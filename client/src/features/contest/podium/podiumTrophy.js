import * as THREE from 'three';

// Gold trophy shown on the first-place block.

export function buildTrophy() {
  const gold = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 1, roughness: 0.2, emissive: 0x7a4a00, emissiveIntensity: 0.35 });
  const profile = [[0, 0], [0.36, 0], [0.36, 0.06], [0.16, 0.12], [0.1, 0.2], [0.1, 0.45], [0.28, 0.58], [0.4, 0.9], [0.36, 0.98], [0, 0.98]].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 32), gold));
  [-1, 1].forEach((side) => {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 20, Math.PI), gold);
    handle.position.set(side * 0.4, 0.72, 0);
    handle.rotation.z = side * (Math.PI / 2) * -1;
    g.add(handle);
  });
  return g;
}
