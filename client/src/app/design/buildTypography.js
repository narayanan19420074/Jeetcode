import { BREAKPOINTS, FONTS, FONT_SCALE, FONT_WEIGHTS, TYPE_SCALE } from './designTokens';

const BASE_FONT_PX = 14;
const REM_BASE_PX = 16;
const DESKTOP_QUERY = `@media (min-width:${BREAKPOINTS.md}px)`;

const toRem = (px, scale) => `${((px * scale) / REM_BASE_PX).toFixed(4)}rem`;

// One variant: the mobile size is the default, the desktop size applies from the `md` breakpoint up.
// Hierarchy therefore changes in one place (TYPE_SCALE) for every page.
const buildVariant = ({ size, lineHeight, weight, tracking }, scale) => ({
  fontSize: toRem(size[0], scale),
  lineHeight,
  fontWeight: weight,
  letterSpacing: tracking,
  ...(size[0] !== size[1] && { [DESKTOP_QUERY]: { fontSize: toRem(size[1], scale) } }),
});

export function buildTypography(fontScale = 'md') {
  const scale = FONT_SCALE[fontScale] ?? 1;
  const variants = Object.fromEntries(Object.entries(TYPE_SCALE).map(([name, spec]) => [name, buildVariant(spec, scale)]));
  return {
    fontFamily: FONTS.sans,
    fontSize: BASE_FONT_PX * scale,
    fontWeightRegular: FONT_WEIGHTS.regular,
    fontWeightMedium: FONT_WEIGHTS.medium,
    fontWeightBold: FONT_WEIGHTS.bold,
    ...variants,
    button: { ...variants.button, textTransform: 'none' },
    // Monospace face reserved for code, problem IDs and statistics: signals "engineering tool".
    monospace: { fontFamily: FONTS.mono },
  };
}
