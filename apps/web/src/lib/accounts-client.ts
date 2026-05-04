import {
  bpLoginCompleteResponseSchema,
  bpLoginStartResponseSchema,
  createAccountResponseSchema,
  disconnectAccountResponseSchema,
  loopAccountSelectionResponseSchema,
  type LoopAccountSelectionKind,
} from '@market-ops/shared';

import { apiDeleteClient, apiPostClient } from './api-client';

export async function createIlbanAccount(input: {
  email: string;
  password: string;
  displayName?: string;
}) {
  return createAccountResponseSchema.parse(
    await apiPostClient('/api/accounts', {
      ...input,
      type: 'ILBAN',
    }),
  ).item;
}

export async function startBpLogin(input: { email: string; password: string }) {
  return bpLoginStartResponseSchema.parse(await apiPostClient('/api/accounts/bp/login/start', input));
}

export async function completeBpLogin(input: {
  email: string;
  password: string;
  otp: string;
}) {
  return bpLoginCompleteResponseSchema.parse(
    await apiPostClient('/api/accounts/bp/login/complete', input),
  ).item;
}

export async function selectAccount(accountId: string) {
  return createAccountResponseSchema.parse(
    await apiPostClient('/api/accounts/select', {
      accountId,
    }),
  ).item;
}

export async function selectLoopAccount(kind: LoopAccountSelectionKind, accountId: string) {
  return loopAccountSelectionResponseSchema.parse(
    await apiPostClient('/api/accounts/loop-selection', {
      kind,
      accountId,
    }),
  ).item;
}

export async function disconnectAccount(accountId: string) {
  return disconnectAccountResponseSchema.parse(
    await apiDeleteClient('/api/accounts', {
      accountId,
    }),
  ).item;
}
