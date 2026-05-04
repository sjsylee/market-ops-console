import { accountOverviewResponseSchema } from '@market-ops/shared';

import { getAccounts, getSelectedAccount } from './accounts-server';
import { ApiServerError, apiGetServer } from './api-server';

export async function getAccountOverview() {
  try {
    return accountOverviewResponseSchema.parse(await apiGetServer('/accounts/overview'));
  } catch (error) {
    if (error instanceof ApiServerError && error.status === 404) {
      const [accounts, selectedAccount] = await Promise.all([
        getAccounts(),
        getSelectedAccount(),
      ]);

      return { accounts, selectedAccount };
    }

    throw error;
  }
}
