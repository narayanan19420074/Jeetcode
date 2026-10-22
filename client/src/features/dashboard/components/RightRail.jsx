import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Collapse, IconButton, LinearProgress, Stack, Tooltip, Typography, alpha } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { studyPlanApi } from '../../../api/studyPlanApi';
import { daysLeftInfo } from '../../studyplan/planUtils';
import {
  DIFF_COLOR,
  MONTHLY_BADGE_GOAL,
  formatCountdown,
  monthCells,
  msUntilUtcMidnight,
  surface,
  utcKey,
  weekSegments,
} from '../dashboardUtils';

const EMERALD = '#10B981';
const GOLD_A = '#FCD34D';
const GOLD_B = '#D97706';
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const Card = ({ children, sx }) => <Box sx={[surface, { p: 2.25 }, ...[].concat(sx || [])]}>{children}</Box>;

// Small cards fold away behind a chevron so the rail stays short and calm.
function FoldCard({ title, trailing, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card sx={{ py: 1.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>{title}</Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          {trailing}
          <IconButton size="small" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? `Collapse ${title}` : `Expand ${title}`}>
            <ExpandMoreRoundedIcon fontSize="small" sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          </IconButton>
        </Stack>
      </Stack>
      <Collapse in={open} timeout={250}>
        <Box sx={{ pt: 1.25 }}>{children}</Box>
      </Collapse>
    </Card>
  );
}

// ------------------------------------------------------------------ calendar

function ResetCountdown() {
  const [ms, setMs] = useState(() => msUntilUtcMidnight());
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilUtcMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <Tooltip title="Streak days change at 00:00 UTC">
      <Typography role="timer" variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums', cursor: 'default' }}>
        Today ends in {formatCountdown(ms)}
      </Typography>
    </Tooltip>
  );
}

function MonthBadge({ label, count, goal }) {
  const earned = count >= goal;
  return (
    <Tooltip title={earned ? `${label} badge earned` : `Be active on ${goal} days this month to earn the ${label} badge`}>
      <Box sx={{ position: 'relative', width: 56, height: 64, flexShrink: 0, filter: earned ? 'none' : 'grayscale(1)', opacity: earned ? 1 : 0.7 }}>
        <svg width="56" height="64" viewBox="0 0 56 64" aria-hidden="true">
          <defs>
            <linearGradient id="badgeGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={GOLD_A} />
              <stop offset="1" stopColor={GOLD_B} />
            </linearGradient>
          </defs>
          <polygon points="28,2 52,16 52,48 28,62 4,48 4,16" fill="url(#badgeGold)" />
          <polygon points="28,7 47,18 47,46 28,57 9,46 9,18" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#3B1D00' }}>
          <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, lineHeight: 1 }}>{label}</Typography>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }}>
            {Math.min(count, goal)}
            <Box component="span" sx={{ fontSize: '0.6rem', fontWeight: 700 }}>
              /{goal}
            </Box>
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  );
}

function DayCell({ day, active, today, future, plans }) {
  const hasPlan = plans && plans.length > 0;
  const cell = (
    <Box sx={{ position: 'relative', height: 34, cursor: hasPlan ? 'help' : 'default' }}>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
          width: 34,
          height: 34,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: active || today ? 800 : 500,
          color: active ? EMERALD : future ? 'text.disabled' : 'text.primary',
          border: today ? '2px solid' : 'none',
          borderColor: 'primary.main',
        }}
        aria-label={`${day}${today ? ', today' : ''}${active ? ', active' : ''}${hasPlan ? ', study plan' : ''}`}
      >
        {day}
      </Box>
      {hasPlan && (
        <Box
          component="span"
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: -2,
            right: 'calc(50% - 20px)',
            width: 13,
            height: 13,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontSize: 8,
            fontWeight: 800,
            lineHeight: 1,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          P
        </Box>
      )}
    </Box>
  );
  if (!hasPlan) return cell;
  return (
    <Tooltip
      arrow
      title={
        <Box>
          {plans.map((p) => (
            <Typography key={p.id} variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
              {p.title} - {p.left}
            </Typography>
          ))}
        </Box>
      }
    >
      {cell}
    </Tooltip>
  );
}

function StreakCalendarCard({ user, isAuthenticated, byDate }) {
  const navigate = useNavigate();
  const now = new Date();
  const cy = now.getUTCFullYear();
  const cm = now.getUTCMonth();
  const todayKey = utcKey(now);
  const [shown, setShown] = useState({ y: cy, m: cm });
  const isCurrent = shown.y === cy && shown.m === cm;

  const cells = useMemo(() => monthCells(shown.y, shown.m), [shown]);
  const monthLabel = new Date(Date.UTC(shown.y, shown.m, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const badgeLabel = new Date(Date.UTC(cy, cm, 1)).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();

  const activeThisMonth = useMemo(() => {
    let n = 0;
    byDate.forEach((count, key) => {
      if (count > 0 && key.startsWith(`${cy}-${String(cm + 1).padStart(2, '0')}`)) n++;
    });
    return n;
  }, [byDate, cy, cm]);

  const earliest = useMemo(() => (byDate.size ? [...byDate.keys()].sort()[0] : null), [byDate]);
  const monthEnd = utcKey(new Date(Date.UTC(shown.y, shown.m + 1, 0)));
  const beforeHistory = isAuthenticated && earliest && monthEnd < earliest;

  const move = (delta) =>
    setShown((s) => {
      const d = new Date(Date.UTC(s.y, s.m + delta, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    });

  // Study plans: mark each plan's last day with a small "P" and show "name - days left" on hover.
  const [plans, setPlans] = useState([]);
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let alive = true;
    studyPlanApi
      .list()
      .then(({ data }) => alive && setPlans(data.data || []))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);
  const plansByDate = useMemo(() => {
    const map = new Map();
    plans.forEach((p) => {
      const end = p.summary?.endDate;
      if (!end || p.summary.status === 'completed') return;
      const left = daysLeftInfo(p.summary).text;
      map.set(end, [...(map.get(end) || []), { id: p.id, title: p.title, left }]);
    });
    return map;
  }, [plans]);

  const isActive = (cell) => Boolean(cell) && (byDate.get(cell.key) || 0) > 0;
  const streak = user?.streakDays ?? 0;

  return (
    <Card>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.75 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              bgcolor: alpha('#F59E0B', streak > 0 ? 0.18 : 0.08),
              color: streak > 0 ? '#F59E0B' : 'text.disabled',
            }}
          >
            <LocalFireDepartmentRoundedIcon />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
              {isAuthenticated ? `${streak}-day streak` : 'Daily streak'}
            </Typography>
            <ResetCountdown />
          </Box>
        </Stack>
        {isAuthenticated && <MonthBadge label={badgeLabel} count={activeThisMonth} goal={MONTHLY_BADGE_GOAL} />}
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <IconButton size="small" onClick={() => move(-1)} aria-label="Previous month">
          <ChevronLeftRoundedIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {monthLabel}
        </Typography>
        <IconButton size="small" onClick={() => move(1)} disabled={isCurrent} aria-label="Next month">
          <ChevronRightRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '4px' }}>
        {WEEKDAYS.map((d, i) => (
          <Typography key={i} variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontWeight: 600, pb: 0.5 }}>
            {d}
          </Typography>
        ))}
        {cells.map((c, i) => {
          if (!c) return <Box key={`b${i}`} />;
          return (
            <DayCell
              key={c.key}
              day={c.day}
              active={isActive(c)}
              today={c.key === todayKey}
              future={c.key > todayKey}
              plans={plansByDate.get(c.key)}
            />
          );
        })}
      </Box>

      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        {isAuthenticated ? (
          <>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                Longest streak
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {user?.longestStreak ?? 0} days
              </Typography>
            </Stack>
            {beforeHistory && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                Activity is shown for the last 7 weeks only.
              </Typography>
            )}
          </>
        ) : (
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Log in to start a streak.
            </Typography>
            <Button size="small" variant="contained" disableElevation onClick={() => navigate('/login')} sx={{ fontWeight: 700 }}>
              Log in
            </Button>
          </Stack>
        )}
      </Box>
    </Card>
  );
}

// -------------------------------------------------------------- weekly goal

function WeeklyGoalCard({ isAuthenticated, byDate }) {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const segments = useMemo(() => weekSegments(y, m), [y, m]);
  const current = segments.findIndex((s) => d >= s.start && d <= s.end);

  const counts = segments.map((s) => {
    let n = 0;
    for (let day = s.start; day <= s.end; day++) {
      if ((byDate.get(utcKey(new Date(Date.UTC(y, m, day)))) || 0) > 0) n++;
    }
    return n;
  });

  const daysLeft = current >= 0 ? segments[current].end - d : 0;

  return (
    <FoldCard
      title="Weekly goal"
      trailing={
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.main' }}>
          {daysLeft === 0 ? 'Last day' : `${daysLeft} days left`}
        </Typography>
      }
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        {segments.map((s, i) => {
          const done = counts[i] >= s.goal;
          const isCurrent = i === current;
          const upcoming = i > current;
          return (
            <Stack key={s.label} spacing={0.75} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                  background: done ? `linear-gradient(135deg, ${GOLD_A}, ${GOLD_B})` : 'transparent',
                  color: done ? '#3B1D00' : isCurrent ? 'primary.main' : 'text.disabled',
                  border: done ? 'none' : '2px',
                  borderStyle: done ? 'none' : upcoming ? 'dashed' : 'solid',
                  borderColor: isCurrent ? 'primary.main' : 'divider',
                }}
                aria-label={`${s.label}: ${counts[i]} of ${s.goal} days${done ? ', complete' : ''}`}
              >
                {done ? <CheckRoundedIcon sx={{ fontSize: 20 }} /> : isAuthenticated ? `${counts[i]}/${s.goal}` : `0/${s.goal}`}
              </Box>
              <Typography variant="caption" sx={{ fontWeight: isCurrent ? 800 : 500, color: isCurrent ? 'text.primary' : 'text.secondary' }}>
                {s.label}
              </Typography>
            </Stack>
          );
        })}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
        Submit a solution on 5 different days in a week to complete it.
      </Typography>
    </FoldCard>
  );
}

// ----------------------------------------------------------------- progress

function TriRing({ easy, medium, hard, totals, size = 112, stroke = 8 }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const gap = 12;
  const seg = C / 3 - gap;
  const parts = [
    { solved: easy, total: totals.Easy, color: DIFF_COLOR.Easy },
    { solved: medium, total: totals.Medium, color: DIFF_COLOR.Medium },
    { solved: hard, total: totals.Hard, color: DIFF_COLOR.Hard },
  ];
  const solvedAll = easy + medium + hard;
  const totalAll = totals.Easy + totals.Medium + totals.Hard;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }} role="img" aria-label={`${solvedAll} of ${totalAll} problems solved`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {parts.map((p, i) => {
          const frac = p.total > 0 ? Math.min(p.solved / p.total, 1) : 0;
          const rot = `rotate(${-90 + i * 120 + (gap / 2 / C) * 360} ${size / 2} ${size / 2})`;
          return (
            <g key={i} transform={rot}>
              <Box component="circle" cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${seg} ${C}`} />
              {p.solved > 0 && (
                <Box
                  component="circle"
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={`${drawn ? Math.max(seg * frac, 0.01) : 0.01} ${C}`}
                  sx={{ transition: 'stroke-dasharray 900ms cubic-bezier(.2,.8,.2,1)', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}
                />
              )}
            </g>
          );
        })}
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: '1.7rem', fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{solvedAll}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          of {totalAll}
        </Typography>
      </Box>
    </Box>
  );
}

function ProgressCard({ user, progress }) {
  const totals = progress?.total || { Easy: 0, Medium: 0, Hard: 0 };
  const solved = progress?.solved || { Easy: user?.easySolved ?? 0, Medium: user?.mediumSolved ?? 0, Hard: user?.hardSolved ?? 0 };

  return (
    <FoldCard title="Your progress">
      <Stack direction="row" spacing={2.25} sx={{ alignItems: 'center' }}>
        <TriRing easy={solved.Easy} medium={solved.Medium} hard={solved.Hard} totals={totals} />
        <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
          {['Easy', 'Medium', 'Hard'].map((d) => {
            const pct = totals[d] ? (solved[d] / totals[d]) * 100 : 0;
            return (
              <Box key={d}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: DIFF_COLOR[d] }}>
                    {d}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {solved[d]}
                    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      /{totals[d]}
                    </Box>
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{ height: 5, borderRadius: 3, bgcolor: `color-mix(in srgb, ${DIFF_COLOR[d]} 16%, transparent)`, '& .MuiLinearProgress-bar': { bgcolor: DIFF_COLOR[d], borderRadius: 3 } }}
                />
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </FoldCard>
  );
}

// --------------------------------------------------------------------- rail

export default function RightRail({ user, isAuthenticated, progress, activity }) {
  const byDate = useMemo(() => new Map((activity || []).map((a) => [a.date, a.submissions])), [activity]);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))', lg: 'minmax(0, 1fr)' },
        pb: { lg: 1 },
        gap: 2,
        alignItems: 'start',
      }}
    >
      <StreakCalendarCard user={user} isAuthenticated={isAuthenticated} byDate={byDate} />
      <WeeklyGoalCard isAuthenticated={isAuthenticated} byDate={byDate} />
      <ProgressCard user={user} progress={progress} />
    </Box>
  );
}
