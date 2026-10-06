import { AptitudePattern } from '../models/AptitudePattern.js';
import { AptitudeQuestion } from '../models/AptitudeQuestion.js';
import { AptitudeAttempt } from '../models/AptitudeAttempt.js';
import { AptitudeProgress } from '../models/AptitudeProgress.js';
import { AptitudeQuestionProgress } from '../models/AptitudeQuestionProgress.js';
import { AptitudeSet } from '../models/AptitudeSet.js';
import { ApiError } from '../utils/ApiError.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Learn is now a *recommended* step, not a hard gate (LeetCode never blocks
// you from a problem; TCS iON never asks what you studied). Flip to true to
// restore the old "finish Learn first" rule for Test mode.
export const REQUIRE_LEARN_BEFORE_TEST = false;

// Test difficulty blueprint — same 30/50/20 mix the content brief uses.
const TEST_MIX = { easy: 0.3, hard: 0.2 }; // medium = remainder

// Seconds of grace after expiresAt in which the server still accepts the
// final autosave / submit (network latency on the auto-submit at 00:00).
const SUBMIT_GRACE_SEC = 30;
const COMPLETE_GRACE_SEC = 10;

// Target solve time per difficulty (seconds) — shown in practice like
// LeetCode's runtime hint, and used for the "slow / on-pace" label.
export const TARGET_TIME_SEC = { easy: 45, medium: 90, hard: 150 };

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const prettify = (slug) =>
  String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Question metadata cache. The hub / practice list read the *whole* bank's
// light metadata (id, order, sub-pattern, difficulty, text) on nearly every
// request; for a ~250-1000 question pattern that is a few hundred KB, so a
// short TTL cache keeps Mongo out of the hot path. Invalidated whenever an
// admin edits questions (recountPatternQuestions) or the seed re-runs.
const META_TTL_MS = 60 * 1000;
const metaCache = new Map(); // patternId -> { at, items }

export function invalidateQuestionMeta(patternId) {
  if (patternId) metaCache.delete(String(patternId));
  else metaCache.clear();
}

export async function getQuestionMeta(patternId) {
  const key = String(patternId);
  const hit = metaCache.get(key);
  if (hit && Date.now() - hit.at < META_TTL_MS) return hit.items;

  const items = await AptitudeQuestion.find({ pattern: patternId, isPublished: true })
    .select('order subPattern difficulty questionText setId attemptsCount correctCount')
    .sort({ order: 1 })
    .lean();
  metaCache.set(key, { at: Date.now(), items });
  return items;
}

/** Sub-pattern list for a pattern; falls back to slugs found on questions (legacy seeds). */
export function resolveSubPatterns(pattern, metaItems = []) {
  if (pattern.subPatterns?.length) return pattern.subPatterns;
  const seen = [];
  for (const q of metaItems) {
    if (q.subPattern && !seen.includes(q.subPattern)) seen.push(q.subPattern);
  }
  return seen.map((slug) => ({ slug, title: prettify(slug) }));
}

// ---------------------------------------------------------------------------
// Pattern list / guards
// ---------------------------------------------------------------------------

/**
 * Builds the home-page pattern list: every published pattern plus this
 * user's progress + unlock state. Pattern with the lowest `order` is
 * always unlocked; every other pattern needs a passed (bestScore >=
 * passPercentage) progress doc on the pattern immediately before it.
 */
export async function getPatternsWithProgress(userId) {
  const patterns = await AptitudePattern.find({ isPublished: true }).sort({ order: 1 }).lean();
  const progressDocs = userId
    ? await AptitudeProgress.find({ user: userId, pattern: { $in: patterns.map((p) => p._id) } }).lean()
    : [];
  const progressByPattern = new Map(progressDocs.map((p) => [String(p.pattern), p]));

  let previousPassed = true; // order:1 pattern is always open
  return patterns.map((pattern, idx) => {
    const progress = progressByPattern.get(String(pattern._id));
    const bestScore = progress?.bestScore ?? 0;
    const unlocked = idx === 0 || previousPassed;
    previousPassed = bestScore >= pattern.passPercentage;

    return {
      ...pattern,
      progress: {
        bestScore,
        attemptsCount: progress?.attemptsCount ?? 0,
        learnCompleted: progress?.learnCompleted ?? false,
        completedSubsections: progress?.completedSubsections ?? [],
        unlocked: !!userId && unlocked,
      },
    };
  });
}

/** Guards direct-URL access to a locked pattern (server-side, not just UI hiding). */
export async function assertPatternUnlocked(userId, pattern) {
  if (!pattern) throw ApiError.notFound('Pattern not found');

  const prevPattern = await AptitudePattern.findOne({
    isPublished: true,
    order: { $lt: pattern.order },
  }).sort({ order: -1 });

  if (!prevPattern) return; // first pattern, always open

  const prevProgress = await AptitudeProgress.findOne({ user: userId, pattern: prevPattern._id });
  const passed = (prevProgress?.bestScore ?? 0) >= prevPattern.passPercentage;
  if (!passed) {
    throw ApiError.forbidden('Complete the previous pattern first');
  }
}

/**
 * Guards Test start when REQUIRE_LEARN_BEFORE_TEST is on (server-side, same
 * "never trust the client" reasoning as assertPatternUnlocked).
 */
export async function assertLearnCompleted(userId, pattern) {
  if (!REQUIRE_LEARN_BEFORE_TEST) return;
  const progress = await AptitudeProgress.findOne({ user: userId, pattern: pattern._id });
  if (!progress?.learnCompleted) {
    throw ApiError.forbidden('Complete the Learn section first');
  }
}

// ---------------------------------------------------------------------------
// Learn progress
// ---------------------------------------------------------------------------

/**
 * Legacy "Mark as Learned" — kept for backward compat. Upserts so a user who
 * never had a progress doc yet still gets one.
 */
export async function markLearnCompleted(userId, patternId) {
  return AptitudeProgress.findOneAndUpdate(
    { user: userId, pattern: patternId },
    { $set: { learnCompleted: true } },
    { upsert: true, new: true }
  );
}

/**
 * Called by the Learn page every time a lesson is completed. Adds the ID to
 * completedSubsections, then auto-flips learnCompleted once every lesson is
 * done. totalSubsections comes from the client — a harmless count, not a
 * security input.
 */
export async function markSubsectionComplete(userId, patternId, subsectionId, totalSubsections) {
  const progress = await AptitudeProgress.findOneAndUpdate(
    { user: userId, pattern: patternId },
    { $addToSet: { completedSubsections: subsectionId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (!progress.learnCompleted && progress.completedSubsections.length >= totalSubsections) {
    progress.learnCompleted = true;
    await progress.save();
  }

  return progress;
}

// ---------------------------------------------------------------------------
// Hub (pattern detail) stats
// ---------------------------------------------------------------------------

/**
 * LeetCode-style progress snapshot for the hub page:
 *   totals + per-difficulty solved/total + per-sub-pattern mastery
 * Computed in memory from the cached question metadata and the user's
 * per-question progress docs (a few hundred rows at most per pattern).
 */
export async function getPracticeStats(userId, pattern) {
  const meta = await getQuestionMeta(pattern._id);
  const subPatterns = resolveSubPatterns(pattern, meta);
  const progressDocs = await AptitudeQuestionProgress.find({ user: userId, pattern: pattern._id }).lean();
  const progByQ = new Map(progressDocs.map((p) => [String(p.question), p]));

  const byDifficulty = {
    easy: { total: 0, solved: 0 },
    medium: { total: 0, solved: 0 },
    hard: { total: 0, solved: 0 },
  };
  const subMap = new Map(
    subPatterns.map((s) => [s.slug, { slug: s.slug, title: s.title, total: 0, solved: 0, attempted: 0, tries: 0, correct: 0 }])
  );

  let solved = 0;
  let attempted = 0;
  for (const q of meta) {
    const p = progByQ.get(String(q._id));
    const diff = byDifficulty[q.difficulty] ?? byDifficulty.medium; // legacy docs may lack difficulty
    diff.total += 1;
    const sub = subMap.get(q.subPattern);
    if (sub) sub.total += 1;
    if (!p) continue;
    attempted += 1;
    if (sub) {
      sub.attempted += 1;
      sub.tries += p.attempts ?? 0;
      sub.correct += p.correctAttempts ?? 0;
    }
    if (p.status === 'solved') {
      solved += 1;
      diff.solved += 1;
      if (sub) sub.solved += 1;
    }
  }

  const bySubPattern = [...subMap.values()].map((s) => ({
    slug: s.slug,
    title: s.title,
    total: s.total,
    solved: s.solved,
    attempted: s.attempted,
    accuracy: s.tries > 0 ? Math.round((s.correct / s.tries) * 100) : null,
  }));

  // Recommendation: lowest accuracy among sub-patterns the learner has
  // touched with enough signal; otherwise the first one with unsolved work.
  const touched = bySubPattern.filter((s) => s.accuracy !== null);
  let recommendedSubPattern = null;
  const weak = touched.filter((s) => s.solved < s.total).sort((a, b) => a.accuracy - b.accuracy)[0];
  if (weak && weak.accuracy < 75) recommendedSubPattern = weak.slug;
  else recommendedSubPattern = bySubPattern.find((s) => s.solved < s.total)?.slug ?? null;

  const bookmarkedCount = progressDocs.filter((p) => p.bookmarked).length;

  return {
    totals: { total: meta.length, solved, attempted },
    byDifficulty,
    bySubPattern,
    bookmarkedCount,
    recommendedSubPattern,
  };
}

// ---------------------------------------------------------------------------
// Practice (LeetCode-style problem set)
// ---------------------------------------------------------------------------

const snippet = (text, n = 160) => {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

/** Filtered + paginated question list with the caller's per-question status. */
export async function listPracticeQuestions(userId, pattern, filters) {
  const { subPattern, difficulty, status, search, page = 1, limit = 50 } = filters;
  const meta = await getQuestionMeta(pattern._id);
  const progressDocs = await AptitudeQuestionProgress.find({ user: userId, pattern: pattern._id }).lean();
  const progByQ = new Map(progressDocs.map((p) => [String(p.question), p]));

  const needle = search ? String(search).toLowerCase() : null;

  const rows = [];
  for (const q of meta) {
    if (subPattern && q.subPattern !== subPattern) continue;
    if (difficulty && q.difficulty !== difficulty) continue;
    if (needle && !q.questionText.toLowerCase().includes(needle)) continue;

    const p = progByQ.get(String(q._id));
    const st = p ? p.status : 'todo';
    if (status === 'todo' && st !== 'todo') continue;
    if (status === 'solved' && st !== 'solved') continue;
    if (status === 'attempted' && st !== 'attempted') continue;
    if (status === 'unsolved' && st === 'solved') continue;
    if (status === 'bookmarked' && !p?.bookmarked) continue;

    rows.push({
      _id: q._id,
      order: q.order,
      title: snippet(q.questionText),
      subPattern: q.subPattern,
      difficulty: q.difficulty,
      hasSet: !!q.setId,
      status: st,
      bookmarked: !!p?.bookmarked,
      attempts: p?.attempts ?? 0,
      bestTimeSec: p?.bestTimeSec ?? null,
      acceptance: q.attemptsCount > 0 ? Math.round((q.correctCount / q.attemptsCount) * 100) : null,
    });
  }

  const total = rows.length;
  const start = (page - 1) * limit;
  return { items: rows.slice(start, start + limit), total, page, limit };
}

async function loadSet(patternId, setId) {
  if (!setId) return null;
  return AptitudeSet.findOne({ pattern: patternId, setId }).select('-__v -createdAt -updatedAt -pattern').lean();
}

/** One practice question (no answer key) + the caller's status + prev/next ids. */
export async function getPracticeQuestion(userId, pattern, questionId) {
  const question = await AptitudeQuestion.findOne(
    { _id: questionId, pattern: pattern._id, isPublished: true },
    AptitudeQuestion.publicProjection()
  ).lean();
  if (!question) throw ApiError.notFound('Question not found');

  const [set, stat, meta] = await Promise.all([
    loadSet(pattern._id, question.setId),
    AptitudeQuestionProgress.findOne({ user: userId, question: question._id }).lean(),
    getQuestionMeta(pattern._id),
  ]);

  const idx = meta.findIndex((m) => String(m._id) === String(question._id));
  const progressDocs = await AptitudeQuestionProgress.find({ user: userId, pattern: pattern._id, status: 'solved' })
    .select('question')
    .lean();
  const solvedIds = new Set(progressDocs.map((p) => String(p.question)));

  let nextUnsolvedId = null;
  for (let step = 1; step < meta.length; step += 1) {
    const cand = meta[(idx + step) % meta.length];
    if (!solvedIds.has(String(cand._id))) {
      nextUnsolvedId = cand._id;
      break;
    }
  }

  return {
    question,
    set,
    position: idx + 1,
    totalInPattern: meta.length,
    prevId: idx > 0 ? meta[idx - 1]._id : null,
    nextId: idx >= 0 && idx < meta.length - 1 ? meta[idx + 1]._id : null,
    nextUnsolvedId,
    targetTimeSec: TARGET_TIME_SEC[question.difficulty] ?? 90,
    progress: stat
      ? {
          status: stat.status,
          attempts: stat.attempts,
          bestTimeSec: stat.bestTimeSec,
          bookmarked: stat.bookmarked,
        }
      : { status: 'todo', attempts: 0, bestTimeSec: null, bookmarked: false },
  };
}

/**
 * Grades one practice submission server-side, records it against the user's
 * per-question progress and the question's global acceptance counters, and
 * only THEN reveals the answer key (explanation + shortcut).
 */
export async function checkPracticeAnswer({ userId, pattern, questionId, selectedOption, timeSpentSec }) {
  const question = await AptitudeQuestion.findOne({ _id: questionId, pattern: pattern._id, isPublished: true });
  if (!question) throw ApiError.notFound('Question not found');

  const isCorrect = question.correctOptionIndex === selectedOption;
  const time = Number.isFinite(timeSpentSec) ? Math.max(0, Math.min(Math.round(timeSpentSec), 3600)) : null;

  const existing = await AptitudeQuestionProgress.findOne({ user: userId, question: question._id });
  const doc =
    existing ||
    new AptitudeQuestionProgress({
      user: userId,
      pattern: pattern._id,
      question: question._id,
      subPattern: question.subPattern,
      difficulty: question.difficulty,
    });

  const wasSolved = doc.status === 'solved';
  doc.attempts += 1;
  doc.lastSelectedOption = selectedOption;
  doc.lastTimeSec = time;
  if (isCorrect) {
    doc.correctAttempts += 1;
    doc.status = 'solved';
    if (!wasSolved) doc.solvedAt = new Date();
    if (time !== null && (doc.bestTimeSec === null || time < doc.bestTimeSec)) doc.bestTimeSec = time;
  }
  await doc.save();

  await AptitudeQuestion.updateOne(
    { _id: question._id },
    { $inc: { attemptsCount: 1, correctCount: isCorrect ? 1 : 0 } }
  );

  return {
    isCorrect,
    correctOptionIndex: question.correctOptionIndex,
    explanation: question.explanation,
    shortcut: question.shortcut,
    targetTimeSec: TARGET_TIME_SEC[question.difficulty] ?? 90,
    progress: {
      status: doc.status,
      attempts: doc.attempts,
      bestTimeSec: doc.bestTimeSec,
      bookmarked: doc.bookmarked,
    },
  };
}

export async function setBookmark({ userId, pattern, questionId, bookmarked }) {
  const question = await AptitudeQuestion.findOne({ _id: questionId, pattern: pattern._id, isPublished: true }).select(
    'subPattern difficulty'
  );
  if (!question) throw ApiError.notFound('Question not found');

  const doc = await AptitudeQuestionProgress.findOneAndUpdate(
    { user: userId, question: question._id },
    {
      $set: { bookmarked: !!bookmarked },
      $setOnInsert: {
        pattern: pattern._id,
        subPattern: question.subPattern,
        difficulty: question.difficulty,
        status: 'attempted',
        attempts: 0,
      },
    },
    { upsert: true, new: true }
  );
  return { bookmarked: doc.bookmarked };
}

// ---------------------------------------------------------------------------
// Attempts (Test mode + legacy practice sessions)
// ---------------------------------------------------------------------------

/**
 * Picks the questions for one Test attempt: `count` questions with a 30/50/20
 * easy/medium/hard blueprint, spread evenly across sub-patterns inside each
 * difficulty, preferring questions the learner has NOT seen in their last few
 * tests. Falls back gracefully when a bucket is short.
 */
async function pickTestQuestions(userId, pattern, meta) {
  const total = meta.length;
  const count = Math.min(pattern.testQuestionCount || 25, total);

  const recent = await AptitudeAttempt.find({ user: userId, pattern: pattern._id, mode: 'test' })
    .sort({ createdAt: -1 })
    .limit(4)
    .select('answers.question')
    .lean();
  const seen = new Set(recent.flatMap((a) => a.answers.map((x) => String(x.question))));

  const nEasy = Math.round(count * TEST_MIX.easy);
  const nHard = Math.round(count * TEST_MIX.hard);
  const quotas = { easy: nEasy, hard: nHard, medium: count - nEasy - nHard };

  const picked = [];
  const pickedIds = new Set();

  const takeFromBucket = (difficulty, n) => {
    // sub-pattern -> queue (unseen first, each half shuffled)
    const queues = new Map();
    for (const q of shuffled(meta.filter((m) => m.difficulty === difficulty))) {
      if (!queues.has(q.subPattern)) queues.set(q.subPattern, []);
      queues.get(q.subPattern).push(q);
    }
    for (const [k, arr] of queues) {
      queues.set(k, [...arr.filter((q) => !seen.has(String(q._id))), ...arr.filter((q) => seen.has(String(q._id)))]);
    }
    const order = shuffled([...queues.keys()]);
    let guard = 0;
    while (picked.filter((p) => p.difficulty === difficulty).length < n && guard < 10000) {
      guard += 1;
      let progressed = false;
      for (const key of order) {
        if (picked.filter((p) => p.difficulty === difficulty).length >= n) break;
        const q = queues.get(key)?.shift();
        if (q && !pickedIds.has(String(q._id))) {
          picked.push(q);
          pickedIds.add(String(q._id));
          progressed = true;
        }
      }
      if (!progressed) break;
    }
  };

  takeFromBucket('easy', quotas.easy);
  takeFromBucket('medium', quotas.medium);
  takeFromBucket('hard', quotas.hard);

  // Top up from whatever is left if a bucket was short.
  if (picked.length < count) {
    const rest = shuffled(meta.filter((m) => !pickedIds.has(String(m._id))));
    rest.sort((a, b) => Number(seen.has(String(a._id))) - Number(seen.has(String(b._id))));
    for (const q of rest) {
      if (picked.length >= count) break;
      picked.push(q);
      pickedIds.add(String(q._id));
    }
  }

  // Exam order: easy -> hard feels natural, but real papers are mixed; shuffle.
  return shuffled(picked);
}

/** Grades + closes any in-progress test attempt whose clock has run out. */
export async function finalizeIfExpired(attempt) {
  if (attempt.status === 'in-progress' && attempt.mode === 'test' && attempt.expiresAt) {
    if (Date.now() > attempt.expiresAt.getTime() + SUBMIT_GRACE_SEC * 1000) {
      return gradeAttempt(attempt);
    }
  }
  return attempt;
}

export async function startAttempt({ userId, pattern, mode }) {
  if (mode === 'test') {
    // Resume instead of silently creating a second paper. Expired leftovers
    // are graded + closed first so they still count in history / best score.
    const open = await AptitudeAttempt.find({ user: userId, pattern: pattern._id, mode: 'test', status: 'in-progress' });
    for (const a of open) {
      const done = await finalizeIfExpired(a);
      if (done.status === 'in-progress') return { attempt: done, resumed: true };
    }
  }

  const meta = await getQuestionMeta(pattern._id);
  if (meta.length === 0) {
    throw ApiError.conflict('This pattern has no questions yet');
  }

  const chosen = mode === 'test' ? await pickTestQuestions(userId, pattern, meta) : meta;

  const now = Date.now();
  const attempt = await AptitudeAttempt.create({
    user: userId,
    pattern: pattern._id,
    mode,
    startedAt: now,
    expiresAt: mode === 'test' ? new Date(now + pattern.timeLimitMinutes * 60 * 1000) : null,
    answers: chosen.map((q) => ({ question: q._id, selectedOption: null, isCorrect: null })),
    totalCount: chosen.length,
  });

  return { attempt, resumed: false };
}

/** Practice-mode instant check for legacy practice *sessions*. */
export async function checkSingleAnswer({ attempt, questionId, selectedOption }) {
  const question = await AptitudeQuestion.findById(questionId);
  if (!question || String(question.pattern) !== String(attempt.pattern)) {
    throw ApiError.notFound('Question not found in this attempt');
  }

  const isCorrect = question.correctOptionIndex === selectedOption;
  const entry = attempt.answers.find((a) => String(a.question) === String(questionId));
  if (entry) {
    entry.selectedOption = selectedOption;
    entry.isCorrect = isCorrect;
    await attempt.save();
  }

  return {
    isCorrect,
    correctOptionIndex: question.correctOptionIndex,
    explanation: question.explanation,
    shortcut: question.shortcut,
  };
}

/**
 * Loads the question set of an attempt in *attempt order* (not DB order) with
 * the answer key stripped, plus shared stimuli and the learner's saved state.
 */
export async function getAttemptPaper(attempt) {
  const ids = attempt.answers.map((a) => a.question);
  const docs = await AptitudeQuestion.find({ _id: { $in: ids } }, AptitudeQuestion.publicProjection()).lean();
  const byId = new Map(docs.map((d) => [String(d._id), d]));
  const questions = ids.map((id) => byId.get(String(id))).filter(Boolean);

  const setIds = [...new Set(questions.map((q) => q.setId).filter(Boolean))];
  const sets = setIds.length
    ? await AptitudeSet.find({ pattern: attempt.pattern, setId: { $in: setIds } })
        .select('-__v -createdAt -updatedAt -pattern')
        .lean()
    : [];

  const state = {};
  for (const a of attempt.answers) {
    state[String(a.question)] = {
      selectedOption: a.selectedOption,
      markedForReview: !!a.markedForReview,
      visited: !!a.visited,
      timeSpentSec: a.timeSpentSec ?? 0,
    };
  }

  return { questions, sets, state };
}

/**
 * Applies autosave updates from the exam interface. Server never trusts the
 * client clock: updates are rejected once the attempt is past
 * expiresAt + grace. timeSpentSec only ever moves forward.
 */
export function applyAnswerUpdates(attempt, updates) {
  if (!Array.isArray(updates)) return 0;
  const byQ = new Map(attempt.answers.map((a) => [String(a.question), a]));
  let applied = 0;

  for (const u of updates.slice(0, 200)) {
    const entry = byQ.get(String(u?.questionId));
    if (!entry) continue;

    if (u.selectedOption === null) entry.selectedOption = null;
    else if (Number.isInteger(u.selectedOption) && u.selectedOption >= 0 && u.selectedOption <= 3) {
      entry.selectedOption = u.selectedOption;
    }
    if (typeof u.markedForReview === 'boolean') entry.markedForReview = u.markedForReview;
    if (typeof u.visited === 'boolean') entry.visited = entry.visited || u.visited;
    if (Number.isFinite(u.timeSpentSec)) {
      entry.timeSpentSec = Math.max(entry.timeSpentSec ?? 0, Math.min(Math.round(u.timeSpentSec), 7200));
    }
    applied += 1;
  }
  return applied;
}

export async function saveAttemptProgress(attempt, updates) {
  if (attempt.status !== 'in-progress') throw ApiError.conflict('This attempt is already submitted');

  if (attempt.expiresAt && Date.now() > attempt.expiresAt.getTime() + SUBMIT_GRACE_SEC * 1000) {
    const done = await gradeAttempt(attempt);
    return { expired: true, attempt: done };
  }

  applyAnswerUpdates(attempt, updates);
  await attempt.save();
  return { expired: false, attempt };
}

/** Grades an attempt and (for tests) feeds the unlock chain. Idempotent-guarded. */
async function gradeAttempt(attempt) {
  if (attempt.status !== 'in-progress') return attempt;

  const questions = await AptitudeQuestion.find({ _id: { $in: attempt.answers.map((a) => a.question) } })
    .select('correctOptionIndex')
    .lean();
  const correctByQuestion = new Map(questions.map((q) => [String(q._id), q.correctOptionIndex]));

  let correctCount = 0;
  for (const entry of attempt.answers) {
    entry.isCorrect =
      entry.selectedOption !== null && entry.selectedOption === correctByQuestion.get(String(entry.question));
    if (entry.isCorrect) correctCount += 1;
  }

  const now = Date.now();
  const lateBy = attempt.mode === 'test' && attempt.expiresAt ? now - attempt.expiresAt.getTime() : -1;
  const timedOut = lateBy > COMPLETE_GRACE_SEC * 1000;

  // A timed-out attempt is stamped at the deadline, not at whenever the lazy
  // finalizer happened to run, so "time taken" can't exceed the paper length.
  const submittedAtMs = timedOut ? attempt.expiresAt.getTime() : now;

  attempt.status = timedOut ? 'expired' : 'completed';
  attempt.submittedAt = new Date(submittedAtMs);
  attempt.correctCount = correctCount;
  attempt.score = Math.round((correctCount / attempt.totalCount) * 1000) / 10;
  attempt.timeTakenSec = Math.max(0, Math.round((submittedAtMs - attempt.startedAt.getTime()) / 1000));
  await attempt.save();

  if (attempt.mode === 'test') {
    const pattern = await AptitudePattern.findById(attempt.pattern);
    const progress = await AptitudeProgress.findOneAndUpdate(
      { user: attempt.user, pattern: attempt.pattern },
      {
        $max: { bestScore: attempt.score },
        $inc: { attemptsCount: 1 },
        $set: { lastAttemptAt: attempt.submittedAt },
      },
      { upsert: true, new: true }
    );
    if (pattern && progress.bestScore >= pattern.passPercentage && !progress.unlocked) {
      progress.unlocked = true;
      await progress.save();
    }
  }

  return attempt;
}

/**
 * Final grade + unlock orchestration. Merges the exam interface's last
 * autosave batch (if still inside the grace window), then grades.
 */
export async function submitAttempt({ attempt, incomingAnswers }) {
  if (attempt.status !== 'in-progress') {
    throw ApiError.conflict('This attempt is already submitted');
  }

  const withinGrace =
    attempt.mode !== 'test' ||
    !attempt.expiresAt ||
    Date.now() <= attempt.expiresAt.getTime() + SUBMIT_GRACE_SEC * 1000;

  if (withinGrace && Array.isArray(incomingAnswers)) {
    applyAnswerUpdates(attempt, incomingAnswers);
  }
  return gradeAttempt(attempt);
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

/** Full result (answer key included — only ever called for finished attempts). */
export async function buildAttemptResult(attempt, pattern) {
  const ids = attempt.answers.map((a) => a.question);
  const docs = await AptitudeQuestion.find({ _id: { $in: ids } })
    .select('-createdBy -__v -attemptsCount -correctCount')
    .lean();
  const byId = new Map(docs.map((d) => [String(d._id), d]));

  const setIds = [...new Set(docs.map((q) => q.setId).filter(Boolean))];
  const sets = setIds.length
    ? await AptitudeSet.find({ pattern: attempt.pattern, setId: { $in: setIds } })
        .select('-__v -createdAt -updatedAt -pattern')
        .lean()
    : [];

  const meta = await getQuestionMeta(pattern._id);
  const subTitles = new Map(resolveSubPatterns(pattern, meta).map((s) => [s.slug, s.title]));

  const answers = attempt.answers.map((a) => ({
    question: byId.get(String(a.question)) ?? null,
    selectedOption: a.selectedOption,
    isCorrect: !!a.isCorrect,
    markedForReview: !!a.markedForReview,
    timeSpentSec: a.timeSpentSec ?? 0,
  }));

  const bump = (map, key, label, a) => {
    if (!map.has(key)) map.set(key, { key, label, total: 0, correct: 0, attempted: 0, timeSec: 0 });
    const row = map.get(key);
    row.total += 1;
    row.timeSec += a.timeSpentSec;
    if (a.selectedOption !== null) row.attempted += 1;
    if (a.isCorrect) row.correct += 1;
  };

  const sub = new Map();
  const diff = new Map();
  for (const a of answers) {
    if (!a.question) continue;
    bump(sub, a.question.subPattern || 'other', subTitles.get(a.question.subPattern) || prettify(a.question.subPattern) || 'Other', a);
    bump(diff, a.question.difficulty, prettify(a.question.difficulty), a);
  }
  const diffOrder = ['easy', 'medium', 'hard'];

  const attemptedCount = answers.filter((a) => a.selectedOption !== null).length;

  // "Better than X% of test takers" — only meaningful with a real crowd.
  let percentile = null;
  if (attempt.status !== 'in-progress' && typeof attempt.score === 'number') {
    const [all, below] = await Promise.all([
      AptitudeAttempt.countDocuments({ pattern: attempt.pattern, mode: 'test', status: { $in: ['completed', 'expired'] } }),
      AptitudeAttempt.countDocuments({
        pattern: attempt.pattern,
        mode: 'test',
        status: { $in: ['completed', 'expired'] },
        score: { $lt: attempt.score },
      }),
    ]);
    if (all >= 10) percentile = Math.round((below / all) * 100);
  }

  const durationSec = attempt.expiresAt ? Math.round((attempt.expiresAt.getTime() - attempt.startedAt.getTime()) / 1000) : null;

  return {
    attemptId: attempt._id,
    mode: attempt.mode,
    status: attempt.status,
    score: attempt.score,
    correctCount: attempt.correctCount,
    totalCount: attempt.totalCount,
    attemptedCount,
    skippedCount: attempt.totalCount - attemptedCount,
    incorrectCount: attemptedCount - attempt.correctCount,
    accuracy: attemptedCount > 0 ? Math.round((attempt.correctCount / attemptedCount) * 100) : 0,
    timeTakenSec: attempt.timeTakenSec,
    durationSec,
    submittedAt: attempt.submittedAt,
    passed: attempt.mode === 'test' ? attempt.score >= pattern.passPercentage : null,
    percentile,
    answers,
    sets,
    bySubPattern: [...sub.values()].sort((a, b) => a.correct / a.total - b.correct / b.total),
    byDifficulty: diffOrder.filter((d) => diff.has(d)).map((d) => diff.get(d)),
  };
}

/** Keeps AptitudePattern.totalQuestions in sync — called after any admin
 * create/delete/publish-toggle on a question, same denormalized-counter
 * reasoning as Problem.totalSubmissions. */
export async function recountPatternQuestions(patternId) {
  const totalQuestions = await AptitudeQuestion.countDocuments({ pattern: patternId, isPublished: true });
  await AptitudePattern.findByIdAndUpdate(patternId, { totalQuestions });
  invalidateQuestionMeta(patternId);
}
