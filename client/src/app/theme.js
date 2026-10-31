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

// JeetCode surfaces: calm, cool-neutral "night desk" (dark first) with one indigo brand.
// Layers, back to front: bg (page) < paper (cards, bars) < tonal (raised chips, inputs) < hero (selected).
// Every text/background pair was checked against WCAG AA (4.5:1 for text).
const surfaces = {
  light: { bg: '#F6F8FA', paper: '#FFFFFF', tonal: '#EEF1F6', hero: '#E0E2FF', text: '#1B1F24', muted: '#4B5563', line: '#D0D7DE', lineSolid: '#D0D7DE' },
  dark: { bg: '#0E1116', paper: '#161B22', tonal: '#1F2630', hero: '#2A2F6B', text: '#E6EDF3', muted: '#9DA7B3', line: 'rgba(255,255,255,0.10)', lineSolid: '#2A313C' },
};
// Warm surfaces (Settings -> Appearance -> Surface): the cream Library palette in light mode and a warm
// charcoal in dark mode. Text/background pairs keep AA contrast (4.5:1).
const warmSurfaces = {
  light: { bg: '#FDF8F4', paper: '#FFFFFF', tonal: '#F6ECE2', hero: '#FBE3D3', text: '#1A1613', muted: '#6F655B', line: '#E9DFD5', lineSolid: '#E9DFD5' },
  dark: { bg: '#17120F', paper: '#201A16', tonal: '#2B231D', hero: '#4A2E22', text: '#F3EBE3', muted: '#B3A79B', line: 'rgba(255,235,220,0.10)', lineSolid: '#3A3029' },
};
// Reward colour: streaks, XP, badges only. Kept rare on purpose so it stands out.
const reward = { light: '#D97706', dark: '#FBBF24' };
// Status colours: deep on light backgrounds, bright on dark ones, all >= 4.5:1 on the page and cards.
const semantic = {
  light: { success: '#047857', warning: '#B45309', error: '#C62828', pending: '#475569' },
  dark: { success: '#34D399', warning: '#FBBF24', error: '#F87171', pending: '#94A3B8' },
};
export const jcTokens = surfaces;
export const gpayTokens = surfaces; // old name, kept so existing imports keep working

// Accent colours offered in Settings -> Appearance. `blue` is the original
// brand colour and is identical in both modes; the others use a deeper shade
// on light backgrounds so links/buttons keep enough contrast.
export const ACCENTS = {
  // Brand. Stored under the existing key 'violet' (the server validates accent keys), shown as "Indigo".
  violet: { label: 'Indigo', dark: ['#818CF8', '#6366F1'], light: ['#4F46E5', '#4338CA'], text: '#FFFFFF', darkText: '#0B0F19' },
  blue: { label: 'Blue', dark: ['#A8C7FA', '#8AB4F8'], light: ['#0B57D0', '#0842A0'], text: '#FFFFFF', darkText: '#0B0F19' },
  emerald: { label: 'Emerald', dark: ['#34D399', '#10B981'], light: ['#047857', '#065F46'], text: '#FFFFFF', darkText: '#0B0F19' },
  amber: { label: 'Amber', dark: ['#FBBF24', '#F59E0B'], light: ['#B45309', '#92400E'], text: '#FFFFFF', darkText: '#0B0F19' },
  rose: { label: 'Rose', dark: ['#FB7185', '#F43F5E'], light: ['#BE123C', '#9F1239'], text: '#FFFFFF', darkText: '#0B0F19' },
  cyan: { label: 'Cyan', dark: ['#22D3EE', '#06B6D4'], light: ['#0E7490', '#155E75'], text: '#FFFFFF', darkText: '#0B0F19' },
  orange: { label: 'Orange', dark: ['#FB923C', '#F97316'], light: ['#C2410C', '#9A3412'], text: '#FFFFFF', darkText: '#0B0F19' },
  // Warm tones: same family as the cream Library surfaces. All light shades keep AA contrast with white text.
  coral: { label: 'Coral', warm: true, dark: ['#F28B6E', '#EF6C4D'], light: ['#C8472D', '#A93A23'], text: '#FFFFFF', darkText: '#0B0F19' },
  terracotta: { label: 'Terracotta', warm: true, dark: ['#E08A63', '#D97757'], light: ['#B4532A', '#933F1D'], text: '#FFFFFF', darkText: '#0B0F19' },
  honey: { label: 'Honey', warm: true, dark: ['#F5C26B', '#E8A93C'], light: ['#A16207', '#854D0E'], text: '#FFFFFF', darkText: '#0B0F19' },
  clay: { label: 'Clay', warm: true, dark: ['#D4A27F', '#C08A66'], light: ['#8C5A3C', '#6F4529'], text: '#FFFFFF', darkText: '#0B0F19' },
  rosewood: { label: 'Rosewood', warm: true, dark: ['#E58B84', '#D4726B'], light: ['#A8433F', '#8A3430'], text: '#FFFFFF', darkText: '#0B0F19' },
};
const FONT_SCALE = { sm: 0.92, md: 1, lg: 1.12 };

// Loading spinner: a small eight-ray burst that turns and softly pulses. It replaces the default MUI ring for every
// indeterminate CircularProgress, so all existing spinners pick it up. It is drawn as a mask, so it takes the text
// colour of its parent (buttons use color="inherit"); on its own it uses the warm SPINNER_COLOR below.
const SPINNER_RAYS = [0, 45, 90, 135, 180, 225, 270, 315]
  .map((deg, i) => `<path d="M12 ${i % 2 ? 4 : 2.5}V8" transform="rotate(${deg} 12 12)"/>`)
  .join('');
const SPINNER_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round">${SPINNER_RAYS}</svg>`,
)}")`;
// Warm clay tone (soft coral) so spinners read well on the cream Library surfaces and on dark surfaces alike.
const SPINNER_COLOR = { light: '#D97757', dark: '#E8946F' };
const spinnerCss = `
  @keyframes jc-spinner-turn { to { transform: rotate(360deg); } }
  @keyframes jc-spinner-pulse { 0%, 100% { transform: scale(0.82); opacity: 0.75; } 50% { transform: scale(1); opacity: 1; } }
`;

// getTheme(mode) keeps working exactly as before. `opts` carries the user's
// appearance preferences: { accent, density, fontScale, contrast, reduceMotion }.
export const getTheme = (mode, opts = {}) => {
  const { accent = 'violet', surface = 'default', density = 'comfortable', fontScale = 'md', contrast = 'normal', reduceMotion = false, underlineLinks = false } = opts;
  const S = (surface === 'warm' ? warmSurfaces : surfaces)[mode === 'dark' ? 'dark' : 'light'];
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
            background: { default: S.bg, paper: S.paper },
            text: { primary: highContrast ? '#FFFFFF' : S.text, secondary: highContrast ? '#CBD5E1' : S.muted },
            divider: highContrast ? 'rgba(226, 232, 240, 0.4)' : S.line,
          }
        : {
            background: { default: S.bg, paper: S.paper },
            text: { primary: highContrast ? '#000000' : S.text, secondary: highContrast ? '#334155' : S.muted },
            divider: highContrast ? '#64748B' : S.line,
          }),
    },
    typography: { ...typography, fontSize: 14 * (FONT_SCALE[fontScale] ?? 1) },
    shape,
    tokens,
    transitions: reduceMotion ? { create: () => 'none' } : {},
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          ${spinnerCss}
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
      MuiCircularProgress: {
        styleOverrides: {
          colorPrimary: { color: SPINNER_COLOR[mode === 'dark' ? 'dark' : 'light'] },
          root: ({ ownerState }) =>
            ownerState.variant === 'indeterminate'
              ? {
                  animation: 'jc-spinner-turn 2.4s linear infinite',
                  '& .MuiCircularProgress-svg': { display: 'none' },
                  '&::before': {
                    content: '""',
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'currentColor',
                    WebkitMaskImage: SPINNER_MASK,
                    maskImage: SPINNER_MASK,
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    animation: 'jc-spinner-pulse 1.2s ease-in-out infinite',
                  },
                  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                }
              : {},
        },
      },
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
  dark: { bg: '#0B0E14', panel: '#151A24', panelHi: '#1D2431', line: '#2B3345', well: '#0B0E14', hud: 'rgba(11,14,20,0.82)', text: '#FFFFFF', muted: '#8E99AD', orangeInk: '#FFB020', greenInk: '#2ED573', blueInk: '#27B6FF', coinInk: '#FFC933', redInk: '#FF6B79' },
  light: { bg: '#EAEFF8', panel: '#FFFFFF', panelHi: '#EEF2F9', line: '#C5CFE2', well: '#E6EBF5', hud: 'rgba(255,255,255,0.92)', text: '#10151F', muted: '#4F5B74', orangeInk: '#B14500', greenInk: '#087A3E', blueInk: '#0A6AAD', coinInk: '#8F6200', redInk: '#C21F33' },
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
