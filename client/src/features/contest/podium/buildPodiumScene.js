import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { COLOR_PALETTE } from '../../../app/design/designTokens';
import { MEDAL, SLOTS, LOCKED, SPARK_COLORS, clamp01, easeOutBack } from './podiumConstants';
import { canvasTex, glowTexture, questionTexture, winnerTexture } from './podiumTextures';
import { createFireworks } from './podiumFireworks';
import { buildTrophy } from './podiumTrophy';

export function buildScene(host, winners, { reveal: startRevealed, reduce, dark }) {
  const BLEND = dark ? THREE.AdditiveBlending : THREE.NormalBlending; // glow adds up on dark, tints on light
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = dark ? 1.05 : 1;
  const el = renderer.domElement;
  el.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab';
  host.appendChild(el);

  const scene = new THREE.Scene();
  // soft pastel backdrop. (An opaque background also keeps the glass visible: transmission needs something behind it.)
  scene.background = canvasTex(4, 256, (c, W, H) => {
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, dark ? COLOR_PALETTE.gray[950] : COLOR_PALETTE.orange[50]);
    g.addColorStop(0.55, dark ? COLOR_PALETTE.custom.gray161B22 : COLOR_PALETTE.orange[50]);
    g.addColorStop(1, dark ? COLOR_PALETTE.gray[800] : COLOR_PALETTE.custom.orangeF1E7DD);
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  });
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envRT = pmrem.fromScene(room, 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = dark ? 0.9 : 1;
  room.dispose?.();
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
  const stage = new THREE.Group();
  scene.add(stage);

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, dark ? 1.4 : 1.1);
  key.position.set(2, 6, 5);
  scene.add(key);
  const violet = new THREE.PointLight(0x818cf8, dark ? 110 : 60, 0, 2);
  violet.position.set(-3.5, 3, 3);
  scene.add(violet);
  const amber = new THREE.PointLight(0xfbbf24, dark ? 120 : 70, 0, 2);
  amber.position.set(3.5, 4, 3);
  scene.add(amber);

  const glow = glowTexture();

  // floor: dark disc, two neon rings, soft glow
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(4.3, 4.5, 0.12, 72), new THREE.MeshStandardMaterial({ color: dark ? 0x1f2630 : 0xfffbf7, metalness: dark ? 0.5 : 0.1, roughness: 0.3 }));
  floor.position.y = -0.06;
  stage.add(floor);
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(4.3, 0.03, 12, 120), new THREE.MeshBasicMaterial({ color: dark ? 0xf58a6e : 0xef6c4d, toneMapped: false }));
  ringA.rotation.x = Math.PI / 2;
  ringA.position.y = 0.01;
  stage.add(ringA);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.02, 12, 120), new THREE.MeshBasicMaterial({ color: 0x6366f1, toneMapped: false }));
  ringB.rotation.x = Math.PI / 2;
  ringB.position.y = 0.01;
  stage.add(ringB);
  const floorGlow = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ map: glow, color: dark ? 0x6366f1 : 0x818cf8, transparent: true, opacity: dark ? 0.55 : 0.35, depthWrite: false, blending: BLEND }));
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
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: glow, color: dark ? 0xa5b4fc : 0x6366f1, size: 0.1, transparent: true, opacity: dark ? 0.7 : 0.45, depthWrite: false, blending: BLEND }));
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
      color: dark ? new THREE.Color(m.hex).lerp(new THREE.Color(0xffffff), 0.45) : 0xffffff, metalness: 0, roughness: 0.06, transmission: 1, thickness: 1.6, ior: 1.45,
      attenuationColor: new THREE.Color(m.hex), attenuationDistance: dark ? 1.3 : 1.8, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: dark ? 2.2 : 1.4,
    });
    const block = new THREE.Mesh(new RoundedBoxGeometry(1.7, h, 1.7, 5, 0.09).translate(0, h / 2, 0), glass);
    // glowing light column inside the glass
    const core = new THREE.Mesh(
      new RoundedBoxGeometry(0.5, h * 0.86, 0.5, 3, 0.05).translate(0, h * 0.5, 0),
      new THREE.MeshStandardMaterial({ color: m.hex, emissive: m.hex, emissiveIntensity: dark ? 1.1 : 0.55, roughness: 0.5 }),
    );
    block.add(core);
    group.add(block);

    const cap = new THREE.Mesh(new RoundedBoxGeometry(1.55, 0.07, 1.55, 2, 0.03), new THREE.MeshBasicMaterial({ color: m.hex, toneMapped: false }));
    group.add(cap);

    let label = null;
    if (w) {
      label = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, (1.5 * 330) / 512),
        new THREE.MeshBasicMaterial({ map: winnerTexture({ ...w, rank }, dark), transparent: true, depthWrite: false, toneMapped: false }),
      );
      label.position.set(0, h * 0.5, 0.88);
      label.visible = false;
      group.add(label);
    }

    const q = new THREE.Sprite(new THREE.SpriteMaterial({ map: questionTexture(m.css, dark), transparent: true, depthWrite: false, toneMapped: false }));
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
    const ringMat = new THREE.MeshBasicMaterial({ color: dark ? 0xfde68a : 0xf59e0b, transparent: true, opacity: 0.85, toneMapped: false });
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.012, 8, 90), ringMat);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.012, 8, 90), ringMat);
    orbit.add(r1, r2);
    const orbs = [0, 1, 2].map(() => {
      const o = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: dark ? 0xfde68a : 0xf59e0b, transparent: true, depthWrite: false, blending: BLEND }));
      o.scale.setScalar(0.4);
      orbit.add(o);
      return o;
    });
    first.group.add(orbit);
    first.r1 = r1;
    first.r2 = r2;
    first.orbs = orbs;
  }

  const fw = createFireworks(scene, glow, BLEND);

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
