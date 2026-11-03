import { useMemo } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from '../libraryStyle';
import { surface, tint } from '../../dashboardUtils';
import { DIFF_W, PAD_X, STAR_W, TOPIC_ROW_H } from './libraryConstants';
import { COLOR_PALETTE, FONT_WEIGHTS, FONT_SIZES, RADII_PX, MOTION } from '../../../../app/design/designTokens';

// Two looks for the same problem library. "classic" is the original page style (used by the Problems page).
// "cream" is the phone Library look: cream pills and panels, accent when selected, tinted difficulty tags.
// The cream look is chosen by the desktop dashboard theme (see desktopLook.jsx).

const ACCENT_HOVER = `color-mix(in srgb, ${LIB_ACCENT} 85%, ${COLOR_PALETTE.black})`;

// ---------------------------------------------------------------- classic

const classicPills = (t) => ({
  pill: (on) => ({
    flexShrink: 0,
    gap: 1,
    px: 2,
    py: 1,
    borderRadius: RADII_PX.pill,
    fontFamily: 'inherit',
    border: `1px solid ${on ? 'transparent' : t.palette.divider}`,
    bgcolor: on ? t.palette.text.primary : alpha(t.palette.background.paper, 0.6),
    color: on ? t.palette.background.default : t.palette.text.primary,
    transition: `background-color ${MOTION.fast}ms, border-color ${MOTION.fast}ms`,
    '&:hover': { borderColor: on ? 'transparent' : t.palette.text.secondary },
    '&.Mui-focusVisible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
  }),
  pillText: { fontWeight: FONT_WEIGHTS.bold, whiteSpace: 'nowrap' },
});

const classicTopics = (t) => ({
  topicGap: { columnGap: 2, rowGap: 0.5 },
  topicChip: () => ({
    gap: 1,
    height: TOPIC_ROW_H,
    px: 0.5,
    borderRadius: RADII_PX.control,
    fontFamily: 'inherit',
    '&:hover': { bgcolor: t.palette.action.hover },
    '&.Mui-focusVisible': { outline: `2px solid ${t.palette.primary.main}` },
  }),
  topicLabel: (on) => ({ fontWeight: on ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium, color: on ? 'primary.main' : 'text.primary', whiteSpace: 'nowrap' }),
  topicCount: (on) => ({
    px: 1,
    borderRadius: RADII_PX.pill,
    fontSize: FONT_SIZES.micro,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 1.7,
    fontVariantNumeric: 'tabular-nums',
    bgcolor: on ? alpha(t.palette.primary.main, 0.16) : t.palette.action.hover,
    color: on ? 'primary.main' : 'text.secondary',
  }),
});

const classicToolbar = (t) => ({
  search: { flex: 1, minWidth: 0, maxWidth: 420, '& .MuiOutlinedInput-root': { borderRadius: RADII_PX.pill } },
  toolButton: { border: `1px solid ${t.palette.divider}`, borderRadius: RADII_PX.control },
});

const classicHead = (t) => ({
  headRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    height: 38,
    pl: PAD_X,
    pr: { xs: 1.5, sm: `calc(18px + ${STAR_W}px)` },
    borderBottom: `1px solid ${t.palette.divider}`,
    bgcolor: alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.03 : 0.025),
  },
  headLabel: { fontWeight: FONT_WEIGHTS.bold, color: 'text.secondary' },
});

const classicRow = (t) => ({
  borderBottom: `1px solid ${t.palette.divider}`,
  '&:last-of-type': { borderBottom: 'none' },
  '&:nth-of-type(even)': { bgcolor: alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.025 : 0.018) },
  '&:hover': { bgcolor: alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.09 : 0.05) },
  '&:hover .row-star, &:focus-within .row-star': { opacity: 1 },
});

const classicTable = (t) => ({
  card: surface(t),
  ...classicHead(t),
  row: classicRow(t),
  rowLink: { py: 1.5 },
  title: { fontWeight: FONT_WEIGHTS.semibold, minWidth: 0, fontSize: FONT_SIZES.body },
  acceptance: {},
  difficulty: (color) => ({ width: DIFF_W, textAlign: 'right', flexShrink: 0, fontWeight: FONT_WEIGHTS.bold, color }),
});

const classicStyles = (t) => ({ cream: false, ...classicPills(t), ...classicTopics(t), ...classicToolbar(t), ...classicTable(t) });

// ------------------------------------------------------------------ cream

const creamPills = (pal) => ({
  pill: (on) => ({
    flexShrink: 0,
    gap: 1,
    height: 34,
    px: 2,
    borderRadius: RADII_PX.pill,
    fontFamily: 'inherit',
    bgcolor: on ? LIB_ACCENT : pal.chip,
    color: on ? COLOR_PALETTE.white : pal.chipText,
    '&:hover': { bgcolor: on ? ACCENT_HOVER : pal.player },
    '&.Mui-focusVisible': { outline: `2px solid ${LIB_ACCENT}`, outlineOffset: 2 },
  }),
  pillText: { fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING, whiteSpace: 'nowrap' },
});

const creamTopics = (pal) => ({
  topicGap: { columnGap: 1, rowGap: 1 },
  topicChip: (on) => ({
    gap: 1,
    height: TOPIC_ROW_H,
    px: 2,
    borderRadius: RADII_PX.pill,
    fontFamily: 'inherit',
    bgcolor: on ? LIB_ACCENT : pal.chip,
    color: on ? COLOR_PALETTE.white : pal.chipText,
    '&:hover': { bgcolor: on ? ACCENT_HOVER : pal.player },
    '&.Mui-focusVisible': { outline: `2px solid ${LIB_ACCENT}`, outlineOffset: 2 },
  }),
  topicLabel: () => ({ fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING, color: 'inherit', whiteSpace: 'nowrap' }),
  topicCount: () => ({ fontSize: FONT_SIZES.body, opacity: 0.75, fontVariantNumeric: 'tabular-nums' }),
});

const creamSearchField = (pal) => ({
  flex: 1,
  minWidth: 0,
  maxWidth: 420,
  '& .MuiOutlinedInput-root': { borderRadius: RADII_PX.pill, height: 44, bgcolor: pal.player, fontSize: FONT_SIZES.title, letterSpacing: LIB_TRACKING, px: 2 },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: LIB_ACCENT, borderWidth: 1 },
});

const creamToolbar = (pal) => ({
  search: creamSearchField(pal),
  toolButton: {
    width: 40,
    height: 40,
    border: 'none',
    borderRadius: '50%',
    color: pal.text,
    bgcolor: pal.player,
    '&:hover': { bgcolor: pal.player, filter: 'brightness(0.97)' },
    '&.Mui-disabled': { bgcolor: pal.player, opacity: 0.5 },
  },
});

const creamRow = (pal) => ({
  borderBottom: `1px solid ${pal.divider}`,
  '&:last-of-type': { borderBottom: 'none' },
  '&:hover': { bgcolor: alpha(LIB_ACCENT, 0.06) },
  '&:hover .row-star, &:focus-within .row-star': { opacity: 1 },
});

const creamDifficulty = (color) => ({
  width: DIFF_W,
  flexShrink: 0,
  textAlign: 'center',
  px: 0.5,
  py: 0.5,
  borderRadius: RADII_PX.control,
  fontSize: FONT_SIZES.bodyLg,
  lineHeight: '20px',
  letterSpacing: LIB_TRACKING,
  color,
  bgcolor: tint(color, 14),
});

const creamHead = (pal) => ({
  headRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    height: 40,
    pl: PAD_X,
    pr: { xs: 1.5, sm: `calc(18px + ${STAR_W}px)` },
    borderBottom: `1px solid ${pal.divider}`,
  },
  headLabel: { fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.body, letterSpacing: LIB_TRACKING, color: pal.muted },
});

const creamTable = (pal) => ({
  card: { borderRadius: RADII_PX.card, border: `1px solid ${pal.border}`, bgcolor: pal.chip, boxShadow: 'none' },
  ...creamHead(pal),
  row: creamRow(pal),
  rowLink: { py: 1.5 },
  title: { fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, letterSpacing: LIB_TRACKING, minWidth: 0 },
  acceptance: { fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING },
  difficulty: creamDifficulty,
});

const creamStyles = (pal) => ({ cream: true, ...creamPills(pal), ...creamTopics(pal), ...creamToolbar(pal), ...creamTable(pal) });

// ------------------------------------------------------------------- hook

export default function useLibraryStyles() {
  const theme = useTheme();
  const pal = useLibraryPalette();
  const cream = Boolean(theme.libraryLook);
  return useMemo(() => (cream ? creamStyles(pal) : classicStyles(theme)), [cream, pal, theme]);
}
