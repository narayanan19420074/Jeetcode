// Design-value rules: font sizes, radii, font families, font weights and pixel spacing written as literals in components.
// Colours have their own hard rule in check-design-tokens.mjs; these five are tracked in a baseline ledger
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
];

export function countValueViolations(codeWithoutComments) {
  const counts = {};
  VALUE_RULES.forEach(({ name, pattern }) => {
    const total = (codeWithoutComments.match(pattern) ?? []).length;
    if (total > 0) counts[name] = total;
  });
  return counts;
}
