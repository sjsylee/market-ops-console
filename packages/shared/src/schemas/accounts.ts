import { z } from 'zod';

import {
  accountIdSchema,
} from './common.js';

export const accountTypeSchema = z.enum(['ILBAN', 'BP']);
export const accountStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
export const bpSessionStateSchema = z.enum(['VALID', 'EXPIRING_SOON', 'EXPIRED', 'UNKNOWN']);

export const accountSummarySchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  type: accountTypeSchema,
  status: accountStatusSchema,
  isSelected: z.boolean(),
  lastLoginAt: z.string().datetime().nullable(),
  tokenExpiresAt: z.string().datetime().nullable(),
  bpSessionExpiresAt: z.string().datetime().nullable(),
  bpSessionState: bpSessionStateSchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const accountListResponseSchema = z.object({
  items: z.array(accountSummarySchema),
});

export const loopAccountSelectionKindSchema = z.enum(['general-loop', 'bp-loop', 'im-loop', 'current-sync']);

export const loopAccountSelectionSchema = z.object({
  kind: loopAccountSelectionKindSchema,
  account: accountSummarySchema.nullable(),
  autoSelected: z.boolean(),
});

export const loopAccountSelectionResponseSchema = z.object({
  item: loopAccountSelectionSchema,
});

export const createAccountRequestSchema = z.object({
  email: z.string().trim().email().max(254),
  displayName: z.string().trim().min(1).max(60).optional(),
  password: z.string().min(1).max(200),
  type: accountTypeSchema,
});

export const createAccountResponseSchema = z.object({
  item: accountSummarySchema,
});

export const bpLoginStartRequestSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
});

export const bpLoginStartResponseSchema = z.object({
  ok: z.literal(true),
  email: z.string().email(),
  otpRequested: z.literal(true),
});

export const bpLoginCompleteRequestSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
  otp: z.string().trim().min(1).max(20),
});

export const bpLoginCompleteResponseSchema = z.object({
  item: accountSummarySchema,
  issuedAt: z.number().int(),
  expiresAt: z.number().int(),
});

export const selectAccountRequestSchema = z.object({
  accountId: accountIdSchema,
});

export const selectLoopAccountRequestSchema = z.object({
  kind: loopAccountSelectionKindSchema,
  accountId: accountIdSchema,
});

export const disconnectAccountRequestSchema = z.object({
  accountId: accountIdSchema,
});

export const disconnectAccountResponseSchema = z.object({
  item: accountSummarySchema,
});

export const selectedAccountResponseSchema = z.object({
  item: accountSummarySchema.nullable(),
});

export type AccountType = z.infer<typeof accountTypeSchema>;
export type AccountStatus = z.infer<typeof accountStatusSchema>;
export type BpSessionState = z.infer<typeof bpSessionStateSchema>;
export type AccountSummary = z.infer<typeof accountSummarySchema>;
export type AccountListResponse = z.infer<typeof accountListResponseSchema>;
export type LoopAccountSelectionKind = z.infer<typeof loopAccountSelectionKindSchema>;
export type LoopAccountSelection = z.infer<typeof loopAccountSelectionSchema>;
export type LoopAccountSelectionResponse = z.infer<typeof loopAccountSelectionResponseSchema>;
export type CreateAccountRequest = z.infer<typeof createAccountRequestSchema>;
export type CreateAccountResponse = z.infer<typeof createAccountResponseSchema>;
export type SelectAccountRequest = z.infer<typeof selectAccountRequestSchema>;
export type SelectLoopAccountRequest = z.infer<typeof selectLoopAccountRequestSchema>;
export type SelectedAccountResponse = z.infer<typeof selectedAccountResponseSchema>;
export type DisconnectAccountRequest = z.infer<typeof disconnectAccountRequestSchema>;
export type DisconnectAccountResponse = z.infer<typeof disconnectAccountResponseSchema>;
