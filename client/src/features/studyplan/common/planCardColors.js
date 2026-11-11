import { COLOR_PALETTE } from '../../../app/design/designTokens';

// Flat card colours taken from the Dashboard promo cards (Prep by company, Go Pro, Aptitude practice, Algorithm
// visualizer, Contest) without their gradients. Each is the start colour of that card; Go Pro uses a darker stop so the
// white text on it stays readable.
const PLAN_CARD_COLORS = [
  COLOR_PALETTE.teal[600],
  COLOR_PALETTE.amber[700],
  COLOR_PALETTE.pink[600],
  COLOR_PALETTE.blue[600],
  COLOR_PALETTE.orange[600],
];

// A plan keeps the same colour every time it is shown, picked from its id.
export function planCardColor(planId) {
  const hash = [...String(planId)].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return PLAN_CARD_COLORS[hash % PLAN_CARD_COLORS.length];
}
