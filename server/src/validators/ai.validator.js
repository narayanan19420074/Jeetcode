import { z } from 'zod';

export const hintRequestSchema = z.object({
  problemSlug: z.string().min(1),
  language: z.enum(['javascript', 'python', 'cpp']),
  code: z.string().max(20000).default(''),
  question: z.string().trim().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), text: z.string().max(2000) }))
    .max(10)
    .optional(),
});
