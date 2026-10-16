import mongoose from 'mongoose';
import { Problem } from '../models/Problem.js';
import { Solution } from '../models/Solution.js';
import { Thread } from '../models/Thread.js';
import { Comment } from '../models/Comment.js';
import { Vote } from '../models/Vote.js';
import { ApiError } from '../utils/ApiError.js';

export const MAX_COMMENT_DEPTH = 3; // 0..3 => 4 visible levels
export const AUTHOR_FIELDS = 'name handle avatarUrl';

export const TARGET_MODELS = { solution: Solution, thread: Thread, comment: Comment };

// Same rule as getProblemBySlug: premium (company-tagged) problems need Pro.
// Requires checkProAccess to have run before (sets req.hasProAccess).
function assertPremiumAccess(problem, req) {
  const isPremium = (problem.companies || []).length > 0;
  if (isPremium && !req.hasProAccess) {
    throw ApiError.paymentRequired('This problem requires a Pro subscription');
  }
}

export async function getAccessibleProblem(slug, req) {
  const problem = await Problem.findOne({ slug, isPublished: true, isDeleted: { $ne: true } })
    .select('_id slug companies')
    .lean();
  if (!problem) throw ApiError.notFound('Problem not found');
  assertPremiumAccess(problem, req);
  return problem;
}

export async function assertProblemIdAccess(problemId, req) {
  const problem = await Problem.findOne({ _id: problemId, isPublished: true, isDeleted: { $ne: true } })
    .select('_id companies')
    .lean();
  if (!problem) throw ApiError.notFound('Problem not found');
  assertPremiumAccess(problem, req);
  return problem;
}

export function toObjectId(id, label = 'Item') {
  if (!mongoose.isValidObjectId(id)) throw ApiError.notFound(`${label} not found`);
  return id;
}

export async function loadTarget(targetType, id) {
  const Model = TARGET_MODELS[targetType];
  if (!Model) throw ApiError.badRequest('Invalid target type');
  const doc = await Model.findById(toObjectId(id));
  if (!doc) throw ApiError.notFound('Item not found');
  return doc;
}

// Short plain-text preview of markdown for list cards.
export function makeExcerpt(md = '') {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

// First few lines of code, shown as the "image" of a solution card in the feed.
export function makeCodePreview(code = '') {
  return code.split('\n').slice(0, 8).join('\n').slice(0, 500);
}

export function isOwner(doc, user) {
  return Boolean(user) && String(doc.author?._id || doc.author) === String(user.id);
}

// Adds `myVote` (1 | -1 | 0) and `isMine` to each lean item.
export async function decorate(items, targetType, user) {
  let votes = new Map();
  if (user && items.length) {
    const rows = await Vote.find({
      user: user.id,
      targetType,
      target: { $in: items.map((i) => i._id) },
    })
      .select('target value')
      .lean();
    votes = new Map(rows.map((r) => [String(r.target), r.value]));
  }
  return items.map((i) => ({
    ...i,
    myVote: votes.get(String(i._id)) || 0,
    isMine: isOwner(i, user),
  }));
}

// Sets the user's vote on a target to value (1 / -1 / 0=clear) and keeps the
// denormalised `score` on the target in sync via a delta.
export async function applyVote({ userId, targetType, targetId, value }) {
  const Model = TARGET_MODELS[targetType];
  const filter = { user: userId, targetType, target: targetId };

  const existing = await Vote.findOne(filter);
  let delta = 0;

  if (value === 0) {
    if (existing) {
      delta = -existing.value;
      await existing.deleteOne();
    }
  } else if (!existing) {
    try {
      await Vote.create({ ...filter, value });
      delta = value;
    } catch (err) {
      if (err?.code !== 11000) throw err; // double-tap race: the other request won
    }
  } else if (existing.value !== value) {
    delta = value - existing.value;
    existing.value = value;
    await existing.save();
  }

  if (delta) await Model.updateOne({ _id: targetId }, { $inc: { score: delta } });

  const fresh = await Model.findById(targetId).select('score').lean();
  const mine = await Vote.findOne(filter).select('value').lean();
  return { score: fresh?.score ?? 0, myVote: mine?.value ?? 0 };
}

// Removes a solution/thread together with its comments and all related votes.
export async function cascadeDelete(targetType, doc) {
  const comments = await Comment.find({ targetType, target: doc._id }).select('_id').lean();
  const commentIds = comments.map((c) => c._id);
  await Promise.all([
    Comment.deleteMany({ targetType, target: doc._id }),
    Vote.deleteMany({ targetType: 'comment', target: { $in: commentIds } }),
    Vote.deleteMany({ targetType, target: doc._id }),
    doc.deleteOne(),
  ]);
}
