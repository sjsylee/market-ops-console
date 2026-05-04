import { z } from 'zod';

import {
  accountIdSchema,
  optionalCategoryListSchema,
  optionalImageUrlSchema,
  optionalShortTextSchema,
  optionTextSchema,
  priceSchema,
  productIdSchema,
} from './common.js';
import { jobLogMetaSchema } from './job-logs.js';

export const imLoopMinPrice = 20000;
export const imLoopMethodSchema = z.enum(['p', 'b']);
export const imLoopTaskStatusSchema = z.enum(['PENDING', 'SUCCEEDED', 'FAILED']);

export const imLoopTaskSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  productId: z.number().int(),
  productName: z.string().nullable(),
  imgUrl: z.string().nullable(),
  category: z.array(z.string()).nullable(),
  option: z.string(),
  price: z.number().int().min(imLoopMinPrice),
  method: imLoopMethodSchema,
  status: imLoopTaskStatusSchema,
  lastError: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const imLoopTaskCreateSchema = z.object({
  accountId: accountIdSchema,
  productId: productIdSchema,
  productName: optionalShortTextSchema,
  imgUrl: optionalImageUrlSchema,
  category: optionalCategoryListSchema,
  option: optionTextSchema,
  price: priceSchema.min(imLoopMinPrice),
  method: imLoopMethodSchema,
});

export const imLoopTaskUpdateSchema = z.object({
  price: z
    .number()
    .int()
    .min(imLoopMinPrice, { message: '목표가는 최소 20,000원 이상이어야 합니다.' })
    .max(1_000_000_000)
    .refine((value) => value % 1000 === 0, {
      message: '목표가는 1,000원 단위로 입력해야 합니다.',
    }),
  method: imLoopMethodSchema,
});

export const imLoopTaskListResponseSchema = z.object({
  items: z.array(imLoopTaskSchema),
});

export const imLoopOptionsSchema = z.object({
  delayPerTask: z.number().int().min(500).max(3_600_000).default(3000),
  delayAfterCycle: z.number().int().min(1000).max(3_600_000).default(30000),
  priceTolerance: z.number().int().min(0).max(1_000_000).default(3000),
  delayJitterMs: z.number().int().min(0).max(60_000).default(200),
  burningEnabled: z.boolean().default(true),
  burningRepeatCount: z.number().int().min(1).max(20).default(1),
  burningDelayMinMs: z.number().int().min(0).max(60_000).default(200),
  burningDelayMaxMs: z.number().int().min(0).max(60_000).default(500),
});

export const imLoopStateSchema = z.object({
  running: z.boolean(),
  accountId: z.string().nullable(),
  currentTaskId: z.string().nullable(),
  pendingCount: z.number().int().nonnegative(),
  successCount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  lastError: z.string().nullable(),
  options: imLoopOptionsSchema,
});

export const imLoopStateResponseSchema = z.object({
  ok: z.literal(true),
  executionId: z.string().nullable(),
  state: imLoopStateSchema,
});

export const imLoopStartSchema = z.object({
  accountId: accountIdSchema,
  options: imLoopOptionsSchema.partial().optional(),
});

export const imLoopEventSchema = z.object({
  type: z.enum(['state', 'log', 'ended']),
  executionId: z.string(),
  accountId: z.string(),
  state: imLoopStateSchema.optional(),
  log: z
    .object({
      level: z.enum(['info', 'success', 'warning', 'error']),
      message: z.string(),
      timestamp: z.string().datetime(),
      meta: jobLogMetaSchema.optional(),
    })
    .optional(),
  reason: z.enum(['succeeded', 'failed', 'stopped']).optional(),
});

export type ImLoopState = z.infer<typeof imLoopStateSchema>;
export type ImLoopEvent = z.infer<typeof imLoopEventSchema>;
export type ImLoopTask = z.infer<typeof imLoopTaskSchema>;
