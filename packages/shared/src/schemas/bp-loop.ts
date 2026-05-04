import { z } from 'zod';

import {
  accountIdSchema,
  optionalImageUrlSchema,
  optionalShortTextSchema,
  productIdSchema,
} from './common.js';
import { generalLoopOptionItemSchema } from './general-loop.js';
import { jobLogMetaSchema } from './job-logs.js';

export const bpLoopTaskStatusSchema = z.enum([
  'PENDING',
  'WAITING_REQ2',
  'SUCCEEDED',
  'FAILED',
]);

export const bpLoopTaskSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  productId: z.number().int(),
  productName: z.string().nullable(),
  imgUrl: z.string().nullable(),
  options: z.array(generalLoopOptionItemSchema),
  status: bpLoopTaskStatusSchema,
  retries1: z.number().int().nonnegative(),
  retries2: z.number().int().nonnegative(),
  reviewId: z.number().int().nullable(),
  returnAddress: z.number().int().nullable(),
  addedAt: z.string().datetime().nullable(),
  lastError: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const bpLoopTaskCreateSchema = z.object({
  accountId: accountIdSchema,
  productId: productIdSchema,
  productName: optionalShortTextSchema,
  imgUrl: optionalImageUrlSchema,
  options: z.array(generalLoopOptionItemSchema).min(1).max(100),
});

export const bpLoopTaskListResponseSchema = z.object({
  items: z.array(bpLoopTaskSchema),
});

export const bpLoopTaskUpdateSchema = z.object({
  options: z.array(generalLoopOptionItemSchema).min(1).max(100),
});

export const bpLoopOptionsSchema = z.object({
  delayPerTask: z.number().int().min(500).max(3_600_000).default(7000),
  delayAfterCycle: z.number().int().min(1000).max(3_600_000).default(15000),
  delayAfterExceed: z.number().int().min(1000).max(3_600_000).default(15000),
  delayAfterIpBlock: z.number().int().min(60_000).max(86_400_000).default(600000),
  delayAfterSecondReq: z.number().int().min(500).max(3_600_000).default(3000),
  maxSecondAttempts: z.number().int().min(1).max(10).default(2),
});

export const bpLoopStateSchema = z.object({
  running: z.boolean(),
  accountId: z.string().nullable(),
  currentTaskId: z.string().nullable(),
  pendingCount: z.number().int().nonnegative(),
  successCount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  lastError: z.string().nullable(),
  options: bpLoopOptionsSchema,
});

export const bpLoopStateResponseSchema = z.object({
  ok: z.literal(true),
  executionId: z.string().nullable(),
  state: bpLoopStateSchema,
});

export const bpLoopStartSchema = z.object({
  accountId: accountIdSchema,
  options: bpLoopOptionsSchema.partial().optional(),
});

export const bpLoopEventSchema = z.object({
  type: z.enum(['state', 'log', 'ended']),
  executionId: z.string(),
  accountId: z.string(),
  state: bpLoopStateSchema.optional(),
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

export type BpLoopState = z.infer<typeof bpLoopStateSchema>;
export type BpLoopEvent = z.infer<typeof bpLoopEventSchema>;
export type BpLoopTask = z.infer<typeof bpLoopTaskSchema>;
