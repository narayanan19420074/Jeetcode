import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, IconButton, Stack, Tooltip, Typography, alpha } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import { studyPlanApi } from '../../../api/studyPlanApi';
import { daysLeftInfo } from '../../studyplan/planUtils';
import { MONTHLY_BADGE_GOAL, formatCountdown, monthCells, msUntilUtcMidnight, surface, utcKey } from '../dashboardUtils';
import { PLAN_AMBER, planTheme } from '../../studyplan/planUtils';

const EMERALD = '#34D399'; // light green reads on the dark plan-style card
const SOFT = 'rgba(255,255,255,0.68)';
const FAINT = 'rgba(255,255,255,0.35)';
const GOLD_A = '#FCD34D';
const GOLD_B = '#D97706';
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const Card = ({ children, sx }) => <Box sx={[surface, { p: 2.25 }, ...[].concat(sx || [])]}>{children}</Box>;

// ------------------------------------------------------------------ calendar

function ResetCountdown() {
  const [ms, setMs] = useState(() => msUntilUtcMidnight());
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilUtcMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <Tooltip title="Streak days change at 00:00 UTC">
      <Typography role="timer" variant="caption" sx={{ color: SOFT, fontVariantNumeric: 'tabular-nums', cursor: 'default' }}>
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
          color: active ? EMERALD : future ? FAINT : '#fff',
          border: today ? '2px solid' : 'none',
          borderColor: PLAN_AMBER,
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
            bgcolor: PLAN_AMBER,
            color: '#1B1200',
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
    <Card sx={{ color: '#fff', background: planTheme(user?.id || 'streak').gradient, border: 'none', boxShadow: '0 14px 28px -16px rgba(2,6,23,0.85), inset 0 1px 0 rgba(255,255,255,0.18)' }}>
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
              bgcolor: alpha(PLAN_AMBER, streak > 0 ? 0.2 : 0.1),
              color: streak > 0 ? PLAN_AMBER : FAINT,
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
        <IconButton size="small" sx={{ color: '#fff' }} onClick={() => move(-1)} aria-label="Previous month">
          <ChevronLeftRoundedIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {monthLabel}
        </Typography>
        <IconButton size="small" sx={{ color: '#fff', '&.Mui-disabled': { color: FAINT } }} onClick={() => move(1)} disabled={isCurrent} aria-label="Next month">
          <ChevronRightRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '4px' }}>
        {WEEKDAYS.map((d, i) => (
          <Typography key={i} variant="caption" sx={{ color: SOFT, textAlign: 'center', fontWeight: 600, pb: 0.5 }}>
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

      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.18)' }}>
        {isAuthenticated ? (
          <>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: SOFT }}>
                Longest streak
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {user?.longestStreak ?? 0} days
              </Typography>
            </Stack>
            {beforeHistory && (
              <Typography variant="caption" sx={{ color: SOFT, display: 'block', mt: 0.75 }}>
                Activity is shown for the last 7 weeks only.
              </Typography>
            )}
          </>
        ) : (
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="caption" sx={{ color: SOFT }}>
              Log in to start a streak.
            </Typography>
            <Button size="small" variant="contained" disableElevation onClick={() => navigate('/login')} sx={{ fontWeight: 700, bgcolor: PLAN_AMBER, color: '#1B1200', '&:hover': { bgcolor: '#F5B50F' } }}>
              Log in
            </Button>
          </Stack>
        )}
      </Box>
    </Card>
  );
}

// --------------------------------------------------------------------- rail

export default function RightRail({ user, isAuthenticated, activity }) {
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
    </Box>
  );
}
