import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  role: z.enum(['learner', 'contributor', 'moderator', 'admin']),
});

export const setUserProSchema = z.object({
  isPro: z.boolean(),
  proExpiresAt: z.string().datetime().nullable().optional(), // omit/null = lifetime
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  filter: z.enum(['pro', 'normal']).optional(),
  search: z.string().optional(),
});
