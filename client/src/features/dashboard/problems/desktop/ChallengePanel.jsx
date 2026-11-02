import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import DifficultyChip from '../../../../components/DifficultyChip';
import { LIB_ACCENT, LIB_TRACKING, libSectionTitleSx, useLibraryPalette } from '../../components/libraryStyle';
import { panelSx, pillButtonSx } from './problemsStyles';

const TWO_LINES = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };

// Today's featured problem, the same one the dashboard highlights.
export default function ChallengePanel({ featured }) {
  const palette = useLibraryPalette();
  if (!featured) return null;
  return (
    <Box sx={panelSx(palette)}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <EventRoundedIcon sx={{ color: LIB_ACCENT }} />
        <Typography component="h2" sx={libSectionTitleSx}>Today&apos;s challenge</Typography>
      </Stack>
      <Typography sx={[{ mt: 1.5, fontSize: 16, fontWeight: 500, letterSpacing: LIB_TRACKING }, TWO_LINES]}>{featured.title}</Typography>
      <Box sx={{ mt: 1 }}>
        <DifficultyChip difficulty={featured.difficulty} />
      </Box>
      <Button component={RouterLink} to={`/workspace/${featured.slug}`} fullWidth disableElevation startIcon={<PlayArrowRoundedIcon />} sx={[pillButtonSx(true, palette), { mt: 2 }]}>
        Start solving
      </Button>
    </Box>
  );
}
