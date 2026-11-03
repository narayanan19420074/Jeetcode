import { useId } from 'react';
import { Box } from '@mui/material';
import { BRAND_MARK } from '../app/design/designTokens';

// Brand colour: the same indigo as the selected navigation item and the streak calendar, so the logo,
// the active state and the calendar always read as one colour family.
const [GRADIENT_START, GRADIENT_MID, GRADIENT_END] = BRAND_MARK.gradient;
export const BRAND_TEXT_DARK = BRAND_MARK.textOnDark;
// Brand text on light pages: 8:1 contrast, above WCAG 2.1 AA.
export const BRAND_TEXT_LIGHT = BRAND_MARK.textOnLight;

// The app logo: rounded tile with the code glyph. Drawn on a 512 grid, identical to
// public/favicon.svg and the installed app icons, so there is one source of truth.
// Light glyph keeps at least 3:1 contrast on the gradient (WCAG 1.4.11). Glyph: one 40-unit stroke, 80x80 chevrons, 24-unit gaps either side of the slash.
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
          <stop offset="0" stopColor={GRADIENT_START} />
          <stop offset="0.32" stopColor={GRADIENT_MID} />
          <stop offset="1" stopColor={GRADIENT_END} />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill={`url(#${gradId})`} />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="40">
        <path d="M176 176 96 256l80 80" stroke={BRAND_MARK.glyph} />
        <path d="M336 176l80 80-80 80" stroke={BRAND_MARK.glyph} />
        <path d="M278 140 234 372" stroke={BRAND_MARK.glyphSlash} />
      </g>
    </Box>
  );
}
