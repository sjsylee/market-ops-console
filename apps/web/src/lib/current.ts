import {
  currentListResponseSchema,
  currentStatsResponseSchema,
  currentSyncStateResponseSchema,
} from '@market-ops/shared';

import { apiGetServer } from './api-server';

export async function getCurrentSyncState(accountId?: string) {
  const suffix = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
  return currentSyncStateResponseSchema.parse(await apiGetServer(`/current/sync/state${suffix}`)).state;
}

export async function getCurrentStats(accountId: string) {
  return currentStatsResponseSchema.parse(await apiGetServer(`/current/stats/${accountId}`)).items;
}

export async function getCurrentItems(accountId: string) {
  const query = new URLSearchParams({ accountId }).toString();
  return currentListResponseSchema.parse(await apiGetServer(`/current/items?${query}`)).items;
}

export async function getCurrentItemsByOrigin(accountId: string, saleOrigin: 'ASK' | 'INVENTORY') {
  const query = new URLSearchParams({ accountId, saleOrigin }).toString();
  return currentListResponseSchema.parse(await apiGetServer(`/current/items?${query}`)).items;
}
