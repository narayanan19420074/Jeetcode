import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildDiamond, buildLarva, clamp01, createSparkles, glowTexture, sparkleTexture, smooth } from './butterflyModel';

// The Quests page is one 3D road map. The larva sits on the road at your check-in progress and looks for the next
// diamond. Every milestone is a glowing diamond on the road; the one with the Pro reward is the big prize at the end.
// Ready diamonds (earned, not claimed yet) shine with a beam: tap one to claim and the larva eats it.
// Everything is a function of the data passed to setData(), so the page never has to know about the 3D side.

const ROAD = [[-7.2, 2.0], [-4.6, -1.3], [-1.6, 1.9], [1.7, -1.5], [4.7, 1.7], [7.3, -0.6]].map(([x, z]) => new THREE.Vector3(x, 0, z));
const SPACING = 0.78;
const CAM_DIR = new THREE.Vector3(0, 0.74, 0.67).normalize();
const COLORS_DARK = { orange: '#FF7A00', yellow: '#FFC933', green: '#2ED573', blue: '#27B6FF', grey: '#8E99AD', white: '#FFFFFF', outline: '#0B0E14' };
const COLORS_LIGHT = { orange: '#E65F00', yellow: '#C98A00', green: '#14A85A', blue: '#0A8FE0', grey: '#5E6A82', white: '#141824', outline: '#FFFFFF' };

function backdrop(dark) {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 256;
  const c = canvas.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, dark ? '#0B0E14' : '#F6F8FC');
  g.addColorStop(1, dark ? '#16203A' : '#DCE5F5');
  c.fillStyle = g;
  c.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Sign above every diamond: small line on top, reward below. Outlined so it stays readable on any background.
function labelTexture(top, bottom, topColor, bottomColor, outline) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const c = canvas.getContext('2d');
  c.textAlign = 'center';
  c.lineJoin = 'round';
  const line = (text, y, size, color) => {
    // shrink until the text fits inside the sign, so long names never run off the edge
    let px = size;
    do {
      c.font = `900 ${px}px "Arial Black", "Segoe UI", system-ui, sans-serif`;
      px -= 2;
    } while (c.measureText(text).width > 470 && px > 20);
    c.lineWidth = 12;
    c.strokeStyle = outline;
    c.strokeText(text, 256, y);
    c.fillStyle = color;
    c.fillText(text, 256, y);
  };
  line(top, 84, 74, topColor);
  line(bottom, 156, 50, bottomColor);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Flat ribbon that follows the curve; `offset` shifts it sideways, `from`/`to` pick a stretch (0..1 of the length).
function ribbonGeometry(curve, width, offset, y, from = 0, to = 1, steps = 160) {
  const pos = [];
  const idx = [];
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  for (let i = 0; i <= steps; i += 1) {
    const u = from + ((to - from) * i) / steps;
    curve.getPointAt(u, p);
    curve.getTangentAt(u, t);
    const nx = -t.z;
    const nz = t.x;
    const len = Math.hypot(nx, nz) || 1;
    const ox = (nx / len) * (offset + width / 2);
    const oz = (nz / len) * (offset + width / 2);
    const ix = (nx / len) * (offset - width / 2);
    const iz = (nz / len) * (offset - width / 2);
    pos.push(p.x + ox, y, p.z + oz, p.x + ix, y, p.z + iz);
    if (i < steps) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function buildStage(host, { dark, reduce, onClaim }) {
  const COLORS = dark ? COLORS_DARK : COLORS_LIGHT;
  const add = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  const el = renderer.domElement;
  el.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y';
  host.appendChild(el);

  const scene = new THREE.Scene();
  scene.background = backdrop(dark);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envRT = pmrem.fromScene(room, 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = dark ? 0.9 : 1.1;
  room.dispose?.();
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(3, 8, 5);
  scene.add(key);
  const warm = new THREE.PointLight(0xff7a00, 120, 0, 2);
  warm.position.set(-7, 3, 3);
  scene.add(warm);
  const cool = new THREE.PointLight(0x27b6ff, 130, 0, 2);
  cool.position.set(7, 3.5, 1);
  scene.add(cool);

  const glow = glowTexture();
  const sparkle = sparkleTexture();
  const sparkles = createSparkles(sparkle, dark);
  scene.add(sparkles.points);

  // ground, grid and road
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshStandardMaterial({ color: dark ? 0x0e121b : 0xe8edf6, roughness: 0.9, metalness: 0.1 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const grid = new THREE.GridHelper(60, 60, dark ? 0x232c40 : 0xc9d2e3, dark ? 0x171d2c : 0xd9e0ee);
  grid.position.y = 0.004;
  scene.add(grid);

  const curve = new THREE.CatmullRomCurve3(ROAD, false, 'catmullrom', 0.5);
  curve.arcLengthDivisions = 600;
  const L = curve.getLength();
  const basic = (color, opacity = 1, blending = THREE.NormalBlending) => new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, side: THREE.DoubleSide, toneMapped: false, depthWrite: false, blending });
  const roadParts = [
    new THREE.Mesh(ribbonGeometry(curve, 3.4, 0, 0.006), basic(0xff7a00, dark ? 0.1 : 0.16, add)),
    new THREE.Mesh(ribbonGeometry(curve, 1.9, 0, 0.012), new THREE.MeshStandardMaterial({ color: dark ? 0x1b2130 : 0x333b50, roughness: 0.65, metalness: 0.2, side: THREE.DoubleSide })),
    new THREE.Mesh(ribbonGeometry(curve, 0.1, 0.95, 0.02), basic(0xff7a00)),
    new THREE.Mesh(ribbonGeometry(curve, 0.1, -0.95, 0.02), basic(0xff7a00)),
  ];
  const dashPos = [];
  const dashIdx = [];
  const dashes = Math.floor(L / 0.9);
  for (let d = 0; d < dashes; d += 1) {
    const g = ribbonGeometry(curve, 0.09, 0, 0.022, (d * 0.9) / L, (d * 0.9 + 0.45) / L, 4);
    const base = dashPos.length / 3;
    dashPos.push(...g.attributes.position.array);
    g.index.array.forEach((i) => dashIdx.push(i + base));
    g.dispose();
  }
  const dashGeo = new THREE.BufferGeometry();
  dashGeo.setAttribute('position', new THREE.Float32BufferAttribute(dashPos, 3));
  dashGeo.setIndex(dashIdx);
  roadParts.push(new THREE.Mesh(dashGeo, basic(0xffc933)));
  roadParts.forEach((m) => scene.add(m));

  // arrows that run along the road from the larva to the next diamond
  const arrowGeo = new THREE.CircleGeometry(0.22, 3);
  arrowGeo.rotateX(-Math.PI / 2);
  const arrows = Array.from({ length: 7 }, () => {
    const m = new THREE.Mesh(arrowGeo, basic(dark ? 0xffc933 : 0xff9a1f, 0.9));
    m.visible = false;
    scene.add(m);
    return m;
  });

  // larva
  const larva = buildLarva();
  scene.add(larva.group);
  const cumul = [0];
  for (let i = 1; i < larva.radii.length; i += 1) cumul.push(cumul[i - 1] + (larva.radii[i - 1] + larva.radii[i]) * SPACING);
  const tmpP = new THREE.Vector3();
  const tmpT = new THREE.Vector3();
  const pointAt = (s, out) => {
    if (s <= 0) {
      curve.getTangentAt(0, tmpT);
      return out.copy(ROAD[0]).addScaledVector(tmpT, s);
    }
    return curve.getPointAt(Math.min(1, s / L), out);
  };
  const headPos = new THREE.Vector3();
  const startPad = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 40), new THREE.MeshStandardMaterial({ color: dark ? 0x232c40 : 0xdfe5f1, roughness: 0.5, metalness: 0.4 }));
  startPad.position.copy(ROAD[0]);
  scene.add(startPad);
  const startLabel = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture('START', '', COLORS.grey, COLORS.grey, COLORS.outline), transparent: true, depthWrite: false }));
  startLabel.scale.set(2, 0.75, 1);
  startLabel.position.set(ROAD[0].x, 0.9, ROAD[0].z);
  scene.add(startLabel);

  // ---------------------------------------------------------------- nodes (one per milestone)
  let nodes = [];
  let signature = '';
  let data = { milestones: [], goalTarget: 25, days: 0 };
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });

  const clearNodes = () => {
    nodes.forEach((n) => {
      scene.remove(n.group);
      n.diamond.dispose();
      scene.remove(n.diamond.gem, n.diamond.holder);
      n.group.traverse((o) => {
        o.geometry?.dispose?.();
        if (o.material && o.material !== hitMat) {
          o.material.map?.dispose?.();
          o.material.dispose();
        }
      });
    });
    nodes = [];
  };

  const stateOf = (m) => (m.claimed ? 'claimed' : m.claimable ? 'ready' : 'locked');

  const paintLabel = (n) => {
    const m = n.m;
    const pro = m.reward.type === 'pro';
    const goal = m.id === n.goalId;
    let top = goal ? `${m.target} CHECK-INS` : `DAY ${m.target}`;
    let bottom = pro ? `${goal ? '= ' : ''}${m.reward.label.toUpperCase()}` : 'BADGE';
    let topColor = COLORS.white;
    let bottomColor = pro ? COLORS.yellow : COLORS.blue;
    if (n.state === 'claimed') {
      top = `DAY ${m.target}`;
      bottom = 'CLAIMED';
      topColor = COLORS.grey;
      bottomColor = COLORS.green;
    } else if (n.state === 'ready') {
      topColor = COLORS.yellow;
      bottomColor = COLORS.orange;
      bottom = 'TAP TO CLAIM';
    } else if (n.state === 'locked' && !goal) topColor = COLORS.grey;
    n.label.material.map?.dispose();
    n.label.material.map = labelTexture(top, bottom, topColor, bottomColor, COLORS.outline);
    n.label.material.needsUpdate = true;
  };

  const ringColor = { locked: dark ? 0x2b3345 : 0xb7c1d6, ready: 0xff7a00, claimed: dark ? 0x2ed573 : 0x14a85a };

  const buildNodes = () => {
    clearNodes();
    const goalId = data.milestones.find((m) => m.target === data.goalTarget)?.id;
    nodes = data.milestones.map((m) => {
      const goal = m.id === goalId;
      const u = clamp01(m.target / data.goalTarget);
      const pos = curve.getPointAt(u);
      const group = new THREE.Group();
      group.position.copy(pos);
      scene.add(group);

      const pad = new THREE.Mesh(new THREE.CylinderGeometry(goal ? 0.95 : 0.75, goal ? 0.95 : 0.75, 0.08, 40), new THREE.MeshStandardMaterial({ color: dark ? 0x232c40 : 0xdfe5f1, roughness: 0.5, metalness: 0.4 }));
      pad.position.y = 0.04;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(goal ? 0.95 : 0.75, 0.05, 10, 60), new THREE.MeshBasicMaterial({ color: ringColor.locked, toneMapped: false }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.09;
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 4, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xffa21a, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide, blending: add, toneMapped: false }));
      beam.position.y = 2;
      beam.visible = false;
      const label = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
      label.scale.set(goal ? 4.2 : 3.2, goal ? 1.575 : 1.2, 1);
      label.position.y = goal ? 3.3 : 2.55;
      const hit = new THREE.Mesh(new THREE.SphereGeometry(1.15, 12, 8), hitMat);
      hit.position.y = 1;
      group.add(pad, ring, beam, label, hit);

      const diamond = buildDiamond({ dark, sparkle, glow });
      scene.add(diamond.gem, diamond.holder);
      let crown = null;
      if (goal) {
        crown = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.04, 8, 60), new THREE.MeshBasicMaterial({ color: 0xffc933, toneMapped: false }));
        crown.rotation.x = Math.PI / 2.6;
        group.add(crown);
      }
      const n = { m, u, pos, group, pad, ring, beam, label, hit, diamond, crown, goal, goalId, state: stateOf(m), eatT: -1, pop: 0 };
      hit.userData.node = n;
      ring.material.color.setHex(ringColor[n.state]);
      beam.visible = n.state === 'ready';
      paintLabel(n);
      return n;
    });
  };

  const refresh = () => {
    data.milestones.forEach((m) => {
      const n = nodes.find((x) => x.m.id === m.id);
      if (!n) return;
      const next = stateOf(m);
      n.m = m;
      if (next === n.state) return;
      const was = n.state;
      n.state = next;
      if (next === 'claimed' && was === 'ready' && !reduce) {
        n.state = 'eating';
        n.eatT = 0;
        n.finalState = 'claimed';
      } else {
        n.ring.material.color.setHex(ringColor[next]);
        n.beam.visible = next === 'ready';
        paintLabel(n);
      }
    });
  };

  // ---------------------------------------------------------------- clock
  let T = 0;
  let sCur = reduce ? 0 : -2.5;
  let sGoal = 0;
  let popT = 1;
  let needsRender = true;
  let ambient = 0;
  let eatCarry = 0;
  const rnd = (a) => (Math.random() - 0.5) * a;

  const targetS = () => {
    const claimedCount = nodes.filter((n) => n.state === 'claimed' || n.finalState === 'claimed').length;
    const u = clamp01(data.days / data.goalTarget);
    return { s: Math.max(0, u * L - (u > 0 ? 0.55 : 0)), size: Math.min(0.85, 0.5 + claimedCount * 0.06) };
  };
  let sizeNow = 0.5;

  const nextNodeU = () => {
    const progress = data.days / data.goalTarget;
    const n = nodes.find((x) => x.m.target > data.days && x.u > progress - 1e-6);
    return n ? n.u : null;
  };

  const pose = (dt) => {
    const tgt = targetS();
    sGoal = tgt.s;
    const diff = sGoal - sCur;
    const moving = Math.abs(diff) > 0.03 && !reduce;
    if (reduce) sCur = sGoal;
    else if (moving) sCur += Math.sign(diff) * Math.min(Math.abs(diff), dt * 2.4 * (0.3 + 0.7 * Math.min(1, Math.abs(diff))));
    sizeNow += (tgt.size - sizeNow) * Math.min(1, dt * 2);
    popT = Math.min(1, popT + dt / 0.7);
    const S = sizeNow * (1 + 0.28 * Math.sin(Math.PI * popT) * (popT < 1 ? 1 : 0));

    const sniff = reduce ? 0 : Math.pow(Math.max(0, Math.sin(T * 0.8)), 3);
    const sway = reduce ? 0 : Math.sin(T * 1.1) * 0.35;
    const phaseWalk = sCur * 4.6;
    larva.segs.forEach((g, i) => {
      const r = larva.radii[i] * S;
      pointAt(sCur - cumul[i] * S, tmpP);
      const arch = moving ? Math.pow(Math.max(0, Math.sin(phaseWalk - i * 0.85)), 1.5) * 0.14 * S : Math.sin(T * 2.2 - i * 0.5) * 0.012 * S;
      const lift = moving ? 0 : sniff * 0.42 * S * Math.exp(-i * 0.6);
      g.position.set(tmpP.x, 0.02 + r + arch + lift, tmpP.z);
      g.scale.setScalar(S);
      if (i === 0) {
        curve.getTangentAt(clamp01(Math.max(0, sCur) / L), tmpT);
        g.rotation.y = -Math.atan2(tmpT.z, tmpT.x) + (moving ? 0 : sway);
        g.rotation.z = moving ? 0 : sniff * 0.5;
        headPos.copy(g.position);
      }
    });

    // arrows from the larva to the next diamond
    const nu = nextNodeU();
    const p = new THREE.Vector3();
    arrows.forEach((a, i) => {
      const from = clamp01(Math.max(0, sCur) / L);
      if (nu === null || nu - from < 0.04) {
        a.visible = false;
        return;
      }
      const span = nu - from - 0.03;
      const u = from + 0.03 + ((i / arrows.length + T * 0.22) % 1) * span;
      curve.getPointAt(clamp01(u), p);
      curve.getTangentAt(clamp01(u), tmpT);
      a.visible = true;
      a.position.set(p.x, 0.04, p.z);
      a.rotation.y = -Math.atan2(tmpT.z, tmpT.x);
      a.material.opacity = 0.35 + 0.65 * Math.sin(((i / arrows.length + T * 0.22) % 1) * Math.PI);
    });

    // diamonds
    nodes.forEach((n, i) => {
      const d = n.diamond;
      const ready = n.state === 'ready';
      const eating = n.state === 'eating';
      const gone = n.state === 'claimed';
      d.gem.visible = !gone;
      d.holder.visible = !gone;
      n.crown && (n.crown.rotation.z = T * 0.8);
      n.beam.material.opacity = 0.16 + (reduce ? 0.06 : 0.07 * Math.sin(T * 3 + i));
      if (n.state !== 'eating' && n.state !== 'claimed') n.ring.material.color.setHex(ringColor[n.state]);
      if (gone) return;
      let sc = (n.goal ? 0.95 : 0.62) * (ready ? 1.12 + (reduce ? 0 : 0.08 * Math.sin(T * 4)) : 0.9);
      if (eating) {
        n.eatT += dt;
        const k = clamp01(n.eatT / 1.3);
        sc *= 1 - smooth(0, 1, k);
        eatCarry += dt * 80;
        while (eatCarry >= 1) {
          eatCarry -= 1;
          const a = Math.random() * Math.PI * 2;
          sparkles.emit({ x: n.pos.x + Math.cos(a) * 0.4, y: 1 + rnd(0.7), z: n.pos.z + Math.sin(a) * 0.4 }, { x: rnd(1.5), y: Math.random() * 1.5, z: rnd(1.5) }, { color: Math.random() > 0.5 ? '#27B6FF' : dark ? '#FFFFFF' : '#FFB020', size: 0.3, ttl: 1.6, to: headPos, strength: 8 });
        }
        if (k >= 1) {
          n.state = 'claimed';
          n.ring.material.color.setHex(ringColor.claimed);
          n.beam.visible = false;
          paintLabel(n);
          popT = 0;
          sparkles.burst(headPos, 40, { color: '#FFC933', speed: 2.4, size: 0.34 });
        }
      }
      const bob = reduce ? 0 : Math.sin(T * 1.6 + i) * 0.07;
      d.gem.position.set(n.pos.x, 1.05 + bob, n.pos.z);
      d.holder.position.copy(d.gem.position);
      d.gem.scale.setScalar(Math.max(0.001, sc));
      d.holder.scale.setScalar(Math.max(0.001, sc / 0.75) * (ready ? 1.2 : 0.7));
      d.update(reduce ? 0.7 : T);
    });
  };

  // ---------------------------------------------------------------- size, input, loop
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const target = new THREE.Vector3(0, 0.6, 0.2);
  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tanH = Math.tan((camera.fov * Math.PI) / 360);
    const dist = Math.max(8, 9.3 / (tanH * camera.aspect), 5.6 / tanH);
    camera.position.copy(target).addScaledVector(CAM_DIR, dist);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    sparkles.setScale(renderer.getDrawingBufferSize(new THREE.Vector2()).y / (2 * tanH));
    needsRender = true;
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
  });
  io.observe(host);

  const pick = (e) => {
    const r = el.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(nodes.filter((n) => n.state === 'ready').map((n) => n.hit), false);
    return hits[0]?.object.userData.node || null;
  };
  const onMove = (e) => {
    el.style.cursor = pick(e) ? 'pointer' : 'default';
  };
  const onClick = (e) => {
    const n = pick(e);
    if (n) onClaim?.(n.m);
  };
  el.addEventListener('pointermove', onMove);
  el.addEventListener('click', onClick);

  let raf = 0;
  let last = performance.now();
  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || document.hidden) return;
    if (reduce && !needsRender) return;
    needsRender = false;
    if (!reduce) {
      T += dt;
      ambient += dt;
      if (ambient > 0.25) {
        ambient = 0;
        sparkles.emit({ x: rnd(16), y: Math.random() * 0.5, z: rnd(8) }, { x: 0, y: 0.5, z: 0 }, { color: Math.random() > 0.5 ? '#27B6FF' : '#FF7A00', size: 0.18, ttl: 3.2 });
      }
    }
    pose(dt);
    sparkles.update(dt);
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(tick);

  return {
    setData(next) {
      data = next;
      const sig = `${next.goalTarget}|${next.milestones.map((m) => m.id).join(',')}`;
      if (sig !== signature) {
        signature = sig;
        buildNodes();
      } else refresh();
      needsRender = true;
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('click', onClick);
      clearNodes();
      larva.dispose();
      sparkles.dispose();
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((m) => {
          m.map?.dispose?.();
          m.dispose();
        });
      });
      hitMat.dispose();
      scene.background?.dispose?.();
      glow.dispose();
      sparkle.dispose();
      envRT.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
      if (el.parentNode === host) host.removeChild(el);
    },
  };
}

export default function QuestRoadScene({ milestones, goalTarget, days, dark = true, reduce = false, onClaim, onFail }) {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const dataRef = useRef({ milestones, goalTarget, days });
  const claimRef = useRef(onClaim);
  dataRef.current = { milestones, goalTarget, days };
  claimRef.current = onClaim;

  useEffect(() => {
    let api = null;
    try {
      api = buildStage(hostRef.current, { dark, reduce, onClaim: (m) => claimRef.current?.(m) });
    } catch {
      onFail?.();
      return undefined;
    }
    apiRef.current = api;
    api.setData(dataRef.current);
    return () => {
      api.dispose();
      apiRef.current = null;
    };
  }, [dark, reduce, onFail]);

  useEffect(() => {
    apiRef.current?.setData({ milestones, goalTarget, days });
  }, [milestones, goalTarget, days]);

  return <div ref={hostRef} role="img" aria-label="3D road map: a larva crawls along a road towards glowing diamonds, one for each check-in milestone." style={{ width: '100%', height: '100%' }} />;
}
