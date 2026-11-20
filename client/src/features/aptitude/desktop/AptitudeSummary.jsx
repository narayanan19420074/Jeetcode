import { cloneElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ProgressRing from '../../../components/ProgressRing';
import { railCardSx } from '../../dashboard/components/rail/railCardStyles';
import { EMERALD, FAINT, SOFT } from '../../dashboard/components/rail/railTokens';
import { LIB_TRACKING, libSectionTitleSx } from '../../dashboard/components/libraryStyle';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const RING_SIZE = 88;

function CardHeading({ track }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      {cloneElement(track.icon, { sx: { fontSize: FONT_SIZES.display } })}
      <Typography component="h1" sx={libSectionTitleSx}>{track.label}</Typography>
    </Stack>
  );
}

function CompletionSummary({ cleared, total, loading }) {
  const percent = total ? Math.round((cleared / total) * 100) : 0;
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', my: 1.5 }}>
      {loading
        ? <Skeleton variant="circular" width={RING_SIZE} height={RING_SIZE} sx={{ bgcolor: FAINT }} />
        : <ProgressRing value={cleared} max={total} color={EMERALD} mutedColor={SOFT} size={RING_SIZE} strokeWidth={10} />}
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography sx={{ fontSize: FONT_SIZES.displayLg, lineHeight: '32px', fontWeight: FONT_WEIGHTS.bold, fontVariantNumeric: 'tabular-nums' }}>{percent}%</Typography>
        <Typography sx={{ fontSize: FONT_SIZES.body, letterSpacing: LIB_TRACKING, color: SOFT }}>of the levels cleared</Typography>
      </Box>
    </Stack>
  );
}

// White pill on the indigo card: the one button that jumps to the current level.
function ContinueButton({ label, onClick }) {
  return (
    <Button fullWidth disableElevation onClick={onClick} startIcon={<PlayArrowRoundedIcon />} sx={{ height: SIZES.filterPillHeight, borderRadius: RADII_PX.pill, textTransform: 'none', fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.subheading, letterSpacing: LIB_TRACKING, bgcolor: COLOR_PALETTE.white, color: COLOR_PALETTE.indigo[700], '&:hover': { bgcolor: COLOR_PALETTE.white, filter: 'brightness(0.95)' } }}>
      {label}
    </Button>
  );
}

const actionLabel = (cleared, total) => (cleared === 0 ? 'Start' : cleared >= total ? 'Review' : 'Continue');

// Open section on the same indigo gradient card as "Your progress" on the Problems page: ring, share cleared and one action.
export default function AptitudeSummary({ track, trackPatterns, cleared, currentIndex, loading }) {
  const navigate = useNavigate();
  const total = trackPatterns.length;
  const current = trackPatterns[currentIndex];
  return (
    <Box component="section" aria-label={`${track.label} progress`} sx={[...railCardSx, { p: 2 }]}>
      <CardHeading track={track} />
      <CompletionSummary cleared={cleared} total={total} loading={loading} />
      {!loading && total > 0 && <ContinueButton label={actionLabel(cleared, total)} onClick={() => current && navigate(`/aptitude/${current.slug}`)} />}
    </Box>
  );
}
