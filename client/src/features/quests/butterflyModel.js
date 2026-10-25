import * as THREE from 'three';

// Everything the Quests stage is made of, built from plain three.js primitives (no model files, no extra packages):
// crystal-cut butterfly wings, the larva, the jade chrysalis, the spinning diamond and a small sparkle system.

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const easeOutBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

const rng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

function canvasTex(size, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  draw(canvas.getContext('2d'), size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const glowTexture = () =>
  canvasTex(128, (c, S) => {
    const g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, S, S);
  });

// Four-point star with a soft core: the "glint" on gems.
export const sparkleTexture = () =>
  canvasTex(128, (c, S) => {
    const m = S / 2;
    const g = c.createRadialGradient(m, m, 0, m, m, m * 0.5);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, S, S);
    c.fillStyle = 'rgba(255,255,255,0.95)';
    [[1, 0], [0, 1]].forEach(([ax, ay]) => {
      c.beginPath();
      c.moveTo(m - ax * m, m - ay * m);
      c.lineTo(m + ay * 4, m + ax * 4);
      c.lineTo(m + ax * m, m + ay * m);
      c.lineTo(m - ay * 4, m - ax * 4);
      c.closePath();
      c.fill();
    });
  });

const disposeTree = (obj) => {
  obj.traverse((o) => {
    o.geometry?.dispose?.();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    mats.forEach((m) => m.dispose());
  });
};

// ------------------------------------------------------------------ wings
// Outlines of the right wings (x outward, y towards the head). The root sits at the origin, on the body.
const FORE = [[0, 0.02], [0.28, 0.42], [0.8, 0.98], [1.45, 1.5], [1.98, 1.42], [2.12, 0.95], [1.86, 0.4], [1.25, -0.04], [0.55, -0.14]];
const HIND = [[0, -0.02], [0.62, -0.06], [1.28, -0.3], [1.62, -0.85], [1.45, -1.45], [1.0, -1.95], [0.62, -1.55], [0.28, -0.95]];
const SPOT = { fore: [1.55, 1.0, 0.28], hind: [0.95, -1.05, 0.3] };
const RING = [1, 0.74, 0.46, 0.2]; // concentric facet rings, outer to inner
const DOME = 0.26; // how high the centre of a wing is lifted, so it reads as a cut stone and not a flat sticker

function facetColor(pal, t, cx, cy, kind, rand) {
  const col = new THREE.Color();
  if (pal.rainbow) {
    col.setHSL((0.55 + t * 0.45 + Math.atan2(cy, cx) * 0.08 + rand() * 0.05 + 2) % 1, 0.9, 0.58);
  } else {
    const a = new THREE.Color(pal.inner);
    const b = new THREE.Color(pal.mid);
    const c = new THREE.Color(pal.outer);
    col.copy(t < 0.55 ? a.lerp(b, t / 0.55) : b.lerp(c, (t - 0.55) / 0.45));
  }
  if (t > 0.8) col.lerp(new THREE.Color(pal.rim), 0.55);
  const [sx, sy, sr] = SPOT[kind];
  if (Math.hypot(cx - sx, cy - sy) < sr) col.set(pal.spot);
  return col.multiplyScalar(0.86 + rand() * 0.3); // every facet catches the light a little differently
}

function wingGeometry(kind, pal, mirror, seed) {
  const curve = new THREE.CatmullRomCurve3((kind === 'fore' ? FORE : HIND).map(([x, y]) => new THREE.Vector3(x, y, 0)), true, 'centripetal');
  const N = 30;
  const outline = curve.getPoints(N).slice(0, N);
  const mid = outline.reduce((a, p) => a.add(p), new THREE.Vector3()).divideScalar(N);
  const rand = rng(seed);

  const rings = RING.map((k, ri) =>
    outline.map((p, j) => {
      const zig = ri === 0 ? 1 : j % 2 ? 0.93 : 1.04; // zig-zag the inner rings: star facets like a brilliant cut
      return new THREE.Vector3(mid.x + (p.x - mid.x) * k * zig, mid.y + (p.y - mid.y) * k * zig, DOME * Math.pow(1 - k, 1.1) + (ri > 0 && j % 2 ? 0.014 : 0));
    })
  );
  const centre = new THREE.Vector3(mid.x, mid.y, DOME * 1.08);

  const tris = []; // [a, b, c, t]
  for (let r = 0; r < RING.length - 1; r += 1) {
    const t = (RING[r] + RING[r + 1]) / 2;
    for (let j = 0; j < N; j += 1) {
      const j1 = (j + 1) % N;
      const a = rings[r][j];
      const b = rings[r][j1];
      const c = rings[r + 1][j];
      const d = rings[r + 1][j1];
      tris.push([a, c, d, t], [a, d, b, t]);
    }
  }
  const last = rings[RING.length - 1];
  for (let j = 0; j < N; j += 1) tris.push([centre, last[(j + 1) % N], last[j], RING[RING.length - 1] / 2]);

  const pos = new Float32Array(tris.length * 9);
  const col = new Float32Array(tris.length * 9);
  tris.forEach(([a, b, c, t], i) => {
    const cx = (a.x + b.x + c.x) / 3;
    const cy = (a.y + b.y + c.y) / 3;
    const color = facetColor(pal, t, cx, cy, kind, rand);
    const order = mirror ? [a, c, b] : [a, b, c]; // mirrored wing: flip x and the winding together
    order.forEach((v, k) => {
      const o = i * 9 + k * 3;
      pos[o] = mirror ? -v.x : v.x;
      pos[o + 1] = v.y;
      pos[o + 2] = v.z;
      col[o] = color.r;
      col[o + 1] = color.g;
      col[o + 2] = color.b;
    });
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals(); // not indexed => one normal per facet => flat, gem-like shading
  return geo;
}

const GLINTS = [[2.0, 1.36, 0.03, 1], [1.55, 1.0, 0.1, 0.8], [0.95, 0.7, 0.16, 0.7], [1.45, -1.4, 0.04, 0.8], [0.96, -1.05, 0.1, 0.75], [1.0, -1.9, 0.03, 0.9]];

// One butterfly. `root` is moved/scaled by the scene, `pivot` is tilted and banked, `setFlap(a)` opens/closes the wings.
export function buildButterfly(pal, { dark = false, sparkle, glow } = {}) {
  const blend = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
  const root = new THREE.Group();
  const pivot = new THREE.Group();
  root.add(pivot);

  const wingMat = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    metalness: 0.3,
    roughness: 0.14,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    iridescence: 1,
    iridescenceIOR: 1.8,
    iridescenceThicknessRange: [180, 720],
    flatShading: true,
    side: THREE.DoubleSide,
    emissive: new THREE.Color(pal.glow),
    emissiveIntensity: dark ? 0.2 : 0.1,
    envMapIntensity: dark ? 2 : 1.7,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const edgeMat = new THREE.LineBasicMaterial({ color: pal.spot, transparent: true, opacity: dark ? 0.5 : 0.4, depthWrite: false, blending: blend });
  const glintMat = new THREE.SpriteMaterial({ map: sparkle, color: dark ? 0xffffff : new THREE.Color(pal.glow), transparent: true, depthWrite: false, blending: blend });

  const wings = { right: new THREE.Group(), left: new THREE.Group() };
  const glints = [];
  [false, true].forEach((mirror) => {
    const side = mirror ? wings.left : wings.right;
    pivot.add(side);
    ['fore', 'hind'].forEach((kind) => {
      const geo = wingGeometry(kind, pal, mirror, kind === 'fore' ? 11 : 29);
      const mesh = new THREE.Mesh(geo, wingMat);
      if (kind === 'hind') mesh.position.z = -0.02;
      side.add(mesh);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 6), edgeMat);
      if (kind === 'hind') edges.position.z = -0.02;
      side.add(edges);
    });
    GLINTS.forEach(([x, y, z, size], i) => {
      const s = new THREE.Sprite(glintMat.clone());
      s.position.set(mirror ? -x : x, y, z);
      s.userData = { size, phase: i * 1.7 + (mirror ? 0.9 : 0) };
      side.add(s);
      glints.push(s);
    });
  });

  // body: thorax + tapered abdomen, head, eyes, antennae
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: pal.body, metalness: 0.55, roughness: 0.28, iridescence: 0.8, clearcoat: 1, emissive: new THREE.Color(pal.glow), emissiveIntensity: 0.12 });
  const profile = [[0, -1.2], [0.04, -1.1], [0.08, -0.85], [0.1, -0.5], [0.12, -0.2], [0.15, 0.04], [0.16, 0.18], [0.13, 0.34], [0, 0.42]].map(([r, y]) => new THREE.Vector2(r, y));
  pivot.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 20), bodyMat));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), bodyMat);
  head.position.y = 0.5;
  pivot.add(head);
  const eyeMat = new THREE.MeshBasicMaterial({ color: pal.spot, toneMapped: false });
  [-1, 1].forEach((s) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), eyeMat);
    eye.position.set(s * 0.08, 0.53, 0.09);
    pivot.add(eye);
    const curveA = new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.03, 0.58, 0), new THREE.Vector3(s * 0.14, 0.95, 0.04), new THREE.Vector3(s * 0.34, 1.28, 0.08)]);
    pivot.add(new THREE.Mesh(new THREE.TubeGeometry(curveA, 12, 0.011, 6), bodyMat));
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), eyeMat);
    tip.position.set(s * 0.34, 1.28, 0.08);
    pivot.add(tip);
  });

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: pal.glow, transparent: true, opacity: dark ? 0.5 : 0.34, depthWrite: false, blending: blend }));
  halo.scale.setScalar(5.2);
  halo.position.z = -0.2;
  pivot.add(halo);

  const setFlap = (a) => {
    wings.right.rotation.y = -a;
    wings.left.rotation.y = a;
  };
  setFlap(0.3);

  return {
    root,
    pivot,
    halo,
    glints,
    setFlap,
    twinkle(t, amount = 1) {
      glints.forEach((g) => {
        const k = Math.pow(0.5 + 0.5 * Math.sin(t * 3.2 + g.userData.phase), 3);
        g.scale.setScalar((0.1 + 0.55 * k) * g.userData.size * amount + 0.001);
        g.material.opacity = 0.35 + 0.65 * k;
      });
    },
    dispose() {
      disposeTree(root);
      glintMat.dispose();
    },
  };
}

// ------------------------------------------------------------------ larva
const LARVA_RADII = [0.31, 0.27, 0.3, 0.32, 0.32, 0.3, 0.27, 0.22, 0.15];

export function buildLarva() {
  const group = new THREE.Group();
  const sphere = new THREE.SphereGeometry(1, 28, 20);
  const mk = (color, emissive) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.2, emissive, emissiveIntensity: 0.28 });
  const lime = mk('#A3FF3F', '#2F8F00');
  const mint = mk('#2EE6A6', '#00875E');
  const headMat = mk('#B15CFF', '#5B1FBF');
  const dotMat = new THREE.MeshPhysicalMaterial({ color: '#FF4D8D', roughness: 0.3, clearcoat: 1, emissive: '#FF1E6E', emissiveIntensity: 0.35 });

  const segs = LARVA_RADII.map((r, i) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(sphere, i === 0 ? headMat : i % 2 ? lime : mint);
    body.scale.setScalar(r);
    g.add(body);
    if (i > 0 && i < LARVA_RADII.length - 1) {
      const dot = new THREE.Mesh(sphere, dotMat);
      dot.scale.setScalar(0.085);
      dot.position.y = r * 0.95;
      g.add(dot);
    }
    group.add(g);
    return g;
  });

  // face (local +x is "forward")
  const head = segs[0];
  const white = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
  const black = new THREE.MeshBasicMaterial({ color: '#1B1030' });
  [-1, 1].forEach((s) => {
    const eye = new THREE.Mesh(sphere, white);
    eye.scale.setScalar(0.1);
    eye.position.set(0.2, 0.12, s * 0.15);
    head.add(eye);
    const pupil = new THREE.Mesh(sphere, black);
    pupil.scale.setScalar(0.055);
    pupil.position.set(0.28, 0.13, s * 0.15);
    head.add(pupil);
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.26, 6), dotMat);
    stalk.position.set(0.08, 0.38, s * 0.12);
    stalk.rotation.set(s * 0.35, 0, -0.35);
    head.add(stalk);
    const ball = new THREE.Mesh(sphere, dotMat);
    ball.scale.setScalar(0.04);
    ball.position.set(0.14, 0.5, s * 0.16);
    head.add(ball);
  });

  return {
    group,
    segs,
    radii: LARVA_RADII,
    dispose() {
      disposeTree(group);
      sphere.dispose();
    },
  };
}

// ------------------------------------------------------------------ diamond
export function buildDiamond({ dark = false, sparkle, glow }) {
  const blend = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
  const group = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xdff8ff,
    roughness: 0.02,
    transmission: 1,
    thickness: 1.4,
    ior: 2.2,
    iridescence: 1,
    iridescenceIOR: 1.9,
    iridescenceThicknessRange: [150, 620],
    clearcoat: 1,
    attenuationColor: new THREE.Color('#7DD3FC'),
    attenuationDistance: 1.6,
    envMapIntensity: dark ? 3 : 2.4,
    flatShading: true,
  });
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.8, 0.34, 8, 1), mat);
  crown.position.y = 0.17;
  const pavilion = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.9, 8, 1), mat);
  pavilion.rotation.x = Math.PI;
  pavilion.position.y = -0.45;
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.28), new THREE.MeshBasicMaterial({ color: '#A5F3FC', toneMapped: false }));
  core.position.y = -0.05;
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, depthWrite: false });
  const lines = [crown, pavilion].map((m) => {
    const l = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 10), lineMat);
    l.position.copy(m.position);
    l.rotation.copy(m.rotation);
    return l;
  });
  group.add(crown, pavilion, core, ...lines);

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: dark ? 0x67e8f9 : 0x38bdf8, transparent: true, opacity: dark ? 0.55 : 0.4, depthWrite: false, blending: blend }));
  halo.scale.setScalar(3.2);
  const stars = [0, 1, 2].map((i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkle, color: dark ? 0xffffff : 0x0ea5e9, transparent: true, depthWrite: false, blending: blend }));
    s.userData.phase = i * 2.1;
    return s;
  });
  const holder = new THREE.Group(); // glow + stars live outside the spinning gem
  holder.add(halo, ...stars);

  return {
    gem: group,
    holder,
    update(t) {
      group.rotation.y = t * 1.1;
      group.rotation.z = Math.sin(t * 0.9) * 0.12;
      stars.forEach((s) => {
        const a = t * 1.3 + s.userData.phase;
        s.position.set(Math.cos(a) * 0.75, 0.15 + Math.sin(a * 1.7) * 0.45, Math.sin(a) * 0.75);
        const k = Math.pow(0.5 + 0.5 * Math.sin(t * 4 + s.userData.phase), 3);
        s.scale.setScalar(0.12 + 0.5 * k);
        s.material.opacity = 0.3 + 0.7 * k;
      });
    },
    dispose() {
      disposeTree(group);
      disposeTree(holder);
    },
  };
}

// ------------------------------------------------------------------ sparkles
const VERT = `
attribute float aSize; attribute float aAlpha; attribute vec3 aColor;
uniform float uScale; varying float vA; varying vec3 vC;
void main() {
  vA = aAlpha; vC = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uScale / max(0.1, -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = `
uniform sampler2D uMap; varying float vA; varying vec3 vC;
void main() {
  vec4 t = texture2D(uMap, gl_PointCoord);
  gl_FragColor = vec4(vC, t.a * vA);
  #include <colorspace_fragment>
}`;

// A pool of short-lived sparkles. `emit` is cheap, `update` moves, fades and (optionally) pulls them towards a point.
export function createSparkles(texture, dark, max = 420) {
  const pos = new Float32Array(max * 3);
  const colors = new Float32Array(max * 3);
  const sizes = new Float32Array(max);
  const alphas = new Float32Array(max);
  const vel = new Float32Array(max * 3);
  const age = new Float32Array(max).fill(1e9);
  const life = new Float32Array(max).fill(1);
  const base = new Float32Array(max);
  const pull = new Float32Array(max);
  const target = new Array(max).fill(null);
  let cursor = 0;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uMap: { value: texture }, uScale: { value: 400 } },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  const tmp = new THREE.Color();

  return {
    points,
    setScale: (v) => {
      mat.uniforms.uScale.value = v;
    },
    emit(p, v, { color = '#ffffff', size = 0.3, ttl = 1, to = null, strength = 0 } = {}) {
      const i = cursor;
      cursor = (cursor + 1) % max;
      pos.set([p.x, p.y, p.z], i * 3);
      vel.set([v.x, v.y, v.z], i * 3);
      tmp.set(color);
      colors.set([tmp.r, tmp.g, tmp.b], i * 3);
      base[i] = size;
      life[i] = ttl;
      age[i] = 0;
      target[i] = to;
      pull[i] = strength;
    },
    burst(p, n, { color = '#ffffff', speed = 2.4, size = 0.36, ttl = 1.3, spread = 1 } = {}) {
      for (let k = 0; k < n; k += 1) {
        const a = Math.random() * Math.PI * 2;
        const u = (Math.random() * 2 - 1) * spread;
        const r = Math.sqrt(1 - u * u);
        const s = speed * (0.35 + Math.random() * 0.8);
        this.emit(p, { x: Math.cos(a) * r * s, y: u * s + 0.4, z: Math.sin(a) * r * s }, { color, size: size * (0.6 + Math.random() * 0.8), ttl: ttl * (0.6 + Math.random() * 0.6) });
      }
    },
    update(dt) {
      for (let i = 0; i < max; i += 1) {
        age[i] += dt;
        const k = age[i] / life[i];
        if (k >= 1) {
          alphas[i] = 0;
          sizes[i] = 0;
          continue;
        }
        const o = i * 3;
        if (target[i] && pull[i] > 0) {
          const g = pull[i] * dt;
          vel[o] += (target[i].x - pos[o]) * g;
          vel[o + 1] += (target[i].y - pos[o + 1]) * g;
          vel[o + 2] += (target[i].z - pos[o + 2]) * g;
          const damp = 1 - Math.min(0.9, 3 * dt);
          vel[o] *= damp;
          vel[o + 1] *= damp;
          vel[o + 2] *= damp;
        } else {
          vel[o + 1] -= 0.9 * dt;
          const damp = 1 - Math.min(0.9, 1.1 * dt);
          vel[o] *= damp;
          vel[o + 1] *= damp;
          vel[o + 2] *= damp;
        }
        pos[o] += vel[o] * dt;
        pos[o + 1] += vel[o + 1] * dt;
        pos[o + 2] += vel[o + 2] * dt;
        alphas[i] = Math.min(1, k * 8) * (1 - k * k);
        sizes[i] = base[i] * (0.6 + 0.4 * (1 - k));
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aColor.needsUpdate = true;
      geo.attributes.aSize.needsUpdate = true;
      geo.attributes.aAlpha.needsUpdate = true;
    },
    dispose() {
      geo.dispose();
      mat.dispose();
    },
  };
}
