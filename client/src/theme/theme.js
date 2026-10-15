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
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 700, letterSpacing: '-0.02em' },
  h2: { fontWeight: 700, letterSpacing: '-0.02em' },
  h3: { fontWeight: 600, letterSpacing: '-0.01em' },
  h4: { fontWeight: 600 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { fontWeight: 600, textTransform: 'none' },
  // Monospace face reserved for code, problem IDs, and stats — signals "engineering tool".
  monospace: { fontFamily: '"JetBrains Mono", "Fira Code", monospace' },
};

const shape = { borderRadius: 16 };

// Google Material 3 / GPay surfaces. Every text/background pair below was checked against WCAG AA
// (4.5:1 for text). Light page is a touch deeper than the white cards so cards read as cards.
const gpay = {
  light: { bg: '#F3F6FB', paper: '#FFFFFF', tonal: '#E4EAF4', hero: '#D3E3FD', text: '#1F1F1F', muted: '#444746', line: '#CDD3DE' },
  dark: { bg: '#131314', paper: '#1E1F20', tonal: '#282A2C', hero: '#0842A0', text: '#E3E3E3', muted: '#C4C7C5', line: 'rgba(255,255,255,0.12)' },
};
// Status colours: deep on light backgrounds, bright on dark ones, all >= 4.5:1 on the page and cards.
const semantic = {
  light: { success: '#047857', warning: '#B45309', error: '#C62828', pending: '#475569' },
  dark: { success: '#34D399', warning: '#FBBF24', error: '#F87171', pending: '#94A3B8' },
};
export const gpayTokens = gpay;

// Accent colours offered in Settings -> Appearance. `blue` is the original
// brand colour and is identical in both modes; the others use a deeper shade
// on light backgrounds so links/buttons keep enough contrast.
export const ACCENTS = {
  // Google-Pay style blue: Material 3 primary (deep blue on light, pale blue on dark).
  blue: { label: 'Blue', dark: ['#A8C7FA', '#8AB4F8'], light: ['#0B57D0', '#0842A0'], text: '#FFFFFF', darkText: '#0B0F19' },
  violet: { label: 'Violet', dark: ['#A78BFA', '#8B5CF6'], light: ['#6D28D9', '#5B21B6'], text: '#FFFFFF', darkText: '#0B0F19' },
  emerald: { label: 'Emerald', dark: ['#34D399', '#10B981'], light: ['#047857', '#065F46'], text: '#FFFFFF', darkText: '#0B0F19' },
  amber: { label: 'Amber', dark: ['#FBBF24', '#F59E0B'], light: ['#B45309', '#92400E'], text: '#FFFFFF', darkText: '#0B0F19' },
  rose: { label: 'Rose', dark: ['#FB7185', '#F43F5E'], light: ['#BE123C', '#9F1239'], text: '#FFFFFF', darkText: '#0B0F19' },
  cyan: { label: 'Cyan', dark: ['#22D3EE', '#06B6D4'], light: ['#0E7490', '#155E75'], text: '#FFFFFF', darkText: '#0B0F19' },
  orange: { label: 'Orange', dark: ['#FB923C', '#F97316'], light: ['#C2410C', '#9A3412'], text: '#FFFFFF', darkText: '#0B0F19' },
};
const FONT_SCALE = { sm: 0.92, md: 1, lg: 1.12 };

// getTheme(mode) keeps working exactly as before. `opts` carries the user's
// appearance preferences: { accent, density, fontScale, contrast, reduceMotion }.
export const getTheme = (mode, opts = {}) => {
  const { accent = 'blue', density = 'comfortable', fontScale = 'md', contrast = 'normal', reduceMotion = false, underlineLinks = false } = opts;
  const a = ACCENTS[accent] ?? ACCENTS.blue;
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
            background: { default: gpay.dark.bg, paper: gpay.dark.paper },
            text: { primary: highContrast ? '#FFFFFF' : gpay.dark.text, secondary: highContrast ? '#CBD5E1' : gpay.dark.muted },
            divider: highContrast ? 'rgba(226, 232, 240, 0.4)' : gpay.dark.line,
          }
        : {
            background: { default: gpay.light.bg, paper: gpay.light.paper },
            text: { primary: highContrast ? '#000000' : gpay.light.text, secondary: highContrast ? '#334155' : gpay.light.muted },
            divider: highContrast ? '#64748B' : gpay.light.line,
          }),
    },
    typography: { ...typography, fontSize: 14 * (FONT_SCALE[fontScale] ?? 1) },
    shape,
    tokens,
    transitions: reduceMotion ? { create: () => 'none' } : {},
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          :root { --jc-easy: ${semantic[mode === 'dark' ? 'dark' : 'light'].success}; --jc-medium: ${semantic[mode === 'dark' ? 'dark' : 'light'].warning}; --jc-hard: ${semantic[mode === 'dark' ? 'dark' : 'light'].error}; --jc-pending: ${semantic[mode === 'dark' ? 'dark' : 'light'].pending}; }
          ${underlineLinks ? 'a { text-decoration: underline !important; }' : ''}
          ${reduceMotion ? '*, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }' : ''}
        `,
      },
      ...(compact
        ? {
            MuiButton: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 999, paddingInline: 14 } } },
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
              styleOverrides: {
                root: { borderRadius: 999, paddingInline: 18 },
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
        styleOverrides: { root: { borderRadius: 20 } },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: 28 } },
      },
      MuiMenu: {
        styleOverrides: { paper: { borderRadius: 16 } },
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

// Mode-aware CSS variables (defined in getTheme's CssBaseline), so these stay readable in light and dark.
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
