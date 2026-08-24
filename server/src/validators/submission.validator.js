import { z } from 'zod';

export const createSubmissionSchema = z.object({
  problemSlug: z.string().min(1),
  language: z.enum(['javascript', 'python', 'cpp']),
  code: z.string().min(1).max(20000),
  mode: z.enum(['run', 'submit']),
});
