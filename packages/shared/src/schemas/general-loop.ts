import { z } from 'zod';

import {
  accountIdSchema,
  optionalCategoryListSchema,
  optionalImageUrlSchema,
  optionalShortTextSchema,
  optionTextSchema,
  productIdSchema,
} from './common.js';
import { jobLogMetaSchema } from './job-logs.js';

export const generalLoopOptionItemSchema = z.object({
  optionKey: z.union([z.string().max(120), z.number().int()]).optional(),
  option: optionTextSchema,
  productId: productIdSchema,
  quantity: z.number().int().positive().max(999),
});

export const generalLoopTaskStatusSchema = z.enum([
  'PENDING',
  'WAITING_REQ2',
  'SUCCEEDED',
  'FAILED',
]);

export const generalLoopTaskSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  productId: z.number().int(),
  productName: z.string().nullable(),
  imgUrl: z.string().nullable(),
  category: z.array(z.string()).nullable(),
  options: z.array(generalLoopOptionItemSchema),
  status: generalLoopTaskStatusSchema,
  retries1: z.number().int().nonnegative(),
  retries2: z.number().int().nonnegative(),
  reviewId: z.number().int().nullable(),
  returnAddress: z.number().int().nullable(),
  addedAt: z.string().datetime().nullable(),
  lastError: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const generalLoopTaskCreateSchema = z.object({
  accountId: accountIdSchema,
  productId: productIdSchema,
  productName: optionalShortTextSchema,
  imgUrl: optionalImageUrlSchema,
  category: optionalCategoryListSchema,
  options: z.array(generalLoopOptionItemSchema).min(1).max(100),
});

export const generalLoopTaskListResponseSchema = z.object({
  items: z.array(generalLoopTaskSchema),
});

export const generalLoopTaskUpdateSchema = z.object({
  options: z.array(generalLoopOptionItemSchema).min(1).max(100),
});

export const generalLoopOptionsSchema = z.object({
  delayPerTask: z.number().int().min(500).max(3_600_000).default(7000),
  delayAfterCycle: z.number().int().min(1000).max(3_600_000).default(15000),
  delayAfterExceed: z.number().int().min(1000).max(3_600_000).default(15000),
  delayAfterIpBlock: z.number().int().min(60_000).max(86_400_000).default(600000),
  delayAfterSecondReq: z.number().int().min(500).max(3_600_000).default(2000),
  maxSecondAttempts: z.number().int().min(1).max(10).default(3),
});

export const generalLoopStateSchema = z.object({
  running: z.boolean(),
  accountId: z.string().nullable(),
  currentTaskId: z.string().nullable(),
  cycleCount: z.number().int().nonnegative(),
  pendingCount: z.number().int().nonnegative(),
  successCount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  lastError: z.string().nullable(),
  options: generalLoopOptionsSchema,
});

export const generalLoopStateResponseSchema = z.object({
  ok: z.literal(true),
  executionId: z.string().nullable(),
  state: generalLoopStateSchema,
});

export const generalLoopStartSchema = z.object({
  accountId: accountIdSchema,
  options: generalLoopOptionsSchema.partial().optional(),
});

export const generalLoopEventSchema = z.object({
  type: z.enum(['state', 'log', 'ended']),
  executionId: z.string(),
  accountId: z.string(),
  state: generalLoopStateSchema.optional(),
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

export type GeneralLoopState = z.infer<typeof generalLoopStateSchema>;
export type GeneralLoopEvent = z.infer<typeof generalLoopEventSchema>;
export type GeneralLoopTask = z.infer<typeof generalLoopTaskSchema>;
