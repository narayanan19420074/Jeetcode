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
// Radii in pixels. Pick the role, not a number: badge (tiny tags), control (buttons, inputs, list rows, panels),
// card, dialog and pill (filter chips, tags, avatars). The theme shape uses `control`, so a numeric
// `borderRadius: 1` in an sx prop equals one control radius; prefer a role from this list instead.
export const RADII = { badge: 4, control: 8, card: 12, dialog: 16, pill: 999 };

// The same radii as CSS pixel strings for sx props. A bare number in sx is multiplied by the theme shape
// (`borderRadius: 2` = 16px), while a string is used exactly as written, so components pass `RADII_PX.card`.
export const RADII_PX = Object.fromEntries(Object.entries(RADII).map(([role, value]) => [role, `${value}px`]));

// ---------------------------------------------------------------- sizing
export const SIZES = {
  // WCAG 2.5.5 / Material: minimum touch target on phones.
  touchTarget: 44,
  controlHeight: { mobile: 44, desktop: 36 },
  iconButton: { mobile: 40, desktop: 32 },
  appBarHeight: { mobile: 56, desktop: 64 },
  bottomNavHeight: 64,
  iconSize: { small: 18, medium: 24, large: 28 },
  chipIconSize: 16,
  // Rows and chips: one height per role so lists, sidebars and filter bars line up across pages.
  listRowHeight: 44,
  listRowHeightDense: 36,
  navItemHeight: 40,
  filterPillHeight: 40,
  chipHeight: 28,
  chipHeightSmall: 24,
  avatar: { xs: 24, sm: 32, md: 40, lg: 56 },
  contentMaxWidth: 1200,
  readingMaxWidth: 720,
};

// ---------------------------------------------------------------- typography
// One sans family for the whole product. `library` stays as an alias so the Library pages follow the same family.
const SANS_STACK = '"Geist", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const FONTS = {
  sans: SANS_STACK,
  library: SANS_STACK,
  // Reserved for code, problem IDs and statistics.
  mono: '"JetBrains Mono", "Fira Code", monospace',
};

// The only font weights the product uses. Components pick a role, never a raw number.
export const FONT_WEIGHTS = { regular: 400, medium: 500, semibold: 600, bold: 700 };
const W = FONT_WEIGHTS;

// Type scale in px: [mobile, desktop], line height (unitless) and weight. Dense, LeetCode-like hierarchy: page title
// (h1) down to micro labels. Headings tighten letter spacing slightly; body text keeps the default.
// `micro` is a custom variant for the smallest labels (counts, badges, table meta).
export const TYPE_SCALE = {
  h1: { size: [28, 36], lineHeight: 1.2, weight: W.bold, tracking: '-0.025em' },
  h2: { size: [24, 30], lineHeight: 1.25, weight: W.bold, tracking: '-0.02em' },
  h3: { size: [20, 24], lineHeight: 1.3, weight: W.bold, tracking: '-0.015em' },
  h4: { size: [18, 20], lineHeight: 1.35, weight: W.semibold, tracking: '-0.01em' },
  h5: { size: [16, 18], lineHeight: 1.4, weight: W.semibold, tracking: '-0.005em' },
  h6: { size: [15, 16], lineHeight: 1.4, weight: W.semibold, tracking: '0' },
  subtitle1: { size: [15, 15], lineHeight: 1.5, weight: W.medium, tracking: '0' },
  subtitle2: { size: [14, 14], lineHeight: 1.45, weight: W.semibold, tracking: '0' },
  body1: { size: [15, 14], lineHeight: 1.55, weight: W.regular, tracking: '0' },
  body2: { size: [14, 14], lineHeight: 1.5, weight: W.regular, tracking: '0' },
  button: { size: [14, 14], lineHeight: 1.25, weight: W.semibold, tracking: '0' },
  caption: { size: [12, 12], lineHeight: 1.4, weight: W.regular, tracking: '0.005em' },
  micro: { size: [11, 11], lineHeight: 1.35, weight: W.medium, tracking: '0.01em' },
  overline: { size: [12, 12], lineHeight: 1.4, weight: W.semibold, tracking: '0.08em' },
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

// ---------------------------------------------------------------- colours: primitive palette
// Raw colour scales (Tailwind-style, 50 = lightest, 950 = darkest). This is the ONLY place raw hex values
// for illustrations, charts and game art may live; components reference COLOR_PALETTE.<hue>[<stop>] instead of
// writing a hex. Prefer theme.palette / semantic tokens above for anything that must follow light and dark mode.
export const COLOR_PALETTE = {
  white: '#FFFFFF',
  black: '#000000',
  slate: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A', 950: '#020617' },
  gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151', 800: '#1F2937', 900: '#111827', 950: '#030712' },
  red: { 50: '#FEF2F2', 100: '#FEE2E2', 200: '#FECACA', 300: '#FCA5A5', 400: '#F87171', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C', 800: '#991B1B', 900: '#7F1D1D', 950: '#450A0A' },
  orange: { 50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 300: '#FDBA74', 400: '#FB923C', 500: '#F97316', 600: '#EA580C', 700: '#C2410C', 800: '#9A3412', 900: '#7C2D12', 950: '#431407' },
  amber: { 50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D', 400: '#FBBF24', 500: '#F59E0B', 600: '#D97706', 700: '#B45309', 800: '#92400E', 900: '#78350F', 950: '#451A03' },
  yellow: { 50: '#FEFCE8', 100: '#FEF9C3', 200: '#FEF08A', 300: '#FDE047', 400: '#FACC15', 500: '#EAB308', 600: '#CA8A04', 700: '#A16207', 800: '#854D0E', 900: '#713F12', 950: '#422006' },
  green: { 50: '#F0FDF4', 100: '#DCFCE7', 200: '#BBF7D0', 300: '#86EFAC', 400: '#4ADE80', 500: '#22C55E', 600: '#16A34A', 700: '#15803D', 800: '#166534', 900: '#14532D', 950: '#052E16' },
  emerald: { 50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7', 400: '#34D399', 500: '#10B981', 600: '#059669', 700: '#047857', 800: '#065F46', 900: '#064E3B', 950: '#022C22' },
  teal: { 50: '#F0FDFA', 100: '#CCFBF1', 200: '#99F6E4', 300: '#5EEAD4', 400: '#2DD4BF', 500: '#14B8A6', 600: '#0D9488', 700: '#0F766E', 800: '#115E59', 900: '#134E4A', 950: '#042F2E' },
  cyan: { 50: '#ECFEFF', 100: '#CFFAFE', 200: '#A5F3FC', 300: '#67E8F9', 400: '#22D3EE', 500: '#06B6D4', 600: '#0891B2', 700: '#0E7490', 800: '#155E75', 900: '#164E63', 950: '#083344' },
  sky: { 50: '#F0F9FF', 100: '#E0F2FE', 200: '#BAE6FD', 300: '#7DD3FC', 400: '#38BDF8', 500: '#0EA5E9', 600: '#0284C7', 700: '#0369A1', 800: '#075985', 900: '#0C4A6E', 950: '#082F49' },
  blue: { 50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8', 800: '#1E40AF', 900: '#1E3A8A', 950: '#172554' },
  indigo: { 50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 300: '#A5B4FC', 400: '#818CF8', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA', 800: '#3730A3', 900: '#312E81', 950: '#1E1B4B' },
  violet: { 50: '#F5F3FF', 100: '#EDE9FE', 200: '#DDD6FE', 300: '#C4B5FD', 400: '#A78BFA', 500: '#8B5CF6', 600: '#7C3AED', 700: '#6D28D9', 800: '#5B21B6', 900: '#4C1D95', 950: '#2E1065' },
  purple: { 50: '#FAF5FF', 100: '#F3E8FF', 200: '#E9D5FF', 300: '#D8B4FE', 400: '#C084FC', 500: '#A855F7', 600: '#9333EA', 700: '#7E22CE', 800: '#6B21A8', 900: '#581C87', 950: '#3B0764' },
  pink: { 50: '#FDF2F8', 100: '#FCE7F3', 200: '#FBCFE8', 300: '#F9A8D4', 400: '#F472B6', 500: '#EC4899', 600: '#DB2777', 700: '#BE185D', 800: '#9D174D', 900: '#831843', 950: '#500724' },
  rose: { 50: '#FFF1F2', 100: '#FFE4E6', 200: '#FECDD3', 300: '#FDA4AF', 400: '#FB7185', 500: '#F43F5E', 600: '#E11D48', 700: '#BE123C', 800: '#9F1239', 900: '#881337', 950: '#4C0519' },
  // Colours carried over unchanged from the original screens during the design-token migration. Each one is
  // named <nearest hue><hex> so it is searchable. They are candidates for consolidation into the scales above
  // in a design review; do not add new ones.
  custom: {
    amberF09A2E: '#F09A2E',
    amberF2B63C: '#F2B63C',
    amberFFB020: '#FFB020',
    amberFFB23A: '#FFB23A',
    black17120F: '#17120F',
    black1A1613: '#1A1613',
    black1B1200: '#1B1200',
    black201A16: '#201A16',
    black2A1815: '#2A1815',
    blue1B2A6B: '#1B2A6B',
    blue1E8BFF: '#1E8BFF',
    blue3F8CE8: '#3F8CE8',
    emerald00875E: '#00875E',
    emerald12301F: '#12301F',
    emerald22A06B: '#22A06B',
    emerald2EE6A6: '#2EE6A6',
    emeraldA5F7C5: '#A5F7C5',
    gray151820: '#151820',
    gray161B22: '#161B22',
    gray1F2328: '#1F2328',
    gray292524: '#292524',
    gray2A1F26: '#2A1F26',
    gray44403C: '#44403C',
    gray6F655B: '#6F655B',
    gray808080: '#808080',
    grayA89888: '#A89888',
    grayAEB8C8: '#AEB8C8',
    grayB4BBCB: '#B4BBCB',
    green12B35A: '#12B35A',
    green25D366: '#25D366',
    green2E9E4F: '#2E9E4F',
    green2ED573: '#2ED573',
    green2F8F00: '#2F8F00',
    green65A30D: '#65A30D',
    greenA3FF3F: '#A3FF3F',
    indigo140A3C: '#140A3C',
    indigo180E48: '#180E48',
    indigo1B1030: '#1B1030',
    indigo26103F: '#26103F',
    indigo3B2A8C: '#3B2A8C',
    indigo6A3FB5: '#6A3FB5',
    orangeC24A00: '#C24A00',
    orangeD9480F: '#D9480F',
    orangeD9A066: '#D9A066',
    orangeE3D6C9: '#E3D6C9',
    orangeE9DFD5: '#E9DFD5',
    orangeF08125: '#F08125',
    orangeF1E7DD: '#F1E7DD',
    orangeF7A33B: '#F7A33B',
    orangeF8E9DE: '#F8E9DE',
    orangeFF6A00: '#FF6A00',
    orangeFF7A00: '#FF7A00',
    orangeFFC266: '#FFC266',
    pinkFF3D81: '#FF3D81',
    pinkFF4D8D: '#FF4D8D',
    purple4A1F8C: '#4A1F8C',
    purple7E3FA8: '#7E3FA8',
    purple86198F: '#86198F',
    purpleB66DFF: '#B66DFF',
    purpleC026D3: '#C026D3',
    purpleD946EF: '#D946EF',
    red3A0A10: '#3A0A10',
    redB0141F: '#B0141F',
    redE53935: '#E53935',
    redEF5B5B: '#EF5B5B',
    redEF6C4D: '#EF6C4D',
    redF28C7A: '#F28C7A',
    redFF3040: '#FF3040',
    redFF3B4A: '#FF3B4A',
    redFF4757: '#FF4757',
    redFF5E62: '#FF5E62',
    roseFF1E6E: '#FF1E6E',
    roseFF9AA2: '#FF9AA2',
    sky0B6FB5: '#0B6FB5',
    sky1F3A5F: '#1F3A5F',
    sky27B6FF: '#27B6FF',
    sky2B3050: '#2B3050',
    sky4CCBFF: '#4CCBFF',
    skyA5E3FF: '#A5E3FF',
    slate0A1230: '#0A1230',
    slate0B1230: '#0B1230',
    slate16203A: '#16203A',
    slate263349: '#263349',
    slate5B667A: '#5B667A',
    slateB7BFCC: '#B7BFCC',
    slateB8BFCB: '#B8BFCB',
    slateB8C0CF: '#B8C0CF',
    violet150F5C: '#150F5C',
    violet5B1FBF: '#5B1FBF',
    violetB58AF2: '#B58AF2',
    yellow2B1B00: '#2B1B00',
    yellow3A1A06: '#3A1A06',
    yellow3A2A1E: '#3A2A1E',
    yellow4A3300: '#4A3300',
    yellow5B3A00: '#5B3A00',
    yellow6B4A1E: '#6B4A1E',
    yellow8F6200: '#8F6200',
    yellowB4693A: '#B4693A',
    yellowB7824A: '#B7824A',
    yellowB97A3F: '#B97A3F',
    yellowF5B301: '#F5B301',
  },
};

// Colour with transparency, for overlays and glows: withAlpha(COLOR_PALETTE.white, 0.18) -> 'rgba(255, 255, 255, 0.18)'.
export const withAlpha = (hex, alpha) => {
  const value = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
};

// ---------------------------------------------------------------- elevation and motion
// Shadows are kept subtle: borders carry most of the separation, shadows are for floating layers only.
export const ELEVATION = {
  light: { raised: '0 1px 2px rgba(16,24,40,0.06)', floating: '0 8px 24px rgba(16,24,40,0.12)' },
  dark: { raised: '0 1px 2px rgba(0,0,0,0.4)', floating: '0 8px 24px rgba(0,0,0,0.5)' },
};

export const MOTION = { fast: 120, standard: 200, slow: 320 };

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
