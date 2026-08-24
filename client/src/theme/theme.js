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

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: tokens.blue, dark: tokens.blueDark, contrastText: '#FFFFFF' },
      success: { main: tokens.emerald },
      warning: { main: tokens.amber },
      error: { main: tokens.red },
      ...(mode === 'dark'
        ? {
            background: { default: tokens.slate900, paper: tokens.slate800 },
            text: { primary: tokens.slate50, secondary: tokens.slate500 },
            divider: 'rgba(148, 163, 184, 0.12)',
          }
        : {
            background: { default: tokens.slate50, paper: '#FFFFFF' },
            text: { primary: tokens.slate900, secondary: tokens.slate500 },
            divider: tokens.slate200,
          }),
    },
    typography,
    shape,
    tokens,
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8, paddingInline: 16 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiChip: {
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
