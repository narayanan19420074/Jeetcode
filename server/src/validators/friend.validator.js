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

export const sendMessageSchema = z.object({
  text: z.string().trim().min(1, 'Message is empty').max(1000, 'Keep messages under 1000 characters'),
});

export const roomInviteSchema = z.object({
  title: z.string().trim().max(80).optional(),
  language: z.enum(['javascript', 'python', 'cpp', 'java']).optional(),
});
