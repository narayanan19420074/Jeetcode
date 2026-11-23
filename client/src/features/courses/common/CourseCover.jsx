import { Box, Typography } from '@mui/material';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES, withAlpha } from '../../../app/design/designTokens';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';

const COVER_RATIO = '16 / 9';
const CHIP_SHADE = 0.5;
const GLOW = 0.18;

const coverBackground = (accent) => `radial-gradient(circle at 85% 15%, ${withAlpha(COLOR_PALETTE.white, GLOW)}, transparent 45%), linear-gradient(135deg, ${accent} 0%, ${COLOR_PALETTE.slate[900]} 100%)`;

const chipSx = (shade, weight, size) => ({ px: 1.5, py: 0.5, borderRadius: RADII_PX.control, bgcolor: withAlpha(COLOR_PALETTE.black, shade), color: COLOR_PALETTE.white, fontWeight: weight, fontSize: size, lineHeight: 1.3, letterSpacing: LIB_TRACKING, textAlign: 'center' });

// Course and lesson picture. Without a photo it is drawn from the item's accent colour with the title on it, so every
// card has a cover and the text stays readable on any accent.
export default function CourseCover({ accent, heading, subheading, image }) {
  if (image) return <Box component="img" src={image} alt="" loading="lazy" sx={{ display: 'block', width: SIZES.fill, aspectRatio: COVER_RATIO, objectFit: 'cover' }} />;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, p: 2, width: SIZES.fill, aspectRatio: COVER_RATIO, background: coverBackground(accent) }}>
      <Typography component="span" sx={chipSx(CHIP_SHADE, FONT_WEIGHTS.bold, FONT_SIZES.subheading)}>{heading}</Typography>
      {subheading && <Typography component="span" sx={chipSx(CHIP_SHADE / 2, FONT_WEIGHTS.medium, FONT_SIZES.body)}>{subheading}</Typography>}
    </Box>
  );
}
