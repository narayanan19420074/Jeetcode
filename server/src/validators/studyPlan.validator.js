import { z } from 'zod';

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const createPlanSchema = z
  .object({
    title: z.string().trim().min(1).max(100),
    description: z.string().trim().max(300).default(''),
    startDate: dateOnly,
    durationDays: z.number().int().min(1).max(90),

    // Auto-generation knobs — all optional. 0 = skip that source.
    problemsPerDay: z.number().int().min(0).max(10).default(0),
    aptitudePerDay: z.number().int().min(0).max(10).default(0),
    difficulties: z.array(z.enum(['Easy', 'Medium', 'Hard'])).max(3).default([]),
    tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
    aptitudePatternSlugs: z.array(z.string().trim().min(1).max(100)).max(10).default([]),

    // Hand-written Notion-style tasks, e.g. { day: 3, title: 'Revise recursion notes' }.
    customTasks: z
      .array(z.object({ day: z.number().int().min(1).max(90), title: z.string().trim().min(1).max(120) }))
      .max(100)
      .default([]),
  })
  .refine((v) => v.problemsPerDay > 0 || v.aptitudePerDay > 0 || v.customTasks.length > 0, {
    message: 'Add at least one source: coding problems, aptitude questions or custom tasks',
  })
  .refine((v) => v.customTasks.every((t) => t.day <= v.durationDays), {
    message: 'A custom task is scheduled after the last day of the plan',
  });

export const updatePlanSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(300).optional(),
});

export const toggleItemSchema = z.object({ done: z.boolean() });

// JS Date#getTimezoneOffset() value (IST = -330).
export const tzQuerySchema = z.object({
  tzOffset: z.coerce.number().int().min(-840).max(840).default(0),
});

export const leaderboardQuerySchema = z.object({
  period: z.enum(['all', 'week', 'month']).default('all'),
  scope: z.enum(['global', 'friends']).default('global'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
