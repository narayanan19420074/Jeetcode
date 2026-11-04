// Elevation, motion, stacking order, media queries, shadows and interaction states.
// Re-exported by app/design/designTokens.js: import from there, not from this file.
import { BREAKPOINTS } from './layout.js';
import { COLOR_PALETTE, withAlpha } from './colorPalette.js';

// ---------------------------------------------------------------- elevation and motion
// Shadows are kept subtle: borders carry most of the separation, shadows are for floating layers only.
export const ELEVATION = {
  light: { raised: '0 1px 2px rgba(16,24,40,0.06)', floating: '0 8px 24px rgba(16,24,40,0.12)' },
  dark: { raised: '0 1px 2px rgba(0,0,0,0.4)', floating: '0 8px 24px rgba(0,0,0,0.5)' },
};

// Durations in ms. instant: press feedback; fast: hover and colour changes; standard: most transitions;
// slow: entrances; deliberate and progress: fades and progress bars that should be noticed.
export const MOTION = { instant: 80, fast: 120, standard: 200, slow: 320, deliberate: 500, progress: 600 };

// Easing curves: standard for movement between states, decelerate for entrances, overshoot for playful pops.
export const EASING = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  decelerate: 'cubic-bezier(0.22, 1, 0.36, 1)',
  overshoot: 'cubic-bezier(0.2, 0.9, 0.3, 1.1)',
  overshootLarge: 'cubic-bezier(0.34, 1.25, 0.5, 1)',
};

// Distance (rootMargin) before an element scrolls into view and its entrance animation starts.
export const SCROLL_REVEAL_MARGIN = { near: '-60px', far: '-80px' };

// Stacking order. Local steps (behind to dock) order siblings inside one component; the larger values sit above
// MUI layers (modal is 1300 in the theme) and are listed bottom to top so the order is visible in one place.
export const Z_INDEX = {
  behind: -1,
  base: 1,
  raised: 2,
  overlap: 3,
  marker: 4,
  pinned: 5,
  bar: 10,
  header: 20,
  dock: 30,
  supportLauncher: 1200,
  floatingCall: 1250,
  sheetBackdrop: 1290,
  sheet: 1300,
  miniCall: 1300,
  aiGlow: 1350,
  aiBackdrop: 1355,
  aiLauncher: 1360,
  aiLiveOverlay: 1360,
  celebration: 1400,
  tourBackdrop: 1400,
  tourHighlight: 1405,
  tourPointer: 1450,
  tourCard: 1460,
  tourControls: 1470,
  toast: 1500,
  offlineGame: 2000,
};

// Media queries for useMediaQuery and CSS. Derived from BREAKPOINTS so a breakpoint change moves every query.
// 0.05px below a breakpoint avoids a one-pixel overlap with the matching min-width query.
export const MEDIA_QUERIES = {
  belowSm: `(max-width:${BREAKPOINTS.sm - 0.05}px)`,
  belowMd: `(max-width:${BREAKPOINTS.md - 0.05}px)`,
  // The aptitude test switches to its compact layout earlier than the rest of the app: the question palette needs room.
  compactTestLayout: '(max-width:1000px)',
};

// Shadow recipes shared by hero cards, bottom sheets, focus rings and highlights. Colours stay arguments so
// the recipe works with any palette; the offsets and blur radii live here.
// Single-layer drop shadows in five steps. The colour (with its alpha) stays an argument.
const DROP_SHADOWS = {
  xs: '0 2px 6px',
  sm: '0 4px 12px',
  md: '0 8px 20px -6px',
  lg: '0 14px 28px -12px',
  xl: '0 18px 40px -16px',
};

export const SHADOWS = {
  drop: (step, color) => `${DROP_SHADOWS[step]} ${color}`,
  card: (color, alpha) => `0 14px 28px -16px ${withAlpha(color, alpha)}`,
  cardLit: (color, alpha, highlightAlpha) => `0 14px 28px -16px ${withAlpha(color, alpha)}, inset 0 1px 0 ${withAlpha(COLOR_PALETTE.white, highlightAlpha)}`,
  highlight: (alpha) => `inset 0 1px 0 ${withAlpha(COLOR_PALETTE.white, alpha)}`,
  sheetUp: (alpha) => `0 -12px 40px ${withAlpha(COLOR_PALETTE.black, alpha)}`,
  ring: (color) => `0 0 0 2px ${color}`,
};

// ---------------------------------------------------------------- interaction states
// One behaviour for every clickable surface (buttons, rows, cards, tabs, chips): normal is flat; hover, pressed and
// selected add a neutral tonal layer; selected also gets heavier text; keyboard focus shows a ring; disabled fades.
// Opacities apply to a black (light mode) or white (dark mode) overlay and feed theme.palette.action.
export const STATES = {
  // Zebra stripe of alternating list rows: fainter than hover so a hovered row still stands out.
  stripeOpacity: 0.02,
  hoverOpacity: 0.04,
  pressedOpacity: 0.08,
  selectedOpacity: 0.08,
  disabledOpacity: 0.5,
  focusRing: { width: 2, offset: 2 },
};
