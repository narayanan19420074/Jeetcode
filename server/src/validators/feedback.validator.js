import { z } from 'zod';
import { FEEDBACK_TYPES, FEEDBACK_STATUSES } from '../models/Feedback.js';

export const submitFeedbackSchema = z.object({
  type: z.enum(FEEDBACK_TYPES).default('question'),
  subject: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().min(10, 'Please write at least 10 characters').max(3000),
  // Only needed for guests; logged-in users' name/email come from their account.
  name: z.string().trim().max(80).optional().default(''),
  email: z.string().trim().email('Enter a valid email').max(254).optional(),
  pageUrl: z.string().trim().max(300).optional().default(''),
  // Honeypot: real users never see or fill this. Bots usually do.
  website: z.string().max(200).optional().default(''),
});

export const listFeedbackQuerySchema = z.object({
  status: z.enum(FEEDBACK_STATUSES).optional(),
  type: z.enum(FEEDBACK_TYPES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const updateFeedbackSchema = z
  .object({
    status: z.enum(FEEDBACK_STATUSES).optional(),
    adminNote: z.string().trim().max(1000).optional(),
  })
  .refine((v) => v.status !== undefined || v.adminNote !== undefined, { message: 'Nothing to update' });
