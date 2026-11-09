// Layout constants (px) for Blip's floating stage.
export const CANCEL = Symbol('teach-cancel');
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const MUTE_KEY = 'jeetcode-teach-muted';
export const BLIP = 124;
export const BUBBLE_W = 300;
export const MARGIN = 12;
export const PAD = 8;
export const TOP_SAFE = 72; // keeps Blip clear of the site navbar
export const BOTTOM_SAFE = 72; // ...and of the control pill

export const readMuted = () => {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
};
export const writeMuted = (v) => {
  try { localStorage.setItem(MUTE_KEY, v ? '1' : '0'); } catch { /* storage unavailable */ }
};
