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

const shape = { borderRadius: 10 };

// Accent colours offered in Settings -> Appearance. `blue` is the original
// brand colour and is identical in both modes; the others use a deeper shade
// on light backgrounds so links/buttons keep enough contrast.
export const ACCENTS = {
  blue: { label: 'Blue', dark: ['#3B82F6', '#2563EB'], light: ['#3B82F6', '#2563EB'], text: '#FFFFFF' },
  violet: { label: 'Violet', dark: ['#8B5CF6', '#7C3AED'], light: ['#7C3AED', '#6D28D9'], text: '#FFFFFF' },
  emerald: { label: 'Emerald', dark: ['#10B981', '#059669'], light: ['#059669', '#047857'], text: '#FFFFFF' },
  amber: { label: 'Amber', dark: ['#F59E0B', '#D97706'], light: ['#B45309', '#92400E'], text: '#111827' },
  rose: { label: 'Rose', dark: ['#F43F5E', '#E11D48'], light: ['#E11D48', '#BE123C'], text: '#FFFFFF' },
  cyan: { label: 'Cyan', dark: ['#06B6D4', '#0891B2'], light: ['#0E7490', '#155E75'], text: '#0B1220' },
  orange: { label: 'Orange', dark: ['#F97316', '#EA580C'], light: ['#C2410C', '#9A3412'], text: '#FFFFFF' },
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
      primary: { main, dark, contrastText: a.text },
      success: { main: tokens.emerald },
      warning: { main: tokens.amber },
      error: { main: tokens.red },
      ...(mode === 'dark'
        ? {
            background: { default: tokens.slate900, paper: tokens.slate800 },
            text: { primary: highContrast ? '#FFFFFF' : tokens.slate50, secondary: highContrast ? '#CBD5E1' : tokens.slate500 },
            divider: highContrast ? 'rgba(226, 232, 240, 0.4)' : 'rgba(148, 163, 184, 0.12)',
          }
        : {
            background: { default: tokens.slate50, paper: '#FFFFFF' },
            text: { primary: highContrast ? '#000000' : tokens.slate900, secondary: highContrast ? '#334155' : tokens.slate500 },
            divider: highContrast ? '#64748B' : tokens.slate200,
          }),
    },
    typography: { ...typography, fontSize: 14 * (FONT_SCALE[fontScale] ?? 1) },
    shape,
    tokens,
    transitions: reduceMotion ? { create: () => 'none' } : {},
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          ${underlineLinks ? 'a { text-decoration: underline !important; }' : ''}
          ${reduceMotion ? '*, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }' : ''}
        `,
      },
      ...(compact
        ? {
            MuiButton: { defaultProps: { size: 'small' }, styleOverrides: { root: { borderRadius: 8, paddingInline: 14 } } },
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
                root: { borderRadius: 8, paddingInline: 16 },
              },
            },
          }),
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
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
          }),
        },
      },
    },
  });
};

export const difficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'Easy':
      return tokens.emerald;
    case 'Medium':
      return tokens.amber;
    case 'Hard':
      return tokens.red;
    default:
      return tokens.slate500;
  }
};

export default tokens;
