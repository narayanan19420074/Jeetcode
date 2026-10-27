import { Link as RouterLink } from 'react-router-dom';
import { Avatar, AvatarGroup, Box, Button, CircularProgress, Typography, alpha } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
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

// "12 days left" / "Last day" / "Starts in 3 days" ... plus a palette tone for the chip.
export function daysLeftInfo(summary, today = localKey()) {
  const { status, daysLeft, startDate, endDate, total, overdue } = summary;
  if (!total || !endDate) return { text: 'No dates yet', tone: 'info' };
  if (status === 'completed') return { text: 'Completed', tone: 'success' };
  if (status === 'upcoming') {
    const n = Math.round((keyToDate(startDate) - keyToDate(today)) / 86400000);
    return { text: n <= 1 ? 'Starts tomorrow' : `Starts in ${n} days`, tone: 'info' };
  }
  if (endDate < today) return { text: overdue ? `Ended · ${overdue} left` : 'Ended', tone: 'error' };
  if (daysLeft <= 1) return { text: 'Last day', tone: 'warning' };
  return { text: `${daysLeft} days left`, tone: daysLeft <= 3 ? 'warning' : 'primary' };
}

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

// ---------- shared visuals for the Study Plan screens ----------

export const planTone = (summary) =>
  summary.status === 'completed' ? 'success' : summary.status === 'behind' ? 'error' : summary.status === 'upcoming' ? 'info' : 'primary';

export const PLAN_AMBER = '#FBBF24';

// Every plan gets its own colour story (same family as the TCS NQT card). Stable per plan id.
export const PLAN_THEMES = [
  { name: 'indigo', gradient: 'linear-gradient(135deg,#1E1B4B 0%,#3730A3 55%,#6D28D9 100%)' },
  { name: 'teal', gradient: 'linear-gradient(135deg,#042F2E 0%,#0F766E 55%,#047857 100%)' },
  { name: 'rose', gradient: 'linear-gradient(135deg,#4C0519 0%,#BE123C 55%,#C2410C 100%)' },
  { name: 'ocean', gradient: 'linear-gradient(135deg,#0C1E4A 0%,#1D4ED8 55%,#0E7490 100%)' },
  { name: 'plum', gradient: 'linear-gradient(135deg,#3B0764 0%,#86198F 55%,#BE185D 100%)' },
  { name: 'ember', gradient: 'linear-gradient(135deg,#431407 0%,#9A3412 55%,#B45309 100%)' },
];
export const planTheme = (id = '') => PLAN_THEMES[[...String(id)].reduce((n, c) => n + c.charCodeAt(0), 0) % PLAN_THEMES.length];

// Big number for the countdown tile on a plan card / hero.
export function daysTile(summary, today = localKey()) {
  const { status, daysLeft, startDate, endDate, total } = summary;
  if (!total || !endDate) return { big: '--', label: 'no dates', urgent: false };
  if (status === 'completed') return { big: 'Done', label: '', urgent: false };
  if (status === 'upcoming') {
    const n = Math.max(1, Math.round((keyToDate(startDate) - keyToDate(today)) / 86400000));
    return { big: String(n), label: n === 1 ? 'day to start' : 'days to start', urgent: false };
  }
  if (endDate < today) return { big: 'Ended', label: '', urgent: true };
  if (daysLeft <= 1) return { big: 'Last', label: 'day', urgent: true };
  return { big: String(daysLeft), label: 'days left', urgent: daysLeft <= 3 };
}

// Circular progress with the percentage in the middle. `onDark` is for gradient cards (white text, amber ring).
export function ProgressRing({ value, size = 56, tone = 'primary', onDark = false }) {
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }} role="img" aria-label={`${value}% done`}>
      <CircularProgress variant="determinate" value={100} size={size} thickness={4.5} sx={(t) => ({ color: onDark ? 'rgba(255,255,255,0.22)' : alpha(t.palette.text.primary, 0.1), position: 'absolute', inset: 0 })} />
      <CircularProgress variant="determinate" value={value} size={size} thickness={4.5} color={onDark ? 'inherit' : tone} sx={{ position: 'absolute', inset: 0, color: onDark ? PLAN_AMBER : undefined, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }} />
      <Typography sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: size * 0.26, fontVariantNumeric: 'tabular-nums', color: onDark ? '#fff' : undefined }}>{value}%</Typography>
    </Box>
  );
}

// One question in a plan: clear tick when solved, a "Solve now" button when not.
export function PlanTaskRow({ item, doers = [] }) {
  const link = itemLink(item);
  const accent = item.done ? 'success' : item.overdue ? 'error' : null;
  return (
    <Box
      sx={(t) => ({
        display: 'flex', alignItems: 'center', gap: 1.25, px: 1.25, py: 1, borderRadius: '12px', border: `1px solid ${accent ? alpha(t.palette[accent].main, 0.35) : t.palette.divider}`,
        bgcolor: accent ? alpha(t.palette[accent].main, item.done ? 0.07 : 0.05) : 'transparent', mb: 0.75,
      })}
    >
      {item.done ? (
        <Box sx={(t) => ({ width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: t.palette.success.main, color: t.palette.success.contrastText })}>
          <CheckRoundedIcon sx={{ fontSize: 18 }} />
        </Box>
      ) : item.overdue ? (
        <ErrorOutlineRoundedIcon sx={{ fontSize: 26, color: 'error.main', flexShrink: 0 }} />
      ) : (
        <Box sx={(t) => ({ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, border: `2px solid ${t.palette.text.disabled}` })} />
      )}

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3, color: item.done ? 'text.secondary' : 'text.primary', overflowWrap: 'anywhere' }}>{item.title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.4, flexWrap: 'wrap' }}>
          <DiffTag difficulty={item.difficulty} />
          <Typography variant="caption" color="text.secondary">{item.type === 'problem' ? 'Coding' : 'Aptitude'}</Typography>
          {item.overdue && <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>Overdue</Typography>}
          {doers.length > 0 && (
            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 18, height: 18, fontSize: 9, fontWeight: 700, border: '2px solid', borderColor: 'background.paper' } }}>
              {doers.map((m) => <Avatar key={m.userId} src={m.avatarUrl || undefined} alt={m.name}>{m.name?.[0]?.toUpperCase()}</Avatar>)}
            </AvatarGroup>
          )}
        </Box>
      </Box>

      {item.done ? (
        <Typography variant="caption" sx={(t) => ({ color: 'success.main', fontWeight: 800, px: 1, py: 0.3, borderRadius: 999, bgcolor: alpha(t.palette.success.main, 0.14), flexShrink: 0 })}>Solved</Typography>
      ) : link ? (
        <Button component={RouterLink} to={link} size="small" variant="contained" disableElevation startIcon={<PlayArrowRoundedIcon />} sx={{ flexShrink: 0, fontWeight: 700, borderRadius: '10px', whiteSpace: 'nowrap' }}>
          Solve now
        </Button>
      ) : null}
    </Box>
  );
}
