import { Box, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import ActivityHeatmap from './ActivityHeatmap';
import AppCard from './ui/AppCard';
import ListRow from './ui/ListRow';
import { COLOR_PALETTE } from '../app/design/designTokens';

const EASY = COLOR_PALETTE.emerald[500];
const MEDIUM = COLOR_PALETTE.amber[500];
const HARD = COLOR_PALETTE.red[500];

const RING_SIZE = 116;
const RING_STROKE = 7;
const RING_GAP = 10; // visible gap between arcs, in px along the ring
const HEATMAP_DAYS = 49;

// Geometry shared by every arc. The arc length leaves room for the round caps so the gaps stay visible.
function ringGeometry(size, strokeWidth) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference / 3 - RING_GAP - strokeWidth;
  const startShift = ((RING_GAP / 2 + strokeWidth / 2) / circumference) * 360;
  return { radius, circumference, arcLength, startShift };
}

// One third of the donut: a grey track plus the solved part of that difficulty in its own colour.
function RingArc({ index, size, strokeWidth, geometry, solved, total, color, trackColor }) {
  const { radius, circumference, arcLength, startShift } = geometry;
  const center = size / 2;
  const fraction = total > 0 ? Math.min(solved / total, 1) : 0;
  const circle = { cx: center, cy: center, r: radius, fill: 'none', strokeWidth, strokeLinecap: 'round' };
  return (
    <g transform={`rotate(${-90 + index * 120 + startShift} ${center} ${center})`}>
      <circle {...circle} stroke={trackColor} strokeDasharray={`${arcLength} ${circumference - arcLength}`} />
      {solved > 0 && <circle {...circle} stroke={color} strokeDasharray={`${Math.max(arcLength * fraction, 0.01)} ${circumference}`} />}
    </g>
  );
}

function SolvedRingTotal({ total }) {
  return (
    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h3" sx={{ lineHeight: 1.1 }}>{total}</Typography>
      <Typography variant="caption" color="text.secondary">Solved</Typography>
    </Box>
  );
}

// LeetCode-style donut: the ring is split into 3 equal arcs (Easy, Medium, Hard). Each arc fills up in its own
// colour by solved/total of that difficulty. Total solved sits in the middle.
function SolvedRing({ easy, medium, hard, totals }) {
  const theme = useTheme();
  const geometry = ringGeometry(RING_SIZE, RING_STROKE);
  const parts = [
    { solved: easy, total: totals.Easy, color: EASY },
    { solved: medium, total: totals.Medium, color: MEDIUM },
    { solved: hard, total: totals.Hard, color: HARD },
  ];
  return (
    <Box sx={{ position: 'relative', width: RING_SIZE, height: RING_SIZE, flexShrink: 0 }}>
      <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
        {parts.map((part, index) => (
          <RingArc key={part.color} index={index} size={RING_SIZE} strokeWidth={RING_STROKE} geometry={geometry} trackColor={theme.palette.divider} {...part} />
        ))}
      </svg>
      <SolvedRingTotal total={easy + medium + hard} />
    </Box>
  );
}

function DifficultyRow({ label, color, solved, total }) {
  return (
    <ListRow dense sx={{ bgcolor: 'action.hover', justifyContent: 'space-between' }}>
      <Typography variant="body2" sx={{ fontWeight: 'fontWeightBold', color }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemibold' }}>
        {solved}
        <Box component="span" sx={{ color: 'text.secondary', fontWeight: 'fontWeightRegular' }}>/{total}</Box>
      </Typography>
    </ListRow>
  );
}

function StreakSummary({ user, isAuthenticated }) {
  if (!isAuthenticated) {
    return <Typography variant="caption" color="text.secondary">Sign in to start tracking your daily streak.</Typography>;
  }
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <LocalFireDepartmentRoundedIcon fontSize="small" sx={{ color: 'warning.main' }} />
      <Typography variant="body2" sx={{ fontWeight: 'fontWeightBold' }}>{user?.streakDays ?? 0}-day streak</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto !important' }}>Longest {user?.longestStreak ?? 0}</Typography>
    </Stack>
  );
}

// The activity grid only shows on larger screens. An empty grid is drawn until the first activity exists.
function ActivitySection({ activity }) {
  const data = activity.length ? activity : Array.from({ length: HEATMAP_DAYS }, (_, day) => ({ day, submissions: 0 }));
  return (
    <Box sx={{ display: { xs: 'none', md: 'block' }, mt: 1 }}>
      <ActivityHeatmap data={data} />
    </Box>
  );
}

export default function SolvedCard({ user, isAuthenticated, totals, activity }) {
  const easy = user?.easySolved ?? 0;
  const medium = user?.mediumSolved ?? 0;
  const hard = user?.hardSolved ?? 0;

  return (
    <AppCard sx={{ height: '100%' }}>
      <Stack direction="row" spacing={{ xs: 2, sm: 3 }} sx={{ alignItems: 'center' }}>
        <SolvedRing easy={easy} medium={medium} hard={hard} totals={totals} />
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          <DifficultyRow label="Easy" color={EASY} solved={easy} total={totals.Easy} />
          <DifficultyRow label="Medium" color={MEDIUM} solved={medium} total={totals.Medium} />
          <DifficultyRow label="Hard" color={HARD} solved={hard} total={totals.Hard} />
        </Stack>
      </Stack>
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 2, pt: 1.5 }}>
        <StreakSummary user={user} isAuthenticated={isAuthenticated} />
        {isAuthenticated && <ActivitySection activity={activity} />}
      </Box>
    </AppCard>
  );
}
