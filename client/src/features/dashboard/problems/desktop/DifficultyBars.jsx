import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS, RADII_PX, MOTION, EASING, SIZES } from '../../../../app/design/designTokens';
import { FAINT, LEVEL_COLOR, SOFT } from '../../components/rail/railTokens';
import { DIFFICULTIES } from '../common/problemsConstants';

const TRACK_COLOR = withAlpha(COLOR_PALETTE.white, 0.18);

function DifficultyStat({ label, solved, total }) {
  const percent = total ? Math.min((solved / total) * 100, 100) : 0;
  const color = LEVEL_COLOR[label];
  return (
    <Box sx={{ minWidth: SIZES.flexShrinkMinWidth }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium, color }}>{label}</Typography>
        <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium, fontVariantNumeric: 'tabular-nums' }}>
          {solved}
          <Box component="span" sx={{ color: SOFT }}>/{total}</Box>
        </Typography>
      </Stack>
      <Box sx={{ height: 6, borderRadius: RADII_PX.pill, overflow: 'hidden', bgcolor: TRACK_COLOR }}>
        <Box sx={{ width: `${percent}%`, height: SIZES.fill, borderRadius: RADII_PX.pill, bgcolor: color, transition: `width ${MOTION.deliberate}ms ${EASING.standard}` }} />
      </Box>
    </Box>
  );
}

// Solved count per difficulty, one bar each, in the colours of the streak calendar.
export default function DifficultyBars({ progress }) {
  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      {DIFFICULTIES.map((level) => (progress
        ? <DifficultyStat key={level} label={level} solved={progress.solved?.[level] || 0} total={progress.total?.[level] || 0} />
        : <Skeleton key={level} variant="rounded" height={30} sx={{ bgcolor: FAINT }} />))}
    </Box>
  );
}
