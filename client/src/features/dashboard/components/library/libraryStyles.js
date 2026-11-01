import { useMemo } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from '../libraryStyle';
import { surface, tint } from '../../dashboardUtils';
import { DIFF_W, PAD_X, STAR_W, TOPIC_ROW_H } from './libraryConstants';

// Two looks for the same problem library. "classic" is the original page style (used by the Problems page).
// "cream" is the phone Library look: cream pills and panels, accent when selected, tinted difficulty tags.
// The cream look is chosen by the desktop dashboard theme (see desktopLook.jsx).

const ACCENT_HOVER = `color-mix(in srgb, ${LIB_ACCENT} 85%, #000)`;

// ---------------------------------------------------------------- classic

const classicPills = (t) => ({
  pill: (on) => ({
    flexShrink: 0,
    gap: 0.9,
    px: 2,
    py: 0.85,
    borderRadius: 999,
    fontFamily: 'inherit',
    border: `1px solid ${on ? 'transparent' : t.palette.divider}`,
    bgcolor: on ? t.palette.text.primary : alpha(t.palette.background.paper, 0.6),
    color: on ? t.palette.background.default : t.palette.text.primary,
    transition: 'background-color 120ms, border-color 120ms',
    '&:hover': { borderColor: on ? 'transparent' : t.palette.text.secondary },
    '&.Mui-focusVisible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
  }),
  pillText: { fontWeight: 700, whiteSpace: 'nowrap' },
});

const classicTopics = (t) => ({
  topicGap: { columnGap: 2, rowGap: 0.25 },
  topicChip: () => ({
    gap: 0.75,
    height: TOPIC_ROW_H,
    px: 0.5,
    borderRadius: '8px',
    fontFamily: 'inherit',
    '&:hover': { bgcolor: t.palette.action.hover },
    '&.Mui-focusVisible': { outline: `2px solid ${t.palette.primary.main}` },
  }),
  topicLabel: (on) => ({ fontWeight: on ? 800 : 500, color: on ? 'primary.main' : 'text.primary', whiteSpace: 'nowrap' }),
  topicCount: (on) => ({
    px: 0.75,
    borderRadius: 999,
    fontSize: '0.7rem',
    fontWeight: 700,
    lineHeight: 1.7,
    fontVariantNumeric: 'tabular-nums',
    bgcolor: on ? alpha(t.palette.primary.main, 0.16) : t.palette.action.hover,
    color: on ? 'primary.main' : 'text.secondary',
  }),
});

const classicToolbar = (t) => ({
  search: { flex: 1, minWidth: 0, maxWidth: 420, '& .MuiOutlinedInput-root': { borderRadius: 999 } },
  toolButton: { border: `1px solid ${t.palette.divider}`, borderRadius: '10px' },
});

const classicHead = (t) => ({
  headRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    height: 38,
    pl: PAD_X,
    pr: { xs: '12px', sm: `calc(18px + ${STAR_W}px)` },
    borderBottom: `1px solid ${t.palette.divider}`,
    bgcolor: alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.03 : 0.025),
  },
  headLabel: { fontWeight: 700, color: 'text.secondary' },
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
  rowLink: { py: 1.35 },
  title: { fontWeight: 600, minWidth: 0, fontSize: '0.9rem' },
  acceptance: {},
  difficulty: (color) => ({ width: DIFF_W, textAlign: 'right', flexShrink: 0, fontWeight: 700, color }),
});

const classicStyles = (t) => ({ cream: false, ...classicPills(t), ...classicTopics(t), ...classicToolbar(t), ...classicTable(t) });

// ------------------------------------------------------------------ cream

const creamPills = (pal) => ({
  pill: (on) => ({
    flexShrink: 0,
    gap: 0.75,
    height: 34,
    px: '14px',
    borderRadius: 999,
    fontFamily: 'inherit',
    bgcolor: on ? LIB_ACCENT : pal.chip,
    color: on ? '#fff' : pal.chipText,
    '&:hover': { bgcolor: on ? ACCENT_HOVER : pal.player },
    '&.Mui-focusVisible': { outline: `2px solid ${LIB_ACCENT}`, outlineOffset: 2 },
  }),
  pillText: { fontSize: 15, letterSpacing: LIB_TRACKING, whiteSpace: 'nowrap' },
});

const creamTopics = (pal) => ({
  topicGap: { columnGap: 1, rowGap: 1 },
  topicChip: (on) => ({
    gap: 0.75,
    height: TOPIC_ROW_H,
    px: '14px',
    borderRadius: 999,
    fontFamily: 'inherit',
    bgcolor: on ? LIB_ACCENT : pal.chip,
    color: on ? '#fff' : pal.chipText,
    '&:hover': { bgcolor: on ? ACCENT_HOVER : pal.player },
    '&.Mui-focusVisible': { outline: `2px solid ${LIB_ACCENT}`, outlineOffset: 2 },
  }),
  topicLabel: () => ({ fontSize: 15, letterSpacing: LIB_TRACKING, color: 'inherit', whiteSpace: 'nowrap' }),
  topicCount: () => ({ fontSize: 13, opacity: 0.75, fontVariantNumeric: 'tabular-nums' }),
});

const creamSearchField = (pal) => ({
  flex: 1,
  minWidth: 0,
  maxWidth: 420,
  '& .MuiOutlinedInput-root': { borderRadius: 999, height: 44, bgcolor: pal.player, fontSize: 16, letterSpacing: LIB_TRACKING, px: '16px' },
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
  px: '5px',
  py: '2px',
  borderRadius: '8px',
  fontSize: 15,
  lineHeight: '20px',
  letterSpacing: LIB_TRACKING,
  color,
  bgcolor: tint(color, 14),
});

const creamHead = (pal) => ({
  headRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    height: 40,
    pl: PAD_X,
    pr: { xs: '12px', sm: `calc(18px + ${STAR_W}px)` },
    borderBottom: `1px solid ${pal.divider}`,
  },
  headLabel: { fontWeight: 500, fontSize: 13, letterSpacing: LIB_TRACKING, color: pal.muted },
});

const creamTable = (pal) => ({
  card: { borderRadius: '20px', border: `1px solid ${pal.border}`, bgcolor: pal.chip, boxShadow: 'none' },
  ...creamHead(pal),
  row: creamRow(pal),
  rowLink: { py: 1.5 },
  title: { fontWeight: 500, fontSize: 16, letterSpacing: LIB_TRACKING, minWidth: 0 },
  acceptance: { fontSize: 15, letterSpacing: LIB_TRACKING },
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
