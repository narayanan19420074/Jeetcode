import { createTheme } from '@mui/material/styles';

// JeetCode design tokens — carried over from the original product palette.
const tokens = {
  blue: '#3B82F6',
  blueDark: '#2563EB',
  emerald: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  slate900: '#0F172A',
  slate800: '#1E293B',
  slate700: '#334155',
  slate500: '#64748B',
  slate200: '#E2E8F0',
  slate50: '#F8FAFC',
};

const typography = {
  fontFamily: '"Geist", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  // Geist (Vercel's developer UI face) for text, JetBrains Mono for code and numbers: the same pairing
  // developer tools like Vercel / Linear / GitHub use. Headings run a touch tighter than body text.
  h1: { fontWeight: 700, letterSpacing: '-0.03em' },
  h2: { fontWeight: 700, letterSpacing: '-0.025em' },
  h3: { fontWeight: 700, letterSpacing: '-0.02em' },
  h4: { fontWeight: 650, letterSpacing: '-0.015em' },
  h5: { fontWeight: 650, letterSpacing: '-0.01em' },
  h6: { fontWeight: 650, letterSpacing: '-0.01em' },
  subtitle1: { fontWeight: 500 },
  subtitle2: { fontWeight: 600 },
  caption: { letterSpacing: '0.005em' },
  button: { fontWeight: 600, textTransform: 'none' },
  // Monospace face reserved for code, problem IDs, and stats — signals "engineering tool".
  monospace: { fontFamily: '"JetBrains Mono", "Fira Code", monospace' },
};

// Tighter radii read as "developer tool"; the old 16-28px bubbles read as a fintech app.
const shape = { borderRadius: 12 };

// JeetCode surfaces: LeetCode-style neutral greys (dark first) with one orange brand.
// Layers, back to front: bg (page) < paper (cards, bars) < tonal (raised chips, inputs) < hero (selected).
// Every text/background pair was checked against WCAG AA (4.5:1 for text).
const surfaces = {
  light: { bg: '#F7F8FA', paper: '#FFFFFF', tonal: '#EFF1F6', hero: '#FFE9C7', text: '#262626', muted: '#595959', line: '#E1E4E8', lineSolid: '#D6D9DE' },
  dark: { bg: '#1A1A1A', paper: '#282828', tonal: '#333333', hero: '#3D2E12', text: '#EFF1F6', muted: '#A8A8A8', line: 'rgba(255,255,255,0.10)', lineSolid: '#3E3E3E' },
};
// Reward colour: streaks, XP, badges only. Kept rare on purpose so it stands out.
const reward = { light: '#B45309', dark: '#FFC01E' };
// Status colours (LeetCode-style: green / yellow / red). Deep on light backgrounds, bright on dark ones, all >= 4.5:1.
const semantic = {
  light: { success: '#0B7A3B', warning: '#A16207', error: '#C62828', pending: '#5F6368' },
  dark: { success: '#2CBB5D', warning: '#FFC01E', error: '#F2625E', pending: '#9A9A9A' },
};
export const jcTokens = surfaces;
export const gpayTokens = surfaces; // old name, kept so existing imports keep working

// Accent colours offered in Settings -> Appearance. `blue` is the original
// brand colour and is identical in both modes; the others use a deeper shade
// on light backgrounds so links/buttons keep enough contrast.
export const ACCENTS = {
  // Brand. Stored under the existing key 'violet' (the server validates accent keys), shown as "Orange" (LeetCode-style).
  violet: { label: 'Orange', dark: ['#FFA116', '#F59300'], light: ['#B34A06', '#8F3B05'], text: '#FFFFFF', darkText: '#1A1A1A' },
  blue: { label: 'Blue', dark: ['#A8C7FA', '#8AB4F8'], light: ['#0B57D0', '#0842A0'], text: '#FFFFFF', darkText: '#0B0F19' },
  emerald: { label: 'Emerald', dark: ['#34D399', '#10B981'], light: ['#047857', '#065F46'], text: '#FFFFFF', darkText: '#0B0F19' },
  amber: { label: 'Amber', dark: ['#FBBF24', '#F59E0B'], light: ['#B45309', '#92400E'], text: '#FFFFFF', darkText: '#0B0F19' },
  rose: { label: 'Rose', dark: ['#FB7185', '#F43F5E'], light: ['#BE123C', '#9F1239'], text: '#FFFFFF', darkText: '#0B0F19' },
  cyan: { label: 'Cyan', dark: ['#22D3EE', '#06B6D4'], light: ['#0E7490', '#155E75'], text: '#FFFFFF', darkText: '#0B0F19' },
  orange: { label: 'Tangerine', dark: ['#FB923C', '#F97316'], light: ['#C2410C', '#9A3412'], text: '#FFFFFF', darkText: '#0B0F19' },
};
const FONT_SCALE = { sm: 0.92, md: 1, lg: 1.12 };

// getTheme(mode) keeps working exactly as before. `opts` carries the user's
// appearance preferences: { accent, density, fontScale, contrast, reduceMotion }.
export const getTheme = (mode, opts = {}) => {
  const { accent = 'violet', density = 'comfortable', fontScale = 'md', contrast = 'normal', reduceMotion = false, underlineLinks = false } = opts;
  const a = ACCENTS[accent] ?? ACCENTS.violet;
  const [main, dark] = a[mode === 'dark' ? 'dark' : 'light'];
  const compact = density === 'compact';
  const highContrast = contrast === 'high';

  return createTheme({
    spacing: compact ? 7 : 8,
    palette: {
      mode,
      primary: { main, dark, contrastText: mode === 'dark' && a.darkText ? a.darkText : a.text },
      success: { main: semantic[mode === 'dark' ? 'dark' : 'light'].success },
      warning: { main: semantic[mode === 'dark' ? 'dark' : 'light'].warning },
      error: { main: semantic[mode === 'dark' ? 'dark' : 'light'].error },
      ...(mode === 'dark'
        ? {
            background: { default: surfaces.dark.bg, paper: surfaces.dark.paper },
            text: { primary: highContrast ? '#FFFFFF' : surfaces.dark.text, secondary: highContrast ? '#CBD5E1' : surfaces.dark.muted },
            divider: highContrast ? 'rgba(226, 232, 240, 0.4)' : surfaces.dark.line,
          }
        : {
            background: { default: surfaces.light.bg, paper: surfaces.light.paper },
            text: { primary: highContrast ? '#000000' : surfaces.light.text, secondary: highContrast ? '#334155' : surfaces.light.muted },
            divider: highContrast ? '#64748B' : surfaces.light.line,
          }),
    },
    typography: { ...typography, fontSize: 14 * (FONT_SCALE[fontScale] ?? 1) },
    shape,
    tokens,
    transitions: reduceMotion ? { create: () => 'none' } : {},
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          :root { --jc-easy: ${semantic[mode === 'dark' ? 'dark' : 'light'].success}; --jc-medium: ${semantic[mode === 'dark' ? 'dark' : 'light'].warning}; --jc-hard: ${semantic[mode === 'dark' ? 'dark' : 'light'].error}; --jc-pending: ${semantic[mode === 'dark' ? 'dark' : 'light'].pending}; --jc-reward: ${reward[mode === 'dark' ? 'dark' : 'light']}; ${gameCss(mode)} }
          ${underlineLinks ? 'a { text-decoration: underline !important; }' : ''}
          ${reduceMotion ? '*, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }' : ''}
        `,
      },
      ...(compact
        ? {
            MuiButton: { defaultProps: { size: 'small', disableElevation: true }, styleOverrides: { root: { borderRadius: 10, paddingInline: 14 } } },
            MuiIconButton: { defaultProps: { size: 'small' } },
            MuiTextField: { defaultProps: { size: 'small' } },
            MuiFormControl: { defaultProps: { size: 'small' } },
            MuiSelect: { defaultProps: { size: 'small' } },
            MuiTable: { defaultProps: { size: 'small' } },
            MuiListItem: { defaultProps: { dense: true } },
            MuiMenuItem: { defaultProps: { dense: true } },
          }
        : {
            MuiButton: {
              defaultProps: { disableElevation: true },
              styleOverrides: {
                root: { borderRadius: 12, paddingInline: 18 },
              },
            },
          }),
      MuiInputBase: {
        styleOverrides: {
          // MUI's default placeholder (42% opacity) is ~3:1; this keeps it readable.
          input: ({ theme }) => ({ '&::placeholder': { opacity: 1, color: theme.palette.text.secondary } }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiCard: {
        styleOverrides: { root: { borderRadius: 14 } },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: 16 } },
      },
      MuiMenu: {
        styleOverrides: { paper: { borderRadius: 12 } },
      },
      MuiDrawer: {
        styleOverrides: { paper: { backgroundImage: 'none' } },
      },
      MuiChip: {
        defaultProps: compact ? { size: 'small' } : {},
        styleOverrides: {
          root: { fontWeight: 600, fontSize: '0.72rem' },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.divider}`,
            // keep the bar clear of the phone notch / status bar
            paddingTop: 'env(safe-area-inset-top)',
          }),
        },
      },
    },
  });
};

// Game-style surfaces for the Quests and Store pages (Free-Fire-like lobby look). Defined globally as CSS variables
// because dialogs render in a portal, outside the page. "Ink" colours are the text-safe shade of each accent.
const gameVars = {
  dark: { bg: '#121212', panel: '#1E1E1E', panelHi: '#2A2A2A', line: '#3A3A3A', well: '#121212', hud: 'rgba(18,18,18,0.82)', text: '#FFFFFF', muted: '#A3A3A3', orangeInk: '#FFB020', greenInk: '#2ED573', blueInk: '#27B6FF', coinInk: '#FFC933', redInk: '#FF6B79' },
  light: { bg: '#F0F1F3', panel: '#FFFFFF', panelHi: '#F5F6F8', line: '#D6D8DC', well: '#ECEDF0', hud: 'rgba(255,255,255,0.92)', text: '#1A1A1A', muted: '#5A5F69', orangeInk: '#B14500', greenInk: '#087A3E', blueInk: '#0A6AAD', coinInk: '#8F6200', redInk: '#C21F33' },
};
const gameCss = (mode) => Object.entries(gameVars[mode === 'dark' ? 'dark' : 'light']).map(([k, v]) => `--ff-${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}: ${v};`).join(' ');

// Mode-aware CSS variables (defined in getTheme's CssBaseline), so these stay readable in light and dark.
// Streak / XP / badge colour (use sparingly): var(--jc-reward)
export const rewardColor = 'var(--jc-reward)';

export const difficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'Easy':
      return 'var(--jc-easy)';
    case 'Medium':
      return 'var(--jc-medium)';
    case 'Hard':
      return 'var(--jc-hard)';
    default:
      return 'var(--jc-pending)';
  }
};

export default tokens;
