import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { paletteFor } from './butterflyCatalog';
import { buildButterfly, createSparkles, glowTexture, sparkleTexture } from './butterflyModel';

// The sidebar butterfly: one crystal butterfly that keeps flying in a loop. Upgrading swaps its wings and sets off a burst.

function buildShowcase(host, { styleId, reduce }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  const el = renderer.domElement;
  el.style.cssText = 'display:block;width:100%;height:100%';
  host.appendChild(el);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envRT = pmrem.fromScene(room, 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 1;
  room.dispose?.();
  pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(2, 4, 6);
  scene.add(key);
  const glint = new THREE.PointLight(0xffffff, 150, 0, 2);
  scene.add(glint);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  const glow = glowTexture();
  const sparkle = sparkleTexture();
  const sparkles = createSparkles(sparkle, true, 260);
  scene.add(sparkles.points);

  let id = styleId;
  let b = null;
  const mount = () => {
    if (b) {
      scene.remove(b.root);
      b.dispose();
    }
    b = buildButterfly(paletteFor(id), { dark: true, sparkle, glow });
    b.root.scale.setScalar(0.62);
    scene.add(b.root);
    glint.color.set(paletteFor(id).spot);
  };
  mount();

  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tanH = Math.tan((camera.fov * Math.PI) / 360);
    camera.position.set(0, 0.4, Math.max(9.5, 2.5 / (tanH * camera.aspect), 2.2 / tanH));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    sparkles.setScale(renderer.getDrawingBufferSize(new THREE.Vector2()).y / (2 * tanH));
    needsRender = true;
  };
  let needsRender = true;
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
  });
  io.observe(host);

  let T = 0;
  let raf = 0;
  let last = performance.now();
  const p0 = new THREE.Vector3();
  const p1 = new THREE.Vector3();
  const path = (t, out) => out.set(1.0 * Math.sin(t * 0.7), 0.5 * Math.sin(t * 1.4 + 0.5), 0.9 * Math.sin(t * 0.5 + 1));
  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || document.hidden) return;
    if (reduce && !needsRender) return;
    needsRender = false;
    if (!reduce) T += dt;

    if (reduce) {
      b.root.position.set(0, 0, 0);
      b.pivot.rotation.set(-0.2, 0, 0);
      b.setFlap(0.4);
    } else {
      path(T, p0);
      path(T + 0.08, p1);
      b.root.position.copy(p0);
      b.root.position.y += Math.sin(T * 11) * 0.04;
      const vx = (p1.x - p0.x) / 0.08;
      b.pivot.rotation.set(-0.3 + Math.sin(T * 5.6) * 0.06, vx * 0.12, -vx * 0.14);
      b.setFlap(0.4 + 0.52 * Math.sin(T * 5.6));
      if (Math.random() < dt * 32) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const q = b.root.position;
        sparkles.emit({ x: q.x + side * (0.4 + Math.random()) , y: q.y + (Math.random() - 0.5) * 1.1, z: q.z }, { x: 0, y: -0.25 - Math.random() * 0.3, z: 0 }, { color: Math.random() > 0.4 ? paletteFor(id).glow : '#FFFFFF', size: 0.22, ttl: 1.1 });
      }
    }
    b.twinkle(T, reduce ? 0.6 : 1);
    glint.position.set(Math.cos(T * 0.9) * 4, 2.5 + Math.sin(T * 0.7), 3);
    sparkles.update(dt);
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(tick);

  return {
    setStyle(next) {
      if (next === id) return;
      id = next;
      mount();
      needsRender = true;
    },
    celebrate() {
      sparkles.burst(b.root.position, 90, { color: paletteFor(id).glow, speed: 3.2, size: 0.4, ttl: 1.7 });
      sparkles.burst(b.root.position, 40, { color: '#FFFFFF', speed: 2.2, size: 0.28, ttl: 1.3 });
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      b.dispose();
      sparkles.dispose();
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((m) => m.dispose());
      });
      glow.dispose();
      sparkle.dispose();
      envRT.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
      if (el.parentNode === host) host.removeChild(el);
    },
  };
}

export default function ButterflyShowcase({ styleId, reduce = false, onFail, apiRef }) {
  const hostRef = useRef(null);
  const styleRef = useRef(styleId);
  styleRef.current = styleId;

  useEffect(() => {
    let api = null;
    try {
      api = buildShowcase(hostRef.current, { styleId: styleRef.current, reduce });
    } catch {
      onFail?.();
      return undefined;
    }
    apiRef.current = api;
    return () => {
      api.dispose();
      apiRef.current = null;
    };
  }, [reduce, onFail, apiRef]);

  useEffect(() => {
    apiRef.current?.setStyle(styleId);
  }, [styleId, apiRef]);

  return <div ref={hostRef} role="img" aria-label="Your crystal butterfly, flying" style={{ width: '100%', height: '100%' }} />;
}
