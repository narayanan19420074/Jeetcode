import { z } from 'zod';

// Only the languages the tracer can follow step by step; the service explains this to the learner for the others.
export const traceRequestSchema = z.object({
  problemSlug: z.string().min(1),
  language: z.enum(['javascript', 'python', 'cpp', 'java']),
  code: z.string().min(1).max(20000),
  caseIndex: z.number().int().min(0).max(20).default(0),
});
