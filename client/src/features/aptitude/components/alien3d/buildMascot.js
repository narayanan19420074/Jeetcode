import * as THREE from 'three';
import { COLOR_PALETTE, withAlpha } from '../../../../app/design/designTokens';
import { createMascotKit } from './mascotKit';
import { cvs } from './alienTextures';
import { buildBlip } from './buildBlip';
import { buildBipedBody } from './buildBiped';
import { buildFormExtras } from './buildFormExtras';

// Assembles one mascot: form-specific body, then the ground shadow and glow pad.
export function buildMascot(kind, brand = false) {
  const ctx = createMascotKit(kind, brand);
  const { f, rig, root, track, disposables } = ctx;
  if (kind === 'blip') {
    buildBlip(ctx);
  } else {
    buildBipedBody(ctx);
    buildFormExtras(ctx);
  }

  /* ground contact */
  const [sc, sg] = cvs(128);
  const sh = sg.createRadialGradient(64, 64, 4, 64, 64, 62);
  sh.addColorStop(0, withAlpha(COLOR_PALETTE.black, 0.5));
  sh.addColorStop(1, withAlpha(COLOR_PALETTE.black, 0));
  sg.fillStyle = sh;
  sg.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(track(new THREE.PlaneGeometry(3.2, 3.2)), track(new THREE.MeshBasicMaterial({ map: track(new THREE.CanvasTexture(sc)), transparent: true, depthWrite: false })));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.012;
  root.add(shadow);
  const pad = new THREE.Mesh(track(new THREE.RingGeometry(0.95, 1.02, 72)), track(new THREE.MeshBasicMaterial({ color: f.glow, transparent: true, opacity: 0.55, side: THREE.DoubleSide })));
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = 0.02;
  root.add(pad);
  rig.shadow = shadow;
  rig.pad = pad;
  rig.accent = f.glow;
  rig.dispose = () => disposables.forEach((d) => d.dispose?.());
  return rig;
}
