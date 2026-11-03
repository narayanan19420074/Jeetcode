import { useNavigate } from 'react-router-dom';
import { Box, Button, IconButton, Menu, MenuItem, Stack, Typography, alpha } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import { PLAN_AMBER } from '../../../studyplan/planUtils';
import { MONTHLY_BADGE_GOAL, surface } from '../../dashboardUtils';
import DayCell from './DayCell';
import MonthBadge from './MonthBadge';
import ResetCountdown from './ResetCountdown';
import useStreakMonth from './useStreakMonth';
import useStudyPlanMarks from './useStudyPlanMarks';
import { CALENDAR_GRADIENT, FAINT, SOFT, WEEKDAYS } from './railTokens';
import { COLOR_PALETTE, withAlpha, FONT_WEIGHTS, FONT_SIZES, RADII_PX, SHADOWS } from '../../../../app/design/designTokens';

const cardSx = (phone) => [
  surface,
  { p: 2.5, color: COLOR_PALETTE.white, background: CALENDAR_GRADIENT, border: 'none', borderRadius: phone ? RADII_PX.card : RADII_PX.card, boxShadow: SHADOWS.cardLit(COLOR_PALETTE.slate[950], 0.85, 0.18) },
];

function StreakHeader({ streak, isAuthenticated, badge }) {
  const flame = { bgcolor: alpha(PLAN_AMBER, streak > 0 ? 0.2 : 0.1), color: streak > 0 ? PLAN_AMBER : FAINT };
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
        <Box sx={{ width: 42, height: 42, borderRadius: RADII_PX.card, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...flame }}>
          <LocalFireDepartmentRoundedIcon />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.subheading, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
            {isAuthenticated ? `${streak}-day streak` : 'Daily streak'}
          </Typography>
          <ResetCountdown />
        </Box>
      </Stack>
      {isAuthenticated && badge}
    </Stack>
  );
}

function MonthNav({ month, phone }) {
  const size = phone ? { width: 40, height: 40 } : {};
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
      <IconButton size="small" sx={{ color: COLOR_PALETTE.white, ...size, ...(phone && { ml: -1 }) }} onClick={() => month.move(-1)} aria-label="Previous month">
        <ChevronLeftRoundedIcon fontSize="small" />
      </IconButton>
      <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.bold, ...(phone && { fontSize: FONT_SIZES.title, letterSpacing: '0.03em' }) }}>
        {month.monthLabel}
      </Typography>
      <IconButton size="small" sx={{ color: COLOR_PALETTE.white, '&.Mui-disabled': { color: FAINT }, ...size, ...(phone && { mr: -1 }) }} onClick={() => month.move(1)} disabled={month.isCurrent} aria-label="Next month">
        <ChevronRightRoundedIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}

function WeekdayHeaders() {
  return WEEKDAYS.map((d, i) => (
    <Typography key={i} variant="caption" sx={{ color: SOFT, textAlign: 'center', fontWeight: FONT_WEIGHTS.semibold, pb: 0.5 }}>
      {d}
    </Typography>
  ));
}

function CalendarGrid({ month, byDate, marks }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 0.5 }}>
      <WeekdayHeaders />
      {month.cells.map((c, i) =>
        c ? (
          <DayCell
            key={c.key}
            day={c.day}
            active={(byDate.get(c.key) || 0) > 0}
            today={c.key === month.todayKey}
            future={c.key > month.todayKey}
            plans={marks.plansByDate.get(c.key)}
            onOpenPlans={marks.onOpenPlans}
          />
        ) : (
          <Box key={`blank-${i}`} />
        )
      )}
    </Box>
  );
}

function GuestFooter() {
  const navigate = useNavigate();
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
      <Typography variant="caption" sx={{ color: SOFT }}>
        Log in to start a streak.
      </Typography>
      <Button size="small" variant="contained" disableElevation onClick={() => navigate('/login')} sx={{ fontWeight: FONT_WEIGHTS.bold, bgcolor: PLAN_AMBER, color: COLOR_PALETTE.custom.black1B1200, '&:hover': { bgcolor: COLOR_PALETTE.amber[400] } }}>
        Log in
      </Button>
    </Stack>
  );
}

function StreakFooter({ user, isAuthenticated, beforeHistory }) {
  if (!isAuthenticated) return <GuestFooter />;
  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: SOFT }}>
          Longest streak
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, fontVariantNumeric: 'tabular-nums' }}>
          {user?.longestStreak ?? 0} days
        </Typography>
      </Stack>
      {beforeHistory && (
        <Typography variant="caption" sx={{ color: SOFT, display: 'block', mt: 1 }}>
          Activity is shown for the last 7 weeks only.
        </Typography>
      )}
    </>
  );
}

function PlanPickerMenu({ menu, onClose, onPick }) {
  return (
    <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={onClose}>
      {(menu?.plans || []).map((p) => (
        <MenuItem key={p.id} onClick={() => onPick(p.id)}>
          {p.title} - {p.left}
        </MenuItem>
      ))}
    </Menu>
  );
}

// Streak count, monthly badge, this month's calendar (active days in green, study plan end dates marked "P").
export default function StreakCalendarCard({ user, isAuthenticated, byDate, phone, onNavigate }) {
  const month = useStreakMonth(byDate, isAuthenticated);
  const marks = useStudyPlanMarks(isAuthenticated, onNavigate);
  const badge = <MonthBadge label={month.badgeLabel} count={month.activeThisMonth} goal={MONTHLY_BADGE_GOAL} />;
  return (
    <Box sx={cardSx(phone)}>
      <StreakHeader streak={user?.streakDays ?? 0} isAuthenticated={isAuthenticated} badge={badge} />
      <MonthNav month={month} phone={phone} />
      <CalendarGrid month={month} byDate={byDate} marks={marks} />
      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${withAlpha(COLOR_PALETTE.white, 0.18)}` }}>
        <StreakFooter user={user} isAuthenticated={isAuthenticated} beforeHistory={month.beforeHistory} />
      </Box>
      <PlanPickerMenu menu={marks.planMenu} onClose={marks.closePlanMenu} onPick={marks.openPlan} />
    </Box>
  );
}
