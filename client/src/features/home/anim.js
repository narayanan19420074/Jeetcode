import { keyframes } from '@mui/material/styles';

// Shared CSS keyframes for the landing page. Hidden "from" states live inside
// the keyframes (animation-fill-mode: both), so when a visitor has
// prefers-reduced-motion on and animations are switched off, every element
// simply renders in its final, visible state.

export const floatY = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

export const drift = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(18px, -14px) scale(1.08); }
`;

export const typeLine = keyframes`
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
`;

export const popIn = keyframes`
  0% { opacity: 0; transform: scale(0.6); }
  70% { opacity: 1; transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
`;

export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Option row in the aptitude card turning green once "answered".
export const pick = keyframes`
  from { background-color: transparent; border-color: var(--line); }
  to { background-color: var(--ok-soft); border-color: var(--ok); }
`;

// Timer ring draining. 52 = ~70% of a r=12 circle's circumference (75.4).
export const ring = keyframes`
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: 52; }
`;

export const marqueeLeft = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

export const marqueeRight = keyframes`
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
`;

export const confetti = keyframes`
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  15% { opacity: 1; }
  100% { transform: translateY(-140px) rotate(220deg); opacity: 0; }
`;

export const glyphFloat = keyframes`
  0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
  50% { transform: translateY(-18px) rotate(var(--r, 0deg)); }
`;

export const DISPLAY_FONT = '"Bricolage Grotesque", "Inter", "Helvetica", "Arial", sans-serif';
export const MONO_FONT = '"JetBrains Mono", "Fira Code", monospace';
