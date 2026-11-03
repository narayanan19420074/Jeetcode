// Design-value rules: font sizes, radii, font families and font weights written as literals in components.
// Colours have their own hard rule in check-design-tokens.mjs; these four are tracked in a baseline ledger
// (design-value-baseline.json) whose counts may only go down while the product is migrated to design tokens.

// Each pattern matches the literal forms only. Token and theme references (`RADII_PX.card`, 'fontWeightBold',
// `typography: 'caption'`, `fontFamily: 'inherit'`) never match, and neither do zero and circle (50%) radii.
export const VALUE_RULES = [
  { name: 'fontSize', pattern: /\bfontSize:\s*(?:['"`]?\d|\{)/g, fix: "Use a Typography variant, sx `typography: 'caption'`, or SIZES.iconSize for icons" },
  { name: 'borderRadius', pattern: /\bborderRadius:\s*(?:['"`]?(?!0(?![\d.])|50%)\d|\{)/g, fix: 'Use RADII_PX.<role> from app/design/designTokens' },
  { name: 'fontFamily', pattern: /\bfontFamily:\s*['"`](?!inherit['"`])/g, fix: 'Use FONTS.sans or FONTS.mono, or inherit the theme font' },
  { name: 'fontWeight', pattern: /\bfontWeight:\s*['"`]?\d/g, fix: "Use 'fontWeightRegular', 'fontWeightMedium', 'fontWeightSemibold' or 'fontWeightBold'" },
];

export function countValueViolations(codeWithoutComments) {
  const counts = {};
  VALUE_RULES.forEach(({ name, pattern }) => {
    const total = (codeWithoutComments.match(pattern) ?? []).length;
    if (total > 0) counts[name] = total;
  });
  return counts;
}
