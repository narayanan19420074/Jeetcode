import { Box, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { BORDER_WIDTHS, COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, SIZES, TEXT_MEASURE } from '../../app/design/designTokens';
import { sectionTitleSx } from './homeStyles';

export function SectionHeading({ children, sub, align = 'center', maxWidth = SIZES.headingMaxWidth.default, sx }) {
  const centered = align === 'center';
  return (
    <Box sx={{ textAlign: align, maxWidth, mx: centered ? 'auto' : 0, mb: { xs: 4, md: 6 }, ...sx }}>
      <Typography variant="h2" sx={sectionTitleSx}>
        {children}
      </Typography>
      {sub && (
        <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: FONT_SIZES.subheading, lineHeight: LINE_HEIGHTS.relaxed, maxWidth: TEXT_MEASURE.intro, mx: centered ? 'auto' : 0 }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

// The `light` variant is the white button used on the dark closing banner.
const lightButtonSx = { bgcolor: COLOR_PALETTE.white, color: COLOR_PALETTE.indigo[950], '&:hover': { bgcolor: alpha(COLOR_PALETTE.white, 0.9) } };

export function PrimaryCta({ onClick, label, size = 'large', sx, buttonRef, light = false }) {
  return (
    <Button
      ref={buttonRef}
      size={size}
      variant="contained"
      disableElevation
      onClick={onClick}
      sx={{ fontWeight: FONT_WEIGHTS.bold, px: 3.5, py: 1.5, whiteSpace: 'nowrap', ...(light && lightButtonSx), ...sx }}
    >
      {label}
    </Button>
  );
}

const outlineCtaSx = (onDark) => ({
  fontWeight: FONT_WEIGHTS.bold,
  px: 3.5,
  py: 1.5,
  whiteSpace: 'nowrap',
  borderWidth: BORDER_WIDTHS.emphasis,
  '&:hover': { borderWidth: BORDER_WIDTHS.emphasis, ...(onDark && { borderColor: COLOR_PALETTE.white, bgcolor: alpha(COLOR_PALETTE.white, 0.08) }) },
  ...(onDark && { color: COLOR_PALETTE.white, borderColor: alpha(COLOR_PALETTE.white, 0.5) }),
});

export function OutlineCta({ children, onDark = false, ...buttonProps }) {
  return (
    <Button size="large" variant="outlined" sx={outlineCtaSx(onDark)} {...buttonProps}>
      {children}
    </Button>
  );
}
