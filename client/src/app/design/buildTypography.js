import { BREAKPOINTS, FONTS, FONT_WEIGHTS, TYPE_SCALE } from './designTokens';

const BASE_FONT_PX = 14;
const REM_BASE_PX = 16;
const DESKTOP_QUERY = `@media (min-width:${BREAKPOINTS.md}px)`;

// Sizes are plain rem: the Text size preference scales the html font-size (see buildComponents), so every rem
// value in the app follows it, not only these variants.
const toRem = (px) => `${(px / REM_BASE_PX).toFixed(4)}rem`;

// One variant: the mobile size is the default, the desktop size applies from the `md` breakpoint up.
// Hierarchy therefore changes in one place (TYPE_SCALE) for every page.
const buildVariant = ({ size, lineHeight, weight, tracking }) => ({
  fontSize: toRem(size[0]),
  lineHeight,
  fontWeight: weight,
  letterSpacing: tracking,
  ...(size[0] !== size[1] && { [DESKTOP_QUERY]: { fontSize: toRem(size[1]) } }),
});

export function buildTypography() {
  const variants = Object.fromEntries(Object.entries(TYPE_SCALE).map(([name, spec]) => [name, buildVariant(spec)]));
  return {
    fontFamily: FONTS.sans,
    fontSize: BASE_FONT_PX,
    fontWeightRegular: FONT_WEIGHTS.regular,
    fontWeightMedium: FONT_WEIGHTS.medium,
    // Not a MUI key: lets sx props write fontWeight: 'fontWeightSemibold' instead of a raw 600.
    fontWeightSemibold: FONT_WEIGHTS.semibold,
    fontWeightBold: FONT_WEIGHTS.bold,
    ...variants,
    button: { ...variants.button, textTransform: 'none' },
    // Monospace face reserved for code, problem IDs and statistics: signals "engineering tool".
    monospace: { fontFamily: FONTS.mono },
  };
}
