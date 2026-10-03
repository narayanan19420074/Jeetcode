import { Box, Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import ActivityHeatmap from './ActivityHeatmap';

const EASY = '#10B981';
const MEDIUM = '#F59E0B';
const HARD = '#EF4444';

// LeetCode-style donut: the ring is split into 3 equal arcs (Easy, Medium,
// Hard). Each arc fills up in its own colour by solved/total of that
// difficulty. Total solved sits in the middle.
function SolvedRing({ easy, medium, hard, totals, size = 116, strokeWidth = 7 }) {
  const theme = useTheme();
  const r = (size - strokeWidth) / 2;
  const C = 2 * Math.PI * r;
  const gap = 10; // visible gap between arcs (px along the ring)
  const seg = C / 3 - gap - strokeWidth; // dash length so round caps don't eat the gap
  const startShift = ((gap / 2 + strokeWidth / 2) / C) * 360;

  const parts = [
    { solved: easy, total: totals.Easy, color: EASY },
    { solved: medium, total: totals.Medium, color: MEDIUM },
    { solved: hard, total: totals.Hard, color: HARD },
  ];
  const totalSolved = easy + medium + hard;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {parts.map((p, i) => {
          const rotate = `rotate(${-90 + i * 120 + startShift} ${size / 2} ${size / 2})`;
          const frac = p.total > 0 ? Math.min(p.solved / p.total, 1) : 0;
          return (
            <g key={i} transform={rotate}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={theme.palette.divider}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${seg} ${C - seg}`}
              />
              {p.solved > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${Math.max(seg * frac, 0.01)} ${C}`}
                />
              )}
            </g>
          );
        })}
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.1 }}>{totalSolved}</Typography>
        <Typography variant="caption" color="text.secondary">
          Solved
        </Typography>
      </Box>
    </Box>
  );
}

function DifficultyRow({ label, color, solved, total }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        px: 1.5,
        py: 0.75,
        borderRadius: 2,
        bgcolor: 'action.hover',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700, color }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {solved}
        <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
          /{total}
        </Box>
      </Typography>
    </Box>
  );
}

export default function SolvedCard({ user, isAuthenticated, totals, activity }) {
  const easy = user?.easySolved ?? 0;
  const medium = user?.mediumSolved ?? 0;
  const hard = user?.hardSolved ?? 0;

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, height: '100%', minWidth: 0 }}>
      <Stack direction="row" spacing={{ xs: 2, sm: 3 }} sx={{ alignItems: 'center' }}>
        <SolvedRing easy={easy} medium={medium} hard={hard} totals={totals} />
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          <DifficultyRow label="Easy" color={EASY} solved={easy} total={totals.Easy} />
          <DifficultyRow label="Medium" color={MEDIUM} solved={medium} total={totals.Medium} />
          <DifficultyRow label="Hard" color={HARD} solved={hard} total={totals.Hard} />
        </Stack>
      </Stack>

      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 2, pt: 1.5 }}>
        {isAuthenticated ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <LocalFireDepartmentRoundedIcon fontSize="small" sx={{ color: 'warning.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {user?.streakDays ?? 0}-day streak
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto !important' }}>
              Longest {user?.longestStreak ?? 0}
            </Typography>
          </Stack>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Sign in to start tracking your daily streak.
          </Typography>
        )}

        {/* The activity grid only shows on larger screens. */}
        {isAuthenticated && (
          <Box sx={{ display: { xs: 'none', md: 'block' }, mt: 1 }}>
            <ActivityHeatmap
              data={activity.length ? activity : Array.from({ length: 49 }, (_, i) => ({ day: i, submissions: 0 }))}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
}
