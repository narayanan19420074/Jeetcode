import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { HeaderTile, LIB_TRACKING, libBackBtnSx, useLibraryPalette } from '../../../dashboard/components/libraryStyle';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, MOTION, RADII_PX, SIZES, withAlpha } from '../../../../app/design/designTokens';

const TRACK_ALPHA = 0.28;
const LINE_CLAMP = 2;

// Centred header of the phone Learn page, the same pattern as the topic page: back arrow, tile, title,
// subtitle and a thin progress bar. The bar counts finished lessons, not the open one.
export default function LearnMobileHeader({ slug, title, lessonIndex, lessonTotal, doneCount }) {
  const pal = useLibraryPalette();
  const donePercent = lessonTotal ? Math.min((doneCount / lessonTotal) * 100, 100) : 0;
  return (
    <>
      <IconButton component={RouterLink} to={`/aptitude/${slug}`} aria-label="Back to topic" sx={libBackBtnSx}>
        <ArrowBackRoundedIcon />
      </IconButton>
      <Box sx={{ textAlign: 'center', mt: 1.5 }}>
        <HeaderTile>
          <SchoolRoundedIcon sx={{ fontSize: FONT_SIZES.displayLg, color: COLOR_PALETTE.white }} />
        </HeaderTile>
        <Typography component="h1" sx={{ mt: 1.5, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: LINE_CLAMP, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title || 'Learn'}</Typography>
        <Typography sx={{ fontSize: FONT_SIZES.subheading, lineHeight: 1.5, letterSpacing: LIB_TRACKING, color: pal.muted }}>Lesson {lessonIndex + 1} of {lessonTotal}</Typography>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', justifyContent: 'center', mt: 2.5 }}>
          <Box role="progressbar" aria-label="Lessons completed" aria-valuemin={0} aria-valuemax={lessonTotal} aria-valuenow={doneCount} sx={{ width: SIZES.phoneProgressTrackWidth, height: SIZES.progressBarHeight, borderRadius: RADII_PX.pill, bgcolor: withAlpha(COLOR_PALETTE.amber[500], TRACK_ALPHA), overflow: 'hidden' }}>
            <Box sx={{ width: `${donePercent}%`, height: SIZES.fill, borderRadius: RADII_PX.pill, bgcolor: COLOR_PALETTE.amber[500], transition: `width ${MOTION.deliberate}ms` }} />
          </Box>
          <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.heading, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {doneCount}
            <Box component="span" sx={{ color: pal.muted, fontWeight: FONT_WEIGHTS.regular }}>/{lessonTotal}</Box>
          </Typography>
        </Stack>
      </Box>
    </>
  );
}
