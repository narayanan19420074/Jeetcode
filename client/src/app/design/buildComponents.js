import { BREAKPOINTS, RADII, SIZES } from './designTokens';
import { rootCssVariables } from './cssVariables';
import { buildSpinnerOverrides, spinnerKeyframes } from './spinner';

const DESKTOP_QUERY = `@media (min-width:${BREAKPOINTS.md}px)`;
const REDUCED_MOTION_CSS =
  '*, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }';

const buildGlobalCss = ({ mode, reduceMotion, underlineLinks }) => `
  ${spinnerKeyframes}
  ${rootCssVariables(mode)}
  ${underlineLinks ? 'a { text-decoration: underline !important; }' : ''}
  ${reduceMotion ? REDUCED_MOTION_CSS : ''}
`;

// Compact density (Settings -> Appearance) shrinks every control through MUI's own `size` props.
const compactDefaults = {
  MuiButton: { defaultProps: { size: 'small', disableElevation: true }, styleOverrides: { root: { borderRadius: RADII.control, paddingInline: 14 } } },
  MuiIconButton: { defaultProps: { size: 'small' } },
  MuiTextField: { defaultProps: { size: 'small' } },
  MuiFormControl: { defaultProps: { size: 'small' } },
  MuiSelect: { defaultProps: { size: 'small' } },
  MuiTable: { defaultProps: { size: 'small' } },
  MuiListItem: { defaultProps: { dense: true } },
  MuiMenuItem: { defaultProps: { dense: true } },
};

// Comfortable density: buttons meet the touch-target height on phones and a slightly tighter height on desktop.
const comfortableDefaults = {
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: { borderRadius: RADII.control, paddingInline: 18 },
      sizeMedium: { minHeight: SIZES.controlHeight.mobile, [DESKTOP_QUERY]: { minHeight: SIZES.controlHeight.desktop } },
    },
  },
};

// MUI's default placeholder (42% opacity) is ~3:1; this keeps it readable.
const readablePlaceholder = {
  styleOverrides: {
    input: ({ theme }) => ({ '&::placeholder': { opacity: 1, color: theme.palette.text.secondary } }),
  },
};

// The app bar stays clear of the phone notch / status bar.
const appBarOverrides = {
  styleOverrides: {
    root: ({ theme }) => ({
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderBottom: `1px solid ${theme.palette.divider}`,
      paddingTop: 'env(safe-area-inset-top)',
    }),
  },
};

const surfaceOverrides = () => ({
  MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  MuiCard: { styleOverrides: { root: { borderRadius: RADII.card } } },
  MuiDialog: { styleOverrides: { paper: { borderRadius: RADII.dialog } } },
  MuiMenu: { styleOverrides: { paper: { borderRadius: RADII.control } } },
  MuiDrawer: { styleOverrides: { paper: { backgroundImage: 'none' } } },
});

const chipOverrides = (compact) => ({
  defaultProps: compact ? { size: 'small' } : {},
  styleOverrides: { root: { fontWeight: 600, fontSize: '0.72rem' } },
});

export function buildComponents({ mode, density, reduceMotion, underlineLinks }) {
  const compact = density === 'compact';
  return {
    MuiCssBaseline: { styleOverrides: buildGlobalCss({ mode, reduceMotion, underlineLinks }) },
    ...(compact ? compactDefaults : comfortableDefaults),
    MuiCircularProgress: buildSpinnerOverrides(mode),
    MuiInputBase: readablePlaceholder,
    ...surfaceOverrides(),
    MuiChip: chipOverrides(compact),
    MuiAppBar: appBarOverrides,
  };
}
