// Per-frame pose of a mascot: walk cycle, waving, talking, blinking and particles.
// `live` is a ref holding the latest props so the animation loop never restarts
// when the parent re-renders (which would reset the pose mid-walk).
export function createPoseAnimator(rig, live) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let t = 0;
  let phase = 0;
  let walkBlend = 0;
  let talkBlend = 0;
  let yaw = 0;

  return function step(dt) {
    t += dt;
    const p = live.current;
    const sp = reduce ? 0 : 1;
    walkBlend += ((p.walking && !reduce ? 1 : 0) - walkBlend) * Math.min(1, dt * 9);
    phase += dt * 11 * walkBlend * sp;
    talkBlend += ((p.talking && !reduce ? 1 : 0) - talkBlend) * Math.min(1, dt * 10);
    const talkWave = talkBlend * Math.abs(Math.sin(t * 13 + Math.sin(t * 5) * 2));
    const idle = 1 - walkBlend;
    const bounce = Math.abs(Math.sin(phase));

    if (rig.orb) {
      const hop = walkBlend > 0.05 ? bounce : 0;
      rig.body.position.y = hop * 0.9 + Math.sin(t * 2) * 0.08 * idle * sp;
      const stretch = 1 + hop * 0.14 - (1 - hop) * 0.05 * walkBlend;
      rig.orb.scale.set(1 / Math.sqrt(stretch), stretch, 1 / Math.sqrt(stretch));
      rig.orb.rotation.z = Math.sin(phase) * 0.12 * walkBlend;
      rig.orb.rotation.y = Math.sin(t * 0.9) * 0.25 * idle * sp;
      if (rig.blipMouth) rig.blipMouth.scale.set(1 + talkWave * 0.25, 1 + talkWave * 1.9, 1);
      rig.orb.scale.multiplyScalar(1 + talkWave * 0.035);
    } else {
      const sL = Math.sin(phase);
      rig.legs[0].rotation.x = sL * 0.95 * walkBlend;
      rig.legs[1].rotation.x = -sL * 0.95 * walkBlend;
      rig.arms[0].rotation.x = -sL * 0.9 * walkBlend;
      rig.arms[1].rotation.x = sL * 0.9 * walkBlend;
      const waving = p.wave && idle > 0.7 && t % 5 < 1.8 && !reduce;
      const a = rig.arms[1];
      a.rotation.z += ((waving ? 2.5 + Math.sin(t * 12) * 0.28 : 0.18 + walkBlend * 0.1) - a.rotation.z) * Math.min(1, dt * 10);
      rig.body.position.y = bounce * 0.12 * walkBlend + Math.sin(t * 2.4) * 0.025 * idle * sp;
      rig.body.rotation.x = 0.16 * walkBlend;
      rig.torso.rotation.y = Math.sin(phase) * 0.2 * walkBlend;
      rig.head.rotation.y = Math.sin(t * 0.8) * 0.22 * idle * sp;
      rig.head.rotation.z = Math.sin(t * 1.3) * 0.05 * idle * sp;
      rig.head.rotation.x = -0.05 * walkBlend;
      rig.mouth.scale.y = 1 + walkBlend * 0.8 + Math.sin(t * 3) * 0.05 * sp + talkWave * 1.8;
      const squash = 1 - bounce * 0.04 * walkBlend;
      rig.torso.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
    }

    const targetYaw = p.spin ? Math.sin(t * 0.55) * 0.5 : (p.heading || 0) * 0.8;
    yaw += (targetYaw - yaw) * Math.min(1, dt * 6);
    rig.root.rotation.y = yaw;
    rig.root.rotation.z = -(p.heading || 0) * 0.04 * walkBlend;

    const k = t % 3.9 > 3.76 ? 0.1 : 1;
    rig.eyes.forEach((e) => {
      e.scale.y = k;
    });

    rig.pad.material.opacity = 0.5 + Math.sin(t * 2.4) * 0.12 * sp;
    rig.shadow.scale.setScalar(1 - (rig.orb ? bounce * 0.25 * walkBlend : 0));
    rig.pulse.forEach((m, i) => m.scale.setScalar(1 + Math.sin(t * 3 + i) * 0.1 * sp));
    rig.spin.forEach((m, i) => {
      m.rotation.z += dt * (0.6 + i * 0.15) * sp;
    });
    rig.flames.forEach((fl, i) => {
      const ph = fl.userData.phase ?? i;
      fl.scale.set(1 + Math.sin(t * 9 + ph) * 0.12 * sp, 1 + Math.sin(t * 12 + ph * 1.7) * 0.22 * sp, 1);
    });
    if (rig.orbit) rig.orbit.rotation.y = t * 0.7 * sp;
    if (rig.sparks) {
      rig.sparks.forEach((s, i) => {
        s.material.opacity = walkBlend > 0.3 ? 0.4 + 0.6 * Math.abs(Math.sin(t * 14 + i * 2)) : 0;
      });
    }
    rig.emitters.forEach((e) => e.update(dt * sp, walkBlend));
  };
}
