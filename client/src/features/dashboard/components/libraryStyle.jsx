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

// Pages that use the Library look on phones: dashboard home (no ?view= open), Problems, Aptitude, Companies, You and Settings.
export const isLibraryRoute = (pathname, search) => {
  const path = pathname.replace(/\/+$/, '');
  if (path === '/dashboard') return !new URLSearchParams(search).get('view');
  return path === '/problems' || path.startsWith('/problems/') || path.startsWith('/settings/') || ['/aptitude', '/prep', '/you', '/settings'].includes(path);
};

// Roboto for everything inside (menus and dialogs opened from it included).
export function LibraryFont({ children, sx }) {
  const theme = useMemo(() => (outer) => createTheme(outer, { typography: TYPOGRAPHY }), []);
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ fontFamily: LIB_FONT, ...sx }}>{children}</Box>
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
