import { alpha } from '@mui/material/styles';
import { LIB_ACCENT, LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { COLOR_PALETTE, FONT_SIZES, MOTION, RADII_PX, SIZES } from '../../../app/design/designTokens';

// Look of the desktop Leaderboard. It is the Dashboard look: flat cream panels with a hairline border, indigo
// accent pills, divider-separated table rows and indigo gradient cards. No glass, blur or raised/pressed shadows.

export const ACCENT_HOVER = `color-mix(in srgb, ${LIB_ACCENT} 85%, ${COLOR_PALETTE.black})`;
export const TABULAR = { fontVariantNumeric: 'tabular-nums' };
export const FOCUS_RING = { outline: `2px solid ${LIB_ACCENT}`, outlineOffset: 2 };

// Ink of the rank tile of the first three places.
export const MEDAL_INK = { 1: COLOR_PALETTE.amber[600], 2: COLOR_PALETTE.slate[500], 3: COLOR_PALETTE.orange[700] };

// Filter pill: cream when idle, accent when selected (same as the Library pills).
export const pillSx = (pal, on) => ({
  flexShrink: 0,
  gap: 1,
  height: SIZES.leaderboard.pillHeight,
  px: 2,
  borderRadius: RADII_PX.pill,
  fontFamily: 'inherit',
  fontSize: FONT_SIZES.bodyLg,
  letterSpacing: LIB_TRACKING,
  whiteSpace: 'nowrap',
  bgcolor: on ? LIB_ACCENT : pal.chip,
  color: on ? COLOR_PALETTE.white : pal.chipText,
  transition: `background-color ${MOTION.fast}ms`,
  '&:hover': { bgcolor: on ? ACCENT_HOVER : pal.player },
  '&.Mui-focusVisible': FOCUS_RING,
  '&.Mui-disabled': { opacity: 0.5 },
});

// Pill that sits on a cream card, so its idle fill is the page colour.
export const insetPillSx = (pal, on) => ({ ...pillSx(pal, on), bgcolor: on ? LIB_ACCENT : pal.bg, '&:hover': { bgcolor: on ? ACCENT_HOVER : pal.player } });

// Round 40px action button on a cream fill.
export const iconButtonSx = (pal) => ({
  width: SIZES.leaderboard.controlSize,
  height: SIZES.leaderboard.controlSize,
  flexShrink: 0,
  color: pal.text,
  bgcolor: pal.player,
  '&:hover': { bgcolor: pal.player, filter: 'brightness(0.97)' },
});

// Cream card with a hairline border, like the problem library card.
export const cardSx = (pal) => ({ borderRadius: RADII_PX.card, border: `1px solid ${pal.border}`, bgcolor: pal.chip });

// Soft accent square behind a section icon.
export const accentTileSx = (size) => ({
  width: size,
  height: size,
  flexShrink: 0,
  display: 'grid',
  placeItems: 'center',
  borderRadius: RADII_PX.card,
  color: LIB_ACCENT,
  bgcolor: alpha(LIB_ACCENT, 0.12),
});

// Small tinted tag (tier, rank change, "You").
export const tintTagSx = (color) => ({ px: 1, borderRadius: RADII_PX.pill, lineHeight: 1.7, bgcolor: alpha(color, 0.16), color });
