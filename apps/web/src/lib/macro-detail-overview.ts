import {
  lowestLoopDetailOverviewResponseSchema,
  macroDetailOverviewResponseSchema,
  type MacroDetailOverviewResponse,
  type MacroDetailOverviewKind,
} from '@market-ops/shared';

import { getAccounts, getLoopAccountSelection } from './accounts-server';
import { ApiServerError, apiGetServer } from './api-server';
import {
  getBpLoopState,
  getBpLoopTasks,
  getGeneralLoopState,
  getGeneralLoopTasks,
  getImLoopState,
  getImLoopTasks,
} from './jobs';
import { getLowestLoopQueue, getLowestLoopState } from './lowest-loop';

type GeneralMacroDetailOverview = Extract<MacroDetailOverviewResponse, { kind: 'general-loop' }>;
type BpMacroDetailOverview = Extract<MacroDetailOverviewResponse, { kind: 'bp-loop' }>;
type ImMacroDetailOverview = Extract<MacroDetailOverviewResponse, { kind: 'im-loop' }>;

export async function getMacroDetailOverview(kind: 'general-loop'): Promise<GeneralMacroDetailOverview>;
export async function getMacroDetailOverview(kind: 'bp-loop'): Promise<BpMacroDetailOverview>;
export async function getMacroDetailOverview(kind: 'im-loop'): Promise<ImMacroDetailOverview>;
export async function getMacroDetailOverview(kind: MacroDetailOverviewKind): Promise<MacroDetailOverviewResponse> {
  try {
    const query = new URLSearchParams({ kind }).toString();
    return macroDetailOverviewResponseSchema.parse(await apiGetServer(`/overview/macro-detail?${query}`));
  } catch (error) {
    if (error instanceof ApiServerError && error.status === 404) {
      return getMacroDetailOverviewFallback(kind);
    }

    throw error;
  }
}

export async function getLowestLoopDetailOverview() {
  try {
    return lowestLoopDetailOverviewResponseSchema.parse(await apiGetServer('/overview/lowest-loop-detail'));
  } catch (error) {
    if (error instanceof ApiServerError && error.status === 404) {
      return getLowestLoopDetailOverviewFallback();
    }

    throw error;
  }
}

async function getMacroDetailOverviewFallback(kind: MacroDetailOverviewKind) {
  const [accounts, selection] = await Promise.all([
    getAccounts(),
    getLoopAccountSelection(kind),
  ]);
  const loopAccounts = accounts.filter((account) => {
    if (kind === 'bp-loop') {
      return (
        account.type === 'BP' &&
        account.status === 'ACTIVE' &&
        account.bpSessionState !== 'EXPIRED' &&
        account.bpSessionState !== 'UNKNOWN'
      );
    }

    return account.type === 'ILBAN' && account.status === 'ACTIVE';
  });
  const accountId = selection.account?.id;

  if (kind === 'general-loop') {
    const [state, tasks] = await Promise.all([
      getGeneralLoopState(accountId),
      accountId ? getGeneralLoopTasks(accountId) : Promise.resolve([]),
    ]);

    return macroDetailOverviewResponseSchema.parse({
      kind,
      accounts: loopAccounts,
      selection,
      state,
      tasks,
    });
  }

  if (kind === 'bp-loop') {
    const [state, tasks] = await Promise.all([
      getBpLoopState(accountId),
      accountId ? getBpLoopTasks(accountId) : Promise.resolve([]),
    ]);

    return macroDetailOverviewResponseSchema.parse({
      kind,
      accounts: loopAccounts,
      selection,
      state,
      tasks,
    });
  }

  const [state, tasks] = await Promise.all([
    getImLoopState(accountId),
    accountId ? getImLoopTasks(accountId) : Promise.resolve([]),
  ]);

  return macroDetailOverviewResponseSchema.parse({
    kind,
    accounts: loopAccounts,
    selection,
    state,
    tasks,
  });
}

async function getLowestLoopDetailOverviewFallback() {
  const [accounts, selection] = await Promise.all([
    getAccounts(),
    getLoopAccountSelection('current-sync'),
  ]);
  const accountId = selection.account?.id;
  const [state, queueItems] = await Promise.all([
    getLowestLoopState(accountId),
    accountId ? getLowestLoopQueue(accountId) : Promise.resolve([]),
  ]);

  return lowestLoopDetailOverviewResponseSchema.parse({
    accounts: accounts.filter((account) => account.type === 'ILBAN' && account.status === 'ACTIVE'),
    selection,
    state,
    queueItems,
  });
}
