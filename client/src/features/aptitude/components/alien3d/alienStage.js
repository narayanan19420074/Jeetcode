import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildMascot } from './buildMascot';

// WebGL renderer, image-based lighting, camera and rig for one mascot.
// Returns null when the browser refuses to create a WebGL context so the
// caller can fall back to the 2D sprite.
export function createAlienStage(mount, size, kind, brand) {
  const W = size;
  const H = Math.round(size * 1.3);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  mount.appendChild(renderer.domElement);
  renderer.domElement.style.display = 'block';

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  const envRT = pmrem.fromScene(envScene, 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.62;
  envScene.dispose?.();

  const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 60);
  camera.position.set(0, 3.0, 11.2);
  camera.lookAt(0, 2.15, 0);

  scene.add(new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(-3.5, 6, 6);
  scene.add(key);

  const rig = buildMascot(kind, brand);
  scene.add(rig.root);
  const rim = new THREE.PointLight(rig.accent, 55, 16);
  rim.position.set(3.2, 3.5, -3.2);
  scene.add(rim);
  const fill = new THREE.PointLight(0xbcd2ff, 10, 16);
  fill.position.set(2.6, 2.2, 5.5);
  scene.add(fill);
  if (kind === 'ember') {
    const fire = new THREE.PointLight(0xff7a1a, 30, 10);
    fire.position.set(0, 3.4, 1.4);
    scene.add(fire);
  }
  return {
    renderer,
    scene,
    camera,
    rig,
    dispose() {
      rig.dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
