import {
  currentAskPriceUpdateResponseSchema,
  currentInventoryPriceUpdateResponseSchema,
  currentSyncControlResponseSchema,
  type CurrentSyncScope,
} from '@market-ops/shared';

import { apiPatchClient, apiPostClient } from './api-client';

export async function startCurrentSyncClient(accountId: string, scope: CurrentSyncScope, includePrices = false) {
  return currentSyncControlResponseSchema.parse(
    await apiPostClient('/api/current/sync/start', {
      accountId,
      scope,
      includePrices,
    }),
  );
}

export async function stopCurrentSyncClient() {
  return currentSyncControlResponseSchema.parse(await apiPostClient('/api/current/sync/stop', {}));
}

export async function updateCurrentBidPriceClient(input: {
  accountId: string;
  saleOrigin: 'ASK' | 'INVENTORY';
  key: number;
  price: number;
  productId?: number;
}) {
  if (input.saleOrigin === 'INVENTORY') {
    return currentInventoryPriceUpdateResponseSchema.parse(
      await apiPatchClient('/api/current/inventory/update-price', {
        accountId: input.accountId,
        direction: 'live',
        items: [
          {
            askId: input.key,
            price: input.price,
            productId: input.productId,
          },
        ],
      }),
    );
  }

  return currentAskPriceUpdateResponseSchema.parse(
    await apiPatchClient('/api/current/ask/update-price', {
      accountId: input.accountId,
      key: input.key,
      newPrice: input.price,
    }),
  );
}

export async function updateCurrentInventoryBidPricesClient(input: {
  accountId: string;
  items: Array<{
    key: number;
    price: number;
    productId?: number;
  }>;
}) {
  return currentInventoryPriceUpdateResponseSchema.parse(
    await apiPatchClient('/api/current/inventory/update-price', {
      accountId: input.accountId,
      direction: 'live',
      items: input.items.map((item) => ({
        askId: item.key,
        price: item.price,
        productId: item.productId,
      })),
    }),
  );
}
