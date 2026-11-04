import { ACCENTS, FONT_WEIGHTS, RADII_PX, SIZES } from '../../app/design/designTokens';
import { modeKey } from '../../app/design/modeHelpers';

// Navigation highlights always use the design-system blue. They must not follow the accent colour a user picks in
// Settings -> Appearance, so the active link, its underline and the logo marks stay the same blue for everyone.
export const navActiveColor = (theme) => ACCENTS.blue[modeKey(theme.palette.mode)][0];

// Desktop navigation link. The active page is marked by a bottom border and text in the navigation blue, not by a filled pill.
// Inactive links keep a transparent border of the same width so the label never shifts when the page changes.
export const navButtonSx = (active) => (theme) => ({
  px: 2,
  borderRadius: RADII_PX.square,
  fontWeight: active ? FONT_WEIGHTS.bold : FONT_WEIGHTS.semibold,
  color: active ? navActiveColor(theme) : theme.palette.text.secondary,
  borderBottom: `${SIZES.navActiveIndicator}px solid ${active ? navActiveColor(theme) : 'transparent'}`,
  bgcolor: 'transparent',
  '&:hover': { bgcolor: theme.palette.action.hover },
});

// Selected row of the Explore dropdown: label and icon in the navigation blue (the row background stays the neutral selected layer).
export const exploreItemSx = (theme) => ({
  '&.Mui-selected': { color: navActiveColor(theme), '& .MuiListItemIcon-root': { color: 'inherit' } },
});
