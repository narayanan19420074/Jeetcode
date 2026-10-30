import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Box } from '@mui/material';
import AlienWalker from './AlienWalker';

// Real-time 3D mascots (three.js). Five ORIGINAL characters that evolve with
// the learner's XP:
//   blip      — a glossy glowing orb with big eyes (hops, floats)
//   zapp      — a speedster with swept quills, gloves and sneakers; sparks
//   ember     — a fire elemental: flame mane, magma cracks, burning fists
//   crystalix — a faceted crystal golem with a gem crown
//   nova      — a cosmic hero: star-field body, halo, orbit rings, star dust
// Cartoon proportions (big head, big eyes, big gloves and shoes), glossy PBR
// materials lit by an image-based environment, squash & stretch, particles.
// Falls back to a 2D sprite when WebGL is unavailable.

const FORMS = {
  blip: { skin: 0x34d399, belly: 0xd1fae5, glove: 0xffffff, shoe: 0x059669, accent: 0x6ee7b7, iris: 0x065f46, glow: 0x34d399 },
  zapp: { skin: 0x22d3ee, belly: 0xe0fbff, glove: 0xffffff, shoe: 0xf43f5e, accent: 0xfacc15, iris: 0x0e7490, glow: 0x22d3ee },
  ember: { skin: 0x2b1a17, belly: 0x4a2a20, glove: 0x2b1a17, shoe: 0x2b1a17, accent: 0xfb923c, iris: 0xfbbf24, glow: 0xfb923c },
  crystalix: { skin: 0x5cc8f5, belly: 0xcdeefc, glove: 0xe0f7ff, shoe: 0x2a8bc7, accent: 0xbae6fd, iris: 0x0369a1, glow: 0x7dd3fc },
  nova: { skin: 0x1a1550, belly: 0x2e2a8a, glove: 0xfde68a, shoe: 0x6d28d9, accent: 0xa78bfa, iris: 0x22d3ee, glow: 0xa78bfa },
};

// Brand tone (phone aptitude map): the green Blip wears the logo's bright orange instead.
const BRAND_BLIP = { skin: 0xf7a33b, belly: 0xffedd5, glove: 0xffffff, shoe: 0xe8590c, accent: 0xffc27a, iris: 0x7c2d12, glow: 0xf7a33b };

/* ------------------------------ textures ------------------------------ */
const cvs = (w, h = w) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
};
const rnd = (i, s = 1) => {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function softTexture() {
  const [c, g] = cvs(64);
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.4, 'rgba(255,255,255,0.45)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function starSkin() {
  const [c, g] = cvs(256);
  const grad = g.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#2b2b9a');
  grad.addColorStop(0.5, '#150f5c');
  grad.addColorStop(1, '#4a1a8a');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 26; i += 1) {
    const x = rnd(i, 1) * 256;
    const y = rnd(i, 2) * 256;
    const r = 18 + rnd(i, 3) * 40;
    const n = g.createRadialGradient(x, y, 0, x, y, r);
    n.addColorStop(0, i % 2 ? 'rgba(103,232,249,.22)' : 'rgba(192,132,252,.25)');
    n.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = n;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 150; i += 1) {
    g.fillStyle = i % 8 === 0 ? '#fde68a' : '#fff';
    g.globalAlpha = 0.5 + rnd(i, 5) * 0.5;
    g.beginPath();
    g.arc(rnd(i, 6) * 256, rnd(i, 7) * 256, 0.6 + rnd(i, 8) * 1.4, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function magmaSkin() {
  const [c, g] = cvs(256);
  g.fillStyle = '#2a1815';
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
    g.strokeStyle = 'rgba(255,120,30,.28)';
    g.lineWidth = 9;
    g.stroke();
    g.strokeStyle = '#ffb23a';
    g.lineWidth = 2.6;
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* -------------------------------- build -------------------------------- */
function buildMascot(kind, brand = false) {
  const f = brand && kind === 'blip' ? BRAND_BLIP : FORMS[kind] ?? FORMS.blip;
  const disposables = [];
  const track = (o) => {
    disposables.push(o);
    return o;
  };
  const soft = track(softTexture());
  const crystal = kind === 'crystalix';

  const phys = (color, o = {}) => track(new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, metalness: 0.05, clearcoat: 0.6, clearcoatRoughness: 0.25, ...o }));
  const glow = (c, i = 2) => track(new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.4 }));
  const basic = (c) => track(new THREE.MeshBasicMaterial({ color: c }));

  let skinTex = null;
  if (kind === 'nova') skinTex = track(starSkin());
  if (kind === 'ember') skinTex = track(magmaSkin());
  const skin = phys(skinTex ? 0xffffff : f.skin, {
    map: skinTex,
    emissiveMap: kind === 'ember' ? skinTex : null,
    emissive: kind === 'ember' ? 0xff7a1a : kind === 'nova' ? 0x2a2aa0 : crystal ? 0x1d6fa0 : 0x000000,
    emissiveIntensity: kind === 'ember' ? 0.75 : kind === 'nova' ? 0.5 : crystal ? 0.3 : 0,
    roughness: crystal ? 0.12 : kind === 'ember' ? 0.7 : 0.35,
    clearcoat: crystal ? 1 : 0.7,
    flatShading: crystal,
  });
  const belly = phys(f.belly, { roughness: 0.55, clearcoat: 0.3, flatShading: crystal, emissive: kind === 'nova' ? 0x2a2aa0 : 0x000000, emissiveIntensity: 0.4 });
  const gloveMat = phys(f.glove, { roughness: 0.45, flatShading: crystal });
  const shoeMat = phys(f.shoe, { roughness: 0.3, clearcoat: 1, flatShading: crystal, emissive: kind === 'ember' ? 0xff5a00 : 0x000000, emissiveIntensity: kind === 'ember' ? 0.35 : 0 });
  const soleMat = phys(kind === 'ember' ? 0xff8a1a : 0xffffff, { roughness: 0.6, emissive: kind === 'ember' ? 0xff6a00 : 0x000000, emissiveIntensity: kind === 'ember' ? 1.4 : 0 });
  const eyeWhite = phys(kind === 'ember' ? 0xfff1c2 : 0xffffff, { roughness: 0.12, clearcoat: 1, emissive: kind === 'ember' ? 0xffb347 : 0x000000, emissiveIntensity: kind === 'ember' ? 0.9 : 0 });
  const irisMat = phys(f.iris, { roughness: 0.2, clearcoat: 1 });
  const ink = basic(0x0b1020);
  const white = basic(0xffffff);

  const mesh = (parent, geo, material, pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0]) => {
    const m = new THREE.Mesh(track(geo), material);
    m.position.set(...pos);
    m.scale.set(...scale);
    m.rotation.set(...rot);
    parent.add(m);
    return m;
  };
  const sprite = (parent, color, size, pos, opacity = 0.9) => {
    const s = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: soft, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })));
    s.scale.set(size, size, 1);
    s.position.set(...pos);
    parent.add(s);
    return s;
  };

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const rig = { root, body, eyes: [], pulse: [], flames: [], spin: [], emitters: [], legs: null, arms: null, head: null, torso: null, orb: null, orbit: null, sparks: null, mouth: null, blipMouth: null };

  const makeEye = (parent, x, y, z, s) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = x * 0.35;
    mesh(g, new THREE.SphereGeometry(0.3, 28, 20), eyeWhite, [0, 0, 0], [1, 1.3, 0.62]);
    mesh(g, new THREE.SphereGeometry(0.17, 22, 16), irisMat, [0, -0.02, 0.13], [1, 1.2, 0.5]);
    mesh(g, new THREE.SphereGeometry(0.095, 16, 12), ink, [0, -0.02, 0.2], [1, 1.2, 0.5]);
    mesh(g, new THREE.SphereGeometry(0.05, 10, 8), white, [-0.07, 0.07, 0.25]);
    mesh(g, new THREE.SphereGeometry(0.022, 8, 6), white, [0.06, -0.07, 0.24]);
    g.scale.setScalar(s);
    parent.add(g);
    rig.eyes.push(g);
    return g;
  };

  const emitter = (parent, { count, color, size, life, spread, up, speed = 0.4, origin = [0, 0, 0], drift = 0 }) => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const age = new Float32Array(count);
    const max = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      age[i] = rnd(i, 9) * life;
      max[i] = life * (0.6 + rnd(i, 10) * 0.6);
      pos[i * 3] = origin[0];
      pos[i * 3 + 1] = origin[1];
      pos[i * 3 + 2] = origin[2];
    }
    const geo = track(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = track(new THREE.PointsMaterial({ map: soft, color, size, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    parent.add(pts);
    let n = 0;
    rig.emitters.push({
      update(dt, trail) {
        for (let i = 0; i < count; i += 1) {
          age[i] += dt;
          if (age[i] > max[i]) {
            n += 1;
            age[i] = 0;
            pos[i * 3] = origin[0] + (rnd(n + i, 11) - 0.5) * spread;
            pos[i * 3 + 1] = origin[1] + (rnd(n + i, 12) - 0.5) * spread * 0.4;
            pos[i * 3 + 2] = origin[2] + (rnd(n + i, 13) - 0.5) * spread;
            vel[i * 3] = (rnd(n + i, 14) - 0.5) * speed;
            vel[i * 3 + 1] = up * (0.6 + rnd(n + i, 15) * 0.8);
            vel[i * 3 + 2] = (rnd(n + i, 16) - 0.5) * speed;
          }
          pos[i * 3] += vel[i * 3] * dt;
          pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
          pos[i * 3 + 2] += (vel[i * 3 + 2] - drift * trail) * dt;
        }
        geo.attributes.position.needsUpdate = true;
      },
    });
  };

  if (kind === 'blip') {
    /* ---------------- orb ---------------- */
    const orb = new THREE.Group();
    orb.position.set(0, 1.55, 0);
    body.add(orb);
    rig.orb = orb;
    mesh(orb, new THREE.SphereGeometry(1.0, 48, 32), phys(f.skin, { roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, emissive: f.glow, emissiveIntensity: 0.25 }));
    const core = mesh(orb, new THREE.SphereGeometry(0.62, 32, 24), glow(0xbbf7d0, 1.2));
    core.material.transparent = true;
    core.material.opacity = 0.5;
    rig.pulse.push(core);
    sprite(orb, f.glow, 3.6, [0, 0, -0.1], 0.5);
    [-1, 1].forEach((s) => {
      const eye = new THREE.Group();
      eye.position.set(s * 0.36, 0.12, 0.84);
      mesh(eye, new THREE.SphereGeometry(0.2, 20, 16), ink, [0, 0, 0], [0.9, 1.4, 0.45]);
      mesh(eye, new THREE.SphereGeometry(0.075, 10, 8), white, [-0.05, 0.12, 0.08]);
      mesh(eye, new THREE.SphereGeometry(0.03, 8, 6), white, [0.05, -0.08, 0.08]);
      orb.add(eye);
      rig.eyes.push(eye);
    });
    rig.blipMouth = mesh(orb, new THREE.TorusGeometry(0.17, 0.028, 8, 20, Math.PI), ink, [0, -0.2, 0.9], [1, 1, 1], [0, 0, Math.PI]);
    const ring = mesh(orb, new THREE.TorusGeometry(1.35, 0.022, 8, 80), glow(f.accent, 1.4), [0, 0, 0], [1, 1, 1], [1.2, 0.2, 0]);
    rig.spin.push(ring);
    [0, 1, 2].forEach((i) => {
      const a = (i * Math.PI * 2) / 3;
      mesh(ring, new THREE.SphereGeometry(0.075, 12, 10), glow(0xffffff, 1.6), [Math.cos(a) * 1.35, Math.sin(a) * 1.35, 0]);
    });
    emitter(body, { count: 18, color: f.accent, size: 0.16, life: 1.8, spread: 1.4, up: 0.5, origin: [0, 0.8, 0] });
  } else {
    /* ---------------- bipeds ---------------- */
    const makeLeg = (x) => {
      const hip = new THREE.Group();
      hip.position.set(x, 0.82, 0);
      mesh(hip, new THREE.CylinderGeometry(0.14, 0.11, 0.6, crystal ? 6 : 18), skin, [0, -0.28, 0]);
      const shoe = new THREE.Group();
      shoe.position.set(0, -0.6, 0);
      hip.add(shoe);
      mesh(shoe, new THREE.SphereGeometry(0.32, crystal ? 8 : 24, 16), shoeMat, [0, 0, 0.2], [0.95, 0.6, 1.6]);
      mesh(shoe, new THREE.SphereGeometry(0.33, crystal ? 8 : 24, 12), soleMat, [0, -0.13, 0.2], [0.97, 0.18, 1.62]);
      mesh(shoe, new THREE.TorusGeometry(0.14, 0.03, 8, 20), kind === 'ember' ? glow(f.accent, 1.8) : phys(f.accent, { roughness: 0.4 }), [0, 0.14, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
      body.add(hip);
      return hip;
    };
    rig.legs = [makeLeg(-0.28), makeLeg(0.28)];

    const torso = new THREE.Group();
    torso.position.set(0, 1.5, 0);
    body.add(torso);
    rig.torso = torso;
    mesh(torso, crystal ? new THREE.IcosahedronGeometry(0.62, 1) : new THREE.SphereGeometry(0.62, 32, 24), skin, [0, 0, 0], [0.95, 1.12, 0.82]);
    mesh(torso, new THREE.SphereGeometry(0.4, 24, 18), belly, [0, -0.04, 0.2], [0.95, 1.1, 0.55]);
    if (kind === 'zapp') {
      const s = new THREE.Shape();
      s.moveTo(0.1, 0.34);
      s.lineTo(-0.17, -0.02);
      s.lineTo(-0.01, -0.02);
      s.lineTo(-0.1, -0.34);
      s.lineTo(0.18, 0.06);
      s.lineTo(0.03, 0.06);
      s.closePath();
      mesh(torso, new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false }), glow(f.accent, 1.6), [0, 0, 0.4]);
    } else {
      const gem = mesh(torso, new THREE.OctahedronGeometry(0.17, 0), glow(kind === 'ember' ? 0xffd166 : f.accent, 2.2), [0, 0.04, 0.46], [1, 1.35, 0.6]);
      rig.pulse.push(gem);
      sprite(torso, f.glow, 1.2, [0, 0.04, 0.5], 0.7);
    }

    const makeArm = (x) => {
      const sh = new THREE.Group();
      sh.position.set(x, 1.82, 0);
      mesh(sh, new THREE.SphereGeometry(0.15, 16, 12), skin);
      mesh(sh, new THREE.CylinderGeometry(0.13, 0.1, 0.62, crystal ? 6 : 16), skin, [0, -0.32, 0]);
      const hand = new THREE.Group();
      hand.position.set(0, -0.72, 0);
      sh.add(hand);
      mesh(hand, new THREE.SphereGeometry(0.25, crystal ? 8 : 24, 16), gloveMat, [0, -0.02, 0], [1, 1.05, 0.95]);
      mesh(hand, new THREE.TorusGeometry(0.17, 0.045, 10, 24), kind === 'ember' ? glow(f.accent, 1.8) : phys(f.accent, { roughness: 0.4 }), [0, 0.2, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
      if (kind === 'ember') {
        [-0.09, 0.09, 0].forEach((fx, i) => {
          const fl = mesh(hand, new THREE.ConeGeometry(0.09, 0.34 + (i === 2 ? 0.1 : 0), 10), glow(i === 2 ? 0xffd166 : 0xff7a1a, 2), [fx, -0.36, 0], [1, 1, 1], [Math.PI, 0, 0]);
          fl.userData.phase = i;
          rig.flames.push(fl);
        });
      }
      body.add(sh);
      return sh;
    };
    rig.arms = [makeArm(-0.82), makeArm(0.82)];
    rig.arms[0].rotation.z = -0.18;
    rig.arms[1].rotation.z = 0.18;

    const head = new THREE.Group();
    head.position.set(0, 2.62, 0.02);
    body.add(head);
    rig.head = head;
    mesh(head, crystal ? new THREE.IcosahedronGeometry(0.92, 1) : new THREE.SphereGeometry(0.92, 40, 30), skin, [0, 0, 0], [1.12, 1, 1]);
    makeEye(head, -0.36, 0.08, 0.76, 1);
    makeEye(head, 0.36, 0.08, 0.76, 1);
    [-1, 1].forEach((s) => mesh(head, new THREE.CapsuleGeometry(0.035, 0.28, 4, 8), kind === 'ember' ? glow(f.accent, 1.2) : ink, [s * 0.36, 0.46, 0.8], [1, 1, 1], [0, 0, Math.PI / 2 + s * 0.28]));
    rig.mouth = mesh(head, new THREE.TorusGeometry(0.17, 0.03, 8, 20, Math.PI), ink, [0, -0.36, 0.86], [1, 1, 1], [0, 0, Math.PI]);

    if (kind === 'zapp') {
      const quill = (x, y, z, rx, rz, len, r) => {
        const q = mesh(head, new THREE.ConeGeometry(r, len, 14), phys(0x0e7490, { roughness: 0.3 }), [x, y, z], [1, 1, 1], [rx, 0, rz]);
        mesh(q, new THREE.ConeGeometry(r * 0.45, len * 0.38, 12), glow(f.accent, 1.6), [0, len * 0.34, 0]);
      };
      quill(0, 1.0, -0.35, -0.75, 0, 1.4, 0.27);
      quill(-0.5, 0.88, -0.3, -0.7, 0.5, 1.2, 0.23);
      quill(0.5, 0.88, -0.3, -0.7, -0.5, 1.2, 0.23);
      quill(-0.85, 0.5, -0.2, -0.45, 1.0, 1.0, 0.19);
      quill(0.85, 0.5, -0.2, -0.45, -1.0, 1.0, 0.19);
      emitter(body, { count: 26, color: 0xfde047, size: 0.14, life: 0.9, spread: 1.2, up: 0.3, speed: 1.2, origin: [0, 1.6, -0.2], drift: 3 });
      rig.sparks = [-1, 1].map((s) => sprite(body, 0x7dd3fc, 0.9, [s * 1.3, 1.9, 0.2], 0));
    } else if (kind === 'ember') {
      [
        [0xff4d1a, 1.5, 0.3, 0, 7, 0.55],
        [0xff8a1a, 1.25, 0.24, 1, 5, 0.38],
        [0xffd166, 0.95, 0.17, 2, 3, 0.2],
      ].forEach(([c, len, r, li, n, rad]) => {
        for (let i = 0; i < n; i += 1) {
          const a = (i / n) * Math.PI * 2 + li * 0.5;
          const fl = mesh(head, new THREE.ConeGeometry(r, len * (0.8 + rnd(i + li, 4) * 0.5), 12), glow(c, 1.8), [Math.cos(a) * rad, 0.8, Math.sin(a) * rad * 0.8 - 0.1]);
          fl.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35);
          fl.userData.phase = i + li * 3;
          rig.flames.push(fl);
        }
      });
      sprite(head, 0xff7a1a, 3.8, [0, 0.9, -0.1], 0.55);
      emitter(body, { count: 44, color: 0xffa83a, size: 0.2, life: 1.5, spread: 0.9, up: 1.6, speed: 0.5, origin: [0, 3.2, -0.1], drift: 2.5 });
      emitter(body, { count: 16, color: 0xff5a1f, size: 0.16, life: 1.0, spread: 0.5, up: 1.2, speed: 0.4, origin: [0, 0.4, -0.2], drift: 3 });
    } else if (kind === 'crystalix') {
      const gemMat = () => phys(0xe0f7ff, { roughness: 0.08, clearcoat: 1, emissive: 0x38bdf8, emissiveIntensity: 0.6, flatShading: true });
      [0, 1, 2, 3, 4].forEach((i) => {
        const h = i === 2 ? 1.5 : i % 2 ? 1.0 : 1.2;
        mesh(head, new THREE.OctahedronGeometry(0.18, 0), gemMat(), [(i - 2) * 0.27, 0.95 + (i === 2 ? 0.1 : 0), -0.05], [0.7, h * 2.4, 0.7], [0, 0, (i - 2) * -0.2]);
      });
      [-1, 1].forEach((s) => mesh(torso, new THREE.OctahedronGeometry(0.2, 0), gemMat(), [s * 0.62, 0.62, -0.05], [0.75, 2.2, 0.75], [0, 0, -s * 0.55]));
      sprite(body, 0x7dd3fc, 4.2, [0, 2.0, -0.4], 0.28);
      emitter(body, { count: 24, color: 0xe0f7ff, size: 0.13, life: 2.2, spread: 2.4, up: 0.3, speed: 0.3, origin: [0, 1.8, 0.3] });
    } else if (kind === 'nova') {
      rig.spin.push(mesh(head, new THREE.TorusGeometry(0.62, 0.028, 10, 72), glow(0xfde68a, 2), [0, 1.3, 0], [1, 1, 1], [Math.PI / 2.3, 0, 0]));
      sprite(head, 0xfde68a, 1.6, [0, 1.3, 0], 0.5);
      [-1, 0, 1].forEach((k) => {
        rig.pulse.push(mesh(head, new THREE.ConeGeometry(0.13, 0.9 - Math.abs(k) * 0.2, 4), glow(f.accent, 1.6), [k * 0.38, 0.9, -0.3], [1, 1, 0.6], [-0.35, 0, -k * 0.4]));
      });
      const orbit = new THREE.Group();
      orbit.position.set(0, 1.7, 0);
      [0, 1].forEach((i) => {
        const ring = new THREE.Mesh(track(new THREE.TorusGeometry(1.45 + i * 0.2, 0.014, 8, 100)), glow(i ? f.accent : 0x67e8f9, 1.6));
        ring.rotation.set(1.15 + i * 0.5, 0.2, i ? -0.5 : 0.4);
        orbit.add(ring);
        const moon = new THREE.Mesh(track(new THREE.SphereGeometry(0.08, 12, 10)), glow(0xfde68a, 2.2));
        moon.position.set(1.45 + i * 0.2, 0, 0);
        ring.add(moon);
      });
      body.add(orbit);
      rig.orbit = orbit;
      sprite(body, 0xa78bfa, 5.2, [0, 1.8, -0.6], 0.35);
      emitter(body, { count: 40, color: 0xfde68a, size: 0.12, life: 2.0, spread: 2.6, up: 0.5, speed: 0.4, origin: [0, 1.3, 0] });
    }
  }

  /* ground contact */
  const [sc, sg] = cvs(128);
  const sh = sg.createRadialGradient(64, 64, 4, 64, 64, 62);
  sh.addColorStop(0, 'rgba(0,0,0,0.5)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  sg.fillStyle = sh;
  sg.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(track(new THREE.PlaneGeometry(3.2, 3.2)), track(new THREE.MeshBasicMaterial({ map: track(new THREE.CanvasTexture(sc)), transparent: true, depthWrite: false })));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.012;
  root.add(shadow);
  const pad = new THREE.Mesh(track(new THREE.RingGeometry(0.95, 1.02, 72)), track(new THREE.MeshBasicMaterial({ color: f.glow, transparent: true, opacity: 0.55, side: THREE.DoubleSide })));
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = 0.02;
  root.add(pad);
  rig.shadow = shadow;
  rig.pad = pad;
  rig.accent = f.glow;
  rig.dispose = () => disposables.forEach((d) => d.dispose?.());
  return rig;
}

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * <Alien3D kind="zapp" size={140} walking heading={0} wave spin />
 *   walking — run cycle (hop for the orb)
 *   heading — -1..1, turns toward the direction of travel
 *   wave    — occasionally waves when standing
 *   spin    — gentle showcase sway (hero use)
 *   talking — moves the mouth like speech (Blip's Teach guide uses it)
 */
export default function Alien3D({ kind = 'blip', size = 140, walking = false, heading = 0, wave = true, spin = false, talking = false, brand = false, sx }) {
  const mountRef = useRef(null);
  const live = useRef({ walking, heading, wave, spin, talking });
  const [fallback, setFallback] = useState(false);
  live.current = { walking, heading, wave, spin, talking };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    if (!webglOk()) {
      setFallback(true);
      return undefined;
    }
    const W = size;
    const H = Math.round(size * 1.3);
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      setFallback(true);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    const envRT = pmrem.fromScene(envScene, 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.62;
    envScene.dispose?.();

    const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 60);
    camera.position.set(0, 3.0, 11.2);
    camera.lookAt(0, 2.15, 0);

    scene.add(new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.45));
    const key = new THREE.DirectionalLight(0xffffff, 1.9);
    key.position.set(-3.5, 6, 6);
    scene.add(key);

    const rig = buildMascot(kind, brand);
    scene.add(rig.root);
    const rim = new THREE.PointLight(rig.accent, 55, 16);
    rim.position.set(3.2, 3.5, -3.2);
    scene.add(rim);
    const fill = new THREE.PointLight(0xbcd2ff, 10, 16);
    fill.position.set(2.6, 2.2, 5.5);
    scene.add(fill);
    if (kind === 'ember') {
      const fire = new THREE.PointLight(0xff7a1a, 30, 10);
      fire.position.set(0, 3.4, 1.4);
      scene.add(fire);
    }

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let t = 0;
    let phase = 0;
    let walkBlend = 0;
    let talkBlend = 0;
    let yaw = 0;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(mount);

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!visible) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const p = live.current;
      const sp = reduce ? 0 : 1;
      walkBlend += ((p.walking && !reduce ? 1 : 0) - walkBlend) * Math.min(1, dt * 9);
      phase += dt * 11 * walkBlend * sp;
      talkBlend += ((p.talking && !reduce ? 1 : 0) - talkBlend) * Math.min(1, dt * 10);
      const talkWave = talkBlend * Math.abs(Math.sin(t * 13 + Math.sin(t * 5) * 2));
      const idle = 1 - walkBlend;
      const bounce = Math.abs(Math.sin(phase));

      if (rig.orb) {
        const hop = walkBlend > 0.05 ? bounce : 0;
        rig.body.position.y = hop * 0.9 + Math.sin(t * 2) * 0.08 * idle * sp;
        const stretch = 1 + hop * 0.14 - (1 - hop) * 0.05 * walkBlend;
        rig.orb.scale.set(1 / Math.sqrt(stretch), stretch, 1 / Math.sqrt(stretch));
        rig.orb.rotation.z = Math.sin(phase) * 0.12 * walkBlend;
        rig.orb.rotation.y = Math.sin(t * 0.9) * 0.25 * idle * sp;
        if (rig.blipMouth) rig.blipMouth.scale.set(1 + talkWave * 0.25, 1 + talkWave * 1.9, 1);
        rig.orb.scale.multiplyScalar(1 + talkWave * 0.035);
      } else {
        const sL = Math.sin(phase);
        rig.legs[0].rotation.x = sL * 0.95 * walkBlend;
        rig.legs[1].rotation.x = -sL * 0.95 * walkBlend;
        rig.arms[0].rotation.x = -sL * 0.9 * walkBlend;
        rig.arms[1].rotation.x = sL * 0.9 * walkBlend;
        const waving = p.wave && idle > 0.7 && t % 5 < 1.8 && !reduce;
        const a = rig.arms[1];
        a.rotation.z += ((waving ? 2.5 + Math.sin(t * 12) * 0.28 : 0.18 + walkBlend * 0.1) - a.rotation.z) * Math.min(1, dt * 10);
        rig.body.position.y = bounce * 0.12 * walkBlend + Math.sin(t * 2.4) * 0.025 * idle * sp;
        rig.body.rotation.x = 0.16 * walkBlend;
        rig.torso.rotation.y = Math.sin(phase) * 0.2 * walkBlend;
        rig.head.rotation.y = Math.sin(t * 0.8) * 0.22 * idle * sp;
        rig.head.rotation.z = Math.sin(t * 1.3) * 0.05 * idle * sp;
        rig.head.rotation.x = -0.05 * walkBlend;
        rig.mouth.scale.y = 1 + walkBlend * 0.8 + Math.sin(t * 3) * 0.05 * sp + talkWave * 1.8;
        const squash = 1 - bounce * 0.04 * walkBlend;
        rig.torso.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
      }

      const targetYaw = p.spin ? Math.sin(t * 0.55) * 0.5 : (p.heading || 0) * 0.8;
      yaw += (targetYaw - yaw) * Math.min(1, dt * 6);
      rig.root.rotation.y = yaw;
      rig.root.rotation.z = -(p.heading || 0) * 0.04 * walkBlend;

      const k = t % 3.9 > 3.76 ? 0.1 : 1;
      rig.eyes.forEach((e) => {
        e.scale.y = k;
      });

      rig.pad.material.opacity = 0.5 + Math.sin(t * 2.4) * 0.12 * sp;
      rig.shadow.scale.setScalar(1 - (rig.orb ? bounce * 0.25 * walkBlend : 0));
      rig.pulse.forEach((m, i) => m.scale.setScalar(1 + Math.sin(t * 3 + i) * 0.1 * sp));
      rig.spin.forEach((m, i) => {
        m.rotation.z += dt * (0.6 + i * 0.15) * sp;
      });
      rig.flames.forEach((fl, i) => {
        const ph = fl.userData.phase ?? i;
        fl.scale.set(1 + Math.sin(t * 9 + ph) * 0.12 * sp, 1 + Math.sin(t * 12 + ph * 1.7) * 0.22 * sp, 1);
      });
      if (rig.orbit) rig.orbit.rotation.y = t * 0.7 * sp;
      if (rig.sparks) {
        rig.sparks.forEach((s, i) => {
          s.material.opacity = walkBlend > 0.3 ? 0.4 + 0.6 * Math.abs(Math.sin(t * 14 + i * 2)) : 0;
        });
      }
      rig.emitters.forEach((e) => e.update(dt * sp, walkBlend));

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      rig.dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [kind, size, brand]);

  if (fallback) return <AlienWalker kind={kind} brand={brand} size={size * 0.8} walking={walking} lean={heading * 8} wave={wave} sx={sx} />;
  return <Box ref={mountRef} sx={{ width: size, height: Math.round(size * 1.3), flexShrink: 0, ...sx }} />;
}
