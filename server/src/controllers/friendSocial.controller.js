import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Submission } from '../models/Submission.js';
import { Problem } from '../models/Problem.js';
import { AptitudeQuestionProgress } from '../models/AptitudeQuestionProgress.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getRanking, assignRanks, publicRow } from '../services/leaderboard.service.js';
import { getFriendIds } from '../services/friend.service.js';
import { assertFriends, assertObjectId, conversationSummaries, history, markRead, sendMessage, unreadSummary } from '../services/chat.service.js';
import { LANGUAGE_IDS } from '../services/judge0.service.js';
import { createRoom, getRoom } from '../realtime/roomStore.js';
import { isOnline } from '../realtime/hub.js';
import { DirectMessage } from '../models/DirectMessage.js';
import { istDateOnly } from '../utils/istDay.js';

const DAY = 86400000;
const NUDGE_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const FEED_DAYS = 30;
const FEED_LIMIT = 30;
const USER_FIELDS = 'name handle avatarUrl streakDays longestStreak lastActivityDate company';

const todayMs = () => istDateOnly().getTime(); // today's India (IST) date as a date-only value

// ---------------------------------------------------------------- chat (REST side)

// GET /friends/chat/unread -> { byUser: { friendId: n }, total }
export const getUnread = asyncHandler(async (req, res) => {
  new ApiResponse(200, await unreadSummary(req.user.id)).send(res);
});

// GET /friends/chat/overview -> { byUser: { friendId: lastMessage } } (chat list previews)
export const chatOverview = asyncHandler(async (req, res) => {
  new ApiResponse(200, await conversationSummaries(req.user.id)).send(res);
});

// GET /friends/chat/:userId?before=ISO -> { messages (old -> new), hasMore }
export const getHistory = asyncHandler(async (req, res) => {
  assertObjectId(req.params.userId);
  new ApiResponse(200, await history(req.user.id, req.params.userId, req.query.before)).send(res);
});

// POST /friends/chat/:userId { text } — fallback when the socket is down.
export const postMessage = asyncHandler(async (req, res) => {
  assertObjectId(req.params.userId);
  const message = await sendMessage({ from: req.user.id, to: req.params.userId, text: req.body.text });
  new ApiResponse(201, { message }).send(res);
});

// POST /friends/chat/:userId/read — I opened this conversation.
export const readChat = asyncHandler(async (req, res) => {
  assertObjectId(req.params.userId);
  await assertFriends(req.user.id, req.params.userId);
  new ApiResponse(200, { marked: await markRead(req.user.id, req.params.userId) }).send(res);
});

// ---------------------------------------------------------------- nudge

// POST /friends/:userId/nudge — remind a friend who has not practised today.
export const nudgeFriend = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const { userId } = req.params;
  assertObjectId(userId);
  await assertFriends(me, userId);

  const friend = await User.findById(userId).select(USER_FIELDS).lean();
  if (!friend) throw ApiError.notFound('Friend not found');

  const last = friend.lastActivityDate ? new Date(friend.lastActivityDate).getTime() : 0;
  if (last >= todayMs()) throw ApiError.badRequest(`@${friend.handle} already practised today — no nudge needed`);

  // One nudge per friend every 6 hours, so it stays a reminder and not spam.
  const recent = await DirectMessage.findOne({ from: me, to: userId, kind: 'nudge', createdAt: { $gte: new Date(Date.now() - NUDGE_COOLDOWN_MS) } })
    .select('createdAt')
    .lean();
  if (recent) throw ApiError.tooMany(`You already nudged @${friend.handle} recently. Try again later.`);

  const streak = publicRow(friend).streak;
  const text = streak > 0
    ? `Your ${streak}-day streak is on the line — solve one problem today to keep it alive!`
    : 'Time to get back in the game — solve one problem today and start a new streak!';
  const message = await sendMessage({ from: me, to: userId, kind: 'nudge', text });
  new ApiResponse(201, { message }, `Nudge sent to @${friend.handle}`).send(res);
});

// ---------------------------------------------------------------- code together

// POST /friends/:userId/room { roomId?, title?, language? } — DM a pair-coding invite.
// With `roomId` the friend is invited to THAT live room; without it a new room is created.
// Response has `online` so the client knows whether the friend got the live popup.
export const inviteToRoom = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const { userId } = req.params;
  assertObjectId(userId);
  await assertFriends(me, userId);

  let room;
  let title;
  if (req.body.roomId) {
    room = getRoom(req.body.roomId);
    if (!room) throw ApiError.notFound('Room not found or expired');
    title = req.body.title || room.title || `${req.user.handle}'s pair room`;
  } else {
    const language = LANGUAGE_IDS[req.body.language] ? req.body.language : 'javascript';
    title = req.body.title || `${req.user.handle}'s pair room`;
    room = createRoom({ language, title });
    if (!room) throw new ApiError(503, 'Too many active rooms right now. Try again in a bit.');
  }

  const message = await sendMessage({ from: me, to: userId, kind: 'room', text: 'Let’s code together!', roomId: room.id, roomTitle: title });
  new ApiResponse(201, { roomId: room.id, message, online: isOnline(userId) }, 'Room ready — invite sent').send(res);
});

// ---------------------------------------------------------------- you vs friend

const statsOf = (u, ranked, week) => {
  const s = ranked.get(String(u._id));
  const w = week.get(String(u._id));
  return {
    ...publicRow(u),
    longestStreak: u.longestStreak || 0,
    rank: s?.rank ?? null,
    score: s?.score || 0,
    solved: s?.solved || 0,
    easy: s?.easy || 0,
    medium: s?.medium || 0,
    hard: s?.hard || 0,
    aptitude: s?.aptitude || 0,
    weekScore: w?.score || 0,
    weekSolved: w?.solved || 0,
  };
};

// GET /friends/:userId/compare -> { me, them }
export const compareWithFriend = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const { userId } = req.params;
  assertObjectId(userId);
  await assertFriends(me, userId);

  const [users, all, week] = await Promise.all([
    User.find({ _id: { $in: [me, userId] } }).select(USER_FIELDS).lean(),
    getRanking('all'),
    getRanking('week'),
  ]);
  const mine = users.find((u) => String(u._id) === String(me));
  const theirs = users.find((u) => String(u._id) === String(userId));
  if (!mine || !theirs) throw ApiError.notFound('Friend not found');

  const ranked = new Map(assignRanks(all.rows).map((r) => [r.userId, r]));
  const weekly = new Map(week.rows.map((r) => [r.userId, r]));
  new ApiResponse(200, { me: statsOf(mine, ranked, weekly), them: statsOf(theirs, ranked, weekly) }).send(res);
});

// ---------------------------------------------------------------- activity feed

// GET /friends/activity?before=ISO — what my friends solved lately (newest first).
export const activityFeed = asyncHandler(async (req, res) => {
  const ids = await getFriendIds(req.user.id);
  if (!ids.length) return new ApiResponse(200, { items: [], hasMore: false }).send(res);

  const oids = ids.map((id) => new mongoose.Types.ObjectId(id));
  const since = new Date(Date.now() - FEED_DAYS * DAY);
  const b = req.query.before ? new Date(req.query.before) : null;
  const before = b && !Number.isNaN(b.getTime()) ? b : null;

  const [problemRows, aptRows] = await Promise.all([
    // first accepted submit per (friend, problem) inside the window
    Submission.aggregate([
      { $match: { user: { $in: oids }, mode: 'submit', status: 'Accepted', createdAt: { $gte: since } } },
      { $sort: { createdAt: 1 } },
      { $group: { _id: { u: '$user', p: '$problem' }, at: { $first: '$createdAt' }, language: { $first: '$language' }, runtimeMs: { $first: '$runtimeMs' } } },
      ...(before ? [{ $match: { at: { $lt: before } } }] : []),
      { $sort: { at: -1 } },
      { $limit: FEED_LIMIT + 1 },
    ]),
    // aptitude: one line per friend per day ("solved 7 aptitude questions")
    AptitudeQuestionProgress.aggregate([
      { $match: { user: { $in: oids }, status: 'solved', solvedAt: { $gte: since } } },
      { $group: { _id: { u: '$user', d: { $dateToString: { format: '%Y-%m-%d', date: '$solvedAt' } } }, count: { $sum: 1 }, at: { $max: '$solvedAt' } } },
      ...(before ? [{ $match: { at: { $lt: before } } }] : []),
      { $sort: { at: -1 } },
      { $limit: FEED_LIMIT + 1 },
    ]),
  ]);

  const events = [
    ...problemRows.map((r) => ({ type: 'problem', userId: String(r._id.u), problemId: String(r._id.p), at: r.at, language: r.language, runtimeMs: r.runtimeMs })),
    ...aptRows.map((r) => ({ type: 'aptitude', userId: String(r._id.u), count: r.count, at: r.at })),
  ].sort((a, c) => new Date(c.at) - new Date(a.at));

  const hasMore = events.length > FEED_LIMIT;
  const page = events.slice(0, FEED_LIMIT);

  const [users, problems] = await Promise.all([
    User.find({ _id: { $in: [...new Set(page.map((e) => e.userId))] } }).select(USER_FIELDS).lean(),
    Problem.find({ _id: { $in: page.filter((e) => e.problemId).map((e) => e.problemId) } }).select('title slug difficulty').lean(),
  ]);
  const byUser = new Map(users.map((u) => [String(u._id), publicRow(u)]));
  const byProblem = new Map(problems.map((p) => [String(p._id), p]));

  const items = page
    .map((e) => {
      const who = byUser.get(e.userId);
      if (!who) return null;
      const base = { id: `${e.type}:${e.userId}:${e.problemId || ''}:${new Date(e.at).getTime()}`, type: e.type, user: who, at: new Date(e.at).toISOString() };
      if (e.type === 'aptitude') return { ...base, count: e.count };
      const p = byProblem.get(e.problemId);
      if (!p) return null;
      return { ...base, problem: { title: p.title, slug: p.slug, difficulty: p.difficulty }, language: e.language, runtimeMs: e.runtimeMs };
    })
    .filter(Boolean);

  new ApiResponse(200, { items, hasMore }).send(res);
});
