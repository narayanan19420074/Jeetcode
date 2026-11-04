import { useState } from 'react';
import { Box, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { COLOR_PALETTE, RADII_PX, SIZES } from '../../app/design/designTokens';
import { hairline } from './homeStyles';

// Screenshot size in the files under /screens. Declared on the img so the browser reserves space before it loads.
const SHOT_WIDTH = 1440;
const SHOT_HEIGHT = 900;

function BrowserBar() {
  return (
    <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', px: 1.5, height: SIZES.browserBarHeight, bgcolor: alpha(COLOR_PALETTE.white, 0.06) }} aria-hidden>
      {[0, 1, 2].map((dot) => (
        <Box key={dot} sx={{ width: SIZES.browserDot, height: SIZES.browserDot, borderRadius: RADII_PX.circle, bgcolor: alpha(COLOR_PALETTE.white, 0.28) }} />
      ))}
    </Stack>
  );
}

// Real app screenshot (desktop, 16:10) in a small browser frame. A missing file renders nothing.
export default function HomeShot({ src, alt, priority = false, sx }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <Box sx={{ width: SIZES.fill, overflow: 'hidden', borderRadius: RADII_PX.card, border: hairline, borderColor: 'divider', bgcolor: COLOR_PALETTE.slate[900], ...sx }}>
      <BrowserBar />
      <Box
        component="img"
        src={src}
        alt={alt}
        width={SHOT_WIDTH}
        height={SHOT_HEIGHT}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onError={() => setFailed(true)}
        sx={{ display: 'block', width: SIZES.fill, height: 'auto', aspectRatio: '16 / 10', objectFit: 'cover', objectPosition: 'top' }}
      />
    </Box>
  );
}
