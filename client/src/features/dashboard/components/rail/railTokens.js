import { COLOR_PALETTE, withAlpha } from '../../../../app/design/designTokens';
// Phone calendar: same indigo gradient as the hero tiles on the phone pages. The desktop rail uses it too.
export const CALENDAR_GRADIENT = `linear-gradient(135deg, ${COLOR_PALETTE.indigo[500]}, color-mix(in srgb, ${COLOR_PALETTE.indigo[500]} 60%, ${COLOR_PALETTE.black}))`;
export const EMERALD = COLOR_PALETTE.emerald[400]; // light green reads on the indigo card
export const SOFT = withAlpha(COLOR_PALETTE.white, 0.68);
export const FAINT = withAlpha(COLOR_PALETTE.white, 0.35);
export const GOLD_A = COLOR_PALETTE.amber[300];
export const GOLD_B = COLOR_PALETTE.amber[600];
export const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
