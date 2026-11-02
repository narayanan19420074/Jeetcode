import { Box, Skeleton, Stack, Typography } from '@mui/material';
import ProgressRing from '../../../../components/ProgressRing';
import { LIB_ACCENT, LIB_TRACKING, libSectionTitleSx, useLibraryPalette } from '../../components/libraryStyle';
import { sumDifficulties } from '../common/problemsConstants';
import DifficultyBars from './DifficultyBars';
import { panelSx } from './problemsStyles';

const RING_SIZE = 112;

function SolvedSummary({ solved, total, palette }) {
  const percent = total ? Math.round((solved / total) * 100) : 0;
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 30, lineHeight: '36px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{percent}%</Typography>
      <Typography sx={{ fontSize: 14, letterSpacing: LIB_TRACKING, color: palette.muted }}>of the library solved</Typography>
    </Box>
  );
}

// Overall completion ring plus the per-difficulty breakdown.
export default function ProgressPanel({ progress }) {
  const palette = useLibraryPalette();
  const solved = sumDifficulties(progress?.solved);
  const total = sumDifficulties(progress?.total);
  return (
    <Box sx={panelSx(palette)}>
      <Typography component="h2" sx={libSectionTitleSx}>Your progress</Typography>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', my: 2 }}>
        {progress
          ? <ProgressRing value={solved} max={total} color={LIB_ACCENT} size={RING_SIZE} strokeWidth={10} />
          : <Skeleton variant="circular" width={RING_SIZE} height={RING_SIZE} />}
        <SolvedSummary solved={solved} total={total} palette={palette} />
      </Stack>
      <DifficultyBars progress={progress} />
    </Box>
  );
}
