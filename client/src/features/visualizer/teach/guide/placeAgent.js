import { MARGIN, PAD, TOP_SAFE, BOTTOM_SAFE } from './guideConstants';

/* Where should Blip hover so he is next to the target but never on top of it? */
export function placeAgent(rect, size, vw, vh) {
  const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const maxX = Math.max(MARGIN, vw - size.w - MARGIN);
  const maxY = Math.max(TOP_SAFE, vh - size.h - BOTTOM_SAFE);
  const corners = [
    { x: maxX, y: maxY },
    { x: MARGIN, y: maxY },
    { x: maxX, y: TOP_SAFE },
    { x: MARGIN, y: TOP_SAFE },
  ];
  if (!rect) return corners[0];

  const t = { left: rect.left - PAD, top: rect.top - PAD, right: rect.right + PAD, bottom: rect.bottom + PAD };
  const cx = cl(rect.left + rect.width / 2 - size.w / 2, MARGIN, maxX);
  const cy = cl(rect.top + rect.height / 2 - size.h / 2, TOP_SAFE, maxY);
  const near = [
    { x: cx, y: t.bottom + 6 },
    { x: cx, y: t.top - 6 - size.h },
    { x: t.right + 8, y: cy },
    { x: t.left - 8 - size.w, y: cy },
  ];
  const big = rect.width * rect.height > vw * vh * 0.22;
  const candidates = big ? [...corners, ...near] : [...near, ...corners];

  const fits = (p) => p.x >= MARGIN - 0.5 && p.y >= TOP_SAFE - 0.5 && p.x <= maxX + 0.5 && p.y <= maxY + 0.5;
  const overlap = (p) => {
    const ox = Math.max(0, Math.min(p.x + size.w, t.right) - Math.max(p.x, t.left));
    const oy = Math.max(0, Math.min(p.y + size.h, t.bottom) - Math.max(p.y, t.top));
    return ox * oy;
  };
  let best = null;
  for (const p of candidates) {
    if (!fits(p)) continue;
    const o = overlap(p);
    if (o === 0) return p;
    if (!best || o < best.o) best = { p, o };
  }
  return best ? best.p : corners[0];
}
