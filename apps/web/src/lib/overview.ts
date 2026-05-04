import { consoleOverviewResponseSchema } from '@market-ops/shared';

import { getAccounts, getLoopAccountSelection, getSelectedAccount } from './accounts-server';
import { ApiServerError, apiGetServer } from './api-server';
import { getCurrentStats, getCurrentSyncState } from './current';
import { getBpLoopState, getGeneralLoopState, getImLoopState } from './jobs';
import { getLowestLoopQueue, getLowestLoopState } from './lowest-loop';

export async function getConsoleOverview() {
  try {
    return consoleOverviewResponseSchema.parse(await apiGetServer('/overview/console'));
  } catch (error) {
    if (error instanceof ApiServerError && error.status === 404) {
      return getConsoleOverviewFallback();
    }

    throw error;
  }
}

async function getConsoleOverviewFallback() {
  const [accounts, selectedAccount, generalLoop, bpLoop, imLoop, currentSync] = await Promise.all([
    getAccounts(),
    getSelectedAccount(),
    getLoopAccountSelection('general-loop'),
    getLoopAccountSelection('bp-loop'),
    getLoopAccountSelection('im-loop'),
    getLoopAccountSelection('current-sync'),
  ]);
  const currentAccountId = currentSync.account?.id;
  const [
    generalLoopState,
    bpLoopState,
    imLoopState,
    currentSyncState,
    lowestLoop,
    currentStats,
    lowestLoopQueue,
  ] = await Promise.all([
    getGeneralLoopState(generalLoop.account?.id),
    getBpLoopState(bpLoop.account?.id),
    getImLoopState(imLoop.account?.id),
    getCurrentSyncState(currentAccountId),
    getLowestLoopState(currentAccountId),
    currentAccountId ? getCurrentStats(currentAccountId) : Promise.resolve([]),
    currentAccountId ? getLowestLoopQueue(currentAccountId) : Promise.resolve([]),
  ]);

  return consoleOverviewResponseSchema.parse({
    accounts,
    selectedAccount,
    selections: {
      generalLoop,
      bpLoop,
      imLoop,
      currentSync,
    },
    states: {
      generalLoop: generalLoopState,
      bpLoop: bpLoopState,
      imLoop: imLoopState,
      currentSync: { ok: true, state: currentSyncState },
      lowestLoop,
    },
    currentStats,
    lowestLoopQueue,
  });
}
