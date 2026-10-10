// Gamification rules for the Aptitude module. Everything here is derived on the
// client from data the hub / list endpoints already return, so there is no extra
// server state to keep in sync: XP is a pure function of progress.

export const ALIENS = [
  { key: 'blip', name: 'Blip', title: 'Rookie', minXp: 0, color: '#34D399', glow: '#10B981' },
  { key: 'zapp', name: 'Zapp', title: 'Sprinter', minXp: 250, color: '#FACC15', glow: '#EAB308' },
  { key: 'ember', name: 'Ember', title: 'Challenger', minXp: 800, color: '#FB923C', glow: '#F97316' },
  { key: 'crystalix', name: 'Crystalix', title: 'Strategist', minXp: 1600, color: '#38BDF8', glow: '#0EA5E9' },
  { key: 'nova', name: 'Nova', title: 'Grandmaster', minXp: 2600, color: '#C084FC', glow: '#A855F7' },
];

export const XP_PER_SOLVE = { easy: 10, medium: 20, hard: 40 };
const XP_PER_LESSON = 50;
const XP_PER_TEST_TAKEN = 25;
const XP_PER_BEST_POINT = 5;
const XP_PASS_BONUS = 300;

export function rankForXp(xp) {
  let index = 0;
  ALIENS.forEach((a, i) => {
    if (xp >= a.minXp) index = i;
  });
  const alien = ALIENS[index];
  const next = ALIENS[index + 1] ?? null;
  const span = next ? next.minXp - alien.minXp : 1;
  const pct = next ? Math.min(100, ((xp - alien.minXp) / span) * 100) : 100;
  return { alien, index, next, pct, toNext: next ? next.minXp - xp : 0 };
}

// Rank for the "all levels" screen: how far through the whole path the learner is.
export function rankForPath(cleared, total) {
  const index = total > 0 ? Math.min(ALIENS.length - 1, Math.floor((cleared / total) * ALIENS.length)) : 0;
  return { alien: ALIENS[index], index };
}

export function moduleXp({ practice, progress, learnDone, pattern }) {
  const { byDifficulty } = practice;
  let xp = 0;
  for (const [k, v] of Object.entries(XP_PER_SOLVE)) xp += (byDifficulty[k]?.solved ?? 0) * v;
  xp += learnDone * XP_PER_LESSON;
  xp += (progress.attemptsCount ?? 0) * XP_PER_TEST_TAKEN;
  if ((progress.attemptsCount ?? 0) > 0) {
    xp += Math.round(progress.bestScore * XP_PER_BEST_POINT);
    if (progress.bestScore >= pattern.passPercentage) xp += XP_PASS_BONUS;
  }
  return Math.round(xp);
}

// XP value of a single finished test, shown on the results screen.
export const testXp = (score, passed) => Math.round(score * XP_PER_BEST_POINT) + XP_PER_TEST_TAKEN + (passed ? XP_PASS_BONUS : 0);

export function buildBadges({ practice, progress, learnDone, learnTotal, pattern }) {
  const { totals, byDifficulty, bySubPattern } = practice;
  const passed = (progress.attemptsCount ?? 0) > 0 && progress.bestScore >= pattern.passPercentage;
  const hard = byDifficulty.hard?.solved ?? 0;
  const easyAll = byDifficulty.easy?.total > 0 && byDifficulty.easy.solved === byDifficulty.easy.total;
  const mastered = bySubPattern.filter((s) => s.total > 0 && s.solved === s.total).length;
  const row = (id, name, desc, icon, color, have, need) => ({ id, name, desc, icon, color, earned: have >= need, have: Math.min(have, need), need });
  return [
    row('first', 'First Blood', 'Solve your first question', 'bolt', '#34D399', totals.solved, 1),
    row('scholar', 'Scholar', 'Finish every lesson', 'book', '#60A5FA', learnDone, Math.max(learnTotal, 1)),
    row('ten', 'Warm-up', 'Solve 10 questions', 'fire', '#FB923C', totals.solved, 10),
    row('easy', 'Easy Sweep', 'Clear every Easy question', 'star', '#FACC15', easyAll ? 1 : 0, 1),
    row('hard', 'Hard Hitter', 'Solve 5 Hard questions', 'shield', '#F87171', hard, 5),
    row('master', 'Topic Master', 'Fully clear 3 topics', 'crown', '#C084FC', mastered, 3),
    row('exam', 'Exam Ready', 'Pass the timed test', 'trophy', '#FBBF24', passed ? 1 : 0, 1),
    row('ace', 'Ace', 'Score 90%+ in a test', 'rocket', '#22D3EE', progress.bestScore ?? 0, 90),
  ];
}

// 1 star for passing, 2 for 85%+, 3 for 95%+ — shown on the level map.
export const starsFor = (best, pass) => (best >= 95 ? 3 : best >= 85 ? 2 : best >= pass ? 1 : 0);
