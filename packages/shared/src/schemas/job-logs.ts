import { z } from 'zod';

export const jobLogMetaSchema = z.object({
  imgUrl: z.string().nullable().optional(),
  productName: z.string().nullable().optional(),
  productId: z.number().int().optional(),
  options: z.array(z.string()).optional(),
});

export const jobLogItemSchema = z.object({
  id: z.string(),
  level: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']),
  message: z.string(),
  createdAt: z.string().datetime(),
  meta: jobLogMetaSchema.optional(),
});

export const jobLogListResponseSchema = z.object({
  items: z.array(jobLogItemSchema),
});

export type JobLogMeta = z.infer<typeof jobLogMetaSchema>;
export type JobLogItem = z.infer<typeof jobLogItemSchema>;
