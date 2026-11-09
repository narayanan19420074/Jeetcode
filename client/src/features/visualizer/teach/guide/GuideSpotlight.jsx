import { keyframes } from '@emotion/react';
import { Box } from '@mui/material';
import { COLOR_PALETTE, withAlpha, RADII_PX, Z_INDEX, EASING } from '../../../../app/design/designTokens';
import { PAD } from './guideConstants';

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 100vmax ${withAlpha(COLOR_PALETTE.slate[950], 0.5)}, 0 0 0 0 ${withAlpha(COLOR_PALETTE.emerald[400], 0.55)}; }
  50% { box-shadow: 0 0 0 100vmax ${withAlpha(COLOR_PALETTE.slate[950], 0.5)}, 0 0 0 9px ${withAlpha(COLOR_PALETTE.emerald[400], 0)}; }
`;
const ripple = keyframes`
  from { transform: translate(-50%, -50%) scale(0.2); opacity: 0.9; }
  to { transform: translate(-50%, -50%) scale(2.4); opacity: 0; }
`;

// Highlights the element Blip is talking about; the huge box-shadow dims everything else.
export function GuideSpotlight({ rect, reduce, accent }) {
  if (!rect) return null;
  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: Z_INDEX.tourHighlight,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
        transform: `translate(${Math.round(rect.left - PAD)}px, ${Math.round(rect.top - PAD)}px)`,
        transition: reduce ? 'none' : `transform 0.5s ${EASING.decelerate}, width 0.5s ${EASING.decelerate}, height 0.5s ${EASING.decelerate}`,
        borderRadius: RADII_PX.card,
        border: `2px solid ${accent}`,
        boxShadow: `0 0 0 100vmax ${withAlpha(COLOR_PALETTE.slate[950], 0.5)}`,
        animation: reduce ? 'none' : `${pulse} 1.8s ease-in-out infinite`,
        pointerEvents: 'none',
      }}
    />
  );
}

// Ripple that shows where Blip is about to click on the learner's behalf.
export function GuideTapRipple({ tap, accent }) {
  return (
    <Box
      key={tap.key}
      aria-hidden
      sx={{
        position: 'fixed',
        left: tap.x,
        top: tap.y,
        zIndex: Z_INDEX.tourPointer,
        width: 56,
        height: 56,
        borderRadius: '50%',
        border: `3px solid ${accent}`,
        bgcolor: withAlpha(COLOR_PALETTE.emerald[400], 0.28),
        animation: `${ripple} 0.7s ease-out forwards`,
        pointerEvents: 'none',
      }}
    />
  );
}
