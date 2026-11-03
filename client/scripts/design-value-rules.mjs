// Design-value rules: font sizes, radii, font families, font weights, pixel spacing, stacking order, media queries,
// motion, shadows and fixed sizes written as literals in components, plus the CSS and HTML equivalents.
// Colours have their own hard rule in check-design-tokens.mjs; these are tracked in a baseline ledger
// (design-value-baseline.json) whose counts may only go down while the product is migrated to design tokens.

// Each pattern matches the literal forms only. Token and theme references (`RADII_PX.card`, 'fontWeightBold',
// `typography: 'caption'`, `fontFamily: 'inherit'`) never match, and neither do zero and circle (50%) radii.
// A responsive object (`{ xs: 12, md: 14 }`) matches only while it still holds a number.
export const VALUE_RULES = [
  { name: 'fontSize', pattern: /\bfontSize:\s*(?:['"`]?\d|\{[^}]*\d)/g, fix: "Use a Typography variant, sx `typography: 'caption'`, or SIZES.iconSize for icons" },
  { name: 'borderRadius', pattern: /\bborderRadius:\s*(?:['"`]?(?!0(?![\d.])|50%)\d|\{[^}]*\d)/g, fix: 'Use RADII_PX.<role> from app/design/designTokens' },
  { name: 'fontFamily', pattern: /\bfontFamily:\s*['"`](?!inherit['"`])/g, fix: 'Use FONTS.sans or FONTS.mono, or inherit the theme font' },
  { name: 'fontWeight', pattern: /\bfontWeight:\s*['"`]?\d/g, fix: "Use 'fontWeightRegular', 'fontWeightMedium', 'fontWeightSemibold' or 'fontWeightBold'" },
  { name: 'spacingPx', pattern: /\b(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|rowGap|columnGap|padding[A-Za-z]*|margin[A-Za-z]*):\s*['"`]-?\d+(?:\.\d+)?px/g, fix: 'Use theme spacing units on the 4px grid (0.5, 1, 1.5, 2, 3, 4), for example `p: 1.5` instead of `p: "12px"`' },
  { name: 'zIndex', pattern: /\bzIndex:\s*-?\d/g, fix: 'Use Z_INDEX.<role> from app/design/designTokens' },
  { name: 'mediaQuery', pattern: /\(\s*(?:max|min)-width:\s*\d/g, fix: 'Use MEDIA_QUERIES.<name> (JS) or a %%MEDIA.<name>%% placeholder (CSS) from app/design/designTokens' },
  { name: 'hexAlphaSuffix', pattern: /\$\{[^}]+\}[0-9A-Fa-f]{2}(?![0-9A-Za-z])/g, fix: 'Use hexAlpha(colour, alpha) or withAlpha(colour, alpha) instead of appending an alpha pair to a hex colour' },
  { name: 'motionDuration', pattern: /\b(?:transition|animation):\s*['"`][^'"`\n]*?\b\d*\.?\d+m?s\b/g, fix: 'Use `${MOTION.<role>}ms` and EASING.<name> from app/design/designTokens' },
  { name: 'shadowPx', pattern: /\b(?:boxShadow|textShadow):\s*['"`][^'"`\n]*\d+px/g, fix: 'Use a SHADOWS recipe, or add one to app/design/designTokens' },
  { name: 'fixedSizePx', pattern: /\b(?:width|height|minWidth|minHeight|maxWidth|maxHeight):\s*['"`]?\d/g, fix: 'Use SIZES.<role> or theme spacing; add a SIZES role when none fits' },
  { name: 'cssFontFamily', pattern: /\bfont-family:[ \t]*(?![ \t]|var\(|inherit|%%|\$\{)/g, fix: 'Use var(--jc-font-sans) or a %%GROUP.key%% placeholder' },
  { name: 'cssBorderRadius', pattern: /\bborder-radius:[ \t]*(?!0(?![\d.])|50%)\d/g, fix: 'Use var(--jc-radius-control) or a %%GROUP.key%% placeholder' },
];

export function countValueViolations(codeWithoutComments) {
  const counts = {};
  VALUE_RULES.forEach(({ name, pattern }) => {
    const total = (codeWithoutComments.match(pattern) ?? []).length;
    if (total > 0) counts[name] = total;
  });
  return counts;
}
