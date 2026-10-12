import mongoose from 'mongoose';
import { Problem } from '../models/Problem.js';
import { AptitudePattern } from '../models/AptitudePattern.js';
import { AptitudeQuestion } from '../models/AptitudeQuestion.js';
import { AptitudeQuestionProgress } from '../models/AptitudeQuestionProgress.js';
import { Submission } from '../models/Submission.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Medium');
export const dateKey = (d) => new Date(d).toISOString().slice(0, 10);

// ---------- dates ----------

// 'YYYY-MM-DD' -> Date at UTC midnight (rejects things like 2026-02-31 and far-off dates).
export function parseDateOnly(str) {
  const [y, m, d] = str.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    throw ApiError.badRequest(`Invalid date: ${str}`);
  }
  if (Math.abs(dt.getTime() - Date.now()) > 400 * DAY_MS) throw ApiError.badRequest(`Date out of range: ${str}`);
  return dt;
}

// The user's local calendar day as a UTC-midnight Date (tzOffset = JS getTimezoneOffset()).
export function localToday(tzOffset = 0, now = new Date()) {
  const local = new Date(now.getTime() - tzOffset * 60000);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
}

// 'YYYY-MM-DD' of a timestamp in the user's local timezone.
const localKeyOf = (date, tzOffset) => new Date(new Date(date).getTime() - tzOffset * 60000).toISOString().slice(0, 10);

// ---------- building a plan from picked questions ----------

// Never trust titles / slugs from the client: load every picked question and snapshot it.
export async function buildItems(picked) {
  const bad = picked.find((p) => !mongoose.isValidObjectId(p.id));
  if (bad) throw ApiError.badRequest('One of the selected questions is invalid');

  const problemIds = picked.filter((p) => p.type === 'problem').map((p) => p.id);
  const aptIds = picked.filter((p) => p.type === 'aptitude').map((p) => p.id);

  const [problems, aptQs] = await Promise.all([
    problemIds.length
      ? Problem.find({ _id: { $in: problemIds }, isPublished: true, isDeleted: { $ne: true } }).select('title slug difficulty').lean()
      : [],
    aptIds.length ? AptitudeQuestion.find({ _id: { $in: aptIds }, isPublished: true }).select('pattern questionText difficulty').lean() : [],
  ]);
  const patterns = aptQs.length
    ? await AptitudePattern.find({ _id: { $in: [...new Set(aptQs.map((q) => String(q.pattern)))] } }).select('slug').lean()
    : [];

  const problemById = new Map(problems.map((p) => [String(p._id), p]));
  const aptById = new Map(aptQs.map((q) => [String(q._id), q]));
  const slugByPattern = new Map(patterns.map((p) => [String(p._id), p.slug]));

  const items = picked.map((p, order) => {
    const date = parseDateOnly(p.date);
    if (p.type === 'problem') {
      const doc = problemById.get(p.id);
      if (!doc) return null;
      return { date, order, type: 'problem', title: doc.title, difficulty: doc.difficulty, problem: doc._id, problemSlug: doc.slug };
    }
    const q = aptById.get(p.id);
    if (!q) return null;
    const text = q.questionText.replace(/\s+/g, ' ').trim();
    return {
      date, order, type: 'aptitude', title: text.length > 110 ? `${text.slice(0, 107)}…` : text,
      difficulty: cap(q.difficulty), aptitudeQuestion: q._id, patternSlug: slugByPattern.get(String(q.pattern)) || null,
    };
  });

  if (items.some((i) => i === null)) throw ApiError.badRequest('Some selected questions are no longer available. Remove them and try again.');
  return items.sort((a, b) => a.date - b.date || a.order - b.order).map((it, i) => ({ ...it, order: i }));
}

// ---------- progress (always derived from real solves) ----------

// Map<userId, { doneIds:Set<itemId>, doneAt:Map<itemId, Date>, user }>
// doneIds comes from the user's solved-problem list / aptitude progress (so older solves count);
// doneAt is the first time we can see them solving it (accepted submission / aptitude solvedAt) and
// is only used for "last active", the 7-day chart and the activity feed.
export async function loadMemberProgress(plan, userIds) {
  const ids = userIds.map(String);
  const oids = ids.map((i) => new mongoose.Types.ObjectId(i));
  const problemItems = plan.items.filter((i) => i.type === 'problem');
  const aptItems = plan.items.filter((i) => i.type === 'aptitude');

  const [users, aptRows, subRows] = await Promise.all([
    User.find({ _id: { $in: ids } }).select('name handle avatarUrl streakDays solvedProblems').lean(),
    aptItems.length
      ? AptitudeQuestionProgress.find({ user: { $in: ids }, question: { $in: aptItems.map((i) => i.aptitudeQuestion) }, status: 'solved' })
          .select('user question solvedAt')
          .lean()
      : [],
    problemItems.length
      ? Submission.aggregate([
          { $match: { user: { $in: oids }, problem: { $in: problemItems.map((i) => i.problem) }, mode: 'submit', status: 'Accepted' } },
          { $group: { _id: { user: '$user', problem: '$problem' }, at: { $min: '$createdAt' } } },
        ])
      : [],
  ]);

  const aptByUser = new Map();
  aptRows.forEach((r) => {
    const k = String(r.user);
    if (!aptByUser.has(k)) aptByUser.set(k, new Map());
    aptByUser.get(k).set(String(r.question), r.solvedAt);
  });
  const subAtByUser = new Map();
  subRows.forEach((r) => {
    const k = String(r._id.user);
    if (!subAtByUser.has(k)) subAtByUser.set(k, new Map());
    subAtByUser.get(k).set(String(r._id.problem), r.at);
  });

  const result = new Map();
  users.forEach((u) => {
    const uid = String(u._id);
    const solved = new Set((u.solvedProblems || []).map(String));
    const apt = aptByUser.get(uid) || new Map();
    const subAt = subAtByUser.get(uid) || new Map();
    const doneIds = new Set();
    const doneAt = new Map();
    plan.items.forEach((item) => {
      const id = String(item._id);
      if (item.type === 'problem' && solved.has(String(item.problem))) {
        doneIds.add(id);
        const at = subAt.get(String(item.problem));
        if (at) doneAt.set(id, at);
      } else if (item.type === 'aptitude' && apt.has(String(item.aptitudeQuestion))) {
        doneIds.add(id);
        const at = apt.get(String(item.aptitudeQuestion));
        if (at) doneAt.set(id, at);
      }
    });
    result.set(uid, { doneIds, doneAt, user: u });
  });
  return result;
}

export function summarize(plan, doneIds, today) {
  const total = plan.items.length;
  const dates = plan.items.map((i) => i.date.getTime());
  const first = dates.length ? Math.min(...dates) : null;
  const last = dates.length ? Math.max(...dates) : null;
  const isDone = (i) => doneIds.has(String(i._id));
  const t = today.getTime();

  const done = plan.items.filter(isDone).length;
  const todayItems = plan.items.filter((i) => i.date.getTime() === t);
  const overdue = plan.items.filter((i) => i.date.getTime() < t && !isDone(i)).length;
  const expected = plan.items.filter((i) => i.date.getTime() <= t).length; // should be done by end of today

  let status = 'on-track';
  if (total > 0 && done === total) status = 'completed';
  else if (first !== null && t < first) status = 'upcoming';
  else if (overdue > 0) status = 'behind';

  // Plan streak: consecutive scheduled days (up to today) where everything was finished.
  // Today only counts once it's complete — an unfinished today never breaks the streak.
  const byDay = new Map();
  plan.items.forEach((i) => {
    const k = i.date.getTime();
    if (k > t) return;
    const e = byDay.get(k) || { all: true };
    if (!isDone(i)) e.all = false;
    byDay.set(k, e);
  });
  let streak = 0;
  for (const [k, e] of [...byDay.entries()].sort((a, b) => b[0] - a[0])) {
    if (e.all) streak += 1;
    else if (k === t) continue;
    else break;
  }

  return {
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
    todayTotal: todayItems.length,
    todayDone: todayItems.filter(isDone).length,
    overdue,
    pace: total ? done - expected : 0, // >0 ahead, <0 behind schedule
    streak,
    status,
    startDate: first !== null ? dateKey(first) : null,
    endDate: last !== null ? dateKey(last) : null,
    daysLeft: last !== null ? Math.max(0, Math.round((last - t) / DAY_MS) + 1) : 0,
  };
}

// Solves per local day for the last 7 days (oldest -> today) plus the latest solve time.
export function activitySummary(progress, tzOffset, todayKey) {
  const days = Array.from({ length: 7 }, (_, i) => new Date(new Date(`${todayKey}T00:00:00Z`).getTime() - (6 - i) * DAY_MS).toISOString().slice(0, 10));
  const counts = new Map(days.map((d) => [d, 0]));
  let lastActiveAt = null;
  progress.doneAt.forEach((at) => {
    const k = localKeyOf(at, tzOffset);
    if (counts.has(k)) counts.set(k, counts.get(k) + 1);
    if (!lastActiveAt || at > lastActiveAt) lastActiveAt = at;
  });
  return { week: days.map((d) => counts.get(d)), lastActiveAt };
}

export function serializeItem(item, doneIds, today, doneBy = []) {
  const done = doneIds.has(String(item._id));
  return {
    id: String(item._id),
    date: dateKey(item.date),
    type: item.type,
    title: item.title,
    difficulty: item.difficulty,
    problemId: item.problem ? String(item.problem) : null,
    problemSlug: item.problemSlug,
    aptitudeQuestionId: item.aptitudeQuestion ? String(item.aptitudeQuestion) : null,
    patternSlug: item.patternSlug,
    done,
    overdue: !done && item.date.getTime() < today.getTime(),
    doneBy,
  };
}
