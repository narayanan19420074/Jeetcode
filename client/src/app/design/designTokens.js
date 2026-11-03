// JeetCode design tokens: the single source of truth for every visual decision.
//
// Colours, typography, spacing, radii, sizing, elevation, motion and breakpoints are defined here and nowhere
// else. The MUI theme (app/design/buildTheme.js) and every legacy palette (Library, Workspace, Leaderboard,
// Quests/Store) read from this file, so one edit restyles the whole product on mobile and desktop.
//
// Rule for contributors: never write a raw hex colour, a font size or a radius in a component. Use the theme
// (palette, typography variants, spacing, shape) or import a token from this file.

// ---------------------------------------------------------------- breakpoints
// Mobile is everything below `md`; desktop is `md` and up. This matches theme.breakpoints.down('md').
export const BREAKPOINTS = { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 };

// ---------------------------------------------------------------- spacing
// One spacing unit feeds theme.spacing(n). Use multiples (sx={{ p: 2 }} = 16px) instead of pixel values.
export const SPACING = { unit: 8, compactUnit: 7 };

// Named layout gaps, in spacing units, for page-level rhythm. Mobile gutters are tighter than desktop.
export const LAYOUT_SPACING = {
  pageGutter: { xs: 2, md: 3 },
  sectionGap: { xs: 3, md: 4 },
  cardPadding: { xs: 2, md: 2.5 },
  stackGap: { xs: 1.5, md: 2 },
};

// ---------------------------------------------------------------- shape
// Radii in pixels. Pick the role, not a number: controls, cards, dialogs and pills each have one value.
export const RADII = { small: 8, control: 12, card: 14, dialog: 16, pill: 999 };

// ---------------------------------------------------------------- sizing
export const SIZES = {
  // WCAG 2.5.5 / Material: minimum touch target on phones.
  touchTarget: 44,
  controlHeight: { mobile: 44, desktop: 40 },
  appBarHeight: { mobile: 56, desktop: 64 },
  bottomNavHeight: 64,
  iconSize: { small: 18, medium: 22, large: 28 },
  contentMaxWidth: 1200,
  readingMaxWidth: 720,
};

// ---------------------------------------------------------------- typography
export const FONTS = {
  sans: '"Geist", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  // Roboto-first stack used by the Library pages (Problems, Dashboard, Settings, Store, Aptitude).
  library: '"Roboto", "Geist", system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
  // Reserved for code, problem IDs and statistics.
  mono: '"JetBrains Mono", "Fira Code", monospace',
};

// Type scale in px: [mobile, desktop], line height (unitless) and weight. Hierarchy: page title (h1) down to
// captions. Headings tighten letter spacing slightly; body text keeps the default.
export const TYPE_SCALE = {
  h1: { size: [30, 40], lineHeight: 1.15, weight: 700, tracking: '-0.03em' },
  h2: { size: [26, 32], lineHeight: 1.2, weight: 700, tracking: '-0.025em' },
  h3: { size: [22, 26], lineHeight: 1.25, weight: 700, tracking: '-0.02em' },
  h4: { size: [20, 24], lineHeight: 1.3, weight: 650, tracking: '-0.015em' },
  h5: { size: [18, 20], lineHeight: 1.35, weight: 650, tracking: '-0.01em' },
  h6: { size: [16, 18], lineHeight: 1.4, weight: 650, tracking: '-0.01em' },
  subtitle1: { size: [16, 16], lineHeight: 1.5, weight: 500, tracking: '0' },
  subtitle2: { size: [14, 14], lineHeight: 1.45, weight: 600, tracking: '0' },
  body1: { size: [16, 16], lineHeight: 1.55, weight: 400, tracking: '0' },
  body2: { size: [14, 14], lineHeight: 1.5, weight: 400, tracking: '0' },
  button: { size: [14, 14], lineHeight: 1.25, weight: 600, tracking: '0' },
  caption: { size: [12, 12], lineHeight: 1.4, weight: 400, tracking: '0.005em' },
  overline: { size: [12, 12], lineHeight: 1.4, weight: 600, tracking: '0.08em' },
};

// Fixed text-size choices in Settings -> Appearance.
export const FONT_SCALE = { sm: 0.92, md: 1, lg: 1.12 };

// ---------------------------------------------------------------- colours: surfaces
// Layers, back to front: bg (page) < paper (cards, bars) < tonal (raised chips, inputs) < hero (selected).
// Every text/background pair meets WCAG AA (4.5:1 for text).
export const SURFACES = {
  light: { bg: '#F6F8FA', paper: '#FFFFFF', tonal: '#EEF1F6', hero: '#E0E2FF', text: '#1B1F24', muted: '#4B5563', line: '#D0D7DE', lineSolid: '#D0D7DE' },
  dark: { bg: '#0E1116', paper: '#161B22', tonal: '#1F2630', hero: '#2A2F6B', text: '#E6EDF3', muted: '#9DA7B3', line: 'rgba(255,255,255,0.10)', lineSolid: '#2A313C' },
};

// Warm surfaces (Settings -> Appearance -> Surface): cream in light mode, warm charcoal in dark mode.
export const WARM_SURFACES = {
  light: { bg: '#FDF8F4', paper: '#FFFFFF', tonal: '#F6ECE2', hero: '#FBE3D3', text: '#1A1613', muted: '#6F655B', line: '#E9DFD5', lineSolid: '#E9DFD5' },
  dark: { bg: '#17120F', paper: '#201A16', tonal: '#2B231D', hero: '#4A2E22', text: '#F3EBE3', muted: '#B3A79B', line: 'rgba(255,235,220,0.10)', lineSolid: '#3A3029' },
};

// Library look (cream pages on phones and on the desktop dashboard). Dark mode keeps the app's own surfaces.
export const LIBRARY_PALETTE = {
  light: {
    bg: WARM_SURFACES.light.bg,
    chip: WARM_SURFACES.light.tonal,
    chipText: WARM_SURFACES.light.muted,
    player: '#F1E7DD',
    nav: WARM_SURFACES.light.tonal,
    border: '#F3E4D4',
    divider: WARM_SURFACES.light.line,
    text: WARM_SURFACES.light.text,
    muted: WARM_SURFACES.light.muted,
  },
  dark: {
    bg: SURFACES.dark.bg,
    chip: SURFACES.dark.tonal,
    chipText: '#B4BDC8',
    player: SURFACES.dark.tonal,
    nav: SURFACES.dark.paper,
    border: SURFACES.dark.line,
    divider: SURFACES.dark.line,
    text: SURFACES.dark.text,
    muted: SURFACES.dark.muted,
  },
};

// ---------------------------------------------------------------- colours: brand and accents
// Brand colour used where no user accent applies (Library buttons, avatars, leaderboard icons).
export const BRAND = { primary: '#6366F1', primaryLight: '#A5B4FC', avatarBg: '#E0E7FF', avatarFg: '#4338CA', warm: '#EF6C4D' };

// Accent colours offered in Settings -> Appearance. Stored under the existing key `violet` (the server validates
// accent keys), shown as "Indigo". Each accent has [main, dark] shades per mode; light shades keep AA contrast.
const onLight = '#FFFFFF';
const onDark = '#0B0F19';
export const ACCENTS = {
  violet: { label: 'Indigo', dark: ['#818CF8', '#6366F1'], light: ['#4F46E5', '#4338CA'], text: onLight, darkText: onDark },
  blue: { label: 'Blue', dark: ['#A8C7FA', '#8AB4F8'], light: ['#0B57D0', '#0842A0'], text: onLight, darkText: onDark },
  emerald: { label: 'Emerald', dark: ['#34D399', '#10B981'], light: ['#047857', '#065F46'], text: onLight, darkText: onDark },
  amber: { label: 'Amber', dark: ['#FBBF24', '#F59E0B'], light: ['#B45309', '#92400E'], text: onLight, darkText: onDark },
  rose: { label: 'Rose', dark: ['#FB7185', '#F43F5E'], light: ['#BE123C', '#9F1239'], text: onLight, darkText: onDark },
  cyan: { label: 'Cyan', dark: ['#22D3EE', '#06B6D4'], light: ['#0E7490', '#155E75'], text: onLight, darkText: onDark },
  orange: { label: 'Orange', dark: ['#FB923C', '#F97316'], light: ['#C2410C', '#9A3412'], text: onLight, darkText: onDark },
  coral: { label: 'Coral', warm: true, dark: ['#F28B6E', '#EF6C4D'], light: ['#C8472D', '#A93A23'], text: onLight, darkText: onDark },
  terracotta: { label: 'Terracotta', warm: true, dark: ['#E08A63', '#D97757'], light: ['#B4532A', '#933F1D'], text: onLight, darkText: onDark },
  honey: { label: 'Honey', warm: true, dark: ['#F5C26B', '#E8A93C'], light: ['#A16207', '#854D0E'], text: onLight, darkText: onDark },
  clay: { label: 'Clay', warm: true, dark: ['#D4A27F', '#C08A66'], light: ['#8C5A3C', '#6F4529'], text: onLight, darkText: onDark },
  rosewood: { label: 'Rosewood', warm: true, dark: ['#E58B84', '#D4726B'], light: ['#A8433F', '#8A3430'], text: onLight, darkText: onDark },
};

// ---------------------------------------------------------------- colours: status and reward
// Status colours: deep on light backgrounds, bright on dark ones, all >= 4.5:1 on the page and cards.
export const SEMANTIC = {
  light: { success: '#047857', warning: '#B45309', error: '#C62828', pending: '#475569' },
  dark: { success: '#34D399', warning: '#FBBF24', error: '#F87171', pending: '#94A3B8' },
};

// Reward colour: streaks, XP and badges only. Kept rare on purpose so it stands out.
export const REWARD = { light: '#D97706', dark: '#FBBF24' };

// Loading spinner tint (warm clay reads well on cream and dark surfaces).
export const SPINNER_COLOR = { light: '#D97757', dark: '#E8946F' };

// Original product palette, still read by charts such as the activity heatmap (theme.tokens).
export const BRAND_PALETTE = {
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

// High-contrast accessibility mode (Settings -> Accessibility).
export const HIGH_CONTRAST = {
  light: { text: '#000000', secondary: '#334155', divider: '#64748B' },
  dark: { text: '#FFFFFF', secondary: '#CBD5E1', divider: 'rgba(226, 232, 240, 0.4)' },
};

// ---------------------------------------------------------------- colours: game surfaces
// Quests and Store lobby look. Published as --ff-* CSS variables because dialogs render in a portal.
// "Ink" colours are the text-safe shade of each accent.
export const GAME_SURFACES = {
  dark: { bg: '#0B0E14', panel: '#151A24', panelHi: '#1D2431', line: '#2B3345', well: '#0B0E14', hud: 'rgba(11,14,20,0.82)', text: '#FFFFFF', muted: '#8E99AD', orangeInk: '#FFB020', greenInk: '#2ED573', blueInk: '#27B6FF', coinInk: '#FFC933', redInk: '#FF6B79' },
  light: { bg: '#EAEFF8', panel: '#FFFFFF', panelHi: '#EEF2F9', line: '#C5CFE2', well: '#E6EBF5', hud: 'rgba(255,255,255,0.92)', text: '#10151F', muted: '#4F5B74', orangeInk: '#B14500', greenInk: '#087A3E', blueInk: '#0A6AAD', coinInk: '#8F6200', redInk: '#C21F33' },
};

// ---------------------------------------------------------------- colours: code editor
// Soft, desaturated syntax hues (no neon): every pair is >= 7:1 on its canvas. Hex without the leading #,
// as Monaco expects.
export const SYNTAX = {
  light: { text: '1F2328', comment: '66707B', keyword: '6F42C1', string: '0A6B3D', number: 'B35900', type: '0550AE', regexp: '0F766E' },
  dark: { text: 'E6EDF3', comment: '8B96A5', keyword: 'C9A9F5', string: '9ECE9A', number: 'F2B880', type: '7CC4F0', regexp: '7FDBCA' },
};

// ---------------------------------------------------------------- elevation and motion
// Shadows are kept subtle: borders carry most of the separation, shadows are for floating layers only.
export const ELEVATION = {
  light: { raised: '0 1px 2px rgba(16,24,40,0.06)', floating: '0 8px 24px rgba(16,24,40,0.12)' },
  dark: { raised: '0 1px 2px rgba(0,0,0,0.4)', floating: '0 8px 24px rgba(0,0,0,0.5)' },
};

export const MOTION = { fast: 120, standard: 200, slow: 320 };
