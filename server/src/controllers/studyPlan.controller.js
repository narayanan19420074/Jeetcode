import mongoose from 'mongoose';
import { StudyPlan, MAX_PLAN_MEMBERS } from '../models/StudyPlan.js';
import { PlanMessage } from '../models/PlanMessage.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  localToday, dateKey, buildItems, loadMemberProgress, summarize, activitySummary, serializeItem,
} from '../services/studyPlan.service.js';

const MAX_PLANS_PER_USER = 30;
const FEED_DAYS = 14;
const NUDGE_COOLDOWN_MS = 6 * 60 * 60 * 1000;

// Loads a plan and checks the caller is a member. 404 (not 403) for strangers so plan ids can't be probed.
async function loadMemberPlan(req) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.notFound('Plan not found');
  const plan = await StudyPlan.findById(id);
  if (!plan || !plan.members.some((m) => String(m.user) === req.user.id)) throw ApiError.notFound('Plan not found');
  return plan;
}

const header = (plan, me) => ({
  id: String(plan._id),
  title: plan.title,
  memberCount: plan.members.length,
  isOwner: String(plan.owner) === me,
});

const publicUser = (u) => ({ id: String(u._id), handle: u.handle, name: u.name, avatarUrl: u.avatarUrl || null });

// GET /study-plans — rail + overview (summary and today's checklist per plan)
export const listMyPlans = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const today = localToday(req.query.tzOffset);
  const plans = await StudyPlan.find({ 'members.user': me }).sort({ createdAt: -1 }).limit(MAX_PLANS_PER_USER);

  // One lookup for everyone in these plans, so the rail can show who is studying with you.
  const memberIds = [...new Set(plans.flatMap((p) => p.members.map((m) => String(m.user))))];
  const people = memberIds.length ? await User.find({ _id: { $in: memberIds } }).select('name handle avatarUrl').lean() : [];
  const personById = new Map(people.map((u) => [String(u._id), u]));

  const data = await Promise.all(
    plans.map(async (plan) => {
      const progress = await loadMemberProgress(plan, [me]);
      const doneIds = progress.get(me)?.doneIds || new Set();
      const todayItems = plan.items
        .filter((i) => i.date.getTime() === today.getTime() || (i.date.getTime() < today.getTime() && !doneIds.has(String(i._id))))
        .sort((a, b) => a.date - b.date || a.order - b.order)
        .slice(0, 8)
        .map((i) => serializeItem(i, doneIds, today));
      const members = plan.members
        .map((m) => personById.get(String(m.user)))
        .filter(Boolean)
        .map((u) => ({ ...publicUser(u), isMe: String(u._id) === me }));
      return { ...header(plan, me), members, summary: summarize(plan, doneIds, today), today: todayItems };
    })
  );
  new ApiResponse(200, data).send(res);
});

// POST /study-plans — create from picked questions + calendar dates
export const createPlan = asyncHandler(async (req, res) => {
  const me = req.user.id;
  if ((await StudyPlan.countDocuments({ owner: me })) >= MAX_PLANS_PER_USER) {
    throw ApiError.badRequest(`You can own at most ${MAX_PLANS_PER_USER} plans`);
  }
  const items = await buildItems(req.body.items);
  const plan = await StudyPlan.create({ owner: me, title: req.body.title, items, members: [{ user: me }] });
  new ApiResponse(201, { id: String(plan._id) }, 'Plan saved').send(res);
});

// PUT /study-plans/:id — owner re-saves title + schedule. Progress is derived, so nothing is lost.
export const savePlan = asyncHandler(async (req, res) => {
  const plan = await loadMemberPlan(req);
  if (String(plan.owner) !== req.user.id) throw ApiError.forbidden('Only the plan owner can edit the schedule');
  plan.title = req.body.title;
  plan.items = await buildItems(req.body.items);
  await plan.save();
  new ApiResponse(200, { id: String(plan._id) }, 'Plan saved').send(res);
});

// GET /study-plans/:id — schedule + everyone's progress, pace, streak and last-7-days in one payload
export const getPlan = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const plan = await loadMemberPlan(req);
  const tz = req.query.tzOffset;
  const today = localToday(tz);
  const todayKey = dateKey(today);
  const progress = await loadMemberProgress(plan, plan.members.map((m) => m.user));

  // item id -> userIds who finished it (drives the avatar stacks and the who-solved-what matrix)
  const doneBy = new Map();
  progress.forEach((p, uid) => p.doneIds.forEach((itemId) => doneBy.set(itemId, [...(doneBy.get(itemId) || []), uid])));

  const mine = progress.get(me)?.doneIds || new Set();
  const items = [...plan.items]
    .sort((a, b) => a.date - b.date || a.order - b.order)
    .map((i) => serializeItem(i, mine, today, doneBy.get(String(i._id)) || []));

  const members = plan.members
    .map((m) => {
      const p = progress.get(String(m.user));
      if (!p) return null; // deleted account
      const act = activitySummary(p, tz, todayKey);
      return {
        userId: String(m.user),
        handle: p.user.handle,
        name: p.user.name,
        avatarUrl: p.user.avatarUrl || null,
        isMe: String(m.user) === me,
        isOwner: String(m.user) === String(plan.owner),
        joinedAt: m.joinedAt,
        week: act.week,
        lastActiveAt: act.lastActiveAt,
        ...summarize(plan, p.doneIds, today),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.percent - a.percent || b.done - a.done || a.handle.localeCompare(b.handle));

  const owner = members.find((m) => m.isOwner);
  new ApiResponse(200, {
    ...header(plan, me),
    shareCode: plan.shareCode,
    createdAt: plan.createdAt,
    owner: owner ? { name: owner.name, handle: owner.handle } : null,
    summary: summarize(plan, mine, today),
    items,
    members,
  }).send(res);
});

// GET /study-plans/:id/feed — Slack-style channel: real solves + joins + chat, newest last
export const getFeed = asyncHandler(async (req, res) => {
  const plan = await loadMemberPlan(req);
  const since = new Date(Date.now() - FEED_DAYS * 24 * 60 * 60 * 1000);
  const progress = await loadMemberProgress(plan, plan.members.map((m) => m.user));
  const itemById = new Map(plan.items.map((i) => [String(i._id), i]));

  const events = [];
  progress.forEach((p, uid) => {
    p.doneAt.forEach((at, itemId) => {
      if (at < since) return;
      const it = itemById.get(itemId);
      events.push({
        id: `s:${uid}:${itemId}`, type: 'solved', at, user: publicUser(p.user),
        item: { title: it.title, difficulty: it.difficulty, kind: it.type },
      });
    });
  });

  plan.members.forEach((m) => {
    const p = progress.get(String(m.user));
    if (!p) return;
    const isOwner = String(m.user) === String(plan.owner);
    events.push({ id: `j:${m.user}`, type: isOwner ? 'created' : 'joined', at: isOwner ? plan.createdAt : m.joinedAt, user: publicUser(p.user) });
  });

  const messages = await PlanMessage.find({ plan: plan._id }).sort({ createdAt: -1 }).limit(80).lean();
  const unknown = [...new Set(messages.flatMap((m) => [String(m.user), m.target ? String(m.target) : null]).filter(Boolean))].filter((id) => !progress.has(id));
  const extra = unknown.length ? await User.find({ _id: { $in: unknown } }).select('name handle avatarUrl').lean() : [];
  const userById = new Map([...[...progress.entries()].map(([id, p]) => [id, p.user]), ...extra.map((u) => [String(u._id), u])]);

  messages.forEach((m) => {
    const u = userById.get(String(m.user));
    if (!u) return;
    const target = m.target ? userById.get(String(m.target)) : null;
    events.push({
      id: `m:${m._id}`, type: m.kind, at: m.createdAt, user: publicUser(u), text: m.text,
      target: target ? { id: String(target._id), handle: target.handle } : null,
    });
  });

  events.sort((a, b) => new Date(a.at) - new Date(b.at));
  new ApiResponse(200, { events: events.slice(-120) }).send(res);
});

// POST /study-plans/:id/messages
export const postMessage = asyncHandler(async (req, res) => {
  const plan = await loadMemberPlan(req);
  const recent = await PlanMessage.countDocuments({ plan: plan._id, user: req.user.id, createdAt: { $gt: new Date(Date.now() - 10000) } });
  if (recent >= 5) throw ApiError.tooMany('Slow down a little');
  await PlanMessage.create({ plan: plan._id, user: req.user.id, text: req.body.text });
  new ApiResponse(201, null).send(res);
});

// POST /study-plans/:id/nudge/:userId — a friendly reminder posted in the plan channel (6h cooldown per friend)
export const nudgeMember = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const plan = await loadMemberPlan(req);
  const { userId } = req.params;
  if (userId === me) throw ApiError.badRequest("You can't nudge yourself");
  if (!plan.members.some((m) => String(m.user) === userId)) throw ApiError.notFound('Member not found');

  const cooldown = await PlanMessage.exists({
    plan: plan._id, user: me, kind: 'nudge', target: userId, createdAt: { $gt: new Date(Date.now() - NUDGE_COOLDOWN_MS) },
  });
  if (cooldown) throw ApiError.conflict('You already nudged them recently');

  const today = localToday(req.query.tzOffset);
  const progress = await loadMemberProgress(plan, [userId]);
  const p = progress.get(userId);
  if (!p) throw ApiError.notFound('Member not found');
  const pending = plan.items.filter((i) => i.date.getTime() <= today.getTime() && !p.doneIds.has(String(i._id))).length;
  if (pending === 0) throw ApiError.badRequest('They have nothing pending — no need to nudge');

  await PlanMessage.create({
    plan: plan._id, user: me, kind: 'nudge', target: userId,
    text: `${pending} question${pending === 1 ? ' is' : 's are'} waiting. Let's finish today's plan!`,
  });
  new ApiResponse(201, null, 'Nudge sent').send(res);
});

// DELETE /study-plans/:id/members/:userId (owner removes a member)
export const removeMember = asyncHandler(async (req, res) => {
  const plan = await loadMemberPlan(req);
  if (String(plan.owner) !== req.user.id) throw ApiError.forbidden('Only the plan owner can remove members');
  if (req.params.userId === String(plan.owner)) throw ApiError.badRequest('The owner cannot be removed');
  await StudyPlan.updateOne({ _id: plan._id }, { $pull: { members: { user: req.params.userId } } });
  new ApiResponse(200, null, 'Member removed').send(res);
});

// DELETE /study-plans/:id (owner)
export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await loadMemberPlan(req);
  if (String(plan.owner) !== req.user.id) throw ApiError.forbidden('Only the plan owner can delete it');
  await Promise.all([StudyPlan.deleteOne({ _id: plan._id }), PlanMessage.deleteMany({ plan: plan._id })]);
  new ApiResponse(200, null, 'Plan deleted').send(res);
});

// POST /study-plans/:id/leave (members)
export const leavePlan = asyncHandler(async (req, res) => {
  const plan = await loadMemberPlan(req);
  if (String(plan.owner) === req.user.id) throw ApiError.badRequest('The owner cannot leave — delete the plan instead');
  await StudyPlan.updateOne({ _id: plan._id }, { $pull: { members: { user: req.user.id } } });
  new ApiResponse(200, null, 'You left the plan').send(res);
});

// GET /study-plans/join/:code — preview shown inline before joining
export const previewJoin = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOne({ shareCode: String(req.params.code).toLowerCase() });
  if (!plan) throw ApiError.notFound('This invite link is invalid or the plan was deleted');
  const owner = await User.findById(plan.owner).select('name handle').lean();
  const dates = plan.items.map((i) => i.date.getTime());
  new ApiResponse(200, {
    id: String(plan._id),
    title: plan.title,
    taskCount: plan.items.length,
    startDate: dates.length ? new Date(Math.min(...dates)).toISOString().slice(0, 10) : null,
    endDate: dates.length ? new Date(Math.max(...dates)).toISOString().slice(0, 10) : null,
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
