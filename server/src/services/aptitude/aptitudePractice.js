import { AptitudeQuestion } from '../../models/AptitudeQuestion.js';
import { AptitudeQuestionProgress } from '../../models/AptitudeQuestionProgress.js';
import { AptitudeSet } from '../../models/AptitudeSet.js';
import { ApiError } from '../../utils/ApiError.js';
import { TARGET_TIME_SEC, getQuestionMeta } from './aptitudeShared.js';

// ---------------------------------------------------------------------------
// Practice (LeetCode-style problem set)
// ---------------------------------------------------------------------------

export const snippet = (text, n = 160) => {
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

export async function loadSet(patternId, setId) {
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
