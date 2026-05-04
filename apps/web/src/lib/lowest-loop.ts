import {
  jobLogListResponseSchema,
  lowestLoopQueueListResponseSchema,
  lowestLoopStateResponseSchema,
} from '@market-ops/shared';

import { apiGetServer } from './api-server';

export async function getLowestLoopState(accountId?: string) {
  const suffix = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
  return lowestLoopStateResponseSchema.parse(await apiGetServer(`/current/lowest-loop/state${suffix}`));
}

export async function getLowestLoopQueue(accountId: string) {
  const query = new URLSearchParams({ accountId }).toString();
  return lowestLoopQueueListResponseSchema.parse(await apiGetServer(`/current/lowest-loop/queue?${query}`)).items;
}

export async function getLowestLoopLogs(accountId?: string) {
  const suffix = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
  return jobLogListResponseSchema.parse(await apiGetServer(`/current/lowest-loop/logs${suffix}`)).items;
}
