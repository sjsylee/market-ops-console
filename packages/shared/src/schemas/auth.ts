import { z } from 'zod';

export const authUserRoleSchema = z.enum(['ADMIN']);

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: authUserRoleSchema,
});

export const authLoginRequestSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
});

export const authTokenPairSchema = z.object({
  accessToken: z.string().min(1),
  accessTokenExpiresAt: z.string().datetime(),
  refreshToken: z.string().min(1),
  refreshTokenExpiresAt: z.string().datetime(),
});

export const authLoginTokenResponseSchema = z.object({
  ok: z.literal(true),
  user: authUserSchema,
  tokens: authTokenPairSchema,
});

export const authLoginResponseSchema = z.object({
  ok: z.literal(true),
  user: authUserSchema,
  expiresAt: z.string().datetime(),
});

export const authRefreshRequestSchema = z.object({
  refreshToken: z.string().trim().min(1).max(500),
});

export const authRefreshTokenResponseSchema = z.object({
  ok: z.literal(true),
  user: authUserSchema,
  tokens: authTokenPairSchema,
});

export const authMeResponseSchema = z.object({
  ok: z.literal(true),
  user: authUserSchema,
});

export const authLogoutResponseSchema = z.object({
  ok: z.literal(true),
});

export type AuthUser = z.infer<typeof authUserSchema>;
