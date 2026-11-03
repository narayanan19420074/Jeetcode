import { ACCENTS, BRAND_PALETTE, SURFACES } from './design/designTokens';
import { buildTheme } from './design/buildTheme';

// Public entry of the theme. Every value comes from app/design/designTokens.js (the single source of truth);
// this file only keeps the long-standing import paths working.

export { ACCENTS };
export const getTheme = buildTheme;
export const jcTokens = SURFACES;
export const gpayTokens = SURFACES; // old name, kept so existing imports keep working

// Streak / XP / badge colour (use sparingly). The CSS variable is defined by the theme and is mode-aware.
export const rewardColor = 'var(--jc-reward)';

const DIFFICULTY_COLORS = { Easy: 'var(--jc-easy)', Medium: 'var(--jc-medium)', Hard: 'var(--jc-hard)' };
export const difficultyColor = (difficulty) => DIFFICULTY_COLORS[difficulty] ?? 'var(--jc-pending)';

export default BRAND_PALETTE;
