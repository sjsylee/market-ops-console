import {
  catalogOptionsResponseSchema,
  catalogSearchResponseSchema,
} from '@market-ops/shared';

import { apiGetServer } from './api-server';

export async function searchCatalog(accountId: string, keyword: string) {
  const query = new URLSearchParams({ accountId, keyword }).toString();
  return catalogSearchResponseSchema.parse(await apiGetServer(`/catalog/search?${query}`)).items;
}

export async function getCatalogOptions(accountId: string, productId: number) {
  return catalogOptionsResponseSchema.parse(
    await apiGetServer(`/catalog/products/${productId}/options?accountId=${encodeURIComponent(accountId)}`),
  );
}
