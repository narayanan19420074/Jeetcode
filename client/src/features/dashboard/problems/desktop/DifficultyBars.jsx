import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { LIGHT_CARD_LEVEL_COLOR, LIGHT_CARD_MUTED_OPACITY, LIGHT_CARD_SELECTED_BG } from '../../components/rail/lightCardStyles';
import { DIFFICULTIES } from '../common/problemsConstants';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, MOTION, EASING, SIZES } from '../../../../app/design/designTokens';

function DifficultyStat({ label, solved, total }) {
  const percent = total ? Math.min((solved / total) * 100, 100) : 0;
  const color = LIGHT_CARD_LEVEL_COLOR[label];
  return (
    <Box sx={{ minWidth: SIZES.flexShrinkMinWidth }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium, color }}>{label}</Typography>
        <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium, fontVariantNumeric: 'tabular-nums' }}>
          {solved}
          <Box component="span" sx={{ opacity: LIGHT_CARD_MUTED_OPACITY }}>/{total}</Box>
        </Typography>
      </Stack>
      <Box sx={{ height: SIZES.progressBarHeight, borderRadius: RADII_PX.pill, overflow: 'hidden', bgcolor: LIGHT_CARD_SELECTED_BG }}>
        <Box sx={{ width: `${percent}%`, height: SIZES.fill, borderRadius: RADII_PX.pill, bgcolor: color, transition: `width ${MOTION.deliberate}ms ${EASING.standard}` }} />
      </Box>
    </Box>
  );
}

// Solved count per difficulty, one bar each, in difficulty colours that read on the white card.
export default function DifficultyBars({ progress }) {
  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      {DIFFICULTIES.map((level) => (progress
        ? <DifficultyStat key={level} label={level} solved={progress.solved?.[level] || 0} total={progress.total?.[level] || 0} />
        : <Skeleton key={level} variant="rounded" height={30} sx={{ opacity: LIGHT_CARD_MUTED_OPACITY }} />))}
    </Box>
  );
}
