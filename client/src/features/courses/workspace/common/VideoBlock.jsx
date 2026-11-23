import { Box, Typography } from '@mui/material';
import { useLibraryPalette } from '../../../dashboard/components/libraryStyle';
import { BORDER_WIDTHS, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';

const VIDEO_RATIO = '16 / 9';

// A short lesson video with the player controls. Videos have on-screen text instead of sound, so the same content is
// also given as plain text below the player for screen reader users and for anyone who prefers to read.
export default function VideoBlock({ block }) {
  const palette = useLibraryPalette();
  return (
    <Box component="figure" sx={{ m: 0, my: 2 }}>
      <Box component="video" controls playsInline preload="metadata" poster={block.poster} aria-label={block.title} sx={{ display: 'block', width: SIZES.fill, aspectRatio: VIDEO_RATIO, borderRadius: RADII_PX.control, bgcolor: palette.chip, border: `${BORDER_WIDTHS.thin}px solid ${palette.border}` }}>
        <source src={block.src} type="video/mp4" />
        Your browser cannot play this video. The text version below has the same content.
      </Box>
      <Box component="details" sx={{ mt: 1 }}>
        <Typography component="summary" sx={{ cursor: 'pointer', fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold, color: palette.muted }}>Text version of the video</Typography>
        <Typography sx={{ mt: 1, fontSize: FONT_SIZES.body, lineHeight: LINE_HEIGHTS.long, color: palette.muted }}>{block.description}</Typography>
      </Box>
    </Box>
  );
}
