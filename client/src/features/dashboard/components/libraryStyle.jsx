import { useMemo } from 'react';
import { Box } from '@mui/material';
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

// The phone dashboard (Home) uses the Library look: only on /dashboard without another ?view= open.
export const isLibraryRoute = (pathname, search) => pathname.replace(/\/+$/, '') === '/dashboard' && !new URLSearchParams(search).get('view');

// Roboto for everything inside (menus and dialogs opened from it included).
export function LibraryFont({ children }) {
  const theme = useMemo(() => (outer) => createTheme(outer, { typography: TYPOGRAPHY }), []);
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ fontFamily: LIB_FONT }}>{children}</Box>
    </ThemeProvider>
  );
}
