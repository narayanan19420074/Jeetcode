import { z } from 'zod';

const handle = z
  .string()
  .trim()
  .toLowerCase()
  .transform((v) => v.replace(/^@/, ''))
  .pipe(z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, 'Handles use letters, numbers and _'));

export const sendRequestSchema = z.object({ handle });

export const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .toLowerCase()
    .transform((v) => v.replace(/^@/, ''))
    .pipe(z.string().min(2, 'Type at least 2 characters').max(30).regex(/^[a-z0-9_]+$/, 'Handles use letters, numbers and _')),
});
