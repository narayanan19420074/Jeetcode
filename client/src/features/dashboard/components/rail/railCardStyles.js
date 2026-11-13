import { COLOR_PALETTE, RADII_PX, SHADOWS } from '../../../../app/design/designTokens';
import { surface } from '../../dashboardUtils';
import { CALENDAR_GRADIENT } from './railTokens';

// Look shared by every card of the right rail (streak calendar, your progress): the indigo gradient with white text.
export const railCardSx = [
  surface,
  { p: 2.5, color: COLOR_PALETTE.white, background: CALENDAR_GRADIENT, border: 'none', borderRadius: RADII_PX.card, boxShadow: SHADOWS.cardLit(COLOR_PALETTE.slate[950], 0.85, 0.18) },
];
