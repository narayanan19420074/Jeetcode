// Shared presentation helpers for the Aptitude module (hub, practice, test,
// results). One place so difficulty colours / time formats never drift.

export const DIFFICULTY = {
  easy: { label: 'Easy', color: '#10B981' },
  medium: { label: 'Medium', color: '#F59E0B' },
  hard: { label: 'Hard', color: '#EF4444' },
};

export const difficultyMeta = (d) => DIFFICULTY[d] ?? { label: d ?? '', color: '#64748B' };

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

// TCS iON question-palette colours — fixed on purpose so the screen looks
// like the real exam the candidate will face.
export const PALETTE = {
  notVisited: { bg: '#E5E7EB', fg: '#374151', label: 'Not Visited' },
  notAnswered: { bg: '#E53935', fg: '#FFFFFF', label: 'Not Answered' },
  answered: { bg: '#2E9E4F', fg: '#FFFFFF', label: 'Answered' },
  marked: { bg: '#6A3FB5', fg: '#FFFFFF', label: 'Marked for Review' },
  answeredMarked: { bg: '#6A3FB5', fg: '#FFFFFF', label: 'Answered & Marked for Review' },
};
