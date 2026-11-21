import { RADII_PX, SIZES, withAlpha } from '../app/design/designTokens';

const THUMB_ALPHA = 0.3;

// Scrolling area whose scrollbar shows only while the pointer is over it. The gutter stays reserved (the bar is
// transparent, not removed), so rows never shift sideways when it appears. `textColor` is the card's text colour.
export const hoverScrollbarSx = (textColor) => {
  const thumb = withAlpha(textColor, THUMB_ALPHA);
  return {
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: 'transparent transparent',
    '&::-webkit-scrollbar': { width: SIZES.hoverScrollbar },
    '&::-webkit-scrollbar-thumb': { backgroundColor: 'transparent', borderRadius: RADII_PX.pill },
    '&:hover': { scrollbarColor: `${thumb} transparent`, '&::-webkit-scrollbar-thumb': { backgroundColor: thumb } },
  };
};
