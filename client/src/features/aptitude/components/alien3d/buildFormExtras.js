import * as THREE from 'three';
import { rnd } from './alienTextures';

// Per-form signature pieces: zapp quills + sparks, ember flame mane, crystal crown, nova halo and orbit.
export function buildFormExtras(ctx) {
  const { f, kind, rig, body, track, phys, glow, mesh, sprite, emitter } = ctx;
  const { head, torso } = rig;
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
