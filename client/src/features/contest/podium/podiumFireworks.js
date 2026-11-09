import * as THREE from 'three';

// Celebration fireworks fired when the podium is revealed.

export function createFireworks(scene, glow, blend) {
  let time = 0;
  const queue = [];
  const rockets = [];
  const bursts = [];

  const spawnRocket = (o) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: o.color, transparent: true, depthWrite: false, blending: blend }));
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
    const mat = new THREE.PointsMaterial({ map: glow, color, size: big ? 0.4 : 0.3, transparent: true, depthWrite: false, blending: blend, opacity: 1 });
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
