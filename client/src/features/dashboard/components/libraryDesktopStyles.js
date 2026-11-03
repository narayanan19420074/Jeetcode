import { LIB_ACCENT, LIB_TRACKING } from './libraryStyle';
import { COLOR_PALETTE, FONT_WEIGHTS, FONT_SIZES } from '../../../app/design/designTokens';

// Shared styles of the desktop pages in the Library look (Problems, Store): cream panels, pill buttons, indigo accent.

export const panelSx = (palette) => ({
  p: 2.5,
  minWidth: 0,
  borderRadius: '20px',
  border: `1px solid ${palette.border}`,
  bgcolor: palette.chip,
});

export const pillButtonSx = (solid, palette) => ({
  height: 40,
  px: 2.25,
  borderRadius: 999,
  textTransform: 'none',
  fontWeight: FONT_WEIGHTS.medium,
  fontSize: FONT_SIZES.bodyLg,
  letterSpacing: LIB_TRACKING,
  whiteSpace: 'nowrap',
  ...(solid
    ? { bgcolor: LIB_ACCENT, color: COLOR_PALETTE.white, '&:hover': { bgcolor: `color-mix(in srgb, ${LIB_ACCENT} 85%, ${COLOR_PALETTE.black})` } }
    : { bgcolor: palette.player, color: palette.text, '&:hover': { bgcolor: palette.player, filter: 'brightness(0.97)' } }),
});
