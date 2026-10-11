import { Chip } from '@mui/material';

export const STATUS_META = {
  'on-track': { label: 'On track', color: 'success' },
  behind: { label: 'Behind', color: 'warning' },
  completed: { label: 'Completed', color: 'primary' },
  'not-started': { label: 'Not started', color: 'default' },
  ended: { label: 'Ended', color: 'default' },
};

export function StatusChip({ status, size = 'small' }) {
  const m = STATUS_META[status] || STATUS_META['on-track'];
  return <Chip size={size} label={m.label} color={m.color} variant={m.color === 'default' ? 'outlined' : 'filled'} sx={{ fontWeight: 700 }} />;
}

// Where clicking a task should take the learner.
export function itemLink(item) {
  if (item.type === 'problem' && item.problemSlug) return `/workspace/${item.problemSlug}`;
  if (item.type === 'aptitude' && item.patternSlug && item.aptitudeQuestionId) {
    return `/aptitude/${item.patternSlug}/practice/${item.aptitudeQuestionId}`;
  }
  return null;
}

// Day N of a plan as a calendar date. startDate is a UTC-midnight date-only value,
// so format in UTC or it would shift a day in negative-offset timezones.
export function dayDate(startDate, day) {
  const d = new Date(startDate);
  d.setUTCDate(d.getUTCDate() + day - 1);
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
}

export const localDateInputValue = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const joinUrl = (shareCode) => `${window.location.origin}/plans/join/${shareCode}`;
