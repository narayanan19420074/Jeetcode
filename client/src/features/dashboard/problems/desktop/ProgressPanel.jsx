import { Box, Skeleton, Stack, Typography } from '@mui/material';
import ProgressRing from '../../../../components/ProgressRing';
import { railCardSx } from '../../components/rail/railCardStyles';
import { EMERALD, FAINT, SOFT } from '../../components/rail/railTokens';
import { LIB_TRACKING, libSectionTitleSx } from '../../components/libraryStyle';
import { sumDifficulties } from '../common/problemsConstants';
import DifficultyBars from './DifficultyBars';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../../app/design/designTokens';

const RING_SIZE = 88;

function SolvedSummary({ solved, total }) {
  const percent = total ? Math.round((solved / total) * 100) : 0;
  return (
    <Box sx={{ minWidth: SIZES.flexShrinkMinWidth }}>
      <Typography sx={{ fontSize: FONT_SIZES.displayLg, lineHeight: '32px', fontWeight: FONT_WEIGHTS.bold, fontVariantNumeric: 'tabular-nums' }}>{percent}%</Typography>
      <Typography sx={{ fontSize: FONT_SIZES.body, letterSpacing: LIB_TRACKING, color: SOFT }}>of the library solved</Typography>
    </Box>
  );
}

// Overall completion ring plus the per-difficulty breakdown, on the same gradient card as the streak calendar.
export default function ProgressPanel({ progress }) {
  const solved = sumDifficulties(progress?.solved);
  const total = sumDifficulties(progress?.total);
  return (
    <Box component="section" aria-label="Your progress" sx={[...railCardSx, { p: 2 }]}>
      <Typography component="h2" sx={libSectionTitleSx}>Your progress</Typography>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', my: 1.5 }}>
        {progress
          ? <ProgressRing value={solved} max={total} color={EMERALD} mutedColor={SOFT} size={RING_SIZE} strokeWidth={10} />
          : <Skeleton variant="circular" width={RING_SIZE} height={RING_SIZE} sx={{ bgcolor: FAINT }} />}
        <SolvedSummary solved={solved} total={total} />
      </Stack>
      <DifficultyBars progress={progress} />
    </Box>
  );
}
