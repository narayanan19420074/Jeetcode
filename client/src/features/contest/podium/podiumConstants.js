import { COLOR_PALETTE } from '../../../app/design/designTokens';

// Medal colours per podium rank; shared by the 3D textures and the scene so a rank always looks the same.
export const MEDAL = {
  1: { css: COLOR_PALETTE.amber[500], css2: COLOR_PALETTE.amber[700], hex: 0xfbbf24, dark: COLOR_PALETTE.white, ring: [COLOR_PALETTE.amber[200], COLOR_PALETTE.amber[500], COLOR_PALETTE.orange[600]] },
  2: { css: COLOR_PALETTE.slate[500], css2: COLOR_PALETTE.slate[600], hex: 0xcbd5e1, dark: COLOR_PALETTE.white, ring: [COLOR_PALETTE.slate[100], COLOR_PALETTE.slate[400], COLOR_PALETTE.slate[500]] },
  3: { css: COLOR_PALETTE.orange[500], css2: COLOR_PALETTE.orange[700], hex: 0xfb923c, dark: COLOR_PALETTE.white, ring: [COLOR_PALETTE.orange[300], COLOR_PALETTE.orange[500], COLOR_PALETTE.orange[700]] },
};
export const SLOTS = { 1: { x: 0, h: 2.5, delay: 1.5 }, 2: { x: -1.95, h: 1.85, delay: 0.9 }, 3: { x: 1.95, h: 1.35, delay: 0.3 } };
export const LOCKED = 0.3;
export const SPARK_COLORS = [0xf59e0b, 0x6366f1, 0xef6c4d, 0xfbbf24, 0x10b981, 0xf97316];

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const easeOutBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
