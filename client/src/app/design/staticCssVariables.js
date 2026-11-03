import { FONTS, MEDIA_QUERIES, RADII_PX, SIZES, withAlpha } from './designTokens.js';

// Values that do not depend on light or dark mode, for the plain CSS in index.css and for the pages that render
// before React starts. The build injects them into index.html (scripts/designTokensPlugin.mjs).
export const STATIC_CSS_TOKENS = {
  'font-sans': FONTS.sans,
  'radius-control': RADII_PX.control,
  'scrollbar-size': `${SIZES.scrollbar.regular}px`,
  'scrollbar-size-slim': `${SIZES.scrollbar.slim}px`,
  'scrollbar-size-thin': `${SIZES.scrollbar.thin}px`,
  'scrollbar-thumb': withAlpha('#94A3B8', 0.35),
  'scrollbar-thumb-panel': withAlpha('#808A9B', 0.45),
};

export const staticCssVariables = () =>
  `:root { ${Object.entries(STATIC_CSS_TOKENS).map(([name, value]) => `--jc-${name}: ${value};`).join(' ')} }`;

export const CSS_MEDIA_TOKENS = { belowMd: MEDIA_QUERIES.belowMd };
