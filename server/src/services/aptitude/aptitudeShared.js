import { AptitudeQuestion } from '../../models/AptitudeQuestion.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Learn is now a *recommended* step, not a hard gate (LeetCode never blocks
// you from a problem; TCS iON never asks what you studied). Flip to true to
// restore the old "finish Learn first" rule for Test mode.
export const REQUIRE_LEARN_BEFORE_TEST = false;

// Test difficulty blueprint — same 30/50/20 mix the content brief uses.
export const TEST_MIX = { easy: 0.3, hard: 0.2 }; // medium = remainder

// Seconds of grace after expiresAt in which the server still accepts the
// final autosave / submit (network latency on the auto-submit at 00:00).
export const SUBMIT_GRACE_SEC = 30;
export const COMPLETE_GRACE_SEC = 10;

// Target solve time per difficulty (seconds) — shown in practice like
// LeetCode's runtime hint, and used for the "slow / on-pace" label.
export const TARGET_TIME_SEC = { easy: 45, medium: 90, hard: 150 };

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

export const prettify = (slug) =>
  String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

export function shuffled(arr) {
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
export const META_TTL_MS = 60 * 1000;
export const metaCache = new Map(); // patternId -> { at, items }

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
