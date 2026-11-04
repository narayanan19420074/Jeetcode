import { FONT_WEIGHTS, RADII_PX, SIZES } from '../../app/design/designTokens';

// Desktop navigation link. The active page is marked by a bottom border in the brand colour, not by a filled pill.
// Inactive links keep a transparent border of the same width so the label never shifts when the page changes.
export const navButtonSx = (active) => (theme) => ({
  px: 2,
  borderRadius: RADII_PX.square,
  fontWeight: active ? FONT_WEIGHTS.bold : FONT_WEIGHTS.semibold,
  color: active ? theme.palette.text.primary : theme.palette.text.secondary,
  borderBottom: `${SIZES.navActiveIndicator}px solid ${active ? theme.palette.primary.main : 'transparent'}`,
  bgcolor: 'transparent',
  '&:hover': { bgcolor: theme.palette.action.hover },
});
