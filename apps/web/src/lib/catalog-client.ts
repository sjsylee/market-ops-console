import {
  catalogFavoriteCreateSchema,
  catalogFavoriteListResponseSchema,
  catalogFavoriteResponseSchema,
  bpCatalogCertificateResponseSchema,
  catalogOptionsResponseSchema,
  catalogRecentTaskPresetKindSchema,
  catalogRecentTaskPresetListResponseSchema,
  catalogSearchResponseSchema,
} from '@market-ops/shared';
import type { z } from 'zod';

import { apiDeleteClient, apiGetClient, apiPostClient } from './api-client';

export type FavoriteCatalogItem = z.infer<typeof catalogFavoriteCreateSchema>;
export type RecentTaskPresetKind = z.infer<typeof catalogRecentTaskPresetKindSchema>;

export async function searchCatalogClient(accountId: string, keyword: string) {
  const query = new URLSearchParams({ accountId, keyword }).toString();
  return catalogSearchResponseSchema.parse(await apiGetClient(`/api/catalog/search?${query}`)).items;
}

export async function searchBpCatalogClient(accountId: string, keyword: string) {
  const query = new URLSearchParams({ accountId, keyword }).toString();
  return catalogSearchResponseSchema.parse(await apiGetClient(`/api/catalog/bp/search?${query}`)).items;
}

export async function getCatalogOptionsClient(accountId: string, productId: number) {
  const query = new URLSearchParams({ accountId }).toString();
  return catalogOptionsResponseSchema.parse(
    await apiGetClient(`/api/catalog/products/${productId}/options?${query}`),
  );
}

export async function getBpCatalogOptionsClient(accountId: string, productId: number) {
  const query = new URLSearchParams({ accountId }).toString();
  const payload = bpCatalogCertificateResponseSchema.parse(
    await apiGetClient(`/api/catalog/bp/products/${productId}/certificate?${query}`),
  );

  return {
    productId: payload.productId,
    productName: payload.productName,
    imgUrl: payload.imgUrl,
    options: payload.options.map((option) => ({
      key: option,
      name: null,
      stockStatus: null,
    })),
  };
}

export async function getCatalogFavoritesClient() {
  return catalogFavoriteListResponseSchema.parse(await apiGetClient('/api/catalog/favorites')).items;
}

export async function addCatalogFavoriteClient(payload: FavoriteCatalogItem) {
  return catalogFavoriteResponseSchema.parse(await apiPostClient('/api/catalog/favorites', payload)).item;
}

export async function removeCatalogFavoriteClient(productId: number) {
  return apiDeleteClient(`/api/catalog/favorites/${productId}`, {});
}

export async function getRecentTaskPresetsClient(kind: RecentTaskPresetKind) {
  const query = new URLSearchParams({ kind }).toString();
  return catalogRecentTaskPresetListResponseSchema.parse(
    await apiGetClient(`/api/catalog/recent-task-presets?${query}`),
  ).items;
}
