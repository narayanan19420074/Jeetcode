import { COLOR_PALETTE } from '../../../app/design/designTokens';
// Shared presentation helpers for the Aptitude module (hub, practice, test,
// results). One place so difficulty colours / time formats never drift.

export const DIFFICULTY = {
  easy: { label: 'Easy', color: COLOR_PALETTE.emerald[500] },
  medium: { label: 'Medium', color: COLOR_PALETTE.amber[500] },
  hard: { label: 'Hard', color: COLOR_PALETTE.red[500] },
};

export const difficultyMeta = (d) => DIFFICULTY[d] ?? { label: d ?? '', color: COLOR_PALETTE.slate[500] };

export function formatClock(totalSec) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatDuration(totalSec) {
  if (totalSec == null) return '—';
  const s = Math.round(totalSec);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

export const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// Exam question-palette colours — fixed on purpose so the screen looks
// like the real exam the candidate will face.
export const PALETTE = {
  notVisited: { bg: COLOR_PALETTE.gray[200], fg: COLOR_PALETTE.gray[700], label: 'Not Visited' },
  notAnswered: { bg: COLOR_PALETTE.custom.redE53935, fg: COLOR_PALETTE.white, label: 'Not Answered' },
  answered: { bg: COLOR_PALETTE.custom.green2E9E4F, fg: COLOR_PALETTE.white, label: 'Answered' },
  marked: { bg: COLOR_PALETTE.custom.indigo6A3FB5, fg: COLOR_PALETTE.white, label: 'Marked for Review' },
  answeredMarked: { bg: COLOR_PALETTE.custom.indigo6A3FB5, fg: COLOR_PALETTE.white, label: 'Answered & Marked for Review' },
};
