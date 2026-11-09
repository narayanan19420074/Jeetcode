import { COLOR_PALETTE } from '../../../../app/design/designTokens';

// Level map. Follows the app theme (dark / light) and the product palette:
// slate surfaces, blue = current, green = cleared. A slim road winds through
// the levels; the learner's alien walks it from START to the current level.
// Geometry is in real pixels (measured width) so nothing is stretched.

export const ROW = 184;
export const TOP = 270;
export const BOTTOM = 90;
export const AMP = 0.16;
export const NODE = 72;

// Desktop keeps the roomy layout with big label cards. Phones get a compact,
// Candy-Crush style map: small nodes, a road that swings almost edge to edge,
// and a short row height so many levels fit on one screen.
export const DESKTOP = { ROW, TOP, BOTTOM, AMP, NODE, TURN: Math.PI / 2 };
export const MOBILE = { ROW: 128, TOP: 96, BOTTOM: 96, AMP: 0.3, NODE: 64, TURN: Math.PI / 3 };

// Phone map colours are the same solid colours as the level cards on the dashboard:
// green = cleared, orange = open (locked levels are the same orange, faded, with a lock).
export const PHONE_STATE = {
  completed: { fg: COLOR_PALETTE.custom.emerald22A06B, bg: COLOR_PALETTE.green[50] },
  current: { fg: COLOR_PALETTE.custom.amberF09A2E, bg: COLOR_PALETTE.orange[50] },
  locked: { fg: COLOR_PALETTE.custom.amberF09A2E, bg: COLOR_PALETTE.orange[50] },
};
export const PHONE_STAR = COLOR_PALETTE.custom.amberF2B63C;
export const PHONE_ALIEN = 96; // px, the alien beside the current level

// `dir` is 1 when the road runs downwards from START and -1 when it climbs from the bottom (compact map).
export function roadPath(pts, W, g, sy, dir = 1) {
  if (!pts.length) return '';
  const sx = W * 0.14;
  const f = pts[0];
  let d = `M ${sx} ${sy} L ${f.x - W * 0.1} ${sy} C ${f.x} ${sy}, ${f.x} ${f.y - (dir * g.ROW) / 2}, ${f.x} ${f.y}`;
  for (let i = 1; i < pts.length; i += 1) {
    const a = pts[i - 1];
    const b = pts[i];
    d += ` C ${a.x} ${a.y + (dir * g.ROW) / 2}, ${b.x} ${b.y - (dir * g.ROW) / 2}, ${b.x} ${b.y}`;
  }
  return d;
}

// Labels go on the side the road is NOT using.
export function labelRight(pts, i, W) {
  const x = pts[i].x;
  if (Math.abs(x - W / 2) > 2) return x > W / 2;
  const ref = pts[i + 1] ?? pts[i - 1];
  if (!ref) return true;
  return ref.x < x;
}
