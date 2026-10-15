import { Avatar, AvatarGroup, Box, Typography, alpha } from '@mui/material';
import { DIFF_COLOR } from '../dashboard/dashboardUtils';

const pad = (n) => String(n).padStart(2, '0');

// Calendar days travel as 'YYYY-MM-DD' strings everywhere, so no timezone can shift a date.
export const localKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const keyToDate = (key) => new Date(`${key}T00:00:00Z`);
export const addDays = (key, n) => {
  const d = keyToDate(key);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export const fmtDay = (key, opts = {}) =>
  keyToDate(key).toLocaleDateString(undefined, { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', ...opts });

export const fmtRange = (a, b) => {
  if (!a) return 'No dates yet';
  const o = { weekday: undefined };
  return a === b ? fmtDay(a, o) : `${fmtDay(a, o)} – ${fmtDay(b, o)}`;
};

export const relDay = (key, today) => {
  if (key === today) return 'Today';
  if (key === addDays(today, 1)) return 'Tomorrow';
  if (key === addDays(today, -1)) return 'Yesterday';
  return fmtDay(key);
};

export const monthLabel = (y, m) => new Date(Date.UTC(y, m, 1)).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'long', year: 'numeric' });

export const relTime = (iso) => {
  if (!iso) return '—';
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

export const daysSince = (iso) => (iso ? (Date.now() - new Date(iso).getTime()) / 86400000 : Infinity);

// ---------- status ----------

export const STATUS_META = {
  'on-track': { label: 'On track', tone: 'success' },
  behind: { label: 'Behind', tone: 'error' },
  completed: { label: 'Completed', tone: 'primary' },
  upcoming: { label: 'Upcoming', tone: 'info' },
};

export function StatusPill({ status, small }) {
  const m = STATUS_META[status] || STATUS_META['on-track'];
  return (
    <Box
      component="span"
      sx={(t) => ({
        display: 'inline-flex', alignItems: 'center', gap: 0.6, px: small ? 0.9 : 1.2, py: small ? 0.1 : 0.3, borderRadius: 999,
        fontSize: small ? 11 : 12, fontWeight: 700, lineHeight: 1.6, whiteSpace: 'nowrap',
        color: t.palette[m.tone].main, bgcolor: alpha(t.palette[m.tone].main, 0.12),
      })}
    >
      <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
      {m.label}
    </Box>
  );
}

export function DiffTag({ difficulty }) {
  const c = DIFF_COLOR[difficulty] || 'var(--jc-pending)';
  return (
    <Typography component="span" sx={{ fontSize: 12, fontWeight: 700, color: c, bgcolor: `color-mix(in srgb, ${c} 12%, transparent)`, px: 1, py: 0.1, borderRadius: 999, whiteSpace: 'nowrap' }}>
      {difficulty}
    </Typography>
  );
}

// Pace: how far ahead / behind the schedule a member is (questions).
export function paceLabel(pace) {
  if (pace > 0) return { text: `+${pace} ahead`, tone: 'success.main' };
  if (pace < 0) return { text: `${Math.abs(pace)} behind`, tone: 'error.main' };
  return { text: 'On pace', tone: 'text.secondary' };
}

// Overlapping avatars — who has finished this question.
export function AvatarStack({ users, max = 4, size = 22 }) {
  if (!users?.length) return null;
  return (
    <AvatarGroup
      max={max}
      sx={{ '& .MuiAvatar-root': { width: size, height: size, fontSize: size * 0.5, fontWeight: 700, border: '2px solid', borderColor: 'background.paper' } }}
    >
      {users.map((u) => (
        <Avatar key={u.userId} src={u.avatarUrl || undefined} alt={u.name}>{u.name?.[0]?.toUpperCase()}</Avatar>
      ))}
    </AvatarGroup>
  );
}

// 7 tiny bars (oldest → today): solves per day.
export function Sparkline({ values, width = 56, height = 20 }) {
  const max = Math.max(1, ...values);
  const w = width / values.length;
  return (
    <svg width={width} height={height} role="img" aria-label={`Solves in the last 7 days: ${values.join(', ')}`}>
      {values.map((v, i) => {
        const h = v ? Math.max(3, (v / max) * (height - 2)) : 2;
        return <rect key={i} x={i * w + 1} y={height - h} width={w - 2.5} height={h} rx={1.5} fill="currentColor" opacity={v ? (i === values.length - 1 ? 1 : 0.65) : 0.2} />;
      })}
    </svg>
  );
}

// ---------- links, invites, calendar export ----------

export function itemLink(item) {
  if (item.type === 'problem' && item.problemSlug) return `/workspace/${item.problemSlug}`;
  if (item.type === 'aptitude' && item.patternSlug && item.aptitudeQuestionId) return `/aptitude/${item.patternSlug}/practice/${item.aptitudeQuestionId}`;
  return null;
}

// Invite links open the dashboard's Study Plan view, which shows the join card inline.
export const shareUrl = (code) => `${window.location.origin}/dashboard?view=plans&join=${code}`;

// Accepts a full invite URL or a bare code.
export const parseInvite = (text) => {
  const t = text.trim();
  if (!t) return '';
  try {
    return new URL(t).searchParams.get('join') || '';
  } catch {
    return t;
  }
};

const icsEscape = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
const icsDate = (key) => key.replace(/-/g, '');

// Download the schedule as an .ics file (all-day events) for Google / Apple / Outlook calendars.
export function downloadIcs(plan) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//JeetCode//Study Plan//EN', 'CALSCALE:GREGORIAN'];
  plan.items.forEach((it) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${it.id}@jeetcode-plan-${plan.id}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(it.date)}`,
      `DTEND;VALUE=DATE:${icsDate(addDays(it.date, 1))}`,
      `SUMMARY:${icsEscape(`${it.title} (${it.difficulty})`)}`,
      `DESCRIPTION:${icsEscape(`${plan.title} · ${it.type === 'problem' ? 'Coding' : 'Aptitude'}`)}`,
      'END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${plan.title.replace(/[^\w-]+/g, '-').toLowerCase() || 'study-plan'}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
