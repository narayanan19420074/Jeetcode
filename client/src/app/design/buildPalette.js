import { ACCENTS, COLOR_PALETTE, HIGH_CONTRAST, SEMANTIC, STATES, withAlpha } from './designTokens';
import { modeKey, surfaceFor } from './modeHelpers';

// Text on the accent colour: dark text on the bright dark-mode shades, white on the deeper light-mode shades.
const accentContrastText = (accent, mode) => (mode === 'dark' && accent.darkText ? accent.darkText : accent.text);

const buildPrimary = (accent, mode) => {
  const [main, dark] = accent[modeKey(mode)];
  return { main, dark, contrastText: accentContrastText(accent, mode) };
};

const buildStatusColors = (mode) => {
  const { success, warning, error } = SEMANTIC[modeKey(mode)];
  return { success: { main: success }, warning: { main: warning }, error: { main: error } };
};

// High contrast replaces text and divider colours; every other surface stays as chosen.
const buildTextAndDivider = (surfaces, mode, highContrast) => {
  const contrast = HIGH_CONTRAST[modeKey(mode)];
  return {
    text: {
      primary: highContrast ? contrast.text : surfaces.text,
      secondary: highContrast ? contrast.secondary : surfaces.muted,
    },
    divider: highContrast ? contrast.divider : surfaces.line,
  };
};

// Neutral tonal layers for hover and selected states (black overlay in light mode, white in dark mode), so every
// clickable surface reacts the same way. Opacities come from STATES.
const buildActionStates = (mode) => {
  const overlay = mode === 'dark' ? COLOR_PALETTE.white : COLOR_PALETTE.black;
  return {
    hover: withAlpha(overlay, STATES.hoverOpacity),
    hoverOpacity: STATES.hoverOpacity,
    selected: withAlpha(overlay, STATES.selectedOpacity),
    selectedOpacity: STATES.selectedOpacity,
    disabledOpacity: STATES.disabledOpacity,
  };
};

export function buildPalette({ mode, accent, surface, highContrast }) {
  const surfaces = surfaceFor(surface, mode);
  return {
    mode,
    primary: buildPrimary(ACCENTS[accent] ?? ACCENTS.violet, mode),
    ...buildStatusColors(mode),
    background: { default: surfaces.bg, paper: surfaces.paper },
    action: buildActionStates(mode),
    ...buildTextAndDivider(surfaces, mode, highContrast),
  };
}
