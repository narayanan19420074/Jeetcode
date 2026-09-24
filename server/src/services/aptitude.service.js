import { AptitudePattern } from '../models/AptitudePattern.js';
import { AptitudeQuestion } from '../models/AptitudeQuestion.js';
import { AptitudeAttempt } from '../models/AptitudeAttempt.js';
import { AptitudeProgress } from '../models/AptitudeProgress.js';
import { ApiError } from '../utils/ApiError.js';

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
 * Guards Practice/Test start (server-side, same "never trust the
 * client" reasoning as assertPatternUnlocked). Learn must be marked done
 * for THIS pattern before either mode can be started.
 */
export async function assertLearnCompleted(userId, pattern) {
  const progress = await AptitudeProgress.findOne({ user: userId, pattern: pattern._id });
  if (!progress?.learnCompleted) {
    throw ApiError.forbidden('Complete the Learn section first');
  }
}

/**
 * Called when the user reaches the last Learn subsection for a
 * pattern and clicks "Mark as Learned" (legacy path — kept for backward
 * compat with older clients). Upserts so a user who never had a
 * progress doc yet (hasn't attempted a test) still gets one.
 *
 * The new path is markSubsectionComplete below, which auto-flips
 * learnCompleted once every subsection is done.
 */
export async function markLearnCompleted(userId, patternId) {
  return AptitudeProgress.findOneAndUpdate(
    { user: userId, pattern: patternId },
    { $set: { learnCompleted: true } },
    { upsert: true, new: true }
  );
}

/**
 * NEW — Called by LearnTopicPage every time a subsection is completed
 * (MicroCheck answered correctly, or Next clicked on a subsection with
 * no checkQuestion). Adds the ID to the user's completedSubsections for
 * this pattern, then auto-flips learnCompleted once every subsection is
 * done (count comparison, no per-pattern whitelist on the backend).
 *
 * totalSubsections comes from the client — it's a harmless count, not a
 * security input (worst case: learnCompleted flips slightly early/late,
 * nothing else). Subsection IDs are free-form strings.
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

export async function startAttempt({ userId, pattern, mode }) {
  const questions = await AptitudeQuestion.find({ pattern: pattern._id, isPublished: true }).sort({ order: 1 });
  if (questions.length === 0) {
    throw ApiError.conflict('This pattern has no questions yet');
  }

  const now = Date.now();
  const attempt = await AptitudeAttempt.create({
    user: userId,
    pattern: pattern._id,
    mode,
    startedAt: now,
    expiresAt: mode === 'test' ? new Date(now + pattern.timeLimitMinutes * 60 * 1000) : null,
    answers: questions.map((q) => ({ question: q._id, selectedOption: null, isCorrect: null })),
    totalCount: questions.length,
  });

  return attempt;
}

/** Practice-mode instant check: grades ONE question without ending the attempt. */
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

  return { isCorrect, correctOptionIndex: question.correctOptionIndex, explanation: question.explanation };
}

/**
 * Final grade + unlock orchestration. Called for both modes, but only
 * 'test' mode attempts feed AptitudeProgress.bestScore / unlock chain —
 * practice mode is purely for learning, it never unlocks anything.
 */
export async function submitAttempt({ attempt, incomingAnswers }) {
  if (attempt.status === 'completed') {
    throw ApiError.conflict('This attempt is already submitted');
  }
  const isExpired = attempt.mode === 'test' && attempt.expiresAt && Date.now() > attempt.expiresAt.getTime();

  // Merge any final answers the client is flushing on submit (e.g. the
  // last-selected option that hadn't been checked yet in practice mode).
  if (Array.isArray(incomingAnswers)) {
    for (const { questionId, selectedOption } of incomingAnswers) {
      const entry = attempt.answers.find((a) => String(a.question) === String(questionId));
      if (entry && entry.selectedOption === null) entry.selectedOption = selectedOption;
    }
  }

  const questions = await AptitudeQuestion.find({ _id: { $in: attempt.answers.map((a) => a.question) } });
  const correctByQuestion = new Map(questions.map((q) => [String(q._id), q.correctOptionIndex]));

  let correctCount = 0;
  for (const entry of attempt.answers) {
    entry.isCorrect = entry.selectedOption !== null && entry.selectedOption === correctByQuestion.get(String(entry.question));
    if (entry.isCorrect) correctCount += 1;
  }

  const score = Math.round((correctCount / attempt.totalCount) * 1000) / 10;

  attempt.status = isExpired ? 'expired' : 'completed';
  attempt.submittedAt = new Date();
  attempt.correctCount = correctCount;
  attempt.score = score;
  attempt.timeTakenSec = Math.round((attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000);
  await attempt.save();

  if (attempt.mode === 'test') {
    const pattern = await AptitudePattern.findById(attempt.pattern);
    const progress = await AptitudeProgress.findOneAndUpdate(
      { user: attempt.user, pattern: attempt.pattern },
      {
        $max: { bestScore: score },
        $inc: { attemptsCount: 1 },
        $set: { lastAttemptAt: attempt.submittedAt },
      },
      { upsert: true, new: true }
    );
    // unlocked flag on THIS pattern's own progress doc is informational
    // (whether the NEXT pattern should open is recomputed live in
    // getPatternsWithProgress rather than stored redundantly).
    if (progress.bestScore >= pattern.passPercentage) {
      progress.unlocked = true;
      await progress.save();
    }
  }

  return attempt;
}

/** Keeps AptitudePattern.totalQuestions in sync — called after any admin
 * create/delete/publish-toggle on a question, same denormalized-counter
 * reasoning as Problem.totalSubmissions. */
export async function recountPatternQuestions(patternId) {
  const totalQuestions = await AptitudeQuestion.countDocuments({ pattern: patternId, isPublished: true });
  await AptitudePattern.findByIdAndUpdate(patternId, { totalQuestions });
}