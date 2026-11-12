import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { BRAND, FONTS, LIBRARY_PALETTE, COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

// Shared look of the phone Library (Problems) pages: the product font and a warm cream surface in light mode.
// Dark mode keeps the app's normal dark surfaces.

// Fonts and colours come from the design tokens (app/design/designTokens.js); they are re-exported here so
// existing imports keep working.
export const LIB_FONT = FONTS.library;
export { LIBRARY_PALETTE };

export const useLibraryPalette = () => LIBRARY_PALETTE[useTheme().palette.mode === 'dark' ? 'dark' : 'light'];

const VARIANTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'button', 'caption', 'overline'];
const TYPOGRAPHY = { fontFamily: LIB_FONT, ...Object.fromEntries(VARIANTS.map((v) => [v, { fontFamily: LIB_FONT }])) };

// Dashboard views that are full phone screens in the Library look.
const LIBRARY_VIEWS = ['contest', 'explore', 'friends', 'leaderboard', 'plans', 'quests'];

// Pages with their own phone header: they use the Library look and hide the top bar on phones.
export const LIBRARY_PAGE_PATHS = ['/aptitude', '/prep', '/you', '/job-profile', '/settings', '/plans'];

// Pages that use the Library look on phones: dashboard home (no ?view= open), Problems, Aptitude (list and topic pages), Companies, You, Settings, Store, Plans and the Contest, Explore, Friends, Leaderboard, Study Plan and Quests views.
export const isLibraryRoute = (pathname, search) => {
  const path = pathname.replace(/\/+$/, '');
  if (path === '/dashboard') {
    const view = new URLSearchParams(search).get('view');
    return !view || LIBRARY_VIEWS.includes(view);
  }
  return path === '/store' || path === '/exams' || /^\/aptitude\/[^/]+(\/practice(\/[^/]+)?)?$/.test(path) || path === '/problems' || path === '/community' || path.startsWith('/community/') || path.startsWith('/problems/') || path.startsWith('/settings/') || path.startsWith('/job-profile/') || LIBRARY_PAGE_PATHS.includes(path);
};

// Library font for everything inside (menus and dialogs opened from it included).
// It also publishes the palette as CSS variables (--lib-*) so nested components can use it without a hook.
// Portals (drawers, menus) do not inherit them: wrap their content in LibraryFont again.
export function LibraryFont({ children, sx }) {
  const pal = useLibraryPalette();
  const theme = useMemo(() => (outer) => createTheme(outer, { typography: TYPOGRAPHY }), []);
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          fontFamily: LIB_FONT,
          color: pal.text,
          '--lib-bg': pal.bg,
          '--lib-chip': pal.chip,
          '--lib-chip-text': pal.chipText,
          '--lib-player': pal.player,
          '--lib-border': pal.border,
          '--lib-divider': pal.divider,
          '--lib-text': pal.text,
          '--lib-muted': pal.muted,
          ...sx,
        }}
      >
        {children}
      </Box>
    </ThemeProvider>
  );
}

// Strip above the tab bar: today's challenge, one tap to open.
export function MiniPlayer({ featured, resume, aboveNav }) {
  const pal = useLibraryPalette();
  const item = resume || featured;
  if (!item) return null;
  return (
    <Box
      component={RouterLink}
      to={`/workspace/${item.slug}`}
      aria-label={`${resume ? 'Resume' : "Open today's challenge"}: ${item.title}`}
      sx={(t) => ({
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: aboveNav ? 'calc(72px + env(safe-area-inset-bottom))' : 'calc(12px + env(safe-area-inset-bottom))',
        zIndex: t.zIndex.appBar - 10,
        maxWidth: 608,
        mx: 'auto',
        height: 57,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        pl: 2,
        pr: 2.5,
        borderRadius: RADII_PX.pill,
        bgcolor: pal.player,
        color: pal.text,
        textDecoration: 'none',
      })}
    >
      <Box aria-hidden sx={{ width: 40, height: 40, flex: 'none', borderRadius: RADII_PX.control, display: 'grid', placeItems: 'center', bgcolor: withAlpha(COLOR_PALETTE.custom.redEF6C4D, 0.2), color: COLOR_PALETTE.custom.redEF6C4D }}>
        {resume ? <HistoryRoundedIcon sx={{ fontSize: FONT_SIZES.display }} /> : <EventRoundedIcon sx={{ fontSize: FONT_SIZES.display }} />}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.title, lineHeight: '22px', fontWeight: FONT_WEIGHTS.medium, letterSpacing: '0.03em' }}>
          {item.title}
        </Typography>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.body, lineHeight: '18px', letterSpacing: '0.03em', color: pal.muted }}>
          {resume ? 'Resume' : 'Today\u2019s challenge'} · {item.difficulty}
        </Typography>
      </Box>
      <PlayArrowRoundedIcon aria-hidden sx={{ fontSize: FONT_SIZES.hero, flex: 'none' }} />
    </Box>
  );
}

// 81px page-header tile: soft gradient square with the page icon on a coloured blob.
export function HeaderTile({ children }) {
  return (
    <Box sx={{ width: 81, height: 81, mx: 'auto', borderRadius: RADII_PX.card, display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${COLOR_PALETTE.rose[100]} 0%, ${COLOR_PALETTE.purple[100]} 55%, ${COLOR_PALETTE.pink[100]} 100%)` }}>
      <Box aria-hidden sx={{ width: 46, height: 42, borderRadius: RADII_PX.card, display: 'grid', placeItems: 'center', color: COLOR_PALETTE.white, background: `linear-gradient(160deg, ${COLOR_PALETTE.custom.violetB58AF2}, ${COLOR_PALETTE.custom.redF28C7A})` }}>
        {children}
      </Box>
    </Box>
  );
}

// ---- Shared pieces for the phone pages in the Library look ----

export const LIB_ACCENT = BRAND.primary;
export const LIB_TRACKING = '0.03em';

// 44px back arrow, flush with the page gutter.
export const libBackBtnSx = { width: 44, height: 44, ml: -1, color: 'var(--lib-text)' };

// 40px round action button on a cream pill.
export const libIconBtnSx = { width: 40, height: 40, flexShrink: 0, bgcolor: 'var(--lib-player)', color: 'var(--lib-text)', '&:hover': { bgcolor: 'var(--lib-player)', filter: 'brightness(0.97)' } };

// 44px pill search field.
export const libSearchSx = {
  mt: 1,
  px: 0.5,
  '& .MuiOutlinedInput-root': { borderRadius: RADII_PX.pill, height: 44, bgcolor: 'var(--lib-player)', fontSize: FONT_SIZES.subheading, letterSpacing: LIB_TRACKING, px: 2 },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
};

export const libSectionTitleSx = { fontSize: FONT_SIZES.subheading, lineHeight: '24px', fontWeight: FONT_WEIGHTS.bold };

const libBtnBase = { height: 48, px: 3, borderRadius: RADII_PX.pill, fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.subheading, letterSpacing: LIB_TRACKING, textTransform: 'none', whiteSpace: 'nowrap', flexShrink: 0 };
export const libSolidBtnSx = { ...libBtnBase, bgcolor: LIB_ACCENT, color: COLOR_PALETTE.white, '&:hover': { bgcolor: `color-mix(in srgb, ${LIB_ACCENT} 85%, ${COLOR_PALETTE.black})` } };
export const libTintBtnSx = { ...libBtnBase, bgcolor: 'var(--lib-player)', color: 'var(--lib-text)', '&:hover': { bgcolor: 'var(--lib-player)', filter: 'brightness(0.97)' } };
export const libSmallBtnSx = { ...libBtnBase, height: 36, px: 2, fontSize: FONT_SIZES.bodyLg };

// Two equal buttons side by side in the bottom row of a card (exam cards, study plan cards).
const libCompactBtn = { height: SIZES.listRowHeightDense, px: 2, fontSize: FONT_SIZES.bodyLg, flex: 1 };
export const libCompactSolidBtnSx = { ...libSolidBtnSx, ...libCompactBtn };
export const libCompactTintBtnSx = { ...libTintBtnSx, ...libCompactBtn };

// Chip / tab pill: cream when idle, accent when selected.
export const libChipSx = (on) => ({
  flexShrink: 0,
  height: 34,
  px: 2,
  gap: 1,
  borderRadius: RADII_PX.pill,
  fontFamily: 'inherit',
  fontSize: FONT_SIZES.bodyLg,
  letterSpacing: LIB_TRACKING,
  whiteSpace: 'nowrap',
  bgcolor: on ? LIB_ACCENT : 'var(--lib-chip)',
  color: on ? COLOR_PALETTE.white : 'var(--lib-chip-text)',
  '&.Mui-disabled': { opacity: 0.5 },
});

// Rounded cream panel for summary blocks.
export const libPanelSx = { borderRadius: RADII_PX.card, bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)' };

// Centred page header: tile, title and subtitle.
export function PageHeader({ icon: Icon, title, subtitle }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ textAlign: 'center', mt: 3 }}>
      <HeaderTile>
        <Icon sx={{ fontSize: FONT_SIZES.displayLg, color: COLOR_PALETTE.white }} />
      </HeaderTile>
      <Typography component="h1" noWrap sx={{ mt: 1.5, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg, lineHeight: '32px' }}>
        {title}
      </Typography>
      {subtitle && <Typography sx={{ fontSize: FONT_SIZES.subheading, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: pal.muted }}>{subtitle}</Typography>}
    </Box>
  );
}
