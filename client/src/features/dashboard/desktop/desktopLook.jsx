import { useMemo } from 'react';
import { ThemeProvider, alpha, createTheme, useTheme } from '@mui/material/styles';
import { LIBRARY_PALETTE, LIB_FONT } from '../components/libraryStyle';

// The desktop dashboard borrows the phone Library look: the cream surfaces and the Library type settings.
// It is applied as a nested theme, so every component under it (navbar, sidebar, cards, dialogs) picks up the
// colours through the normal theme palette without being edited. Other pages are not wrapped and keep their look.

const FONT_VARIANTS_TO_KEEP = ['monospace']; // code and numbers stay in the monospace face

export const isDashboardPath = (pathname) => pathname.replace(/\/+$/, '') === '/dashboard';

// Pages that wear the Library look on desktop: the dashboard, Problems, Store, Companies (/prep), Aptitude, Settings
// and the code workspace. Settings and the workspace have a sub-path (/settings/profile, /workspace/two-sum).
const DESKTOP_LOOK_PATHS = ['/dashboard', '/problems', '/store', '/prep', '/aptitude', '/settings'];
const DESKTOP_LOOK_PREFIXES = ['/settings/', '/workspace/'];
export const usesDesktopLook = (pathname) => {
  const path = pathname.replace(/\/+$/, '');
  return DESKTOP_LOOK_PATHS.includes(path) || DESKTOP_LOOK_PREFIXES.some((prefix) => path.startsWith(prefix));
};

// Components that need the marker (for example the problem library) read it with this hook.
export const useLibraryLook = () => Boolean(useTheme().libraryLook);

const libraryTypography = (outer) => {
  const variants = Object.entries(outer.typography)
    .filter(([name, value]) => value && typeof value === 'object' && value.fontFamily && !FONT_VARIANTS_TO_KEEP.includes(name))
    .map(([name]) => [name, { fontFamily: LIB_FONT }]);
  return { fontFamily: LIB_FONT, ...Object.fromEntries(variants) };
};

const creamPalette = (outer, pal) => ({
  background: { default: pal.bg, paper: pal.chip },
  text: { primary: pal.text, secondary: pal.muted },
  divider: pal.divider,
  action: { ...outer.palette.action, hover: alpha(pal.muted, 0.1) },
});

// The top bar blends into the cream page instead of staying a white strip.
const creamAppBar = (pal) => ({
  styleOverrides: {
    root: ({ theme }) => ({
      backgroundColor: pal.bg,
      color: theme.palette.text.primary,
      borderBottom: `1px solid ${pal.divider}`,
      paddingTop: 'env(safe-area-inset-top)',
    }),
  },
});

const withDesktopLook = (outer) => {
  const isLight = outer.palette.mode === 'light';
  const pal = LIBRARY_PALETTE[isLight ? 'light' : 'dark'];
  return createTheme(outer, {
    libraryLook: true,
    typography: libraryTypography(outer),
    // Buttons keep the shared control radius from the main theme; only the app bar changes here.
    components: isLight ? { MuiAppBar: creamAppBar(pal) } : {},
    ...(isLight && { palette: creamPalette(outer, pal) }),
  });
};

const keepOuterTheme = (outer) => outer;

// `enabled` flips with the route and screen width. The provider stays mounted either way,
// so the navbar and page below it are never remounted when the look switches on or off.
export function DesktopLookProvider({ enabled, children }) {
  const theme = useMemo(() => (enabled ? withDesktopLook : keepOuterTheme), [enabled]);
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
