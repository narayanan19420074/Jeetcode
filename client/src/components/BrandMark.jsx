import { useId } from 'react';
import { Box } from '@mui/material';

// Brand colours: the orange ramp of the Contest banner (#F7A33B to #E8590C), so the logo sits
// naturally on the warm Library surface (light) and on the dark surface.
export const BRAND_ORANGE = '#F7A33B';
export const BRAND_ORANGE_MID = '#E8590C';
export const BRAND_ORANGE_DEEP = '#D9480F';
// Orange for text on the cream page (5.2:1 contrast, WCAG 2.1 AA); the bright orange is used on dark.
export const BRAND_TEXT_LIGHT = '#C2410C';

// The app logo: rounded tile with the code glyph. Drawn on a 512 grid, identical to
// public/favicon.svg and the installed app icons, so there is one source of truth.
// Cream glyph keeps at least 3:1 contrast on the gradient (WCAG 1.4.11). Glyph: one 40-unit stroke, 80x80 chevrons, 24-unit gaps either side of the slash.
export default function BrandMark({ size = 40, sx }) {
  const gradId = `brand-${useId().replace(/:/g, '')}`;
  return (
    <Box
      component="svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      sx={{ display: 'block', flexShrink: 0, ...sx }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={BRAND_ORANGE} />
          <stop offset="0.32" stopColor={BRAND_ORANGE_MID} />
          <stop offset="1" stopColor={BRAND_ORANGE_DEEP} />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill={`url(#${gradId})`} />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="40">
        <path d="M176 176 96 256l80 80" stroke="#FFF8EE" />
        <path d="M336 176l80 80-80 80" stroke="#FFF8EE" />
        <path d="M278 140 234 372" stroke="#FFEFCF" />
      </g>
    </Box>
  );
}
