import { z } from 'zod';

const MAX_CODE_LENGTH = 20000;

const problemSlugSchema = z.string().min(1);
const languageSchema = z.enum(['javascript', 'python', 'cpp', 'java']);
const codeSchema = z.string().max(MAX_CODE_LENGTH).default('');

export const hintRequestSchema = z.object({
  problemSlug: problemSlugSchema,
  language: languageSchema,
  code: codeSchema,
  question: z.string().trim().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), text: z.string().max(2000) }))
    .max(10)
    .optional(),
});

export const fixRequestSchema = z.object({
  problemSlug: problemSlugSchema,
  language: languageSchema,
  code: codeSchema,
});

// Live voice only needs the problem: the learner's code streams in from the browser during the session.
export const liveSessionRequestSchema = z.object({
  problemSlug: problemSlugSchema,
});
