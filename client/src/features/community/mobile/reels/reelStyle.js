import { alpha } from '@mui/material';

// Soft black fade that keeps white text readable over any photo. `direction` is the CSS gradient direction toward the
// solid end: "to bottom" under the top bar, "to top" under the caption.
export const blackFade = (theme, direction) =>
  `linear-gradient(${direction}, ${alpha(theme.palette.common.black, 0.7)}, ${alpha(theme.palette.common.black, 0)})`;

// A round dark backing for the action buttons, so white icons stay visible on bright photos.
export const buttonBackdrop = (theme) => alpha(theme.palette.common.black, 0.35);
