import { SPINNER_COLOR } from './designTokens';
import { modeKey } from './modeHelpers';

// Loading spinner: a small eight-ray burst that turns and softly pulses. It replaces the default MUI ring for every
// indeterminate CircularProgress, so all existing spinners pick it up. It is drawn as a mask, so it takes the text
// colour of its parent (buttons use color="inherit"); on its own it uses the brand-coloured SPINNER_COLOR.
const SPINNER_RAYS = [0, 45, 90, 135, 180, 225, 270, 315]
  .map((deg, index) => `<path d="M12 ${index % 2 ? 4 : 2.5}V8" transform="rotate(${deg} 12 12)"/>`)
  .join('');

const SPINNER_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round">${SPINNER_RAYS}</svg>`,
)}")`;

export const spinnerKeyframes = `
  @keyframes jc-spinner-turn { to { transform: rotate(360deg); } }
  @keyframes jc-spinner-pulse { 0%, 100% { transform: scale(0.82); opacity: 0.75; } 50% { transform: scale(1); opacity: 1; } }
`;

const spinnerRays = {
  content: '""',
  display: 'block',
  width: '100%',
  height: '100%',
  backgroundColor: 'currentColor',
  WebkitMaskImage: SPINNER_MASK,
  maskImage: SPINNER_MASK,
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
  animation: 'jc-spinner-pulse 1.2s ease-in-out infinite',
};

const indeterminateSpinner = {
  animation: 'jc-spinner-turn 2.4s linear infinite',
  '& .MuiCircularProgress-svg': { display: 'none' },
  '&::before': spinnerRays,
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
};

export const buildSpinnerOverrides = (mode) => ({
  styleOverrides: {
    colorPrimary: { color: SPINNER_COLOR[modeKey(mode)] },
    root: ({ ownerState }) => (ownerState.variant === 'indeterminate' ? indeterminateSpinner : {}),
  },
});
