import { RADII, STATES } from './designTokens';
import { buildInteractiveOverrides } from './buildInteractiveOverrides';
import { rootCssVariables } from './cssVariables';
import { buildSpinnerOverrides, spinnerKeyframes } from './spinner';

const REDUCED_MOTION_CSS =
  '*, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }';

// Keyboard focus ring for every interactive element except text inputs, which show their own focused outline.
const FOCUS_RING_SELECTOR = 'a, button, [role="button"], [role="tab"], [role="menuitem"], [role="option"]';
const focusRingCss = ({ palette }) =>
  `:is(${FOCUS_RING_SELECTOR}):focus-visible { outline: ${STATES.focusRing.width}px solid ${palette.primary.main}; outline-offset: ${STATES.focusRing.offset}px; }`;

const buildGlobalCss = ({ mode, reduceMotion, underlineLinks }, theme) => `
  ${spinnerKeyframes}
  ${rootCssVariables(mode)}
  ${focusRingCss(theme)}
  ${underlineLinks ? 'a { text-decoration: underline !important; }' : ''}
  ${reduceMotion ? REDUCED_MOTION_CSS : ''}
`;

// Compact density (Settings -> Appearance) shrinks every control through MUI's own `size` props.
// Buttons and chips are handled in buildInteractiveOverrides because they also carry the shared states.
const compactDefaults = {
  MuiIconButton: { defaultProps: { size: 'small' } },
  MuiTextField: { defaultProps: { size: 'small' } },
  MuiFormControl: { defaultProps: { size: 'small' } },
  MuiSelect: { defaultProps: { size: 'small' } },
  MuiTable: { defaultProps: { size: 'small' } },
  MuiListItem: { defaultProps: { dense: true } },
  MuiMenuItem: { defaultProps: { dense: true } },
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
  // Cards are flat: a 1px border separates them from the page, shadows are reserved for floating layers.
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({ borderRadius: RADII.card, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }),
    },
  },
  MuiDialog: { styleOverrides: { paper: { borderRadius: RADII.dialog } } },
  MuiMenu: { styleOverrides: { paper: { borderRadius: RADII.control } } },
  MuiDrawer: { styleOverrides: { paper: { backgroundImage: 'none' } } },
});

export function buildComponents({ mode, density, reduceMotion, underlineLinks }) {
  const compact = density === 'compact';
  return {
    MuiCssBaseline: { styleOverrides: (theme) => buildGlobalCss({ mode, reduceMotion, underlineLinks }, theme) },
    ...(compact ? compactDefaults : {}),
    ...buildInteractiveOverrides(compact),
    MuiCircularProgress: buildSpinnerOverrides(mode),
    MuiInputBase: readablePlaceholder,
    ...surfaceOverrides(),
    MuiAppBar: appBarOverrides,
  };
}
