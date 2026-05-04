import { z } from 'zod';

export const userNotificationTypeSchema = z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']);
export const userNotificationSourceSchema = z.enum([
  'GENERAL_LOOP',
  'IM_LOOP',
  'BP_LOOP',
  'CURRENT_SYNC',
  'LOWEST_LOOP',
  'SYSTEM',
]);

export const userNotificationPayloadSchema = z
  .object({
    accountId: z.string().optional(),
    executionId: z.string().optional(),
    taskId: z.string().optional(),
    productId: z.number().int().optional(),
    productName: z.string().nullable().optional(),
    imgUrl: z.string().nullable().optional(),
    options: z.array(z.string()).optional(),
  })
  .passthrough();

export const userNotificationSchema = z.object({
  id: z.string(),
  source: userNotificationSourceSchema,
  type: userNotificationTypeSchema,
  title: z.string(),
  message: z.string(),
  groupKey: z.string().nullable(),
  linkPath: z.string().nullable(),
  payload: userNotificationPayloadSchema.nullable(),
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export const userNotificationListQuerySchema = z.object({
  source: userNotificationSourceSchema.optional(),
  type: userNotificationTypeSchema.optional(),
  unreadOnly: z.coerce.boolean().optional(),
  cursor: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const userNotificationListResponseSchema = z.object({
  items: z.array(userNotificationSchema),
  nextCursor: z.string().nullable(),
});

export const userNotificationSummaryResponseSchema = z.object({
  unreadCount: z.number().int().nonnegative(),
  bySource: z.object({
    GENERAL_LOOP: z.number().int().nonnegative().optional(),
    IM_LOOP: z.number().int().nonnegative().optional(),
    BP_LOOP: z.number().int().nonnegative().optional(),
    CURRENT_SYNC: z.number().int().nonnegative().optional(),
    LOWEST_LOOP: z.number().int().nonnegative().optional(),
    SYSTEM: z.number().int().nonnegative().optional(),
  }),
  byType: z.object({
    INFO: z.number().int().nonnegative().optional(),
    SUCCESS: z.number().int().nonnegative().optional(),
    WARNING: z.number().int().nonnegative().optional(),
    ERROR: z.number().int().nonnegative().optional(),
  }),
});

export const userNotificationReadResponseSchema = z.object({
  ok: z.literal(true),
  item: userNotificationSchema.optional(),
});

export const userNotificationReadAllRequestSchema = z.object({
  source: userNotificationSourceSchema.optional(),
  type: userNotificationTypeSchema.optional(),
});

export const userNotificationReadAllResponseSchema = z.object({
  ok: z.literal(true),
  updatedCount: z.number().int().nonnegative(),
});

export const userPushPublicKeyResponseSchema = z.object({
  enabled: z.boolean(),
  publicKey: z.string().nullable(),
});

export const userPushSubscriptionRequestSchema = z.object({
  endpoint: z.string().url().max(1000),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1).max(300),
    auth: z.string().min(1).max(120),
  }),
  deviceLabel: z.string().trim().max(120).optional(),
});

export const userPushSubscriptionResponseSchema = z.object({
  ok: z.literal(true),
  enabled: z.boolean(),
});

export const userPushSubscriptionDeleteRequestSchema = z.object({
  endpoint: z.string().url().max(1000),
});

export type UserNotification = z.infer<typeof userNotificationSchema>;
export type UserNotificationType = z.infer<typeof userNotificationTypeSchema>;
export type UserNotificationSource = z.infer<typeof userNotificationSourceSchema>;
export type UserPushSubscriptionRequest = z.infer<typeof userPushSubscriptionRequestSchema>;
