import * as THREE from 'three';

// Shared biped body (legs, torso, arms, head, face) for zapp / ember / crystalix / nova.
export function buildBipedBody(ctx) {
  const { f, kind, crystal, rig, body, phys, glow, skin, belly, gloveMat, shoeMat, soleMat, ink, mesh, sprite, makeEye } = ctx;
  const makeLeg = (x) => {
    const hip = new THREE.Group();
    hip.position.set(x, 0.82, 0);
    mesh(hip, new THREE.CylinderGeometry(0.14, 0.11, 0.6, crystal ? 6 : 18), skin, [0, -0.28, 0]);
    const shoe = new THREE.Group();
    shoe.position.set(0, -0.6, 0);
    hip.add(shoe);
    mesh(shoe, new THREE.SphereGeometry(0.32, crystal ? 8 : 24, 16), shoeMat, [0, 0, 0.2], [0.95, 0.6, 1.6]);
    mesh(shoe, new THREE.SphereGeometry(0.33, crystal ? 8 : 24, 12), soleMat, [0, -0.13, 0.2], [0.97, 0.18, 1.62]);
    mesh(shoe, new THREE.TorusGeometry(0.14, 0.03, 8, 20), kind === 'ember' ? glow(f.accent, 1.8) : phys(f.accent, { roughness: 0.4 }), [0, 0.14, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
    body.add(hip);
    return hip;
  };
  rig.legs = [makeLeg(-0.28), makeLeg(0.28)];

  const torso = new THREE.Group();
  torso.position.set(0, 1.5, 0);
  body.add(torso);
  rig.torso = torso;
  mesh(torso, crystal ? new THREE.IcosahedronGeometry(0.62, 1) : new THREE.SphereGeometry(0.62, 32, 24), skin, [0, 0, 0], [0.95, 1.12, 0.82]);
  mesh(torso, new THREE.SphereGeometry(0.4, 24, 18), belly, [0, -0.04, 0.2], [0.95, 1.1, 0.55]);
  if (kind === 'zapp') {
    const s = new THREE.Shape();
    s.moveTo(0.1, 0.34);
    s.lineTo(-0.17, -0.02);
    s.lineTo(-0.01, -0.02);
    s.lineTo(-0.1, -0.34);
    s.lineTo(0.18, 0.06);
    s.lineTo(0.03, 0.06);
    s.closePath();
    mesh(torso, new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false }), glow(f.accent, 1.6), [0, 0, 0.4]);
  } else {
    const gem = mesh(torso, new THREE.OctahedronGeometry(0.17, 0), glow(kind === 'ember' ? 0xffd166 : f.accent, 2.2), [0, 0.04, 0.46], [1, 1.35, 0.6]);
    rig.pulse.push(gem);
    sprite(torso, f.glow, 1.2, [0, 0.04, 0.5], 0.7);
  }

  const makeArm = (x) => {
    const sh = new THREE.Group();
    sh.position.set(x, 1.82, 0);
    mesh(sh, new THREE.SphereGeometry(0.15, 16, 12), skin);
    mesh(sh, new THREE.CylinderGeometry(0.13, 0.1, 0.62, crystal ? 6 : 16), skin, [0, -0.32, 0]);
    const hand = new THREE.Group();
    hand.position.set(0, -0.72, 0);
    sh.add(hand);
    mesh(hand, new THREE.SphereGeometry(0.25, crystal ? 8 : 24, 16), gloveMat, [0, -0.02, 0], [1, 1.05, 0.95]);
    mesh(hand, new THREE.TorusGeometry(0.17, 0.045, 10, 24), kind === 'ember' ? glow(f.accent, 1.8) : phys(f.accent, { roughness: 0.4 }), [0, 0.2, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
    if (kind === 'ember') {
      [-0.09, 0.09, 0].forEach((fx, i) => {
        const fl = mesh(hand, new THREE.ConeGeometry(0.09, 0.34 + (i === 2 ? 0.1 : 0), 10), glow(i === 2 ? 0xffd166 : 0xff7a1a, 2), [fx, -0.36, 0], [1, 1, 1], [Math.PI, 0, 0]);
        fl.userData.phase = i;
        rig.flames.push(fl);
      });
    }
    body.add(sh);
    return sh;
  };
  rig.arms = [makeArm(-0.82), makeArm(0.82)];
  rig.arms[0].rotation.z = -0.18;
  rig.arms[1].rotation.z = 0.18;

  const head = new THREE.Group();
  head.position.set(0, 2.62, 0.02);
  body.add(head);
  rig.head = head;
  mesh(head, crystal ? new THREE.IcosahedronGeometry(0.92, 1) : new THREE.SphereGeometry(0.92, 40, 30), skin, [0, 0, 0], [1.12, 1, 1]);
  makeEye(head, -0.36, 0.08, 0.76, 1);
  makeEye(head, 0.36, 0.08, 0.76, 1);
  [-1, 1].forEach((s) => mesh(head, new THREE.CapsuleGeometry(0.035, 0.28, 4, 8), kind === 'ember' ? glow(f.accent, 1.2) : ink, [s * 0.36, 0.46, 0.8], [1, 1, 1], [0, 0, Math.PI / 2 + s * 0.28]));
  rig.mouth = mesh(head, new THREE.TorusGeometry(0.17, 0.03, 8, 20, Math.PI), ink, [0, -0.36, 0.86], [1, 1, 1], [0, 0, Math.PI]);
}
