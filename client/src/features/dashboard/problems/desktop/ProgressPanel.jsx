import { Box, Typography } from '@mui/material';
import LightCardRing from '../../components/rail/LightCardRing';
import { lightCardSx } from '../../components/rail/lightCardStyles';
import { libSectionTitleSx } from '../../components/libraryStyle';
import { sumDifficulties } from '../common/problemsConstants';
import DifficultyBars from './DifficultyBars';

// Overall completion ring plus the per-difficulty breakdown, on the white card with blue content used by the sidebar cards.
export default function ProgressPanel({ progress }) {
  return (
    <Box component="section" aria-label="Your progress" sx={lightCardSx}>
      <Typography component="h2" sx={libSectionTitleSx}>Your progress</Typography>
      <LightCardRing value={sumDifficulties(progress?.solved)} max={sumDifficulties(progress?.total)} loading={!progress} />
      <DifficultyBars progress={progress} />
    </Box>
  );
}
