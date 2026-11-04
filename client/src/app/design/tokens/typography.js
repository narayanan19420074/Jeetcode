// Typography tokens: font families, weights and sizes, the type scale, letter spacing, line heights and text measure.
// Re-exported by app/design/designTokens.js: import from there, not from this file.

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

// Font sizes for text that is not a Typography variant (icons, badges, inline labels). Values are rem, so the
// Settings -> Text size preference (html font-size, see buildComponents) scales them with the type scale.
// Pick the nearest step; do not invent new numbers.
const remOf = (px) => `${px / 16}rem`;
export const FONT_SIZES = {
  micro: remOf(11),
  caption: remOf(12),
  body: remOf(14),
  bodyLg: remOf(15),
  title: remOf(16),
  subheading: remOf(18),
  heading: remOf(20),
  display: remOf(24),
  displayLg: remOf(28),
  hero: remOf(32),
  heroLg: remOf(40),
  jumbo: remOf(48),
  jumboLg: remOf(60),
  // Decorative steps below and above the regular scale: status dots, tiny badges, compact icon buttons,
  // hero numerals and inline code (em, so it follows the surrounding text).
  dot: remOf(8),
  nano: remOf(9.6),
  iconCompact: remOf(17),
  heroDisplay: remOf(70.4),
  heroDisplayLg: remOf(86.4),
  inlineCode: '0.85em',
};

// Starting values for the code editor preferences (Settings -> Editor). Users change them; this is the default.
export const EDITOR_DEFAULTS = { fontSize: 14 };

// Share of the avatar or frame height used for the rank number printed inside it (mobile, then tablet and up).
export const RANK_TEXT_RATIO = { xs: 0.36, sm: 0.42 };

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

// Letter spacing and line heights for display text that sits outside the Typography variants (landing page, auth pages).
export const LETTER_SPACING = { display: '-0.035em', title: '-0.03em', heading: '-0.02em', subheading: '-0.015em', quote: '-0.01em' };
export const LINE_HEIGHTS = { tight: 1.05, display: 1.1, snug: 1.42, body: 1.5, comfortable: 1.55, relaxed: 1.6, long: 1.65 };

// Line length of running text, in characters, so paragraphs stay readable at any screen width.
export const TEXT_MEASURE = { headline: '22ch', brief: '34ch', lead: '38ch', body: '50ch', intro: '56ch', answer: '64ch', legal: '90ch' };

// Border thickness in px: hairline card outlines, emphasised outlines (outlined buttons, plan cards) and accent bars.
export const BORDER_WIDTHS = { thin: 1, emphasis: 1.5, accent: 4 };

// Fixed text-size choices in Settings -> Appearance.
export const FONT_SCALE = { sm: 0.92, md: 1, lg: 1.12 };
