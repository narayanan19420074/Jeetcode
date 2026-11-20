import { COLOR_PALETTE } from '../../../../app/design/designTokens';
import { surface, tint } from '../../dashboardUtils';

// Sidebar cards of the Aptitude and Problems pages: the inverse of the indigo rail card. The card is white (the page's
// paper colour) and everything on it is blue. Children inherit the blue through `currentColor`, so one colour change
// here restyles the text, the ring, the borders and the selected rows together.
const INK = { light: COLOR_PALETTE.indigo[600], dark: COLOR_PALETTE.indigo[300] };
const BORDER_PERCENT = 24;
const SELECTED_PERCENT = 12;

export const LIGHT_CARD_MUTED_OPACITY = 0.72;
export const LIGHT_CARD_SELECTED_BG = tint('currentColor', SELECTED_PERCENT);

export const lightCardSx = [
  surface,
  (theme) => ({ p: 2, color: theme.palette.mode === 'dark' ? INK.dark : INK.light, border: `1px solid ${tint('currentColor', BORDER_PERCENT)}` }),
];
