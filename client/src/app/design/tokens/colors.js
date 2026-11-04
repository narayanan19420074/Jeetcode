// Colour tokens that follow light and dark mode: surfaces, brand and accents, status and reward, game surfaces and the code editor.
// Re-exported by app/design/designTokens.js: import from there, not from this file.

// ---------------------------------------------------------------- colours: surfaces
// Light mode is a plain white page and white cards (cards are separated by a 1px line) with neutral near-black text, so every light page and card shares one family.
// Layers, back to front: bg (page) < paper (cards, bars) < tonal (raised chips, inputs) < hero (selected).
// Every text/background pair meets WCAG AA (4.5:1 for text).
export const SURFACES = {
  light: { bg: '#FFFFFF', paper: '#FFFFFF', tonal: '#F4F4F5', hero: '#E0E2FF', text: '#1A1A1A', muted: '#55585F', line: '#E4E4E7', lineSolid: '#E4E4E7' },
  dark: { bg: '#0E1116', paper: '#161B22', tonal: '#1F2630', hero: '#2A2F6B', text: '#E6EDF3', muted: '#9DA7B3', line: 'rgba(255,255,255,0.10)', lineSolid: '#2A313C' },
};

// Warm surfaces (Settings -> Appearance -> Surface): light mode matches the default cream, dark mode is warm charcoal.
export const WARM_SURFACES = {
  light: SURFACES.light, // same creamy white as the default, so an account that saved "Warm" earlier sees the same light colours
  dark: { bg: '#17120F', paper: '#201A16', tonal: '#2B231D', hero: '#4A2E22', text: '#F3EBE3', muted: '#B3A79B', line: 'rgba(255,235,220,0.10)', lineSolid: '#3A3029' },
};

// Library look (cream pages on phones and on the desktop dashboard). Dark mode keeps the app's own surfaces.
export const LIBRARY_PALETTE = {
  light: {
    bg: SURFACES.light.bg,
    chip: SURFACES.light.tonal,
    chipText: SURFACES.light.muted,
    player: '#F0F0F2',
    nav: SURFACES.light.tonal,
    border: '#E8E8EB',
    divider: SURFACES.light.line,
    text: SURFACES.light.text,
    muted: SURFACES.light.muted,
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

// Loading spinner tint: the logo indigo (BRAND.primary), and its lighter shade on dark surfaces. Every spinner in the app reads this.
export const SPINNER_COLOR = { light: BRAND.primary, dark: ACCENTS.violet.dark[0] };

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
  light: { bg: '#FFFFFF', panel: '#FFFFFF', panelHi: '#F6F6F7', line: '#E4E4E7', well: '#F4F4F5', hud: 'rgba(255,255,255,0.92)', text: '#1A1A1A', muted: '#55585F', orangeInk: '#B14500', greenInk: '#087A3E', blueInk: '#0A6AAD', coinInk: '#8F6200', redInk: '#C21F33' },
};

// ---------------------------------------------------------------- colours: code editor
// Soft, desaturated syntax hues (no neon): every pair is >= 7:1 on its canvas. Hex without the leading #,
// as Monaco expects.
export const SYNTAX = {
  light: { text: '1F2328', comment: '66707B', keyword: '6F42C1', string: '0A6B3D', number: 'B35900', type: '0550AE', regexp: '0F766E' },
  dark: { text: 'E6EDF3', comment: '8B96A5', keyword: 'C9A9F5', string: '9ECE9A', number: 'F2B880', type: '7CC4F0', regexp: '7FDBCA' },
};
