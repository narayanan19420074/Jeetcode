import { cloneElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { tint } from '../../dashboard/dashboardUtils';
import { HeaderTile, LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { COLOR_PALETTE, FONT_WEIGHTS, FONT_SIZES, RADII_PX } from '../../../app/design/designTokens';

const PROGRESS_GOLD = COLOR_PALETTE.custom.amberF2B63C;

function ProgressLine({ cleared, total, palette }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', justifyContent: 'center', mt: 2.5 }}>
      <Box role="progressbar" aria-label="Levels cleared" aria-valuemin={0} aria-valuemax={total} aria-valuenow={cleared} sx={{ width: 162, height: 8, borderRadius: RADII_PX.pill, bgcolor: tint(PROGRESS_GOLD, 28), overflow: 'hidden' }}>
        <Box sx={{ width: `${Math.min((cleared / total) * 100, 100)}%`, height: '100%', borderRadius: RADII_PX.pill, bgcolor: PROGRESS_GOLD, transition: 'width .5s' }} />
      </Box>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.heading, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {cleared}<Box component="span" sx={{ color: palette.muted, fontWeight: FONT_WEIGHTS.regular }}>/{total}</Box>
      </Typography>
    </Stack>
  );
}

function ContinueButton({ label, onClick, palette }) {
  return (
    <Button onClick={onClick} disableElevation startIcon={<PlayArrowRoundedIcon />} sx={(theme) => ({ mt: 2.5, height: 40, minWidth: 152, px: 3, borderRadius: RADII_PX.pill, fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.subheading, letterSpacing: LIB_TRACKING, textTransform: 'none', bgcolor: palette.player, color: theme.palette.mode === 'dark' ? palette.text : COLOR_PALETTE.custom.yellow6B4A1E, '&:hover': { bgcolor: palette.player, filter: 'brightness(0.97)' } })}>
      {label}
    </Button>
  );
}

// Open track: icon tile, title, levels cleared and the one button that jumps to the current level.
export default function AptitudeSummary({ track, trackPatterns, cleared, currentIndex, loading }) {
  const navigate = useNavigate();
  const palette = useLibraryPalette();
  const total = trackPatterns.length;
  const current = trackPatterns[currentIndex];
  const label = cleared === 0 ? 'Start' : cleared >= total ? 'Review' : 'Continue';
  return (
    <Box sx={{ textAlign: 'center' }}>
      <HeaderTile>{cloneElement(track.icon, { sx: { fontSize: FONT_SIZES.displayLg } })}</HeaderTile>
      <Typography component="h1" sx={{ mt: 1.5, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg, lineHeight: '32px' }}>{track.label}</Typography>
      <Typography sx={{ fontSize: FONT_SIZES.subheading, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: palette.muted }}>Placement preparation</Typography>
      {!loading && total > 0 && (
        <>
          <ProgressLine cleared={cleared} total={total} palette={palette} />
          <ContinueButton label={label} onClick={() => current && navigate(`/aptitude/${current.slug}`)} palette={palette} />
        </>
      )}
    </Box>
  );
}
