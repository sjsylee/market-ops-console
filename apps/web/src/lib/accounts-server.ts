import {
  accountListResponseSchema,
  loopAccountSelectionResponseSchema,
  type LoopAccountSelectionKind,
  selectedAccountResponseSchema,
  type AccountSummary,
} from '@market-ops/shared';

import { apiGetServer } from './api-server';

export async function getAccounts() {
  return accountListResponseSchema.parse(await apiGetServer('/accounts')).items;
}

export async function getSelectedAccount() {
  return selectedAccountResponseSchema.parse(await apiGetServer('/accounts/selected')).item;
}

export async function getLoopAccountSelection(kind: LoopAccountSelectionKind) {
  const query = new URLSearchParams({ kind }).toString();
  return loopAccountSelectionResponseSchema.parse(await apiGetServer(`/accounts/loop-selection?${query}`)).item;
}

export function getPrimaryAccountLabel(account: AccountSummary | null) {
  if (!account) {
    return '선택된 계정 없음';
  }

  return `${account.displayName} · ${account.type}`;
}
