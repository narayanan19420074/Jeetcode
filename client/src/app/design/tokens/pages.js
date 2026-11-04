// Tokens for pages that render before the app loads: brand mark, splash screen and the offline game.
// Re-exported by app/design/designTokens.js: import from there, not from this file.
import { RADII_PX } from './layout.js';
import { SURFACES } from './colors.js';
import { COLOR_PALETTE, withAlpha } from './colorPalette.js';

// ---------------------------------------------------------------- pages that render before the app loads
// The launch splash (index.html) and the offline game (static-pages/offline.template.html) are plain HTML, so they
// cannot import this file at runtime. The build (scripts/designTokensPlugin.mjs) writes these values into them, which
// keeps their colours, radii and fonts in this file too.
// The logo uses the same indigo as the selected navigation item and the streak calendar (BRAND.primary).
// public/favicon.svg and the PNG app icons are drawn with the same hex values.
export const BRAND_MARK = {
  gradient: [COLOR_PALETTE.indigo[400], COLOR_PALETTE.indigo[500], COLOR_PALETTE.indigo[800]],
  glyph: COLOR_PALETTE.indigo[50],
  glyphSlash: COLOR_PALETTE.indigo[100],
  // Brand-coloured text: deep indigo on light pages (8:1 on white), light indigo on dark pages.
  textOnLight: COLOR_PALETTE.indigo[700],
  textOnDark: COLOR_PALETTE.indigo[300],
};

// glyphLight is the colour of the two chevrons and glyphWarm the colour of the slash (placeholder names used by index.html).
export const SPLASH = {
  background: SURFACES.light.bg,
  ring: BRAND_MARK.gradient[0],
  gradient: BRAND_MARK.gradient,
  glyphLight: BRAND_MARK.glyph,
  glyphWarm: BRAND_MARK.glyphSlash,
  radius: '26px',
  shadow: `0 14px 34px ${withAlpha(BRAND_MARK.gradient[1], 0.32)}`,
};

export const OFFLINE_GAME = {
  background: COLOR_PALETTE.white,
  white: COLOR_PALETTE.white,
  ink: '#1F2328',
  muted: '#6B7686',
  wall: '#2B3441',
  danger: '#C5221F',
  offline: '#D93025',
  success: '#1E8E3E',
  amber: '#FFB020',
  brand: '#1A73E8',
  brandDeep: '#0B4FB3',
  brandRgb: '26,115,232',
  laneLine: '#E6EBF3',
  edgeLine: '#D5DDE9',
  pillText: '#3C4655',
  pillBackground: '#F3F6FB',
  pillBorder: '#DDE3EC',
  radiusPill: RADII_PX.pill,
  radiusCircle: RADII_PX.circle,
  font: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};
