import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Submission } from '../models/Submission.js';
import { AptitudeQuestionProgress } from '../models/AptitudeQuestionProgress.js';

// HackerRank-style points: harder problems are worth more. Each question counts once.
export const POINTS = { easy: 10, medium: 20, hard: 40, aptitude: 5 };

const DAY_MS = 24 * 60 * 60 * 1000;
const PERIOD_DAYS = { week: 7, month: 30 };
const MAX_ROWS = 10000;
// A full ranking is an aggregation over every user — cache it briefly.
const TTL_MS = { all: 60 * 1000, week: 5 * 60 * 1000, month: 5 * 60 * 1000 };
const cache = new Map(); // period -> { at, rows }

// Streak counters only change when someone solves something, so a lapsed streak still reads
// as its old value on the user document. Show 0 once a full day has been missed.
const todayUtc = () => {
  const n = new Date();
  return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
};
const liveStreak = (u) => {
  if (!u.streakDays || !u.lastActivityDate) return 0;
  const last = new Date(u.lastActivityDate);
  const lastUtc = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());
  return (todayUtc() - lastUtc) / DAY_MS <= 1 ? u.streakDays : 0;
};
const dayKey = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);

// Everyone with an account (admins excluded) — the "players" number shown on the board.
let totalUsersCache = { at: 0, count: 0 };
export async function getTotalUsers() {
  if (Date.now() - totalUsersCache.at < 5 * 60 * 1000) return totalUsersCache.count;
  const count = await User.countDocuments({ role: { $ne: 'admin' } });
  totalUsersCache = { at: Date.now(), count };
  return count;
}

// Shape shared by the ranking rows and the friends who haven't solved anything yet.
export const publicRow = (u) => ({
  userId: String(u._id),
  handle: u.handle,
  name: u.name,
  avatarUrl: u.avatarUrl || null,
  company: u.company || '',
  streak: liveStreak(u),
  lastActive: dayKey(u.lastActivityDate),
});

const toScore = (e, m, h, a) => e * POINTS.easy + m * POINTS.medium + h * POINTS.hard + a * POINTS.aptitude;

async function aptitudeCounts(since) {
  const match = { status: 'solved', ...(since ? { solvedAt: { $gte: since } } : {}) };
  const rows = await AptitudeQuestionProgress.aggregate([{ $match: match }, { $group: { _id: '$user', count: { $sum: 1 } } }]);
  return new Map(rows.map((r) => [String(r._id), r.count]));
}

// Rolling window: problems whose FIRST-EVER accepted submission falls inside the window,
// so re-solving an old problem this week doesn't earn points again.
async function codingCountsInWindow(since) {
  const rows = await Submission.aggregate([
    { $match: { mode: 'submit', status: 'Accepted' } },
    { $group: { _id: { user: '$user', problem: '$problem' }, first: { $min: '$createdAt' } } },
    { $match: { first: { $gte: since } } },
    { $lookup: { from: 'problems', localField: '_id.problem', foreignField: '_id', as: 'p' } },
    { $unwind: '$p' },
    { $group: { _id: { user: '$_id.user', difficulty: '$p.difficulty' }, count: { $sum: 1 } } },
  ]);
  const byUser = new Map();
  rows.forEach((r) => {
    const k = String(r._id.user);
    if (!byUser.has(k)) byUser.set(k, { Easy: 0, Medium: 0, Hard: 0 });
    byUser.get(k)[r._id.difficulty] = r.count;
  });
  return byUser;
}

async function buildRanking(period) {
  const since = period === 'all' ? null : new Date(Date.now() - PERIOD_DAYS[period] * DAY_MS);
  const apt = await aptitudeCounts(since);

  const stats = new Map(); // userId -> { e, m, h, a }
  if (period === 'all') {
    const users = await User.find({
      role: { $ne: 'admin' },
      $or: [{ easySolved: { $gt: 0 } }, { mediumSolved: { $gt: 0 } }, { hardSolved: { $gt: 0 } }],
    })
      .select('easySolved mediumSolved hardSolved')
      .lean();
    users.forEach((u) => stats.set(String(u._id), { e: u.easySolved, m: u.mediumSolved, h: u.hardSolved, a: 0 }));
  } else {
    const coding = await codingCountsInWindow(since);
    coding.forEach((c, k) => stats.set(k, { e: c.Easy, m: c.Medium, h: c.Hard, a: 0 }));
  }
  apt.forEach((count, k) => {
    const s = stats.get(k) || { e: 0, m: 0, h: 0, a: 0 };
    s.a = count;
    stats.set(k, s);
  });

  const ids = [...stats.keys()].map((k) => new mongoose.Types.ObjectId(k));
  const users = await User.find({ _id: { $in: ids }, role: { $ne: 'admin' } })
    .select('name handle avatarUrl streakDays lastActivityDate company')
    .lean();

  const rows = users.map((u) => {
    const s = stats.get(String(u._id));
    return {
      ...publicRow(u),
      easy: s.e,
      medium: s.m,
      hard: s.h,
      aptitude: s.a,
      solved: s.e + s.m + s.h + s.a,
      score: toScore(s.e, s.m, s.h, s.a),
    };
  });
  rows.sort((a, b) => b.score - a.score || b.solved - a.solved || a.handle.localeCompare(b.handle));
  return rows.slice(0, MAX_ROWS);
}

export async function getRanking(period) {
  const hit = cache.get(period);
  if (hit && Date.now() - hit.at < TTL_MS[period]) return hit;
  const entry = { at: Date.now(), rows: await buildRanking(period) };
  cache.set(period, entry);
  return entry;
}

// Standard competition ranking: equal scores share a rank (1, 2, 2, 4).
export function assignRanks(rows) {
  let prevScore = null;
  let prevRank = 0;
  return rows.map((r, i) => {
    const rank = r.score === prevScore ? prevRank : i + 1;
    prevScore = r.score;
    prevRank = rank;
    return { ...r, rank };
  });
}
