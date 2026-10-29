import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';

// Shared look of the phone Library (Problems) pages: Roboto type and a warm cream surface in light mode.
// Dark mode keeps the app's normal dark surfaces.

export const LIB_FONT = '"Roboto", "Geist", system-ui, -apple-system, "Segoe UI", Arial, sans-serif';

export const LIBRARY_PALETTE = {
  light: {
    bg: '#FDF8F4',
    chip: '#F6ECE2',
    chipText: '#6F655B',
    player: '#F1E7DD',
    nav: '#F6ECE2',
    border: '#F3E4D4',
    divider: '#E9DFD5',
    text: '#1A1613',
    muted: '#6F655B',
  },
  dark: {
    bg: '#0E1116',
    chip: '#1F2630',
    chipText: '#B4BDC8',
    player: '#1F2630',
    nav: '#161B22',
    border: 'rgba(255,255,255,0.10)',
    divider: 'rgba(255,255,255,0.10)',
    text: '#E6EDF3',
    muted: '#9DA7B3',
  },
};

export const useLibraryPalette = () => LIBRARY_PALETTE[useTheme().palette.mode === 'dark' ? 'dark' : 'light'];

const VARIANTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'button', 'caption', 'overline'];
const TYPOGRAPHY = { fontFamily: LIB_FONT, ...Object.fromEntries(VARIANTS.map((v) => [v, { fontFamily: LIB_FONT }])) };

// Dashboard views that are full phone screens in the Library look.
const LIBRARY_VIEWS = ['contest', 'friends', 'leaderboard', 'plans', 'quests'];

// Pages that use the Library look on phones: dashboard home (no ?view= open), Problems, Aptitude, Companies, You, Settings, Store and the Contest, Friends, Leaderboard, Study Plan and Quests views.
export const isLibraryRoute = (pathname, search) => {
  const path = pathname.replace(/\/+$/, '');
  if (path === '/dashboard') {
    const view = new URLSearchParams(search).get('view');
    return !view || LIBRARY_VIEWS.includes(view);
  }
  return path === '/store' || path === '/problems' || path.startsWith('/problems/') || path.startsWith('/settings/') || ['/aptitude', '/prep', '/you', '/settings'].includes(path);
};

// Roboto for everything inside (menus and dialogs opened from it included).
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
export function MiniPlayer({ featured, aboveNav }) {
  const pal = useLibraryPalette();
  if (!featured) return null;
  return (
    <Box
      component={RouterLink}
      to={`/workspace/${featured.slug}`}
      aria-label={`Open today's challenge: ${featured.title}`}
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
        gap: '12px',
        pl: 2,
        pr: 2.5,
        borderRadius: 999,
        bgcolor: pal.player,
        color: pal.text,
        textDecoration: 'none',
      })}
    >
      <Box aria-hidden sx={{ width: 40, height: 40, flex: 'none', borderRadius: '10px', display: 'grid', placeItems: 'center', bgcolor: 'rgba(239,108,77,0.2)', color: '#EF6C4D' }}>
        <EventRoundedIcon sx={{ fontSize: 22 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: 16, lineHeight: '22px', fontWeight: 500, letterSpacing: '0.03em' }}>
          {featured.title}
        </Typography>
        <Typography noWrap sx={{ fontSize: 14, lineHeight: '18px', letterSpacing: '0.03em', color: pal.muted }}>
          Today&apos;s challenge · {featured.difficulty}
        </Typography>
      </Box>
      <PlayArrowRoundedIcon aria-hidden sx={{ fontSize: 32, flex: 'none' }} />
    </Box>
  );
}

// 81px page-header tile: soft gradient square with the page icon on a coloured blob.
export function HeaderTile({ children }) {
  return (
    <Box sx={{ width: 81, height: 81, mx: 'auto', borderRadius: '22px', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #F6DCE3 0%, #EEE3F6 55%, #F8DDEB 100%)' }}>
      <Box aria-hidden sx={{ width: 46, height: 42, borderRadius: '14px', display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(160deg, #B58AF2, #F28C7A)' }}>
        {children}
      </Box>
    </Box>
  );
}

// ---- Shared pieces for the phone pages in the Library look ----

export const LIB_ACCENT = '#6366F1';
export const LIB_TRACKING = '0.03em';

// 44px back arrow, flush with the page gutter.
export const libBackBtnSx = { width: 44, height: 44, ml: -1, color: 'var(--lib-text)' };

// 40px round action button on a cream pill.
export const libIconBtnSx = { width: 40, height: 40, flexShrink: 0, bgcolor: 'var(--lib-player)', color: 'var(--lib-text)', '&:hover': { bgcolor: 'var(--lib-player)', filter: 'brightness(0.97)' } };

// 44px pill search field.
export const libSearchSx = {
  mt: 1,
  px: '4px',
  '& .MuiOutlinedInput-root': { borderRadius: 999, height: 44, bgcolor: 'var(--lib-player)', fontSize: 18, letterSpacing: LIB_TRACKING, px: '16px' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
};

export const libSectionTitleSx = { fontSize: 18, lineHeight: '24px', fontWeight: 700 };

const libBtnBase = { height: 48, px: 3, borderRadius: 999, fontWeight: 500, fontSize: 18, letterSpacing: LIB_TRACKING, textTransform: 'none', whiteSpace: 'nowrap', flexShrink: 0 };
export const libSolidBtnSx = { ...libBtnBase, bgcolor: LIB_ACCENT, color: '#fff', '&:hover': { bgcolor: `color-mix(in srgb, ${LIB_ACCENT} 85%, #000)` } };
export const libTintBtnSx = { ...libBtnBase, bgcolor: 'var(--lib-player)', color: 'var(--lib-text)', '&:hover': { bgcolor: 'var(--lib-player)', filter: 'brightness(0.97)' } };
export const libSmallBtnSx = { ...libBtnBase, height: 36, px: 2, fontSize: 15 };

// Chip / tab pill: cream when idle, accent when selected.
export const libChipSx = (on) => ({
  flexShrink: 0,
  height: 34,
  px: '14px',
  gap: 0.75,
  borderRadius: 999,
  fontFamily: 'inherit',
  fontSize: 15,
  letterSpacing: LIB_TRACKING,
  whiteSpace: 'nowrap',
  bgcolor: on ? LIB_ACCENT : 'var(--lib-chip)',
  color: on ? '#fff' : 'var(--lib-chip-text)',
  '&.Mui-disabled': { opacity: 0.5 },
});

// Rounded cream panel for summary blocks.
export const libPanelSx = { borderRadius: '20px', bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)' };

// Centred page header: tile, title and subtitle.
export function PageHeader({ icon: Icon, title, subtitle }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ textAlign: 'center', mt: 3 }}>
      <HeaderTile>
        <Icon sx={{ fontSize: 28, color: '#fff' }} />
      </HeaderTile>
      <Typography component="h1" noWrap sx={{ mt: 1.5, fontWeight: 700, fontSize: 26, lineHeight: '32px' }}>
        {title}
      </Typography>
      {subtitle && <Typography sx={{ fontSize: 17, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: pal.muted }}>{subtitle}</Typography>}
    </Box>
  );
}
