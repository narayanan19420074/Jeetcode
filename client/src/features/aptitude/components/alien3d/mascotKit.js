import * as THREE from 'three';
import { BRAND_BLIP, FORMS } from './alienForms';
import { rnd, softTexture, starSkin, magmaSkin } from './alienTextures';

// Shared materials, mesh helpers and the animation rig skeleton every mascot form is built from.
export function createMascotKit(kind, brand = false) {
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

  return { f, kind, crystal, rig, body, root, track, disposables, soft, phys, glow, basic, skin, belly, gloveMat, shoeMat, soleMat, eyeWhite, irisMat, ink, white, mesh, sprite, makeEye, emitter };
}
