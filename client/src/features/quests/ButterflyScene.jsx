import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { paletteFor } from './butterflyCatalog';
import { buildButterfly, buildChrysalis, buildDiamond, buildLarva, createSparkles, clamp01, easeOutBack, glowTexture, lerp, smooth, sparkleTexture } from './butterflyModel';

// The Quests stage. One 40 second loop, every pose is a function of the clock `T` (so "jump to the hatch" is just setting T):
//   0-5    a larva crawls in towards a spinning diamond
//   5-16   it eats the diamond and grows, a second diamond appears, it eats that one too and grows again
//   16-23  it climbs a silk thread and turns into a jade chrysalis
//   23-40  the chrysalis cracks open, the butterfly (the one you equipped) unfolds its crystal wings and flies
// Plain three.js, no extra packages. Phases are reported through onPhase so the page can show where we are.

const LOOP = 40;
const HATCH = 23;
const FLY = 25.4;
const PHASES = [[0, 'larva'], [5, 'feeding'], [16, 'cocoon'], [HATCH, 'butterfly']];
const phaseAt = (t) => PHASES.reduce((cur, [from, name]) => (t >= from ? name : cur), 'larva');

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const PATH_POINTS = [v3(-7.6, 0, 1.0), v3(-5.8, 0, 1.0), v3(-3.8, 0, 1.0), v3(-2.0, 0, 0.75), v3(-0.15, 0, 0.35)];
const ANCHOR = v3(-0.15, 2.9, 0.35); // where the chrysalis hangs
const SILK_TOP = 5.4;
const SPACING = 0.78;

function gradientTexture(dark) {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 256;
  const c = canvas.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, dark ? '#14123A' : '#F5F3FF');
  g.addColorStop(0.55, dark ? '#1E1B4B' : '#E8EDFF');
  g.addColorStop(1, dark ? '#2E1065' : '#FCE7F3');
  c.fillStyle = g;
  c.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildStage(host, { dark, reduce, styleId, onPhase }) {
  const blend = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = dark ? 1.05 : 1;
  const el = renderer.domElement;
  el.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y';
  host.appendChild(el);

  const scene = new THREE.Scene();
  scene.background = gradientTexture(dark);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envRT = pmrem.fromScene(room, 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = dark ? 0.95 : 1;
  room.dispose?.();
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 80);
  const camBase = { dist: 10 };

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, dark ? 1.3 : 1.1);
  key.position.set(2, 6, 5);
  scene.add(key);
  const violet = new THREE.PointLight(0xa78bfa, dark ? 110 : 60, 0, 2);
  violet.position.set(-4, 3.5, 3);
  scene.add(violet);
  const cyan = new THREE.PointLight(0x38bdf8, dark ? 90 : 50, 0, 2);
  cyan.position.set(4, 3, 3);
  scene.add(cyan);
  const glint = new THREE.PointLight(0xffffff, dark ? 140 : 90, 0, 2); // sweeps across the wings so the facets flash
  scene.add(glint);

  const glow = glowTexture();
  const sparkle = sparkleTexture();

  // floor + rings + soft pool of light
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 6.8, 0.12, 80), new THREE.MeshStandardMaterial({ color: dark ? 0x211f58 : 0xffffff, metalness: dark ? 0.5 : 0.1, roughness: 0.3 }));
  floor.position.y = -0.06;
  scene.add(floor);
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(6.1, 0.03, 12, 140), new THREE.MeshBasicMaterial({ color: dark ? 0xff5fa8 : 0xf472b6, toneMapped: false }));
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(5.0, 0.02, 12, 140), new THREE.MeshBasicMaterial({ color: 0x8b5cf6, toneMapped: false }));
  [ringA, ringB].forEach((r) => {
    r.rotation.x = Math.PI / 2;
    r.position.y = 0.01;
    scene.add(r);
  });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), new THREE.MeshBasicMaterial({ map: glow, color: dark ? 0x7c4dff : 0xa78bfa, transparent: true, opacity: dark ? 0.5 : 0.32, depthWrite: false, blending: blend }));
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.02;
  scene.add(pool);

  // fake contact shadows keep the larva and butterfly from floating
  const shadowMat = new THREE.MeshBasicMaterial({ map: glow, color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false });
  const shadowGeo = new THREE.PlaneGeometry(1, 1);
  const makeShadow = () => {
    const m = new THREE.Mesh(shadowGeo, shadowMat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.025;
    scene.add(m);
    return m;
  };
  const flyShadow = makeShadow();
  const diamondShadow = makeShadow();

  const sparkles = createSparkles(sparkle, dark);
  scene.add(sparkles.points);

  // ------------------------------------------------------------ actors
  const curve = new THREE.CatmullRomCurve3(PATH_POINTS, false, 'catmullrom', 0.4);
  curve.arcLengthDivisions = 400;
  const lengths = curve.getLengths();
  const total = curve.getLength();
  const sAt = (k) => lengths[Math.round((k / (PATH_POINTS.length - 1)) * (lengths.length - 1))];
  const S1 = sAt(2);
  const S2 = total;
  const lead = curve.getTangentAt(0).setY(0).normalize();
  const pathPoint = (s, out) => {
    if (s <= 0) return out.copy(PATH_POINTS[0]).addScaledVector(lead, s);
    return curve.getPointAt(Math.min(1, s / total), out);
  };
  const pathTangent = (s, out) => curve.getTangentAt(clamp01(s / total), out).setY(0).normalize();

  const larva = buildLarva();
  scene.add(larva.group);
  const cumul = [0];
  for (let i = 1; i < larva.radii.length; i += 1) cumul.push(cumul[i - 1] + (larva.radii[i - 1] + larva.radii[i]) * SPACING);

  const diamonds = [buildDiamond({ dark, sparkle, glow }), buildDiamond({ dark, sparkle, glow })];
  const D1 = pathPoint(S1, v3(0, 0, 0)).addScaledVector(pathTangent(S1, v3(0, 0, 0)), 0.78).setY(0.78);
  const D2 = pathPoint(S2, v3(0, 0, 0)).addScaledVector(pathTangent(S2, v3(0, 0, 0)), 0.88).setY(0.78);
  const diamondPos = [D1, D2];
  diamonds.forEach((d) => {
    scene.add(d.gem, d.holder);
  });

  const state = { id: null, pal: paletteFor(styleId), butterfly: null, chrysalis: null };
  const silk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 6), new THREE.MeshBasicMaterial({ color: dark ? 0xe9d5ff : 0x9b87c9, transparent: true, opacity: 0, toneMapped: false }));
  scene.add(silk);
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(flash);
  const shock = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 8, 80), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(shock);

  const mountButterfly = (id) => {
    state.id = id;
    state.pal = paletteFor(id);
    if (state.butterfly) {
      scene.remove(state.butterfly.root);
      state.butterfly.dispose();
    }
    if (state.chrysalis) {
      scene.remove(state.chrysalis.group);
      state.chrysalis.dispose();
    }
    state.butterfly = buildButterfly(state.pal, { dark, sparkle, glow });
    scene.add(state.butterfly.root);
    state.chrysalis = buildChrysalis(state.pal);
    state.chrysalis.group.position.copy(ANCHOR);
    scene.add(state.chrysalis.group);
    glint.color.set(state.pal.spot);
    flash.material.color.set(state.pal.glow);
    shock.material.color.set(state.pal.glow);
  };
  mountButterfly(styleId);

  // ------------------------------------------------------------ clock + events
  let T = reduce ? 31 : 0;
  let phase = null;
  const headPos = v3(0, 0, 0);
  const tmpA = v3(0, 0, 0);
  const tmpB = v3(0, 0, 0);
  const pf = (p, dx = 0, dy = 0, dz = 0) => ({ x: p.x + dx, y: p.y + dy, z: p.z + dz });
  const rnd = (a) => (Math.random() - 0.5) * a;

  const events = [
    { t: 0.2, run: () => sparkles.burst(D1, 18, { color: '#7DD3FC', speed: 1.6, size: 0.3 }) },
    { t: 7.2, run: () => sparkles.burst(headPos, 30, { color: '#FDE047', speed: 2.2, size: 0.34 }) },
    { t: 8.6, run: () => sparkles.burst(D2, 18, { color: '#7DD3FC', speed: 1.6, size: 0.3 }) },
    { t: 15.2, run: () => sparkles.burst(headPos, 36, { color: '#FDE047', speed: 2.4, size: 0.36 }) },
    {
      t: HATCH,
      run: () => {
        const p = ANCHOR.clone().add(v3(0, -0.45, 0.1));
        sparkles.burst(p, 110, { color: state.pal.glow, speed: 4, size: 0.42, ttl: 1.8 });
        sparkles.burst(p, 50, { color: '#FFFFFF', speed: 2.6, size: 0.3, ttl: 1.4 });
        flash.userData.at = T;
      },
    },
    { t: FLY, run: () => sparkles.burst(state.butterfly.root.position, 40, { color: state.pal.spot, speed: 2.2, size: 0.3 }) },
  ];
  let evIdx = 0;
  const seek = (to) => {
    T = to;
    evIdx = events.findIndex((e) => e.t >= to);
    if (evIdx < 0) evIdx = events.length;
    flash.material.opacity = 0;
    shock.material.opacity = 0;
  };

  const flightAt = (tt, out) =>
    out.set(2.7 * Math.sin(0.42 * tt + 0.6), 2.15 + 0.7 * Math.sin(0.83 * tt + 1.0), 0.6 + 0.9 * Math.sin(0.31 * tt + 2.0));
  const EMERGE = v3(ANCHOR.x, ANCHOR.y - 0.75, ANCHOR.z + 0.12);

  // ------------------------------------------------------------ pose for time T
  let eatCarry = 0;
  const pose = (dt) => {
    // larva progress along the path
    let s;
    if (T < 4.8) s = S1 * smooth(0, 1, T / 4.8);
    else if (T < 8.4) s = S1;
    else if (T < 13) s = lerp(S1, S2, smooth(0, 1, (T - 8.4) / 4.6));
    else s = S2;
    // two growth spurts, one after each diamond
    const S = 0.55 + 0.23 * easeOutBack(clamp01(T - 7)) + 0.24 * easeOutBack(clamp01(T - 15));
    const rear = smooth(4.3, 5.1, T) * (1 - smooth(7.9, 8.4, T)) + smooth(12.6, 13.4, T) * (1 - smooth(15.6, 16.1, T));
    const chomp = (T > 5.4 && T < 7.4) || (T > 13.4 && T < 15.4) ? Math.sin(T * 15) * 0.05 : 0;
    const phaseWalk = s * 4.6;
    const moving = T < 4.8 || (T > 8.4 && T < 13);

    larva.group.visible = T < 19.3;
    if (larva.group.visible) {
      const k0 = (i) => smooth(16.2 + i * 0.1, 17.8 + i * 0.1, T);
      const fade = 1 - smooth(18.3, 19.2, T);
      larva.segs.forEach((g, i) => {
        const r = larva.radii[i] * S;
        pathPoint(s - cumul[i] * S, tmpA);
        const arch = moving ? Math.pow(Math.max(0, Math.sin(phaseWalk - i * 0.85)), 1.5) * 0.14 * S : Math.sin(T * 2.2 - i * 0.5) * 0.012 * S;
        const lift = (0.78 - larva.radii[0] * S) * rear * Math.exp(-i * 0.62);
        let y = r + arch + lift + (i === 0 ? chomp : 0);
        let x = tmpA.x;
        let z = tmpA.z;
        const k = k0(i);
        if (k > 0) {
          const hx = ANCHOR.x + (i > 3 ? Math.sin((i - 3) * 0.55) * 0.12 : 0) + Math.sin(k * Math.PI) * 0.28;
          const hy = ANCHOR.y - 0.1 - i * 0.15;
          const hz = ANCHOR.z + Math.sin(k * Math.PI) * 0.12;
          x = lerp(x, hx, k);
          y = lerp(y, hy, k);
          z = lerp(z, hz, k);
        }
        g.position.set(x, y, z);
        g.scale.setScalar(S * (1 - 0.45 * k0(i)) * fade * (1 + (moving ? 0 : Math.sin(T * 2.2 - i * 0.5) * 0.01)));
        if (i === 0) {
          pathTangent(s, tmpB);
          g.rotation.y = -Math.atan2(tmpB.z, tmpB.x);
          g.rotation.z = k > 0 ? -k * 1.1 : rear * 0.5; // nose up at the diamond while eating, curls down once it hangs
          headPos.set(x, y, z);
        }
      });
    }

    // diamonds
    diamonds.forEach((d, i) => {
      const pop = i === 0 ? clamp01((T - 0.2) / 1) : clamp01((T - 8.6) / 1);
      const eatFrom = i === 0 ? 5.4 : 13.4;
      const eaten = smooth(eatFrom, eatFrom + 2, T);
      const bite = T > eatFrom && T < eatFrom + 2 ? 1 + Math.sin(T * 22) * 0.05 : 1;
      const sc = 0.75 * Math.max(0, easeOutBack(pop)) * (1 - eaten) * bite;
      const show = sc > 0.01 && T < (i === 0 ? 7.6 : 15.6);
      d.gem.visible = show;
      d.holder.visible = show;
      if (show) {
        const p = diamondPos[i];
        const bob = Math.sin(T * 1.6 + i) * 0.06;
        d.gem.position.set(p.x, p.y + bob, p.z);
        d.holder.position.copy(d.gem.position);
        d.gem.scale.setScalar(sc);
        d.holder.scale.setScalar(Math.max(0.01, sc / 0.75));
        d.update(T);
        if (!reduce && T > eatFrom && T < eatFrom + 2) {
          eatCarry += dt * 70;
          while (eatCarry >= 1) {
            eatCarry -= 1;
            const a = Math.random() * Math.PI * 2;
            sparkles.emit(pf(d.gem.position, Math.cos(a) * 0.4, rnd(0.6), Math.sin(a) * 0.4), { x: rnd(1), y: Math.random() * 1.2, z: rnd(1) }, { color: Math.random() > 0.5 ? '#A5F3FC' : '#FFFFFF', size: 0.26, ttl: 0.9, to: headPos, strength: 9 });
          }
        }
      }
    });
    const d0 = diamonds[0].gem.visible ? 0 : diamonds[1].gem.visible ? 1 : -1;
    diamondShadow.visible = d0 >= 0;
    if (d0 >= 0) {
      diamondShadow.position.x = diamondPos[d0].x;
      diamondShadow.position.z = diamondPos[d0].z;
      diamondShadow.scale.setScalar(1.3 * diamonds[d0].gem.scale.x / 0.75);
    }

    // silk thread + chrysalis
    const silkK = smooth(16, 16.8, T) * (1 - smooth(HATCH, HATCH + 0.4, T));
    silk.visible = silkK > 0.01;
    if (silk.visible) {
      const len = SILK_TOP - ANCHOR.y;
      silk.scale.set(1, len, 1);
      silk.position.set(ANCHOR.x, ANCHOR.y + len / 2, ANCHOR.z);
      silk.material.opacity = silkK * 0.9;
    }
    const ch = state.chrysalis;
    const chScale = easeOutBack(clamp01((T - 18.2) / 1)) * 0.62;
    ch.group.visible = T >= 18.2 && T < HATCH + 0.9;
    if (ch.group.visible) {
      const crack = smooth(21.8, HATCH, T);
      ch.group.scale.setScalar(Math.max(0.001, chScale));
      ch.group.rotation.z = Math.sin(T * 1.3) * 0.05 + Math.sin(T * 38) * 0.045 * crack;
      ch.shellMat.emissive.set(crack > 0 ? state.pal.glow : '#1FBF7A');
      ch.shellMat.emissiveIntensity = 0.25 + 0.2 * Math.sin(T * 3) + crack * 1.4;
      ch.shellMat.opacity = (1 - 0.5 * smooth(21, HATCH, T)) * (1 - smooth(HATCH, HATCH + 0.7, T));
      ch.innerMat.opacity = 1;
      ch.group.children[0].visible = T < HATCH + 0.3;
    }

    // butterfly
    const b = state.butterfly;
    b.root.visible = T >= HATCH;
    flyShadow.visible = b.root.visible && T >= FLY;
    if (b.root.visible) {
      const tt = T - FLY;
      const open = smooth(HATCH + 0.2, FLY, T);
      let sc = lerp(0.18, 0.7, easeOutBack(smooth(HATCH, FLY - 0.2, T)));
      let flap;
      if (reduce) {
        flap = 0.4;
        b.root.position.set(0, 2.1, 0.6);
        sc = 0.8;
      } else if (tt < 0) {
        flap = lerp(1.35, 0.4, open) + 0.1 * Math.sin((T - HATCH) * 3.2);
        b.root.position.copy(EMERGE);
      } else {
        const w = smooth(0, 2.2, tt);
        flightAt(tt, tmpA);
        b.root.position.lerpVectors(EMERGE, tmpA, w);
        b.root.position.y += Math.sin(T * 11) * 0.05;
        flap = 0.4 + 0.52 * Math.sin(T * 5.6) * smooth(0, 1.2, tt);
        const exit = clamp01((T - 37.6) / 2.4);
        b.root.position.y += exit * exit * 3.2;
        sc *= 1 - smooth(38.4, 40, T);
        flightAt(tt + 0.08, tmpB);
        const vx = (tmpB.x - tmpA.x) / 0.08;
        b.pivot.rotation.set(-0.38 + Math.sin(T * 5.6) * 0.06, vx * 0.12, -vx * 0.14 * w);
      }
      if (tt < 0 || reduce) b.pivot.rotation.set(-0.3, 0, 0);
      b.root.scale.setScalar(Math.max(0.001, sc));
      b.setFlap(flap);
      b.twinkle(T, reduce ? 0.6 : 1);
      if (!reduce && tt >= 0 && Math.random() < dt * 30) {
        const side = Math.random() > 0.5 ? 1 : -1;
        sparkles.emit(pf(b.root.position, side * (0.5 + Math.random() * 1.2) * sc, rnd(1.4) * sc, rnd(0.4)), { x: rnd(0.3), y: -0.2 - Math.random() * 0.3, z: rnd(0.2) }, { color: Math.random() > 0.4 ? state.pal.glow : state.pal.spot, size: 0.24, ttl: 1.1 });
      }
      flyShadow.position.set(b.root.position.x, 0.025, b.root.position.z);
      const h = Math.max(0, b.root.position.y);
      flyShadow.scale.setScalar(Math.max(0.2, 2.2 * sc * (1 - clamp01(h / 7))));
    }

    // hatch flash + shockwave
    const since = T - (flash.userData.at ?? -99);
    if (since >= 0 && since < 1.2) {
      flash.position.set(ANCHOR.x, ANCHOR.y - 0.45, ANCHOR.z + 0.2);
      flash.scale.setScalar(2 + since * 12);
      flash.material.opacity = (1 - since / 1.2) * 0.9;
      shock.position.copy(flash.position);
      shock.scale.setScalar(0.3 + since * 7);
      shock.material.opacity = (1 - since / 1.2) * 0.8;
    } else {
      flash.material.opacity = 0;
      shock.material.opacity = 0;
    }
  };

  // ------------------------------------------------------------ size, input, loop
  const px = { x: 0, target: 0 };
  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camBase.dist = Math.max(9.6, 4.9 / (Math.tan((camera.fov * Math.PI) / 360) * camera.aspect));
    camera.updateProjectionMatrix();
    const buf = renderer.getDrawingBufferSize(new THREE.Vector2());
    sparkles.setScale(buf.y / (2 * Math.tan((camera.fov * Math.PI) / 360)));
    needsRender = true;
  };
  let needsRender = true;
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(host);

  const onMove = (e) => {
    const r = host.getBoundingClientRect();
    px.target = ((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * 2;
  };
  const onLeave = () => {
    px.target = 0;
  };
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerleave', onLeave);

  let raf = 0;
  let last = performance.now();
  let ambient = 0;
  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || document.hidden) return;
    if (reduce && !needsRender) return;
    needsRender = false;

    if (!reduce) {
      T += dt;
      if (T >= LOOP) seek(0);
      while (evIdx < events.length && events[evIdx].t <= T) {
        events[evIdx].run();
        evIdx += 1;
      }
      ambient += dt;
      if (ambient > 0.3) {
        ambient = 0;
        sparkles.emit({ x: rnd(10), y: Math.random() * 0.4, z: rnd(5) }, { x: 0, y: 0.5, z: 0 }, { color: state.pal.glow, size: 0.18, ttl: 3.2 });
      }
    }
    const phaseNow = phaseAt(T);
    if (phaseNow !== phase) {
      phase = phaseNow;
      onPhase?.(phase);
    }

    pose(dt);
    sparkles.update(dt);

    px.x += (px.target - px.x) * Math.min(1, dt * 3);
    camera.position.set(px.x * 0.8, 3.0, camBase.dist);
    camera.lookAt(px.x * 0.25, 1.5, 0);
    glint.position.set(Math.cos(T * 0.9) * 4.2, 3.2 + Math.sin(T * 0.7), 2.2 + Math.sin(T * 0.9) * 1.5);
    ringA.rotation.z = reduce ? 0 : T * 0.12;
    ringB.rotation.z = reduce ? 0 : -T * 0.18;
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(tick);

  return {
    get styleId() {
      return state.id;
    },
    setStyle(id, { jump = false } = {}) {
      if (id === state.id && !jump) return;
      if (id !== state.id) mountButterfly(id);
      if (jump && !reduce) seek(HATCH - 0.4);
      needsRender = true;
    },
    // Fireworks on the butterfly: used when something is unlocked or equipped.
    celebrate() {
      if (reduce) return;
      const p = state.butterfly.root.visible ? state.butterfly.root.position : v3(0, 2, 0.5);
      sparkles.burst(p, 90, { color: state.pal.glow, speed: 3.6, size: 0.44, ttl: 1.8 });
      sparkles.burst(p, 40, { color: '#FFFFFF', speed: 2.4, size: 0.3, ttl: 1.4 });
    },
    replay() {
      if (reduce) return;
      seek(0);
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      state.butterfly.dispose();
      state.chrysalis.dispose();
      larva.dispose();
      diamonds.forEach((d) => d.dispose());
      sparkles.dispose();
      scene.traverse((o) => {
        if (o === state.butterfly.root || o === state.chrysalis.group) return;
        o.geometry?.dispose?.();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((m) => {
          Object.values(m).forEach((v) => v && v.isTexture && v.dispose());
          m.dispose();
        });
      });
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

export default function ButterflyStage({ styleId, dark = false, reduce = false, onPhase, onFail, apiRef }) {
  const hostRef = useRef(null);
  const styleRef = useRef(styleId);
  const phaseRef = useRef(onPhase);

  useEffect(() => {
    styleRef.current = styleId;
    apiRef.current?.setStyle(styleId, { jump: true });
  }, [styleId, apiRef]);

  useEffect(() => {
    phaseRef.current = onPhase;
  }, [onPhase]);

  useEffect(() => {
    let api = null;
    try {
      api = buildStage(hostRef.current, { dark, reduce, styleId: styleRef.current, onPhase: (p) => phaseRef.current?.(p) });
    } catch {
      onFail?.();
      return undefined;
    }
    apiRef.current = api;
    return () => {
      api.dispose();
      apiRef.current = null;
    };
  }, [dark, reduce, onFail, apiRef]);

  return <div ref={hostRef} role="img" aria-label="3D stage: a larva eats diamonds, grows, becomes a chrysalis and hatches into a crystal butterfly." style={{ width: '100%', height: '100%' }} />;
}
