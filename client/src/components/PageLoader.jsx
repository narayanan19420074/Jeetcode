import { createPortal } from 'react-dom';
import { Box, CircularProgress } from '@mui/material';
import { Z_INDEX } from '../app/design/designTokens';

// Single loading state for every page change. It is rendered straight into <body> and fixed to the viewport, so the
// spinner sits in the exact centre of the screen on phones even when a page wraps its content in an animated or
// transformed container. It stays below the top bar and the bottom tab bar, so the user can still navigate away
// while a page loads.
export default function PageLoader() {
  return createPortal(
    <Box
      role="status"
      aria-label="Loading"
      sx={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', zIndex: Z_INDEX.base, pointerEvents: 'none' }}
    >
      <CircularProgress />
    </Box>,
    document.body,
  );
}
