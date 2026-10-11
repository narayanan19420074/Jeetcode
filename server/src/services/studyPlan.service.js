import { Problem } from '../models/Problem.js';
import { AptitudePattern } from '../models/AptitudePattern.js';
import { AptitudeQuestion } from '../models/AptitudeQuestion.js';
import { AptitudeQuestionProgress } from '../models/AptitudeQuestionProgress.js';
import { StudyPlanProgress } from '../models/StudyPlanProgress.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const DIFF_RANK = { Easy: 0, Medium: 1, Hard: 2 };
const APT_RANK = { easy: 0, medium: 1, hard: 2 };
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : null);

// ---------- dates ----------

// 'YYYY-MM-DD' -> Date at UTC midnight (rejects things like 2026-02-31).
export function parseDateOnly(str) {
  const [y, m, d] = str.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    throw ApiError.badRequest('Invalid start date');
  }
  return dt;
}

// The user's local calendar day as a UTC-midnight Date. tzOffset is the value of
// JS Date#getTimezoneOffset() from the browser (IST = -330).
export function localToday(tzOffset = 0, now = new Date()) {
  const local = new Date(now.getTime() - tzOffset * 60000);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
}

// 1-based day number of "today" inside the plan (<=0 means it hasn't started yet).
export const todayDayNumber = (plan, tzOffset) =>
  Math.round((localToday(tzOffset) - new Date(plan.startDate)) / DAY_MS) + 1;

// ---------- plan generation ----------

export async function generateItems({
  durationDays,
  problemsPerDay,
  aptitudePerDay,
  difficulties,
  tags,
  aptitudePatternSlugs,
  customTasks,
}) {
  const items = [];
  const counters = new Map(); // day -> next order
  const push = (day, item) => {
    const order = counters.get(day) || 0;
    counters.set(day, order + 1);
    items.push({ ...item, day, order });
  };

  if (problemsPerDay > 0) {
    const filter = {
      isPublished: true,
      ...(difficulties.length ? { difficulty: { $in: difficulties } } : {}),
      ...(tags.length ? { tags: { $in: tags } } : {}),
    };
    const docs = await Problem.find(filter).select('title slug difficulty createdAt').sort({ createdAt: 1 }).limit(600).lean();
    // Easy -> Medium -> Hard so the plan ramps up like a real study schedule.
    docs.sort((a, b) => DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty] || a.createdAt - b.createdAt);
    docs.slice(0, durationDays * problemsPerDay).forEach((p, i) =>
      push(Math.floor(i / problemsPerDay) + 1, {
        type: 'problem',
        title: p.title,
        difficulty: p.difficulty,
        problem: p._id,
        problemSlug: p.slug,
      })
    );
  }

  if (aptitudePerDay > 0) {
    const patternFilter = { isPublished: true, ...(aptitudePatternSlugs.length ? { slug: { $in: aptitudePatternSlugs } } : {}) };
    const patterns = await AptitudePattern.find(patternFilter).select('slug order').sort({ order: 1 }).lean();
    if (patterns.length) {
      const slugById = new Map(patterns.map((p) => [String(p._id), p.slug]));
      const orderById = new Map(patterns.map((p, i) => [String(p._id), i]));
      const qs = await AptitudeQuestion.find({ pattern: { $in: patterns.map((p) => p._id) }, isPublished: true })
        .select('pattern questionText difficulty order')
        .limit(1500)
        .lean();
      qs.sort(
        (a, b) =>
          orderById.get(String(a.pattern)) - orderById.get(String(b.pattern)) ||
          APT_RANK[a.difficulty] - APT_RANK[b.difficulty] ||
          a.order - b.order
      );
      qs.slice(0, durationDays * aptitudePerDay).forEach((q, i) => {
        const text = q.questionText.replace(/\s+/g, ' ').trim();
        push(Math.floor(i / aptitudePerDay) + 1, {
          type: 'aptitude',
          title: text.length > 110 ? `${text.slice(0, 107)}…` : text,
          difficulty: cap(q.difficulty),
          aptitudeQuestion: q._id,
          patternSlug: slugById.get(String(q.pattern)),
        });
      });
    }
  }

  customTasks.forEach((t) => push(t.day, { type: 'custom', title: t.title }));

  if (items.length === 0) {
    throw ApiError.badRequest('No published problems / aptitude questions matched these filters. Try wider filters or add custom tasks.');
  }
  return items;
}

// ---------- progress ----------

// Returns Map<userIdString, { doneIds:Set<itemIdString>, user }> for the given users.
export async function loadMemberProgress(plan, userIds) {
  const ids = userIds.map(String);
  const problemItemIds = plan.items.filter((i) => i.type === 'problem').map((i) => i.problem);
  const aptItemIds = plan.items.filter((i) => i.type === 'aptitude').map((i) => i.aptitudeQuestion);

  const [users, aptSolved, manual] = await Promise.all([
    User.find({ _id: { $in: ids } }).select('name handle avatarUrl streakDays solvedProblems').lean(),
    aptItemIds.length
      ? AptitudeQuestionProgress.find({ user: { $in: ids }, question: { $in: aptItemIds }, status: 'solved' })
          .select('user question')
          .lean()
      : [],
    StudyPlanProgress.find({ plan: plan._id, user: { $in: ids } }).select('user doneItems').lean(),
  ]);

  const aptByUser = new Map();
  aptSolved.forEach((r) => {
    const k = String(r.user);
    if (!aptByUser.has(k)) aptByUser.set(k, new Set());
    aptByUser.get(k).add(String(r.question));
  });
  const manualByUser = new Map(manual.map((m) => [String(m.user), new Set(m.doneItems.map(String))]));

  const result = new Map();
  users.forEach((u) => {
    const solvedProblems = new Set((u.solvedProblems || []).map(String));
    const aptSet = aptByUser.get(String(u._id)) || new Set();
    const manualSet = manualByUser.get(String(u._id)) || new Set();
    const doneIds = new Set();
    plan.items.forEach((item) => {
      const done =
        (item.type === 'problem' && solvedProblems.has(String(item.problem))) ||
        (item.type === 'aptitude' && aptSet.has(String(item.aptitudeQuestion))) ||
        (item.type === 'custom' && manualSet.has(String(item._id)));
      if (done) doneIds.add(String(item._id));
    });
    result.set(String(u._id), { doneIds, user: u });
  });
  return result;
}

// Totals / status for one member given today's day number.
export function summarize(plan, doneIds, todayDay) {
  const total = plan.items.length;
  const done = plan.items.filter((i) => doneIds.has(String(i._id))).length;
  const todayItems = plan.items.filter((i) => i.day === todayDay);
  const todayDone = todayItems.filter((i) => doneIds.has(String(i._id))).length;
  const overdue = plan.items.filter((i) => i.day < todayDay && !doneIds.has(String(i._id))).length;

  let status = 'on-track';
  if (total > 0 && done === total) status = 'completed';
  else if (todayDay < 1) status = 'not-started';
  else if (todayDay > plan.durationDays) status = 'ended';
  else if (overdue > 0) status = 'behind';

  return {
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
    todayDay,
    todayTotal: todayItems.length,
    todayDone,
    overdue,
    status,
  };
}

export function serializeItem(item, doneIds, todayDay) {
  const done = doneIds.has(String(item._id));
  return {
    id: String(item._id),
    day: item.day,
    order: item.order,
    type: item.type,
    title: item.title,
    difficulty: item.difficulty,
    problemSlug: item.problemSlug,
    patternSlug: item.patternSlug,
    aptitudeQuestionId: item.aptitudeQuestion ? String(item.aptitudeQuestion) : null,
    done,
    overdue: !done && item.day < todayDay,
  };
}

export const sortItems = (items) => [...items].sort((a, b) => a.day - b.day || a.order - b.order);
