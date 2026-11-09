import { AptitudePattern } from '../../models/AptitudePattern.js';
import { AptitudeQuestion } from '../../models/AptitudeQuestion.js';
import { AptitudeAttempt } from '../../models/AptitudeAttempt.js';
import { AptitudeProgress } from '../../models/AptitudeProgress.js';
import { AptitudeSet } from '../../models/AptitudeSet.js';
import { ApiError } from '../../utils/ApiError.js';
import { COMPLETE_GRACE_SEC, SUBMIT_GRACE_SEC, TEST_MIX, getQuestionMeta, shuffled } from './aptitudeShared.js';

// ---------------------------------------------------------------------------
// Attempts (Test mode + legacy practice sessions)
// ---------------------------------------------------------------------------

/**
 * Picks the questions for one Test attempt: `count` questions with a 30/50/20
 * easy/medium/hard blueprint, spread evenly across sub-patterns inside each
 * difficulty, preferring questions the learner has NOT seen in their last few
 * tests. Falls back gracefully when a bucket is short.
 */
export async function pickTestQuestions(userId, pattern, meta) {
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
export async function gradeAttempt(attempt) {
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
