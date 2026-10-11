import mongoose from 'mongoose';
import { StudyPlan, MAX_PLAN_MEMBERS } from '../models/StudyPlan.js';
import { StudyPlanProgress } from '../models/StudyPlanProgress.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  parseDateOnly,
  todayDayNumber,
  generateItems,
  loadMemberProgress,
  summarize,
  serializeItem,
  sortItems,
} from '../services/studyPlan.service.js';

const MAX_PLANS_PER_USER = 30;

// Loads a plan and checks the caller is a member. 404 (not 403) for strangers so plan ids can't be probed.
async function loadMemberPlan(req) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.notFound('Plan not found');
  const plan = await StudyPlan.findById(id);
  if (!plan || !plan.members.some((m) => String(m.user) === req.user.id)) throw ApiError.notFound('Plan not found');
  return plan;
}

const planHeader = (plan, me) => ({
  id: String(plan._id),
  title: plan.title,
  description: plan.description,
  startDate: plan.startDate,
  durationDays: plan.durationDays,
  memberCount: plan.members.length,
  isOwner: String(plan.owner) === me,
});

async function mySummary(plan, me, tzOffset) {
  const map = await loadMemberProgress(plan, [me]);
  const doneIds = map.get(me)?.doneIds || new Set();
  const todayDay = todayDayNumber(plan, tzOffset);
  return { doneIds, todayDay, summary: summarize(plan, doneIds, todayDay) };
}

// GET /study-plans
export const listMyPlans = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const { tzOffset } = req.query;
  const plans = await StudyPlan.find({ 'members.user': me }).sort({ createdAt: -1 }).limit(MAX_PLANS_PER_USER);
  const data = await Promise.all(
    plans.map(async (plan) => ({ ...planHeader(plan, me), summary: (await mySummary(plan, me, tzOffset)).summary }))
  );
  new ApiResponse(200, data).send(res);
});

// GET /study-plans/today — "what should I study today?" across every plan I'm in
export const getToday = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const { tzOffset } = req.query;
  const plans = await StudyPlan.find({ 'members.user': me }).sort({ createdAt: -1 }).limit(MAX_PLANS_PER_USER);

  const out = [];
  let todayTotal = 0;
  let todayDone = 0;
  for (const plan of plans) {
    const { doneIds, todayDay, summary } = await mySummary(plan, me, tzOffset);
    if (todayDay < 1 || todayDay > plan.durationDays + 7) continue; // not started / long finished
    const items = sortItems(plan.items)
      .filter((i) => i.day === todayDay || (i.day < todayDay && !doneIds.has(String(i._id))))
      .map((i) => serializeItem(i, doneIds, todayDay));
    if (items.length === 0) continue;
    todayTotal += summary.todayTotal;
    todayDone += summary.todayDone;
    out.push({ ...planHeader(plan, me), summary, items });
  }
  new ApiResponse(200, { plans: out, todayTotal, todayDone }).send(res);
});

// POST /study-plans
export const createPlan = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const body = req.body;

  const count = await StudyPlan.countDocuments({ owner: me });
  if (count >= MAX_PLANS_PER_USER) throw ApiError.badRequest(`You can own at most ${MAX_PLANS_PER_USER} plans`);

  const items = await generateItems(body);
  const plan = await StudyPlan.create({
    owner: me,
    title: body.title,
    description: body.description,
    startDate: parseDateOnly(body.startDate),
    durationDays: body.durationDays,
    items,
    members: [{ user: me }],
  });
  new ApiResponse(201, { id: String(plan._id) }, 'Study plan created').send(res);
});

// GET /study-plans/:id
export const getPlan = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const plan = await loadMemberPlan(req);
  const { doneIds, todayDay, summary } = await mySummary(plan, me, req.query.tzOffset);
  const owner = await User.findById(plan.owner).select('name handle avatarUrl').lean();

  new ApiResponse(200, {
    ...planHeader(plan, me),
    shareCode: plan.shareCode,
    owner: owner ? { name: owner.name, handle: owner.handle, avatarUrl: owner.avatarUrl || null } : null,
    summary,
    todayDay,
    items: sortItems(plan.items).map((i) => serializeItem(i, doneIds, todayDay)),
  }).send(res);
});

// GET /study-plans/:id/compare — everyone's progress side by side
export const comparePlan = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const plan = await loadMemberPlan(req);
  const todayDay = todayDayNumber(plan, req.query.tzOffset);
  const progress = await loadMemberProgress(plan, plan.members.map((m) => m.user));

  const members = plan.members
    .map((m) => {
      const p = progress.get(String(m.user));
      if (!p) return null; // deleted account
      return {
        userId: String(m.user),
        handle: p.user.handle,
        name: p.user.name,
        avatarUrl: p.user.avatarUrl || null,
        streak: p.user.streakDays || 0,
        isMe: String(m.user) === me,
        isOwner: String(m.user) === String(plan.owner),
        joinedAt: m.joinedAt,
        ...summarize(plan, p.doneIds, todayDay),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.percent - a.percent || b.done - a.done || a.handle.localeCompare(b.handle));

  new ApiResponse(200, { todayDay, durationDays: plan.durationDays, members }).send(res);
});

// PATCH /study-plans/:id (owner)
export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await loadMemberPlan(req);
  if (String(plan.owner) !== req.user.id) throw ApiError.forbidden('Only the plan owner can edit it');
  if (req.body.title !== undefined) plan.title = req.body.title;
  if (req.body.description !== undefined) plan.description = req.body.description;
  await plan.save();
  new ApiResponse(200, { id: String(plan._id) }, 'Plan updated').send(res);
});

// DELETE /study-plans/:id (owner)
export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await loadMemberPlan(req);
  if (String(plan.owner) !== req.user.id) throw ApiError.forbidden('Only the plan owner can delete it');
  await Promise.all([StudyPlan.deleteOne({ _id: plan._id }), StudyPlanProgress.deleteMany({ plan: plan._id })]);
  new ApiResponse(200, null, 'Plan deleted').send(res);
});

// POST /study-plans/:id/leave (members)
export const leavePlan = asyncHandler(async (req, res) => {
  const plan = await loadMemberPlan(req);
  if (String(plan.owner) === req.user.id) throw ApiError.badRequest('The owner cannot leave — delete the plan instead');
  await Promise.all([
    StudyPlan.updateOne({ _id: plan._id }, { $pull: { members: { user: req.user.id } } }),
    StudyPlanProgress.deleteOne({ plan: plan._id, user: req.user.id }),
  ]);
  new ApiResponse(200, null, 'You left the plan').send(res);
});

// POST /study-plans/:id/items/:itemId/toggle — manual tick for custom tasks only
export const toggleItem = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const plan = await loadMemberPlan(req);
  const item = mongoose.isValidObjectId(req.params.itemId) ? plan.items.id(req.params.itemId) : null;
  if (!item) throw ApiError.notFound('Task not found');
  if (item.type !== 'custom') {
    throw ApiError.badRequest('Problems and aptitude questions complete automatically when you solve them');
  }

  const update = req.body.done ? { $addToSet: { doneItems: item._id } } : { $pull: { doneItems: item._id } };
  await StudyPlanProgress.updateOne({ plan: plan._id, user: me }, update, { upsert: true });

  const { summary } = await mySummary(plan, me, req.query.tzOffset);
  new ApiResponse(200, { done: req.body.done, summary }).send(res);
});

// GET /study-plans/join/:code — preview before joining
export const previewJoin = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOne({ shareCode: String(req.params.code).toLowerCase() });
  if (!plan) throw ApiError.notFound('This invite link is invalid or the plan was deleted');
  const owner = await User.findById(plan.owner).select('name handle').lean();
  new ApiResponse(200, {
    id: String(plan._id),
    title: plan.title,
    description: plan.description,
    durationDays: plan.durationDays,
    taskCount: plan.items.length,
    memberCount: plan.members.length,
    owner: owner ? { name: owner.name, handle: owner.handle } : null,
    alreadyMember: plan.members.some((m) => String(m.user) === req.user.id),
    isFull: plan.members.length >= MAX_PLAN_MEMBERS,
  }).send(res);
});

// POST /study-plans/join/:code
export const joinPlan = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const plan = await StudyPlan.findOne({ shareCode: String(req.params.code).toLowerCase() });
  if (!plan) throw ApiError.notFound('This invite link is invalid or the plan was deleted');
  if (plan.members.some((m) => String(m.user) === me)) {
    return new ApiResponse(200, { id: String(plan._id) }, 'Already in this plan').send(res);
  }

  // Atomic: only push if I'm not in and there is still room.
  const result = await StudyPlan.updateOne(
    { _id: plan._id, 'members.user': { $ne: me }, [`members.${MAX_PLAN_MEMBERS - 1}`]: { $exists: false } },
    { $push: { members: { user: me, joinedAt: new Date() } } }
  );
  if (result.modifiedCount === 0) throw ApiError.conflict(`This plan is full (max ${MAX_PLAN_MEMBERS} members)`);
  new ApiResponse(200, { id: String(plan._id) }, 'Joined the plan').send(res);
});
