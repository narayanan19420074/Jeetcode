import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { inr } from './contestUtils';

// 3D glass podium. Locked until `revealed` turns true, then: fireworks, blocks rise 3rd -> 2nd -> 1st,
// winner plates pop in, trophy spins. Drag sideways to turn it. Plain three.js (no extra packages).

const MEDAL = {
  1: { css: '#F59E0B', css2: '#EA580C', hex: 0xfbbf24, dark: '#FFFFFF', ring: ['#FF9A3C', '#FF3D81', '#7C4DFF'] },
  2: { css: '#6366F1', css2: '#4338CA', hex: 0xa5b4fc, dark: '#FFFFFF', ring: ['#22D3EE', '#6366F1', '#A855F7'] },
  3: { css: '#F97316', css2: '#C2410C', hex: 0xfb923c, dark: '#FFFFFF', ring: ['#34D399', '#22D3EE', '#3B82F6'] },
};
const SLOTS = { 1: { x: 0, h: 2.5, delay: 1.5 }, 2: { x: -1.95, h: 1.85, delay: 0.9 }, 3: { x: 1.95, h: 1.35, delay: 0.3 } };
const LOCKED = 0.3;
const SPARK_COLORS = [0xf59e0b, 0x8b5cf6, 0x06b6d4, 0xec4899, 0x10b981, 0xf97316];

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOutBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

function canvasTex(w, h, draw) {
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

function glowTexture() {
  return canvasTex(128, 128, (c) => {
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 128);
  });
}

function questionTexture(color) {
  return canvasTex(256, 256, (c) => {
    const g = c.createRadialGradient(128, 128, 10, 128, 128, 120);
    g.addColorStop(0, 'rgba(255,255,255,0.8)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
    c.fillStyle = color;
    c.font = '900 150px system-ui, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.shadowColor = 'rgba(255,255,255,0.95)';
    c.shadowBlur = 18;
    c.fillText('?', 128, 138);
  });
}

function winnerTexture(w) {
  const m = MEDAL[w.rank];
  return canvasTex(512, 330, (c, W, H) => {
    roundRect(c, 8, 8, W - 16, H - 16, 38);
    c.shadowColor = 'rgba(99,102,241,0.35)';
    c.shadowBlur = 22;
    c.shadowOffsetY = 8;
    c.fillStyle = 'rgba(255,255,255,0.86)';
    c.fill();
    c.shadowColor = 'transparent';
    c.lineWidth = 3;
    c.strokeStyle = 'rgba(255,255,255,1)';
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
    c.fillStyle = '#F8FAFF';
    c.fill();
    c.fillStyle = m.css2;
    c.font = '800 48px system-ui, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText((w.name || '?')[0].toUpperCase(), 88, 97);

    c.textAlign = 'left';
    c.textBaseline = 'alphabetic';
    c.fillStyle = '#1E1B4B';
    c.font = '800 40px system-ui, sans-serif';
    c.fillText(fitText(c, w.name, 330), 164, 88);
    c.fillStyle = '#64748B';
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
    if (w.prize) x += chip(x, 184, inr(w.prize), '#FEF3C7', '#B45309') + 12;
    chip(x, 184, `${w.solved ?? 0} solved`, '#D1FAE5', '#047857');

    const rg = c.createLinearGradient(36, 250, 300, 300);
    rg.addColorStop(0, m.ring[0]);
    rg.addColorStop(1, m.ring[2]);
    c.fillStyle = rg;
    c.font = '900 64px system-ui, sans-serif';
    c.fillText(`#${w.rank}`, 36, 298);
  });
}

function createFireworks(scene, glow) {
  let time = 0;
  const queue = [];
  const rockets = [];
  const bursts = [];

  const spawnRocket = (o) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: o.color, transparent: true, depthWrite: false, blending: THREE.NormalBlending }));
    s.scale.setScalar(0.38);
    s.position.set(o.x, -0.2, -0.6);
    scene.add(s);
    rockets.push({ s, vy: 7 + Math.random() * 1.4, target: o.y, color: o.color, big: Boolean(o.big) });
  };

  const explode = (x, y, z, color, big) => {
    const n = big ? 150 : 80;
    const pos = new Float32Array(n * 3);
    const vel = new Float32Array(n * 3);
    for (let i = 0; i < n; i += 1) {
      const u = Math.random() * 2 - 1;
      const th = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      const sp = (big ? 2.7 : 2.1) * (0.55 + Math.random() * 0.6);
      vel[i * 3] = r * Math.cos(th) * sp;
      vel[i * 3 + 1] = u * sp;
      vel[i * 3 + 2] = r * Math.sin(th) * sp;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ map: glow, color, size: big ? 0.4 : 0.3, transparent: true, depthWrite: false, blending: THREE.NormalBlending, opacity: 1 });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    scene.add(pts);
    bursts.push({ pts, vel, age: 0, life: big ? 2.3 : 1.8 });
  };

  return {
    schedule(delay, o) {
      queue.push({ at: time + delay, o });
    },
    update(dt) {
      time += dt;
      for (let i = queue.length - 1; i >= 0; i -= 1) {
        if (queue[i].at <= time) {
          spawnRocket(queue[i].o);
          queue.splice(i, 1);
        }
      }
      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const r = rockets[i];
        r.s.position.y += r.vy * dt;
        r.vy *= 0.992;
        if (r.s.position.y >= r.target) {
          explode(r.s.position.x, r.s.position.y, r.s.position.z, r.color, r.big);
          scene.remove(r.s);
          r.s.material.dispose();
          rockets.splice(i, 1);
        }
      }
      for (let i = bursts.length - 1; i >= 0; i -= 1) {
        const b = bursts[i];
        b.age += dt;
        const attr = b.pts.geometry.attributes.position;
        const arr = attr.array;
        const drag = 1 - 0.9 * dt;
        for (let j = 0; j < b.vel.length; j += 3) {
          b.vel[j + 1] -= 2.4 * dt;
          b.vel[j] *= drag;
          b.vel[j + 1] *= drag;
          b.vel[j + 2] *= drag;
          arr[j] += b.vel[j] * dt;
          arr[j + 1] += b.vel[j + 1] * dt;
          arr[j + 2] += b.vel[j + 2] * dt;
        }
        attr.needsUpdate = true;
        b.pts.material.opacity = Math.max(0, 1 - Math.pow(b.age / b.life, 1.6));
        if (b.age >= b.life) {
          scene.remove(b.pts);
          b.pts.geometry.dispose();
          b.pts.material.dispose();
          bursts.splice(i, 1);
        }
      }
    },
  };
}

function buildTrophy() {
  const gold = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 1, roughness: 0.2, emissive: 0x7a4a00, emissiveIntensity: 0.35 });
  const profile = [[0, 0], [0.36, 0], [0.36, 0.06], [0.16, 0.12], [0.1, 0.2], [0.1, 0.45], [0.28, 0.58], [0.4, 0.9], [0.36, 0.98], [0, 0.98]].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 32), gold));
  [-1, 1].forEach((side) => {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 20, Math.PI), gold);
    handle.position.set(side * 0.4, 0.72, 0);
    handle.rotation.z = side * (Math.PI / 2) * -1;
    g.add(handle);
  });
  return g;
}

function buildScene(host, winners, { reveal: startRevealed, reduce }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  const el = renderer.domElement;
  el.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab';
  host.appendChild(el);

  const scene = new THREE.Scene();
  // soft pastel backdrop. (An opaque background also keeps the glass visible: transmission needs something behind it.)
  scene.background = canvasTex(4, 256, (c, W, H) => {
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#F5F3FF');
    g.addColorStop(0.55, '#E8EDFF');
    g.addColorStop(1, '#FCE7F3');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  });
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envRT = pmrem.fromScene(room, 0.04);
  scene.environment = envRT.texture;
  room.dispose?.();
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
  const stage = new THREE.Group();
  scene.add(stage);

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(2, 6, 5);
  scene.add(key);
  const violet = new THREE.PointLight(0xa78bfa, 60, 0, 2);
  violet.position.set(-3.5, 3, 3);
  scene.add(violet);
  const amber = new THREE.PointLight(0xfbbf24, 70, 0, 2);
  amber.position.set(3.5, 4, 3);
  scene.add(amber);

  const glow = glowTexture();

  // floor: dark disc, two neon rings, soft glow
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(4.3, 4.5, 0.12, 72), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.3 }));
  floor.position.y = -0.06;
  stage.add(floor);
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(4.3, 0.03, 12, 120), new THREE.MeshBasicMaterial({ color: 0xf472b6, toneMapped: false }));
  ringA.rotation.x = Math.PI / 2;
  ringA.position.y = 0.01;
  stage.add(ringA);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.02, 12, 120), new THREE.MeshBasicMaterial({ color: 0x8b5cf6, toneMapped: false }));
  ringB.rotation.x = Math.PI / 2;
  ringB.position.y = 0.01;
  stage.add(ringB);
  const floorGlow = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ map: glow, color: 0xa78bfa, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.NormalBlending }));
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.y = 0.02;
  stage.add(floorGlow);

  // drifting dust
  const DUST = 80;
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i += 1) {
    dustPos[i * 3] = (Math.random() - 0.5) * 10;
    dustPos[i * 3 + 1] = Math.random() * 5.5;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: glow, color: 0x8b5cf6, size: 0.1, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.NormalBlending }));
  dust.frustumCulled = false;
  scene.add(dust);

  // podium blocks
  const slots = [];
  const empty = winners.length === 0; // no finished contest yet: an empty glass podium
  [1, 2, 3].forEach((rank) => {
    const w = winners.find((x) => x.rank === rank) || null;
    const cfg = SLOTS[rank];
    const m = MEDAL[rank];
    if (!cfg) return;
    const { h } = cfg;
    const group = new THREE.Group();
    group.position.x = cfg.x;
    stage.add(group);

    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.06, transmission: 1, thickness: 1.6, ior: 1.45,
      attenuationColor: new THREE.Color(m.hex), attenuationDistance: 1.8, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.4,
    });
    const block = new THREE.Mesh(new RoundedBoxGeometry(1.7, h, 1.7, 5, 0.09).translate(0, h / 2, 0), glass);
    // glowing light column inside the glass
    const core = new THREE.Mesh(
      new RoundedBoxGeometry(0.5, h * 0.86, 0.5, 3, 0.05).translate(0, h * 0.5, 0),
      new THREE.MeshStandardMaterial({ color: m.hex, emissive: m.hex, emissiveIntensity: 0.55, roughness: 0.5 }),
    );
    block.add(core);
    group.add(block);

    const cap = new THREE.Mesh(new RoundedBoxGeometry(1.55, 0.07, 1.55, 2, 0.03), new THREE.MeshBasicMaterial({ color: m.hex, toneMapped: false }));
    group.add(cap);

    let label = null;
    if (w) {
      label = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, (1.5 * 330) / 512),
        new THREE.MeshBasicMaterial({ map: winnerTexture({ ...w, rank }), transparent: true, depthWrite: false, toneMapped: false }),
      );
      label.position.set(0, h * 0.5, 0.88);
      label.visible = false;
      group.add(label);
    }

    const q = new THREE.Sprite(new THREE.SpriteMaterial({ map: questionTexture(m.css), transparent: true, depthWrite: false, toneMapped: false }));
    q.scale.setScalar(1.1);
    group.add(q);

    q.visible = !empty;
    slots.push({ rank, cfg, h, block, cap, label, q, phase: rank * 1.7, winner: w });
  });

  // trophy + orbiting parts for the champion
  const first = slots.find((s) => s.rank === 1);
  let trophy = null;
  let orbit = null;
  if (first && first.winner) {
    trophy = buildTrophy();
    trophy.visible = false;
    first.group = first.block.parent;
    first.group.add(trophy);
    orbit = new THREE.Group();
    orbit.visible = false;
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.85, toneMapped: false });
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.012, 8, 90), ringMat);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.012, 8, 90), ringMat);
    orbit.add(r1, r2);
    const orbs = [0, 1, 2].map(() => {
      const o = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xf59e0b, transparent: true, depthWrite: false, blending: THREE.NormalBlending }));
      o.scale.setScalar(0.4);
      orbit.add(o);
      return o;
    });
    first.group.add(orbit);
    first.r1 = r1;
    first.r2 = r2;
    first.orbs = orbs;
  }

  const fw = createFireworks(scene, glow);

  // state
  let elapsed = 0;
  let revealAt = null;
  let revealed = false;
  let visible = true;
  let raf = 0;
  let target = 0;
  let dragging = false;
  let lastX = 0;

  const reveal = (instant) => {
    if (revealed) return;
    revealed = true;
    revealAt = instant ? elapsed - 20 : elapsed;
    if (instant) return;
    for (let i = 0; i < 14; i += 1) {
      fw.schedule(i * 0.16, { x: (Math.random() - 0.5) * 8, y: 3.2 + Math.random() * 1.4, color: SPARK_COLORS[i % SPARK_COLORS.length] });
    }
    for (let i = 0; i < 5; i += 1) {
      fw.schedule(1.9 + i * 0.1, { x: -2.6 + i * 1.3, y: 3.6 + (i % 2) * 0.7, color: 0xf59e0b, big: true });
    }
  };
  if (empty) {
    revealed = true;
    revealAt = 0; // blocks rise on their own, no fireworks, no plates
  } else if (startRevealed) reveal(true);

  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const dist = Math.max(8, 4 / (Math.tan((camera.fov * Math.PI) / 360) * camera.aspect));
    camera.position.set(0, 2.9, dist);
    camera.lookAt(0, 1.7, 0);
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  io.observe(host);

  const down = (e) => {
    dragging = true;
    lastX = e.clientX;
    el.setPointerCapture?.(e.pointerId);
    el.style.cursor = 'grabbing';
  };
  const move = (e) => {
    if (!dragging) return;
    target = Math.min(0.75, Math.max(-0.75, target + (e.clientX - lastX) * 0.008));
    lastX = e.clientX;
  };
  const up = () => {
    dragging = false;
    el.style.cursor = 'grab';
  };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);

  let last = performance.now();
  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || document.hidden) return;
    elapsed += dt;
    const t = elapsed;
    const rt = revealAt == null ? -1 : t - revealAt;

    const sway = dragging || reduce ? 0 : Math.sin(t * 0.45) * 0.1;
    stage.rotation.y += (target + sway - stage.rotation.y) * Math.min(1, dt * 8);

    ringA.rotation.z = reduce ? 0 : t * 0.15;
    ringB.rotation.z = reduce ? 0 : -t * 0.22;
    if (!reduce) {
      const arr = dustGeo.attributes.position.array;
      for (let i = 1; i < arr.length; i += 3) {
        arr[i] += dt * 0.12;
        if (arr[i] > 5.5) arr[i] = 0;
      }
      dustGeo.attributes.position.needsUpdate = true;
    }

    slots.forEach((s) => {
      const grow = rt < 0 ? 0 : easeOutBack(clamp01((rt - s.cfg.delay) / 0.9));
      const sy = Math.max(0.05, LOCKED + (1 - LOCKED) * grow);
      s.block.scale.y = sy;
      s.cap.position.y = s.h * sy + 0.12 + Math.sin(t * 1.6 + s.phase) * 0.04;
      s.cap.rotation.y = t * 0.4;

      if (s.label) {
        const pop = rt < 0 ? 0 : clamp01((rt - s.cfg.delay - 0.8) / 0.5);
        s.label.visible = pop > 0;
        s.label.scale.setScalar(Math.max(0.001, easeOutBack(pop)));
      }

      const qs = empty ? 0 : rt < 0 ? 1 : Math.max(0, 1 - rt * 3);
      s.q.visible = qs > 0.01;
      s.q.scale.setScalar(1.1 * qs);
      s.q.position.y = s.h * sy + 0.85 + Math.sin(t * 2 + s.phase) * 0.08;
    });

    if (first && trophy) {
      const tp = rt < 0 ? 0 : clamp01((rt - first.cfg.delay - 0.7) / 0.6);
      trophy.visible = tp > 0;
      trophy.scale.setScalar(Math.max(0.001, easeOutBack(tp)) * 0.85);
      trophy.position.y = first.cap.position.y + 0.06;
      trophy.rotation.y = t * 1.2;
      orbit.visible = tp > 0.9;
      orbit.position.y = trophy.position.y + 0.55;
      first.r1.rotation.x = t * 0.7;
      first.r2.rotation.y = t * 0.9;
      first.r2.rotation.x = Math.PI / 3;
      first.orbs.forEach((o, i) => {
        const a = t * 1.5 + i * 2.094;
        o.position.set(Math.cos(a) * 1.15, Math.sin(a * 1.3) * 0.25, Math.sin(a) * 1.15);
      });
    }

    fw.update(dt);
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(tick);

  return {
    reveal: () => reveal(Boolean(reduce)),
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((mt) => {
          Object.values(mt).forEach((v) => v && v.isTexture && v.dispose());
          mt.dispose();
        });
      });
      glow.dispose();
      envRT.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
      if (el.parentNode === host) host.removeChild(el);
    },
  };
}

export default function PodiumScene({ winners, revealed, reduce = false, onFail }) {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const revealedRef = useRef(revealed);

  useEffect(() => {
    let api = null;
    try {
      api = buildScene(hostRef.current, winners, { reveal: revealedRef.current, reduce });
    } catch {
      onFail?.();
      return undefined;
    }
    apiRef.current = api;
    return () => {
      api.dispose();
      apiRef.current = null;
    };
  }, [winners, reduce, onFail]);

  useEffect(() => {
    revealedRef.current = revealed;
    if (revealed) apiRef.current?.reveal();
  }, [revealed]);

  return <div ref={hostRef} role="img" aria-label="3D winners podium. Drag sideways to turn it." style={{ width: '100%', height: '100%' }} />;
}
