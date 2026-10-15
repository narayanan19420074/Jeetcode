import mongoose from 'mongoose';
import { PrepCompany } from '../models/PrepCompany.js';
import { PrepSection } from '../models/PrepSection.js'; // required so Mongoose registers the "PrepSection" model before .populate('sections.section') resolves it — without this import the ref lookup throws MissingSchemaError even though the file is never used directly here
import { UserPrepProgress } from '../models/UserPrepProgress.js';
import { Problem } from '../models/Problem.js';
import { User } from '../models/User.js';
import { AptitudePattern } from '../models/AptitudePattern.js';
import { AptitudeQuestion } from '../models/AptitudeQuestion.js';
import { AptitudeQuestionProgress } from '../models/AptitudeQuestionProgress.js';
import { getPatternsWithProgress } from '../services/aptitude.service.js';
import { AptitudeAttempt } from '../models/AptitudeAttempt.js';
import { AptitudeProgress } from '../models/AptitudeProgress.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Counts DISTINCT questions the user has ever answered correctly, across
// every pattern and every attempt (test or practice). Deliberately NOT a
// sum of correctCount across attempts — that would let someone inflate
// "600 solved" by retrying the same fixed question bank repeatedly. This
// mirrors the same idempotent-counting principle User.solvedProblems
// already uses for coding problems (re-solving doesn't double-count).
//
// Aggregate pipelines do NOT auto-cast string ids like Mongoose's find()
// does — `new mongoose.Types.ObjectId(userId)` is required here or the
// $match silently matches nothing.
async function countDistinctAptitudeQuestionsSolved(userId) {
  const result = await AptitudeAttempt.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $unwind: '$answers' },
    { $match: { 'answers.isCorrect': true } },
    { $group: { _id: '$answers.question' } },
    { $count: 'count' },
  ]);
  return result[0]?.count || 0;
}

const DIFFICULTY_RANK = { Easy: 0, Medium: 1, Hard: 2 };

const problemBaseFilter = (section) => {
  const f = section.problemFilter || {};
  return {
    isPublished: { $ne: false },
    ...(f.tags?.length ? { tags: { $in: f.tags } } : {}),
    ...(f.companies?.length ? { companies: { $in: f.companies } } : {}),
    ...(f.difficulty ? { difficulty: f.difficulty } : {}),
    ...(f.sheet ? { sheets: f.sheet } : {}),
  };
};

// A target can't be higher than what exists, or the bar could never reach 100%.
const cappedTarget = (recommended, total) => (recommended ? Math.min(recommended, total || recommended) : total || 1);

// A section that is a GROUP of aptitude patterns (all quant patterns, all reasoning
// patterns, ...). Per pattern: total questions, how many this user solved, and whether
// the aptitude unlock chain has opened it. `ctx` memoises the pattern list per request.
async function loadPatternGroup(userId, section, ctx) {
  ctx.patterns ||= getPatternsWithProgress(userId);
  const all = await ctx.patterns;
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  const picked = section.aptitudePatternSlugs.map((s) => bySlug.get(s)).filter(Boolean);
  const ids = picked.map((p) => p._id);
  const diff = section.aptitudeDifficulty ? { difficulty: section.aptitudeDifficulty } : {};

  const [totals, solved] = await Promise.all([
    AptitudeQuestion.aggregate([
      { $match: { pattern: { $in: ids }, isPublished: true, ...diff } },
      { $group: { _id: '$pattern', n: { $sum: 1 } } },
    ]),
    userId
      ? AptitudeQuestionProgress.aggregate([
          { $match: { user: new mongoose.Types.ObjectId(userId), pattern: { $in: ids }, status: 'solved', ...diff } },
          { $group: { _id: '$pattern', n: { $sum: 1 } } },
        ])
      : [],
  ]);
  const totalBy = new Map(totals.map((t) => [String(t._id), t.n]));
  const solvedBy = new Map(solved.map((t) => [String(t._id), t.n]));

  const patterns = picked
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      unlocked: Boolean(p.progress?.unlocked),
      total: totalBy.get(String(p._id)) || 0,
      solved: solvedBy.get(String(p._id)) || 0,
    }))
    .filter((p) => p.total > 0);
  return {
    patterns,
    total: patterns.reduce((n, p) => n + p.total, 0),
    solved: patterns.reduce((n, p) => n + p.solved, 0),
  };
}

// Computes progress for a single section. Never throws — an
// untrackable/unwired contentType degrades to trackable:false rather
// than breaking the whole roadmap page over one misconfigured section.
// `detail` (roadmap page only) also returns the pattern rows / problem list to render.
async function computeSectionProgress(userId, section, solvedProblemIds, selfReported = false, ctx = {}, detail = false) {
  if (section.contentType === 'problem-filter') {
    const base = problemBaseFilter(section);
    const sheet = Boolean(section.problemFilter?.sheet);
    const [practiceCount, total] = await Promise.all([
      Problem.countDocuments({ ...base, _id: { $in: solvedProblemIds } }),
      sheet ? Problem.countDocuments(base) : Promise.resolve(0),
    ]);
    const target = sheet ? cappedTarget(section.recommendedTarget, total) : section.recommendedTarget || 1;
    const result = {
      trackable: true,
      practiceCount,
      target,
      progressPercent: Math.min(100, Math.round((practiceCount / target) * 100)),
      selfReported: false,
    };
    if (detail) {
      const solvedSet = new Set(solvedProblemIds.map(String));
      const rows = await Problem.find(base).select('title slug difficulty').lean();
      result.problemTotal = rows.length;
      result.problems = rows
        .map((p) => ({ slug: p.slug, title: p.title, difficulty: p.difficulty, solved: solvedSet.has(String(p._id)) }))
        .sort((a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] || a.title.localeCompare(b.title))
        .slice(0, 300);
    }
    return result;
  }

  if (section.contentType === 'aptitude-pattern' && section.aptitudePatternSlugs?.length) {
    const g = await loadPatternGroup(userId, section, ctx);
    const target = cappedTarget(section.recommendedTarget, g.total);
    return {
      trackable: Boolean(userId),
      practiceCount: g.solved,
      target,
      progressPercent: Math.min(100, Math.round((g.solved / target) * 100)),
      selfReported: false,
      ...(detail ? { patterns: g.patterns } : {}),
    };
  }

  if (section.contentType === 'aptitude-pattern') {
    if (!userId) return { trackable: false, practiceCount: 0, target: section.recommendedTarget || 0, progressPercent: 0, selfReported: false };

    if (section.aptitudePatternSlug) {
      // Points at ONE specific pattern — AptitudeProgress.bestScore (their
      // best TEST-mode score for that pattern) is already a 0-100 percent,
      // so it's used directly rather than a practice-count/target ratio.
      // AptitudeProgress refs the pattern by ObjectId, not slug, so the
      // pattern has to be resolved first — this is the fix for a bug in
      // an earlier draft that queried AptitudeProgress without a pattern
      // filter at all (would have matched ANY of the user's patterns,
      // silently returning the wrong score).
      const pattern = await AptitudePattern.findOne({ slug: section.aptitudePatternSlug }).select('_id').lean();
      if (!pattern) return { trackable: false, practiceCount: 0, target: 100, progressPercent: 0, selfReported: false };

      const progress = await AptitudeProgress.findOne({ user: userId, pattern: pattern._id }).lean();
      return {
        trackable: Boolean(progress),
        practiceCount: 0,
        target: 100,
        progressPercent: progress?.bestScore || 0,
        selfReported: false,
      };
    }

    // Whole-feature link (aptitudePatternSlug: null, our TCS NQT case) —
    // "how many of the 20-pattern question bank has the user solved
    // correctly at least once", matching the "solve 600 across patterns"
    // framing directly.
    const practiceCount = await countDistinctAptitudeQuestionsSolved(userId);
    const target = section.recommendedTarget || 1;
    return {
      trackable: true,
      practiceCount,
      target,
      progressPercent: Math.min(100, Math.round((practiceCount / target) * 100)),
      selfReported: false,
    };
  }

  // 'learn-topic': no backend progress source at all (Learn is static
  // content with client-only quiz state, no completion signal).
  if (section.contentType === 'learn-topic') {
    return { trackable: false, practiceCount: 0, target: 0, progressPercent: 0, selfReported: false };
  }

  // 'external-only' — no measurable signal (a site we don't control), so
  // this is a deliberate self-report checkbox rather than a fabricated
  // percentage. trackable:true only when the user has actually checked
  // it, and the response carries selfReported:true so the UI can badge
  // it distinctly instead of implying it was verified the same way
  // problem-filter / aptitude-pattern progress is.
  return {
    trackable: selfReported,
    practiceCount: 0,
    target: 0,
    progressPercent: selfReported ? 100 : 0,
    selfReported,
  };
}

function weaknessLabel(progressPercent) {
  if (progressPercent < 40) return 'weak';
  if (progressPercent < 70) return 'moderate';
  return 'strong';
}

// Shared weighted-average helper — only trackable sections count toward
// the score, so an untracked "Learn" resource can't drag readiness down
// (or artificially inflate it) with a number we can't actually measure.
function computeReadiness(scoredSections) {
  const totalWeight = scoredSections.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return 0;
  return Math.round(scoredSections.reduce((sum, s) => sum + s.weight * s.percent, 0) / totalWeight);
}

// GET /api/prep/companies — card list. Public; readiness only computed
// for authenticated users (guests see the exam pattern/section count only).
export const listCompanies = asyncHandler(async (req, res) => {
  const companies = await PrepCompany.find({ isPublished: true })
    .populate('sections.section', 'name slug contentType recommendedTarget problemFilter aptitudePatternSlug aptitudePatternSlugs aptitudeDifficulty')
    .lean();

  const ctx = {}; // shared per request (pattern list is loaded once)
  let solvedProblemIds = [];
  // Keyed by "companyId_sectionId" — a user could theoretically have
  // progress rows across several companies, so this can't be a flat
  // section-id map the way getCompanyRoadmap's single-company one is.
  let progressByKey = new Map();
  if (req.user) {
    const user = await User.findById(req.user.id).select('solvedProblems').lean();
    solvedProblemIds = user?.solvedProblems || [];
    const allProgress = await UserPrepProgress.find({ user: req.user.id }).lean();
    progressByKey = new Map(allProgress.map((p) => [`${p.company}_${p.section}`, p]));
  }

  const data = await Promise.all(
    companies.map(async (company) => {
      let readiness = null;
      if (req.user) {
        const scored = [];
        for (const ref of company.sections) {
          if (!ref.section) continue;
          const saved = progressByKey.get(`${company._id}_${ref.section._id}`);
          const progress = await computeSectionProgress(req.user.id, ref.section, solvedProblemIds, saved?.selfReported, ctx);
          if (progress.trackable) scored.push({ weight: ref.weight, percent: progress.progressPercent });
        }
        readiness = computeReadiness(scored);
      }
      return {
        name: company.name,
        slug: company.slug,
        logoUrl: company.logoUrl,
        examDurationMinutes: company.examDurationMinutes,
        examDate: company.examDate,
        description: company.description,
        sectionCount: company.sections.length,
        readiness,
      };
    })
  );

  new ApiResponse(200, { items: data }).send(res);
});

// GET /api/prep/companies/:slug — full roadmap with per-section progress.
export const getCompanyRoadmap = asyncHandler(async (req, res) => {
  const company = await PrepCompany.findOne({ slug: req.params.slug, isPublished: true })
    .populate('sections.section')
    .lean();
  if (!company) throw ApiError.notFound('Prep track not found');

  let solvedProblemIds = [];
  let progressDocs = [];
  if (req.user) {
    const user = await User.findById(req.user.id).select('solvedProblems').lean();
    solvedProblemIds = user?.solvedProblems || [];
    progressDocs = await UserPrepProgress.find({ user: req.user.id, company: company._id }).lean();
  }
  const progressBySection = new Map(progressDocs.map((p) => [p.section.toString(), p]));

  const ctx = {};
  const scored = [];
  const sortedRefs = [...company.sections].filter((ref) => ref.section).sort((a, b) => a.order - b.order);

  const sections = await Promise.all(
    sortedRefs.map(async (ref) => {
      const section = ref.section;
      const saved = progressBySection.get(section._id.toString());
      const progress = await computeSectionProgress(req.user?.id, section, solvedProblemIds, saved?.selfReported, ctx, true);
      if (progress.trackable) scored.push({ weight: ref.weight, percent: progress.progressPercent });

      return {
        id: section._id,
        name: section.name,
        slug: section.slug,
        description: section.description,
        contentType: section.contentType,
        aptitudePatternSlug: section.aptitudePatternSlug,
        aptitudeDifficulty: section.aptitudeDifficulty,
        patterns: progress.patterns ?? null,
        problems: progress.problems ?? null,
        problemTotal: progress.problemTotal ?? null,
        group: ref.group || '',
        learnTopicSlug: section.learnTopicSlug,
        problemFilter: section.problemFilter,
        externalResources: section.externalResources,
        order: ref.order,
        minutes: ref.minutes,
        questionCount: ref.questionCount,
        weight: ref.weight,
        trackable: progress.trackable,
        selfReported: progress.selfReported,
        practiceCount: progress.practiceCount,
        target: progress.target,
        progressPercent: progress.progressPercent,
        weakness: progress.trackable && !progress.selfReported ? weaknessLabel(progress.progressPercent) : null,
        testScore: saved?.testScore ?? null,
        stage: saved?.stage ?? 'not-started',
        enrolled: Boolean(saved),
      };
    })
  );

  new ApiResponse(200, {
    name: company.name,
    slug: company.slug,
    logoUrl: company.logoUrl,
    examDurationMinutes: company.examDurationMinutes,
    examDate: company.examDate,
    description: company.description,
    readiness: req.user ? computeReadiness(scored) : null,
    enrolled: req.user ? progressDocs.length > 0 : false,
    sections,
  }).send(res);
});

// POST /api/prep/companies/:slug/enroll — creates a UserPrepProgress doc
// per section. Upsert via bulkWrite so re-enrolling is a harmless no-op
// rather than a duplicate-key error.
export const enrollInCompany = asyncHandler(async (req, res) => {
  const company = await PrepCompany.findOne({ slug: req.params.slug, isPublished: true });
  if (!company) throw ApiError.notFound('Prep track not found');

  const ops = company.sections.map((ref) => ({
    updateOne: {
      filter: { user: req.user.id, company: company._id, section: ref.section },
      update: {
        $setOnInsert: { user: req.user.id, company: company._id, section: ref.section, stage: 'not-started' },
      },
      upsert: true,
    },
  }));
  if (ops.length) await UserPrepProgress.bulkWrite(ops);

  new ApiResponse(200, { enrolled: true }, 'Enrolled in prep track').send(res);
});

// POST /api/prep/companies/:slug/sections/:sectionId/progress — updates
// stage and/or records a test score. Called from the roadmap page's
// action buttons now; wire this into a coding-test-completion flow later
// if/when "Advanced Coding" gets a dedicated timed-test mode instead of
// just linking to filtered Problems.
export const updateSectionProgress = asyncHandler(async (req, res) => {
  const { stage, testScore, selfReported } = req.body;
  const company = await PrepCompany.findOne({ slug: req.params.slug });
  if (!company) throw ApiError.notFound('Prep track not found');

  const update = { lastActivityAt: new Date() };
  if (stage) update.stage = stage;
  if (typeof testScore === 'number') {
    update.testScore = testScore;
    update.testAttemptedAt = new Date();
  }
  if (typeof selfReported === 'boolean') update.selfReported = selfReported;

  const progress = await UserPrepProgress.findOneAndUpdate(
    { user: req.user.id, company: company._id, section: req.params.sectionId },
    { $set: update },
    { new: true, upsert: true }
  );

  new ApiResponse(200, progress, 'Progress updated').send(res);
});
