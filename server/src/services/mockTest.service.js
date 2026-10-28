import { AptitudePattern } from '../models/AptitudePattern.js';
import { AptitudeQuestion } from '../models/AptitudeQuestion.js';
import { MockAttempt } from '../models/MockAttempt.js';
import { ApiError } from '../utils/ApiError.js';
import {
  MOCK_FREE_ATTEMPTS_PER_PAPER,
  MOCK_MIX,
  MOCK_PAPERS,
  PAPER_BY_ID,
  paperMinutes,
  paperQuestions,
} from '../config/mockTests.js';

const SECTION_GRACE_SEC = 15; // late autosave / auto-submit still accepted
const MIN_PERCENTILE_SAMPLE = 20;

const shuffled = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const round1 = (n) => Math.round(n * 10) / 10;

// ---------------------------------------------------------------------------
// Hub
// ---------------------------------------------------------------------------

export async function listMocks(userId, hasProAccess) {
  const allSlugs = [...new Set(MOCK_PAPERS.flatMap((p) => p.sections.flatMap((s) => s.slugs)))];
  const patterns = await AptitudePattern.find({ slug: { $in: allSlugs }, isPublished: true }).select('slug totalQuestions').lean();
  const totalBySlug = new Map(patterns.map((p) => [p.slug, p.totalQuestions || 0]));

  const attempts = userId
    ? await MockAttempt.find({ user: userId }).sort({ createdAt: -1 }).limit(60)
        .select('paperId paperTitle status score correctCount totalCount timeTakenSec createdAt').lean()
    : [];

  const papers = MOCK_PAPERS.map((p) => {
    const mine = attempts.filter((a) => a.paperId === p.id);
    const done = mine.filter((a) => a.status !== 'in-progress');
    const open = mine.find((a) => a.status === 'in-progress');
    const available = p.sections.every(
      (s) => s.slugs.reduce((sum, slug) => sum + (totalBySlug.get(slug) || 0), 0) >= s.questions
    );
    return {
      id: p.id,
      company: p.company,
      title: p.title,
      short: p.short,
      blurb: p.blurb,
      reported: p.reported,
      officialUrl: p.officialUrl,
      comingSoon: p.comingSoon,
      minutes: paperMinutes(p),
      questions: paperQuestions(p),
      sections: p.sections.map((s) => ({ key: s.key, title: s.title, questions: s.questions, minutes: s.minutes })),
      available,
      attemptsCount: done.length,
      bestScore: done.length ? Math.max(...done.map((a) => a.score ?? 0)) : null,
      lastScore: done.length ? done[0].score ?? null : null,
      openAttemptId: open ? String(open._id) : null,
      locked: !hasProAccess && done.length >= MOCK_FREE_ATTEMPTS_PER_PAPER && !open,
    };
  });

  const recent = attempts.filter((a) => a.status !== 'in-progress').slice(0, 8).map((a) => ({
    id: String(a._id),
    paperId: a.paperId,
    paperTitle: a.paperTitle,
    score: a.score,
    correctCount: a.correctCount,
    totalCount: a.totalCount,
    timeTakenSec: a.timeTakenSec,
    createdAt: a.createdAt,
  }));

  return { papers, recent, freeAttemptsPerPaper: MOCK_FREE_ATTEMPTS_PER_PAPER, hasProAccess: Boolean(hasProAccess) };
}

// ---------------------------------------------------------------------------
// Picking questions
// ---------------------------------------------------------------------------

async function pickSection(section, patternIdBySlug, seen) {
  const ids = section.slugs.map((s) => patternIdBySlug.get(s)).filter(Boolean);
  if (ids.length === 0) return [];

  // Stand-alone questions only: a mock section never needs a shared stimulus.
  const pool = await AptitudeQuestion.find({ pattern: { $in: ids }, isPublished: true, setId: null })
    .select('_id pattern difficulty')
    .lean();

  const count = Math.min(section.questions, pool.length);
  const nEasy = Math.round(count * MOCK_MIX.easy);
  const nHard = Math.round(count * MOCK_MIX.hard);
  const quotas = { easy: nEasy, hard: nHard, medium: count - nEasy - nHard };

  const picked = [];
  const taken = new Set();

  const take = (difficulty, n) => {
    // pattern -> queue (unseen first), then round-robin so topics stay balanced
    const queues = new Map();
    for (const q of shuffled(pool.filter((x) => x.difficulty === difficulty))) {
      const k = String(q.pattern);
      if (!queues.has(k)) queues.set(k, []);
      queues.get(k).push(q);
    }
    for (const [k, arr] of queues) {
      queues.set(k, [...arr.filter((q) => !seen.has(String(q._id))), ...arr.filter((q) => seen.has(String(q._id)))]);
    }
    const order = shuffled([...queues.keys()]);
    let got = 0;
    let progressed = true;
    while (got < n && progressed) {
      progressed = false;
      for (const k of order) {
        if (got >= n) break;
        const q = queues.get(k).shift();
        if (q && !taken.has(String(q._id))) {
          picked.push(q);
          taken.add(String(q._id));
          got += 1;
          progressed = true;
        }
      }
    }
  };

  take('easy', quotas.easy);
  take('medium', quotas.medium);
  take('hard', quotas.hard);

  if (picked.length < count) {
    const rest = shuffled(pool.filter((q) => !taken.has(String(q._id))));
    rest.sort((a, b) => Number(seen.has(String(a._id))) - Number(seen.has(String(b._id))));
    for (const q of rest) {
      if (picked.length >= count) break;
      picked.push(q);
    }
  }
  return shuffled(picked);
}

// ---------------------------------------------------------------------------
// Start / resume
// ---------------------------------------------------------------------------

export async function startMock({ userId, paperId, hasProAccess }) {
  const paper = PAPER_BY_ID.get(paperId);
  if (!paper) throw ApiError.notFound('Mock test not found');

  // Resume an open paper (or close it if its clock has run out).
  const open = await MockAttempt.find({ user: userId, paperId, status: 'in-progress' });
  for (const a of open) {
    const fresh = await syncClock(a);
    if (fresh.status === 'in-progress') return { attempt: fresh, resumed: true };
  }

  if (!hasProAccess) {
    const used = await MockAttempt.countDocuments({ user: userId, paperId });
    if (used >= MOCK_FREE_ATTEMPTS_PER_PAPER) {
      throw ApiError.paymentRequired('Your free attempt for this mock is used. Go Pro for unlimited mocks.');
    }
  }

  const allSlugs = [...new Set(paper.sections.flatMap((s) => s.slugs))];
  const patterns = await AptitudePattern.find({ slug: { $in: allSlugs }, isPublished: true }).select('_id slug').lean();
  const patternIdBySlug = new Map(patterns.map((p) => [p.slug, p._id]));

  const recent = await MockAttempt.find({ user: userId }).sort({ createdAt: -1 }).limit(3).select('answers.question').lean();
  const seen = new Set(recent.flatMap((a) => a.answers.map((x) => String(x.question))));

  const answers = [];
  const sections = [];
  for (let i = 0; i < paper.sections.length; i += 1) {
    const sec = paper.sections[i];
    const chosen = await pickSection(sec, patternIdBySlug, seen);
    if (chosen.length < Math.ceil(sec.questions * 0.8)) {
      throw ApiError.conflict(`Not enough questions yet for "${sec.title}". Try another mock.`);
    }
    sections.push({ key: sec.key, title: sec.title, durationSec: sec.minutes * 60, total: chosen.length });
    for (const q of chosen) {
      answers.push({ question: q._id, section: i, pattern: q.pattern, difficulty: q.difficulty, selectedOption: null, isCorrect: null });
    }
  }

  const now = Date.now();
  const totalSec = sections.reduce((s, x) => s + x.durationSec, 0);
  const attempt = await MockAttempt.create({
    user: userId,
    paperId: paper.id,
    paperTitle: paper.title,
    sections,
    currentSection: 0,
    sectionEndsAt: new Date(now + sections[0].durationSec * 1000),
    startedAt: now,
    expiresAt: new Date(now + totalSec * 1000),
    answers,
    totalCount: answers.length,
  });
  return { attempt, resumed: false };
}

// ---------------------------------------------------------------------------
// Clock: lazily moves a paper to the next section / finishes it when time is up
// ---------------------------------------------------------------------------

export async function syncClock(attempt) {
  if (attempt.status !== 'in-progress') return attempt;
  let moved = false;
  while (attempt.status === 'in-progress' && Date.now() > attempt.sectionEndsAt.getTime() + SECTION_GRACE_SEC * 1000) {
    if (attempt.currentSection >= attempt.sections.length - 1) return gradeAttempt(attempt);
    const next = attempt.sections[attempt.currentSection + 1];
    // The next section's clock continues from where the last one ended, as in a real exam.
    attempt.sectionEndsAt = new Date(attempt.sectionEndsAt.getTime() + next.durationSec * 1000);
    attempt.currentSection += 1;
    moved = true;
  }
  if (moved) await attempt.save();
  return attempt;
}

// ---------------------------------------------------------------------------
// Paper for the exam screen (current section only, answer key stripped)
// ---------------------------------------------------------------------------

export async function getPaper(attempt) {
  const cur = attempt.currentSection;
  const entries = attempt.answers.filter((a) => a.section === cur);
  const ids = entries.map((a) => a.question);
  const docs = await AptitudeQuestion.find({ _id: { $in: ids } }, AptitudeQuestion.publicProjection()).lean();
  const byId = new Map(docs.map((d) => [String(d._id), d]));
  const questions = ids.map((id) => byId.get(String(id))).filter(Boolean);

  const state = {};
  for (const a of entries) {
    state[String(a.question)] = {
      selected: a.selectedOption,
      marked: a.markedForReview,
      visited: a.visited,
      time: a.timeSpentSec,
    };
  }

  return {
    paperTitle: attempt.paperTitle,
    sections: attempt.sections.map((s) => ({ key: s.key, title: s.title, minutes: Math.round(s.durationSec / 60), total: s.total })),
    currentSection: cur,
    sectionEndsAt: attempt.sectionEndsAt,
    expiresAt: attempt.expiresAt,
    serverNow: new Date().toISOString(),
    questions,
    state,
  };
}

// ---------------------------------------------------------------------------
// Autosave / section submit / final submit
// ---------------------------------------------------------------------------

function applyUpdates(attempt, updates) {
  if (!Array.isArray(updates)) return 0;
  const byQ = new Map(
    attempt.answers.filter((a) => a.section === attempt.currentSection).map((a) => [String(a.question), a])
  );
  let applied = 0;
  for (const u of updates.slice(0, 200)) {
    const e = byQ.get(String(u?.questionId));
    if (!e) continue;
    if (u.selectedOption === null) e.selectedOption = null;
    else if (Number.isInteger(u.selectedOption) && u.selectedOption >= 0 && u.selectedOption <= 3) e.selectedOption = u.selectedOption;
    if (typeof u.markedForReview === 'boolean') e.markedForReview = u.markedForReview;
    if (typeof u.visited === 'boolean') e.visited = e.visited || u.visited;
    if (Number.isFinite(u.timeSpentSec)) e.timeSpentSec = Math.max(e.timeSpentSec ?? 0, Math.min(Math.round(u.timeSpentSec), 7200));
    applied += 1;
  }
  return applied;
}

const sectionOpen = (attempt) => Date.now() <= attempt.sectionEndsAt.getTime() + SECTION_GRACE_SEC * 1000;

export async function saveProgress(attempt, updates) {
  if (attempt.status !== 'in-progress') throw ApiError.conflict('This mock is already submitted');
  const before = attempt.currentSection;
  const fresh = await syncClock(attempt); // mutates the same doc, so remember where we were
  if (fresh.status !== 'in-progress') return { expired: true, finished: true, attempt: fresh };
  if (fresh.currentSection !== before) return { expired: false, moved: true, attempt: fresh };
  applyUpdates(fresh, updates);
  await fresh.save();
  return { expired: false, attempt: fresh };
}

/** Locks the current section (early or at its deadline) and opens the next one. */
export async function submitSection(attempt, updates) {
  if (attempt.status !== 'in-progress') throw ApiError.conflict('This mock is already submitted');
  const before = attempt.currentSection;
  if (sectionOpen(attempt)) applyUpdates(attempt, updates);

  if (before >= attempt.sections.length - 1) return gradeAttempt(attempt);

  const next = attempt.sections[before + 1];
  // Early submit: the next clock starts now (unused time does not carry over).
  // Late submit: it continues from the previous deadline.
  const start = Math.min(Date.now(), attempt.sectionEndsAt.getTime());
  attempt.currentSection = before + 1;
  attempt.sectionEndsAt = new Date(start + next.durationSec * 1000);
  await attempt.save();
  return syncClock(attempt);
}

export async function submitAll(attempt, updates) {
  if (attempt.status !== 'in-progress') throw ApiError.conflict('This mock is already submitted');
  if (sectionOpen(attempt)) applyUpdates(attempt, updates);
  return gradeAttempt(attempt);
}

// ---------------------------------------------------------------------------
// Grading (no negative marking)
// ---------------------------------------------------------------------------

async function gradeAttempt(attempt) {
  if (attempt.status !== 'in-progress') return attempt;

  const qs = await AptitudeQuestion.find({ _id: { $in: attempt.answers.map((a) => a.question) } }).select('correctOptionIndex').lean();
  const key = new Map(qs.map((q) => [String(q._id), q.correctOptionIndex]));

  let correct = 0;
  for (const s of attempt.sections) { s.correct = 0; s.attempted = 0; }
  attempt.answers.forEach((a) => {
    a.isCorrect = a.selectedOption !== null && a.selectedOption === key.get(String(a.question));
    const sec = attempt.sections[a.section];
    if (a.selectedOption !== null) sec.attempted += 1;
    if (a.isCorrect) { sec.correct += 1; correct += 1; }
  });

  const now = Date.now();
  const timedOut = now > attempt.expiresAt.getTime() + SECTION_GRACE_SEC * 1000;
  const endMs = timedOut ? attempt.expiresAt.getTime() : now;

  attempt.status = timedOut ? 'expired' : 'completed';
  attempt.submittedAt = new Date(endMs);
  attempt.correctCount = correct;
  attempt.score = round1((correct / attempt.totalCount) * 100);
  attempt.timeTakenSec = Math.max(0, Math.round((endMs - attempt.startedAt.getTime()) / 1000));
  await attempt.save();
  return attempt;
}

// ---------------------------------------------------------------------------
// Result (answer key included: only for finished attempts)
// ---------------------------------------------------------------------------

export async function buildResult(attempt) {
  const ids = attempt.answers.map((a) => a.question);
  const patternIds = [...new Set(attempt.answers.map((a) => String(a.pattern)))];
  const [qs, patterns] = await Promise.all([
    AptitudeQuestion.find({ _id: { $in: ids } }).select('questionText options correctOptionIndex explanation shortcut').lean(),
    AptitudePattern.find({ _id: { $in: patternIds } }).select('title slug').lean(),
  ]);
  const qById = new Map(qs.map((q) => [String(q._id), q]));
  const pById = new Map(patterns.map((p) => [String(p._id), p]));

  const topicMap = new Map();
  const review = attempt.answers.map((a, i) => {
    const q = qById.get(String(a.question));
    const p = pById.get(String(a.pattern));
    const t = topicMap.get(String(a.pattern)) || { slug: p?.slug, title: p?.title || 'Topic', total: 0, correct: 0, timeSec: 0 };
    t.total += 1;
    if (a.isCorrect) t.correct += 1;
    t.timeSec += a.timeSpentSec || 0;
    topicMap.set(String(a.pattern), t);
    return {
      n: i + 1,
      section: a.section,
      questionText: q?.questionText || '',
      options: (q?.options || []).map((o) => o.text),
      correctOptionIndex: q?.correctOptionIndex,
      selectedOption: a.selectedOption,
      isCorrect: Boolean(a.isCorrect),
      explanation: q?.explanation || '',
      shortcut: q?.shortcut || '',
      difficulty: a.difficulty,
      timeSpentSec: a.timeSpentSec || 0,
      topic: p?.title || '',
    };
  });

  const topics = [...topicMap.values()]
    .map((t) => ({ ...t, accuracy: Math.round((t.correct / t.total) * 100), avgTimeSec: Math.round(t.timeSec / t.total) }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const sections = attempt.sections.map((s, i) => {
    const rows = attempt.answers.filter((a) => a.section === i);
    const timeSec = rows.reduce((sum, a) => sum + (a.timeSpentSec || 0), 0);
    return {
      key: s.key,
      title: s.title,
      total: s.total,
      correct: s.correct,
      attempted: s.attempted,
      accuracy: s.total ? Math.round((s.correct / s.total) * 100) : 0,
      allowedSec: s.durationSec,
      usedSec: timeSec,
    };
  });

  const byDifficulty = ['easy', 'medium', 'hard'].map((d) => {
    const rows = attempt.answers.filter((a) => a.difficulty === d);
    return { difficulty: d, total: rows.length, correct: rows.filter((a) => a.isCorrect).length };
  }).filter((d) => d.total > 0);

  // Percentile only once enough people have taken the paper, otherwise it is noise.
  let percentile = null;
  const sample = await MockAttempt.countDocuments({ paperId: attempt.paperId, status: { $in: ['completed', 'expired'] } });
  if (sample >= MIN_PERCENTILE_SAMPLE) {
    const below = await MockAttempt.countDocuments({ paperId: attempt.paperId, status: { $in: ['completed', 'expired'] }, score: { $lt: attempt.score } });
    percentile = Math.round((below / sample) * 100);
  }

  return {
    attemptId: String(attempt._id),
    paperId: attempt.paperId,
    paperTitle: attempt.paperTitle,
    status: attempt.status,
    score: attempt.score,
    correctCount: attempt.correctCount,
    totalCount: attempt.totalCount,
    attempted: attempt.answers.filter((a) => a.selectedOption !== null).length,
    timeTakenSec: attempt.timeTakenSec,
    submittedAt: attempt.submittedAt,
    percentile,
    sections,
    topics,
    byDifficulty,
    review,
  };
}
