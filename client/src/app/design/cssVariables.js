import { GAME_SURFACES, REWARD, SEMANTIC } from './designTokens';
import { modeKey } from './modeHelpers';

const toKebab = (name) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

// Game surfaces (Quests, Store) are CSS variables because their dialogs render in a portal, outside the page.
const gameVariables = (mode) =>
  Object.entries(GAME_SURFACES[modeKey(mode)])
    .map(([name, value]) => `--ff-${toKebab(name)}: ${value};`)
    .join(' ');

// Difficulty, pending and reward colours are mode-aware CSS variables so they stay readable in light and dark.
export function rootCssVariables(mode) {
  const status = SEMANTIC[modeKey(mode)];
  return `:root { --jc-easy: ${status.success}; --jc-medium: ${status.warning}; --jc-hard: ${status.error}; --jc-pending: ${status.pending}; --jc-reward: ${REWARD[modeKey(mode)]}; ${gameVariables(mode)} }`;
}
