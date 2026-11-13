import { z } from 'zod';

export const memberSearchSchema = z.object({
  q: z.string().trim().min(2, 'Type at least 2 characters').max(40),
});

export const suggestedMembersSchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(10),
});
