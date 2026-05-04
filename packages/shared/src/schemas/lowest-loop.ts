import { z } from 'zod';

import {
  accountIdSchema,
  externalKeySchema,
  optionTextSchema,
  productIdSchema,
} from './common.js';
import { currentSaleOriginSchema } from './current.js';

export const lowestLoopStrategySchema = z.enum(['FOLLOW', 'OVERTAKE']);

export const lowestLoopQueueItemSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  externalKey: z.number().int(),
  productId: z.number().int(),
  option: z.string(),
  saleOrigin: currentSaleOriginSchema,
  productName: z.string().nullable(),
  imgUrl: z.string().nullable(),
  bidPrice: z.number().int().nullable(),
  referencePrice: z.number().int().nullable(),
  active: z.boolean(),
  strategy: lowestLoopStrategySchema,
  undercutStep: z.number().int().nonnegative(),
  budget: z.number().int().nonnegative(),
  spent: z.number().int().nonnegative(),
  currentPrice: z.number().int().nullable(),
  marketUpdatedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const lowestLoopQueueListResponseSchema = z.object({
  items: z.array(lowestLoopQueueItemSchema),
});

export const lowestLoopQueueCreateSchema = z.object({
  accountId: accountIdSchema,
  externalKey: externalKeySchema,
  productId: productIdSchema,
  option: optionTextSchema,
  saleOrigin: currentSaleOriginSchema,
  active: z.boolean().optional(),
  strategy: lowestLoopStrategySchema.optional(),
  undercutStep: z.number().int().min(100).max(1_000_000).optional(),
  budget: z.number().int().min(0).max(1_000_000_000).optional(),
});

export const lowestLoopQueueUpdateSchema = z.object({
  active: z.boolean().optional(),
  strategy: lowestLoopStrategySchema.optional(),
  undercutStep: z.number().int().min(100).max(1_000_000).optional(),
  budget: z.number().int().min(0).max(1_000_000_000).optional(),
  resetSpent: z.boolean().optional(),
});

export const lowestLoopRunOptionsSchema = z.object({
  intervalMs: z.number().int().min(500).max(3_600_000).default(1800),
  intervalJitterMs: z.number().int().min(0).max(60_000).default(200),
  cycleDelayMs: z.number().int().min(1000).max(3_600_000).default(12000),
});

export const lowestLoopStateSchema = z.object({
  running: z.boolean(),
  accountId: z.string().nullable(),
  stage: z.enum(['idle', 'running', 'waiting_cycle', 'ended']),
  current: z
    .object({
      externalKey: z.number().int(),
      productId: z.number().int(),
      option: z.string(),
    })
    .nullable(),
  total: z.number().int().nonnegative(),
  activeCount: z.number().int().nonnegative(),
  soldCount: z.number().int().nonnegative(),
  cycleCount: z.number().int().nonnegative(),
  lastError: z.string().nullable(),
});

export const lowestLoopStateResponseSchema = z.object({
  ok: z.literal(true),
  executionId: z.string().nullable(),
  state: lowestLoopStateSchema,
});

export const lowestLoopStartSchema = z.object({
  accountId: accountIdSchema,
  options: lowestLoopRunOptionsSchema.optional(),
});

export const lowestLoopEventSchema = z.object({
  type: z.enum(['state', 'log', 'ended']),
  executionId: z.string(),
  accountId: z.string(),
  state: lowestLoopStateSchema.optional(),
  log: z
    .object({
      level: z.enum(['info', 'success', 'warning', 'error']),
      message: z.string(),
      timestamp: z.string().datetime(),
      meta: z
        .object({
          productId: z.number().int().optional(),
          productName: z.string().nullable().optional(),
          imgUrl: z.string().nullable().optional(),
          options: z.array(z.string()).optional(),
        })
        .optional(),
    })
    .optional(),
  reason: z.enum(['succeeded', 'failed', 'stopped']).optional(),
});

export type LowestLoopState = z.infer<typeof lowestLoopStateSchema>;
export type LowestLoopEvent = z.infer<typeof lowestLoopEventSchema>;
export type LowestLoopQueueItem = z.infer<typeof lowestLoopQueueItemSchema>;
