import * as THREE from 'three';
import { COLOR_PALETTE, withAlpha } from '../../../../app/design/designTokens';

/* ------------------------------ textures ------------------------------ */
export const cvs = (w, h = w) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
};
export const rnd = (i, s = 1) => {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function softTexture() {
  const [c, g] = cvs(64);
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, COLOR_PALETTE.white);
  r.addColorStop(0.4, withAlpha(COLOR_PALETTE.white, 0.45));
  r.addColorStop(1, withAlpha(COLOR_PALETTE.white, 0));
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function starSkin() {
  const [c, g] = cvs(256);
  const grad = g.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, COLOR_PALETTE.indigo[800]);
  grad.addColorStop(0.5, COLOR_PALETTE.custom.violet150F5C);
  grad.addColorStop(1, COLOR_PALETTE.violet[900]);
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 26; i += 1) {
    const x = rnd(i, 1) * 256;
    const y = rnd(i, 2) * 256;
    const r = 18 + rnd(i, 3) * 40;
    const n = g.createRadialGradient(x, y, 0, x, y, r);
    n.addColorStop(0, i % 2 ? withAlpha(COLOR_PALETTE.cyan[300], .22) : withAlpha(COLOR_PALETTE.purple[400], .25));
    n.addColorStop(1, withAlpha(COLOR_PALETTE.black, 0));
    g.fillStyle = n;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 150; i += 1) {
    g.fillStyle = i % 8 === 0 ? COLOR_PALETTE.amber[200] : COLOR_PALETTE.white;
    g.globalAlpha = 0.5 + rnd(i, 5) * 0.5;
    g.beginPath();
    g.arc(rnd(i, 6) * 256, rnd(i, 7) * 256, 0.6 + rnd(i, 8) * 1.4, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function magmaSkin() {
  const [c, g] = cvs(256);
  g.fillStyle = COLOR_PALETTE.custom.black2A1815;
  g.fillRect(0, 0, 256, 256);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (let k = 0; k < 16; k += 1) {
    let x = rnd(k, 1) * 256;
    let y = rnd(k, 2) * 256;
    g.beginPath();
    g.moveTo(x, y);
    for (let s = 0; s < 6; s += 1) {
      x += (rnd(k * 9 + s, 3) - 0.5) * 70;
      y += (rnd(k * 9 + s, 4) - 0.5) * 70;
      g.lineTo(x, y);
    }
    g.strokeStyle = withAlpha(COLOR_PALETTE.orange[500], .28);
    g.lineWidth = 9;
    g.stroke();
    g.strokeStyle = COLOR_PALETTE.custom.amberFFB23A;
    g.lineWidth = 2.6;
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
