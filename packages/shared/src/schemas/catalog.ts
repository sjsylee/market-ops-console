import { z } from 'zod';

import {
  accountIdSchema,
  categoryListSchema,
  keywordSchema,
  nullableImageUrlSchema,
  productIdSchema,
  shortTextSchema,
} from './common.js';
import { generalLoopOptionItemSchema } from './general-loop.js';
import { imLoopMethodSchema } from './im-loop.js';

export const catalogSearchItemSchema = z.object({
  productId: productIdSchema,
  name: shortTextSchema,
  modelName: z.string().max(160).nullable(),
  imgUrl: nullableImageUrlSchema,
  category: categoryListSchema,
});

export const catalogSearchQuerySchema = z.object({
  accountId: accountIdSchema,
  keyword: keywordSchema,
});

export const catalogSearchResponseSchema = z.object({
  items: z.array(catalogSearchItemSchema),
});

export const catalogProductOptionSchema = z.object({
  key: z.string().min(1).max(120),
  name: z.string().max(160).nullable(),
  stockStatus: z.string().max(80).nullable(),
});

export const catalogOptionsResponseSchema = z.object({
  productId: productIdSchema,
  productName: z.string().max(160).nullable(),
  imgUrl: nullableImageUrlSchema,
  options: z.array(catalogProductOptionSchema),
});

export const catalogCertificateResponseSchema = z.object({
  productId: productIdSchema,
  option: z.string().min(1).max(120),
  productName: z.string().max(160).nullable(),
  imgUrl: nullableImageUrlSchema,
  category: categoryListSchema,
  options: z.array(z.string().min(1).max(120)).max(300),
});

export const bpCatalogSearchQuerySchema = z.object({
  accountId: accountIdSchema,
  keyword: keywordSchema.optional(),
  productId: z.string().trim().regex(/^\d+$/).max(20).optional(),
});

export const bpCatalogCertificateResponseSchema = z.object({
  productId: productIdSchema,
  productName: z.string().max(160).nullable(),
  imgUrl: nullableImageUrlSchema,
  category: categoryListSchema,
  options: z.array(z.string().min(1).max(120)).max(300),
});

export const catalogFavoriteItemSchema = catalogSearchItemSchema;

export const catalogFavoriteCreateSchema = catalogSearchItemSchema.pick({
  productId: true,
  name: true,
  modelName: true,
  imgUrl: true,
  category: true,
});

export const catalogFavoriteListResponseSchema = z.object({
  items: z.array(catalogFavoriteItemSchema),
});

export const catalogFavoriteResponseSchema = z.object({
  item: catalogFavoriteItemSchema,
});

export const catalogFavoriteDeleteResponseSchema = z.object({
  ok: z.literal(true),
});

export const catalogRecentTaskPresetKindSchema = z.enum(['general-loop', 'bp-loop', 'im-loop']);

export const catalogRecentTaskPresetListQuerySchema = z.object({
  kind: catalogRecentTaskPresetKindSchema,
});

export const catalogImRecentTaskOptionItemSchema = z.object({
  option: z.string().min(1).max(120),
  productId: productIdSchema,
  price: z.number().int().positive(),
  method: imLoopMethodSchema,
});

export const catalogRecentTaskPresetItemSchema = z.object({
  id: z.string(),
  kind: catalogRecentTaskPresetKindSchema,
  productId: z.number().int(),
  productName: z.string().nullable(),
  imgUrl: z.string().nullable(),
  category: z.array(z.string()),
  options: z.array(z.union([generalLoopOptionItemSchema, catalogImRecentTaskOptionItemSchema])),
  addCount: z.number().int().positive(),
  lastAddedAt: z.string().datetime(),
  lastUsedAccountId: z.string().nullable(),
});

export const catalogRecentTaskPresetListResponseSchema = z.object({
  items: z.array(catalogRecentTaskPresetItemSchema),
});
export type CatalogSearchItem = z.infer<typeof catalogSearchItemSchema>;
