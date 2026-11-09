import * as THREE from 'three';

// Blip: a glossy glowing orb with big eyes that hops and floats.
export function buildBlip(ctx) {
  const { f, rig, body, phys, glow, ink, white, mesh, sprite, emitter } = ctx;
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
}
