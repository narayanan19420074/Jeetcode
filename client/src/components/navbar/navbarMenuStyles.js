import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../app/design/designTokens';
import { ACCENT, ACCENT_GRADIENT, TRACKING, libPal } from './navbarTheme';

// Shared look of the phone menu rows: a single link, a group header and the links inside a group all use these.
export const rowBaseSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  py: 1,
  textDecoration: 'none',
  color: 'inherit',
};

// Hairline between rows; a group draws it once, under its header and its links together.
export const rowDividerSx = {
  borderBottom: (theme) => `1px solid ${libPal(theme).divider}`,
  '&:last-of-type': { borderBottom: 'none' },
};

// The active row gets the accent gradient tile; other rows use the neutral tonal tile.
export const tileSx = (active) => (theme) => ({
  width: SIZES.menuRowHeight,
  height: SIZES.menuRowHeight,
  borderRadius: RADII_PX.card,
  flexShrink: 0,
  display: 'grid',
  placeItems: 'center',
  ...(active ? { background: ACCENT_GRADIENT, color: COLOR_PALETTE.white } : { bgcolor: libPal(theme).chip, color: libPal(theme).chipText }),
});

export const labelSx = (active) => ({
  flex: 1,
  minWidth: SIZES.flexShrinkMinWidth,
  fontWeight: active ? FONT_WEIGHTS.bold : FONT_WEIGHTS.regular,
  fontSize: FONT_SIZES.title,
  lineHeight: '24px',
  letterSpacing: TRACKING,
  color: active ? ACCENT : 'inherit',
});
