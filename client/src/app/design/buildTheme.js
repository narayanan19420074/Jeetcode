import { createTheme } from '@mui/material/styles';
import { BRAND_PALETTE, ELEVATION, FONTS, FONT_WEIGHTS, LAYOUT_SPACING, MOTION, RADII, SIZES, SPACING, STATES } from './designTokens';
import { buildComponents } from './buildComponents';
import { buildPalette } from './buildPalette';
import { buildTypography } from './buildTypography';
import { modeKey } from './modeHelpers';

const DEFAULT_APPEARANCE = {
  accent: 'violet',
  surface: 'default',
  density: 'comfortable',
  fontScale: 'md',
  contrast: 'normal',
  reduceMotion: false,
  underlineLinks: false,
};

// Design tokens that MUI has no slot for, exposed as theme.jc so components read them from the theme
// (for example theme.jc.sizes.touchTarget) instead of hard-coding numbers.
const buildJcTokens = (mode) => ({
  sizes: SIZES,
  radii: RADII,
  layout: LAYOUT_SPACING,
  fonts: FONTS,
  weights: FONT_WEIGHTS,
  states: STATES,
  motion: MOTION,
  elevation: ELEVATION[modeKey(mode)],
});

// `opts` carries the user's appearance preferences from Settings -> Appearance:
// { accent, surface, density, fontScale, contrast, reduceMotion, underlineLinks }.
export function buildTheme(mode, opts = {}) {
  const appearance = { ...DEFAULT_APPEARANCE, ...opts };
  const compact = appearance.density === 'compact';
  return createTheme({
    spacing: compact ? SPACING.compactUnit : SPACING.unit,
    palette: buildPalette({ ...appearance, mode, highContrast: appearance.contrast === 'high' }),
    typography: buildTypography(),
    shape: { borderRadius: RADII.control },
    tokens: BRAND_PALETTE,
    jc: buildJcTokens(mode),
    transitions: appearance.reduceMotion ? { create: () => 'none' } : {},
    components: buildComponents({ mode, ...appearance }),
  });
}
