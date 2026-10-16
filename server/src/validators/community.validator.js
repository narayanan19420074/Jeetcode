import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const LANGS = ['javascript', 'python', 'cpp'];

const page = z.coerce.number().int().min(1).default(1);
const limit = z.coerce.number().int().min(1).max(30).default(10);

export const listSolutionsQuerySchema = z.object({
  sort: z.enum(['top', 'new']).default('top'),
  language: z.enum(LANGS).optional(),
  page,
  limit,
});

export const listThreadsQuerySchema = z.object({
  sort: z.enum(['active', 'top', 'new']).default('active'),
  q: z.string().trim().max(60).optional(),
  page,
  limit,
});

export const createSolutionSchema = z.object({
  submissionId: objectId,
  title: z.string().trim().min(3).max(120),
  content: z.string().max(10000).default(''),
});

export const updateSolutionSchema = z.object({
  title: z.string().trim().min(3).max(120),
  content: z.string().max(10000).default(''),
});

export const createThreadSchema = z.object({
  title: z.string().trim().min(3).max(150),
  body: z.string().trim().min(1).max(10000),
});

export const updateThreadSchema = createThreadSchema;

export const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(3000),
  parentId: objectId.optional(),
});

export const updateCommentSchema = z.object({
  body: z.string().trim().min(1).max(3000),
});

export const voteSchema = z.object({
  targetType: z.enum(['solution', 'thread', 'comment']),
  targetId: objectId,
  value: z.union([z.literal(1), z.literal(-1), z.literal(0)]), // 0 = clear my vote
});

export const reportSchema = z.object({
  targetType: z.enum(['solution', 'thread', 'comment']),
  targetId: objectId,
  reason: z.enum(['spam', 'abusive', 'off-topic', 'wrong-solution', 'other']),
  note: z.string().trim().max(300).default(''),
});
