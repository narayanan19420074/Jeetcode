import MissingValueVisual from '../visuals/MissingValueVisual';

export const MAIN_NAV_HEIGHT_PX = 72;

export const CONTENT_MAX = 720;

// Which lessons use the new interactive pilot visual instead of the
// legacy static SVG registry. Migrate one at a time as they get rebuilt.
export const PILOT_VISUALS = {
  'missing-value': MissingValueVisual,
};

export const SPRING = { type: 'spring', stiffness: 200, damping: 24 };
