import { AptitudePattern } from '../../models/AptitudePattern.js';
import { AptitudeQuestion } from '../../models/AptitudeQuestion.js';
import { AptitudeAttempt } from '../../models/AptitudeAttempt.js';
import { AptitudeSet } from '../../models/AptitudeSet.js';
import { getQuestionMeta, invalidateQuestionMeta, prettify, resolveSubPatterns } from './aptitudeShared.js';

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
