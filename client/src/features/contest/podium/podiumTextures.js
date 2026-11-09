import * as THREE from 'three';
import { inr } from '../contestUtils';
import { COLOR_PALETTE, withAlpha } from '../../../app/design/designTokens';
import { MEDAL } from './podiumConstants';

// Canvas-drawn textures: the podium is plain three.js, so labels and glows are painted on 2D canvases.

export function canvasTex(w, h, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function fitText(c, text, max) {
  let t = String(text || '');
  const full = t;
  while (t.length > 1 && c.measureText(t).width > max) t = t.slice(0, -1);
  return t === full ? t : `${t.trimEnd()}…`;
}

export function glowTexture() {
  return canvasTex(128, 128, (c) => {
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, COLOR_PALETTE.white);
    g.addColorStop(0.25, withAlpha(COLOR_PALETTE.white, 0.55));
    g.addColorStop(1, withAlpha(COLOR_PALETTE.white, 0));
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 128);
  });
}

export function questionTexture(color, dark) {
  return canvasTex(256, 256, (c) => {
    const g = c.createRadialGradient(128, 128, 10, 128, 128, 120);
    g.addColorStop(0, dark ? withAlpha(COLOR_PALETTE.white, 0.18) : withAlpha(COLOR_PALETTE.white, 0.8));
    g.addColorStop(1, withAlpha(COLOR_PALETTE.white, 0));
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
    c.fillStyle = dark ? COLOR_PALETTE.white : color;
    c.font = '900 150px system-ui, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.shadowColor = dark ? color : withAlpha(COLOR_PALETTE.white, 0.95);
    c.shadowBlur = dark ? 30 : 18;
    c.fillText('?', 128, 138);
  });
}

export function winnerTexture(w, dark) {
  const m = MEDAL[w.rank];
  return canvasTex(512, 330, (c, W, H) => {
    roundRect(c, 8, 8, W - 16, H - 16, 38);
    c.shadowColor = dark ? withAlpha(COLOR_PALETTE.black, 0.5) : withAlpha(COLOR_PALETTE.custom.gray6F655B, 0.28);
    c.shadowBlur = 22;
    c.shadowOffsetY = 8;
    c.fillStyle = dark ? withAlpha(COLOR_PALETTE.custom.gray161B22, 0.92) : withAlpha(COLOR_PALETTE.orange[50], 0.9);
    c.fill();
    c.shadowColor = 'transparent';
    c.lineWidth = 3;
    c.strokeStyle = dark ? withAlpha(COLOR_PALETTE.white, 0.14) : COLOR_PALETTE.white;
    c.stroke();

    // vibrant avatar frame
    const g = c.createLinearGradient(30, 36, 142, 148);
    g.addColorStop(0, m.ring[0]);
    g.addColorStop(0.5, m.ring[1]);
    g.addColorStop(1, m.ring[2]);
    c.beginPath();
    c.arc(88, 94, 56, 0, Math.PI * 2);
    c.fillStyle = g;
    c.fill();
    c.beginPath();
    c.arc(88, 94, 46, 0, Math.PI * 2);
    c.fillStyle = dark ? COLOR_PALETTE.gray[800] : COLOR_PALETTE.orange[50];
    c.fill();
    c.fillStyle = dark ? m.ring[0] : m.css2;
    c.font = '800 48px system-ui, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText((w.name || '?')[0].toUpperCase(), 88, 97);

    c.textAlign = 'left';
    c.textBaseline = 'alphabetic';
    c.fillStyle = dark ? COLOR_PALETTE.slate[200] : COLOR_PALETTE.custom.black1A1613;
    c.font = '800 40px system-ui, sans-serif';
    c.fillText(fitText(c, w.name, 330), 164, 88);
    c.fillStyle = dark ? COLOR_PALETTE.gray[400] : COLOR_PALETTE.custom.gray6F655B;
    c.font = '500 26px system-ui, sans-serif';
    c.fillText(fitText(c, `@${w.handle || ''}`, 330), 164, 126);

    // colourful badges: prize / solved, and the rank
    const chip = (x, y, text, bg, fg) => {
      c.font = '800 28px system-ui, sans-serif';
      const tw = c.measureText(text).width + 36;
      roundRect(c, x, y, tw, 48, 24);
      c.fillStyle = bg;
      c.fill();
      c.fillStyle = fg;
      c.textBaseline = 'middle';
      c.fillText(text, x + 18, y + 25);
      c.textBaseline = 'alphabetic';
      return tw;
    };
    let x = 36;
    if (w.prize) x += chip(x, 184, inr(w.prize), dark ? withAlpha(COLOR_PALETTE.amber[400], 0.18) : COLOR_PALETTE.amber[100], dark ? COLOR_PALETTE.amber[300] : COLOR_PALETTE.amber[700]) + 12;
    chip(x, 184, `${w.solved ?? 0} solved`, dark ? withAlpha(COLOR_PALETTE.emerald[400], 0.18) : COLOR_PALETTE.emerald[100], dark ? COLOR_PALETTE.emerald[300] : COLOR_PALETTE.emerald[700]);

    const rg = c.createLinearGradient(36, 250, 300, 300);
    rg.addColorStop(0, m.ring[0]);
    rg.addColorStop(1, m.ring[2]);
    c.fillStyle = rg;
    c.font = '900 64px system-ui, sans-serif';
    c.fillText(`#${w.rank}`, 36, 298);
  });
}
