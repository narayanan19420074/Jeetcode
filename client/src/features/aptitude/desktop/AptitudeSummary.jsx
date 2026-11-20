import { cloneElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import LightCardRing from '../../dashboard/components/rail/LightCardRing';
import { lightCardSx } from '../../dashboard/components/rail/lightCardStyles';
import { LIB_TRACKING, libSectionTitleSx } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

function CardHeading({ track }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      {cloneElement(track.icon, { sx: { fontSize: FONT_SIZES.display } })}
      <Typography component="h1" sx={libSectionTitleSx}>{track.label}</Typography>
    </Stack>
  );
}

// Solid blue pill on the white card: the one button that jumps to the current level.
function ContinueButton({ label, onClick }) {
  return (
    <Button fullWidth disableElevation onClick={onClick} startIcon={<PlayArrowRoundedIcon />} sx={{ height: SIZES.filterPillHeight, borderRadius: RADII_PX.pill, textTransform: 'none', fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.subheading, letterSpacing: LIB_TRACKING, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.main', filter: 'brightness(0.92)' } }}>
      {label}
    </Button>
  );
}

const actionLabel = (cleared, total) => (cleared === 0 ? 'Start' : cleared >= total ? 'Review' : 'Continue');

// Open section as a white card with blue content, the inverse of "Your progress" on the Problems page: ring and one action.
export default function AptitudeSummary({ track, trackPatterns, cleared, currentIndex, loading }) {
  const navigate = useNavigate();
  const total = trackPatterns.length;
  const current = trackPatterns[currentIndex];
  return (
    <Box component="section" aria-label={`${track.label} progress`} sx={lightCardSx}>
      <CardHeading track={track} />
      <LightCardRing value={cleared} max={total} loading={loading} />
      {!loading && total > 0 && <ContinueButton label={actionLabel(cleared, total)} onClick={() => current && navigate(`/aptitude/${current.slug}`)} />}
    </Box>
  );
}
