import { SURFACES, WARM_SURFACES } from './designTokens';

// Anything that is not explicitly dark is treated as light, so an unknown mode never breaks a lookup.
export const modeKey = (mode) => (mode === 'dark' ? 'dark' : 'light');

// Picks the surface set for the user's Settings -> Appearance -> Surface choice.
export const surfaceFor = (surface, mode) => (surface === 'warm' ? WARM_SURFACES : SURFACES)[modeKey(mode)];
