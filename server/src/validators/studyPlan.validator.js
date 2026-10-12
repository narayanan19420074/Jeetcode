import { z } from 'zod';
import { MAX_PLAN_ITEMS } from '../models/StudyPlan.js';

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

// Used for both create (POST) and save (PUT): a title plus the picked
// questions, each with the calendar date the learner scheduled it on.
export const savePlanSchema = z
  .object({
    title: z.string().trim().min(1, 'Give your plan a name').max(100),
    items: z
      .array(z.object({ type: z.enum(['problem', 'aptitude']), id: z.string().min(1), date: dateOnly }))
      .min(1, 'Add at least one question')
      .max(MAX_PLAN_ITEMS, `A plan can hold at most ${MAX_PLAN_ITEMS} questions`),
  })
  .refine((v) => new Set(v.items.map((i) => `${i.type}:${i.id}`)).size === v.items.length, {
    message: 'The same question is in the plan twice',
  });

export const messageSchema = z.object({ text: z.string().trim().min(1).max(500) });

// JS Date#getTimezoneOffset() value from the browser (IST = -330).
export const tzQuerySchema = z.object({
  tzOffset: z.coerce.number().int().min(-840).max(840).default(0),
});

export const leaderboardQuerySchema = z.object({
  period: z.enum(['all', 'week', 'month']).default('all'),
  scope: z.enum(['global', 'friends']).default('global'),
  track: z.enum(['overall', 'coding', 'aptitude']).default('overall'),
  q: z.string().trim().max(60).default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});
