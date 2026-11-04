import { BORDER_WIDTHS, FONT_SIZES, FONT_WEIGHTS, LETTER_SPACING, LINE_HEIGHTS, RADII_PX, SIZES, TEXT_MEASURE } from '../../app/design/designTokens';

// Landing page style presets. Every value comes from designTokens.js, so a change there restyles the page.

export const hairline = `${BORDER_WIDTHS.thin}px solid`;

// Anchored sections stop below the sticky header instead of behind it.
export const anchorOffset = SIZES.appBarHeight.desktop;

// Pure page surface: background.default is white in light mode and the dark surface in dark mode.
export const pageSx = { minHeight: SIZES.viewportHeight, bgcolor: 'background.default', overflowX: 'hidden' };

export const cardSx = { borderRadius: RADII_PX.card, border: hairline, borderColor: 'divider', bgcolor: 'background.default' };

// Full-width band between sections, separated by hairlines only.
export const bandSx = { bgcolor: 'background.paper', borderTop: hairline, borderBottom: hairline, borderColor: 'divider' };

const displayText = (fontSize, letterSpacing, lineHeight, extra) => ({
  fontWeight: FONT_WEIGHTS.bold,
  fontSize,
  letterSpacing,
  lineHeight,
  ...extra,
});

export const heroTitleSx = displayText(
  { xs: FONT_SIZES.heroLg, sm: FONT_SIZES.jumbo },
  LETTER_SPACING.display,
  LINE_HEIGHTS.tight,
  { textWrap: 'balance', mb: 2.5 },
);
export const sectionTitleSx = displayText({ xs: FONT_SIZES.hero, md: FONT_SIZES.heroLg }, LETTER_SPACING.title, LINE_HEIGHTS.display, { textWrap: 'balance' });
export const closingTitleSx = displayText({ xs: FONT_SIZES.hero, md: FONT_SIZES.jumbo }, LETTER_SPACING.title, LINE_HEIGHTS.display, { textWrap: 'balance', mb: 1.5 });
export const cardTitleSx = displayText(FONT_SIZES.display, LETTER_SPACING.heading);
export const smallCardTitleSx = displayText(FONT_SIZES.heading, LETTER_SPACING.subheading);
export const planPriceSx = displayText(FONT_SIZES.heroLg, LETTER_SPACING.title, LINE_HEIGHTS.display, { mt: 1 });
export const wordmarkSx = displayText(FONT_SIZES.heading, LETTER_SPACING.heading, undefined, { color: 'text.primary', textDecoration: 'none' });
export const quoteSx = displayText({ xs: FONT_SIZES.heading, md: FONT_SIZES.displayLg }, LETTER_SPACING.quote, LINE_HEIGHTS.snug, {
  fontWeight: FONT_WEIGHTS.semibold,
  maxWidth: TEXT_MEASURE.lead,
  textWrap: 'pretty',
});
