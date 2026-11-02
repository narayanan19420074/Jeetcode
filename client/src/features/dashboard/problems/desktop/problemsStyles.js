import { LIB_ACCENT, LIB_TRACKING } from '../../components/libraryStyle';

// Shared styles of the desktop Problems page, taken from the Library look (cream panels, pill buttons, indigo accent).

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
  fontWeight: 500,
  fontSize: 15,
  letterSpacing: LIB_TRACKING,
  whiteSpace: 'nowrap',
  ...(solid
    ? { bgcolor: LIB_ACCENT, color: '#fff', '&:hover': { bgcolor: `color-mix(in srgb, ${LIB_ACCENT} 85%, #000)` } }
    : { bgcolor: palette.player, color: palette.text, '&:hover': { bgcolor: palette.player, filter: 'brightness(0.97)' } }),
});
