import { AptitudePattern } from '../../models/AptitudePattern.js';
import { AptitudeProgress } from '../../models/AptitudeProgress.js';
import { AptitudeQuestionProgress } from '../../models/AptitudeQuestionProgress.js';
import { ApiError } from '../../utils/ApiError.js';
import { REQUIRE_LEARN_BEFORE_TEST, getQuestionMeta, resolveSubPatterns } from './aptitudeShared.js';

// ---------------------------------------------------------------------------
// Pattern list / guards
// ---------------------------------------------------------------------------

/**
 * The Aptitude home page has separate tracks (tabs). Each track is its own
 * unlock chain with its own first level. Keep in sync with trackOf() in
 * client/src/features/aptitude/AptitudePatternsPage.jsx.
 */
export function trackOf(category = '') {
  const c = String(category || '').toLowerCase();
  if (/logical|reason/.test(c)) return 'reasoning';
  if (/verbal/.test(c)) return 'verbal';
  if (/data/.test(c)) return 'di';
  return 'aptitude';
}

/**
 * Builds the home-page pattern list: every published pattern plus this
 * user's progress + unlock state. Within each track (aptitude / reasoning /
 * verbal / data interpretation) the pattern with the lowest `order` is always
 * unlocked; every other pattern needs a passed (bestScore >= passPercentage)
 * progress doc on the pattern immediately before it IN THE SAME TRACK.
 */
export async function getPatternsWithProgress(userId) {
  const patterns = await AptitudePattern.find({ isPublished: true }).sort({ order: 1 }).lean();
  const progressDocs = userId
    ? await AptitudeProgress.find({ user: userId, pattern: { $in: patterns.map((p) => p._id) } }).lean()
    : [];
  const progressByPattern = new Map(progressDocs.map((p) => [String(p.pattern), p]));

  const previousPassedByTrack = new Map(); // track -> did the previous level in this track pass?
  return patterns.map((pattern) => {
    const progress = progressByPattern.get(String(pattern._id));
    const bestScore = progress?.bestScore ?? 0;
    const track = trackOf(pattern.category);
    const unlocked = !previousPassedByTrack.has(track) || previousPassedByTrack.get(track); // first level of a track is always open
    previousPassedByTrack.set(track, bestScore >= pattern.passPercentage);

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

  // Previous level in the SAME track (tracks have independent unlock chains).
  const earlier = await AptitudePattern.find({ isPublished: true, order: { $lt: pattern.order } })
    .sort({ order: -1 })
    .select('_id passPercentage category');
  const track = trackOf(pattern.category);
  const prevPattern = earlier.find((p) => trackOf(p.category) === track);

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
