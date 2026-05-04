import { z } from 'zod';

export const entityIdSchema = z.string().trim().min(1).max(80);
export const accountIdSchema = entityIdSchema;
export const productIdSchema = z.number().int().positive().max(2_147_483_647);
export const externalKeySchema = z.number().int().positive().max(2_147_483_647);
export const priceSchema = z.number().int().positive().max(1_000_000_000);
export const nullablePriceSchema = z.number().int().min(0).max(1_000_000_000).nullable();
export const shortTextSchema = z.string().trim().min(1).max(160);
export const optionalShortTextSchema = z.string().trim().min(1).max(160).optional();
export const nullableShortTextSchema = z.string().max(160).nullable();
export const optionTextSchema = z.string().trim().min(1).max(120);
export const keywordSchema = z.string().trim().min(1).max(120);
export const imageUrlSchema = z.string().trim().url().max(500);
export const optionalImageUrlSchema = imageUrlSchema.optional();
export const nullableImageUrlSchema = imageUrlSchema.nullable();
export const categoryListSchema = z.array(z.string().trim().min(1).max(80)).max(8);
export const optionalCategoryListSchema = categoryListSchema.optional();
