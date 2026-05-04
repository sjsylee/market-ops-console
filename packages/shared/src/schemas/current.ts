import { z } from 'zod';

import {
  accountIdSchema,
  externalKeySchema,
  nullablePriceSchema,
  priceSchema,
  productIdSchema,
} from './common.js';

export const currentSyncStageSchema = z.enum([
  'idle',
  'sync_inventory',
  'sync_ask',
  'bulk_price',
  'ended',
]);

export const currentRetryStateSchema = z.discriminatedUnion('active', [
  z.object({
    active: z.literal(false),
  }),
  z.object({
    active: z.literal(true),
    stage: z.literal('bulk_price'),
    accountId: z.string(),
    target: z.string(),
    attempt: z.number().int().nonnegative(),
    reason: z.string(),
    waitMs: z.number().int().nonnegative(),
    startedAt: z.string().datetime(),
    nextRetryAt: z.string().datetime(),
  }),
]);

export const currentSyncScopeSchema = z.enum(['ASK', 'INVENTORY', 'ALL']);

export const currentSyncStateSchema = z.object({
  running: z.boolean(),
  accountId: z.string().nullable(),
  scope: currentSyncScopeSchema.nullable(),
  stage: currentSyncStageSchema,
  total: z.number().int().nonnegative(),
  done: z.number().int().nonnegative(),
  current: z
    .object({
      productId: z.number().int(),
      option: z.string(),
    })
    .nullable(),
  lastError: z
    .object({
      stage: z.string(),
      message: z.string(),
    })
    .nullable(),
  retryState: currentRetryStateSchema,
});

export const currentSaleOriginSchema = z.enum(['ASK', 'INVENTORY']);

export const currentItemSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  externalKey: z.number().int(),
  productId: z.number().int(),
  option: z.string(),
  saleOrigin: currentSaleOriginSchema,
  name: z.string().nullable(),
  imgUrl: z.string().nullable(),
  styleCode: z.string().nullable(),
  category: z.string().nullable(),
  status: z.string(),
  purchasePrice: z.number().int().nullable(),
  price: z.number().int().nullable(),
  fee: z.number().int().nullable(),
  pPrice: z.number().int().nullable(),
  bPrice: z.number().int().nullable(),
  highestBid: z.number().int().nullable(),
  isStored: z.boolean(),
  isSold: z.boolean(),
  isHidden: z.boolean(),
  hiddenReason: z.string().nullable(),
  firstSeenAt: z.string().datetime().nullable(),
  lastSeenAt: z.string().datetime().nullable(),
  priceUpdatedAt: z.string().datetime().nullable(),
  lastBidActionAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const currentStatSchema = z.object({
  accountId: z.string(),
  normalCount: z.number().int().nonnegative(),
  storedCount: z.number().int().nonnegative(),
  lastSyncNormalAt: z.string().datetime().nullable(),
  lastSyncStoredAt: z.string().datetime().nullable(),
  lastErrorScope: z.string().nullable(),
  lastErrorCode: z.string().nullable(),
  lastErrorMessage: z.string().nullable(),
});

export const currentProductMetaSchema = z.object({
  productId: z.number().int(),
  option: z.string(),
  name: z.string().nullable(),
  imgUrl: z.string().nullable(),
  styleCode: z.string().nullable(),
  category: z.string().nullable(),
  originalPrice: z.number().int().nullable(),
  originalPriceCurrency: z.string().nullable(),
  releaseDate: z.string().nullable(),
  bestAskPrice: z.number().int().nullable(),
  bestBidPrice: z.number().int().nullable(),
  highestBid: z.number().int().nullable(),
  updatedAt: z.string().datetime(),
});

export const currentSnapshotSchema = z.object({
  inventoryRows: z.array(currentItemSchema),
  askRows: z.array(currentItemSchema),
  stats: z.array(currentStatSchema),
  productsByPair: z.record(currentProductMetaSchema),
});

export const currentSyncStateResponseSchema = z.object({
  ok: z.literal(true),
  state: currentSyncStateSchema,
});

export const currentSyncStartRequestSchema = z.object({
  accountId: accountIdSchema,
  scope: currentSyncScopeSchema,
  includePrices: z.boolean().optional(),
});

export const currentSyncControlResponseSchema = z.object({
  ok: z.literal(true),
  executionId: z.string(),
  state: currentSyncStateSchema,
});

export const currentListQuerySchema = z.object({
  accountId: accountIdSchema,
  saleOrigin: currentSaleOriginSchema.optional(),
  includeHidden: z.coerce.boolean().optional(),
  includeSold: z.coerce.boolean().optional(),
});

export const currentListResponseSchema = z.object({
  items: z.array(currentItemSchema),
});

export const currentStatsResponseSchema = z.object({
  items: z.array(currentStatSchema),
});

export const currentPurchasePriceUpdateSchema = z.object({
  accountId: accountIdSchema,
  key: externalKeySchema,
  purchasePrice: nullablePriceSchema,
});

export const currentPurchasePriceBulkUpdateSchema = z.object({
  accountId: accountIdSchema,
  items: z.array(
    z.object({
      key: externalKeySchema,
      purchasePrice: nullablePriceSchema,
    }),
  ).min(1).max(500),
});

export const currentPurchasePriceResponseSchema = z.object({
  ok: z.literal(true),
  key: z.number().int(),
  purchasePrice: z.number().int().nullable(),
});

export const currentPurchasePriceBulkResponseSchema = z.object({
  ok: z.literal(true),
  updatedKeys: z.array(z.number().int()),
  missingKeys: z.array(z.number().int()),
});

export const currentInventoryDirectionSchema = z.enum(['live', 'in_storage']);

export const currentInventoryPriceUpdateSchema = z.object({
  accountId: accountIdSchema,
  direction: currentInventoryDirectionSchema,
  items: z.array(
    z.object({
      askId: externalKeySchema,
      price: priceSchema.optional(),
      productId: productIdSchema.optional(),
    }),
  ).min(1).max(100),
});

export const currentInventoryPriceUpdateResponseSchema = z.object({
  ok: z.literal(true),
  updated: z.array(
    z.object({
      askId: z.number().int(),
      price: z.number().int().nullable(),
      fee: z.number().int().nullable(),
      status: z.string().nullable(),
    }),
  ),
});

export const currentAskPriceUpdateSchema = z.object({
  accountId: accountIdSchema,
  key: externalKeySchema,
  newPrice: priceSchema,
  expiresIn: z.number().int().min(1).max(90).optional(),
});

export const currentAskPriceUpdateResponseSchema = z.object({
  ok: z.literal(true),
  oldKey: z.number().int(),
  key: z.number().int(),
  newKey: z.number().int().optional(),
  price: z.number().int(),
  fee: z.number().int().nullable(),
  status: z.string().nullable(),
});

export const currentSyncEventSchema = z.object({
  type: z.enum(['state', 'snapshot-ready', 'ended']),
  accountId: z.string(),
  executionId: z.string(),
  state: currentSyncStateSchema.optional(),
  scope: currentSyncScopeSchema.optional(),
  reason: z.enum(['succeeded', 'failed', 'stopped']).optional(),
});

export type CurrentSyncState = z.infer<typeof currentSyncStateSchema>;
export type CurrentItem = z.infer<typeof currentItemSchema>;
export type CurrentStat = z.infer<typeof currentStatSchema>;
export type CurrentProductMeta = z.infer<typeof currentProductMetaSchema>;
export type CurrentSnapshot = z.infer<typeof currentSnapshotSchema>;
export type CurrentSyncScope = z.infer<typeof currentSyncScopeSchema>;
export type CurrentSyncEvent = z.infer<typeof currentSyncEventSchema>;
export type CurrentListQuery = z.infer<typeof currentListQuerySchema>;
