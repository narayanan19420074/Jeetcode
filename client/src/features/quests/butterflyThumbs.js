import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { paletteFor } from './butterflyCatalog';
import { buildButterfly, glowTexture, sparkleTexture } from './butterflyModel';

// Renders every butterfly once into a small transparent PNG (wings open, seen from the front) with a throw-away
// renderer, so the collection list shows the real 3D wings without running six live WebGL canvases.
export function renderButterflyThumbs(ids, { dark = false, size = 240 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(size, size, false);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envRT = pmrem.fromScene(room, 0.04);
  scene.environment = envRT.texture;
  room.dispose?.();
  pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(2, 4, 6);
  scene.add(key);
  const fill = new THREE.PointLight(0xffffff, 60, 0, 2);
  fill.position.set(-3, 2, 5);
  scene.add(fill);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0.2, 9.6);
  camera.lookAt(0, -0.2, 0);

  const glow = glowTexture();
  const sparkle = sparkleTexture();
  const out = {};
  try {
    ids.forEach((id) => {
      const b = buildButterfly(paletteFor(id), { dark, sparkle, glow });
      b.pivot.rotation.set(-0.2, 0, 0);
      b.setFlap(0.2);
      b.twinkle(0.6, 1);
      scene.add(b.root);
      renderer.render(scene, camera);
      out[id] = renderer.domElement.toDataURL('image/png');
      scene.remove(b.root);
      b.dispose();
    });
  } finally {
    glow.dispose();
    sparkle.dispose();
    envRT.dispose();
    renderer.dispose();
    renderer.forceContextLoss?.();
  }
  return out;
}
