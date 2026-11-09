import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import AlienWalker from './AlienWalker';
import { createAlienStage } from './alien3d/alienStage';
import { createPoseAnimator } from './alien3d/alienPose';

//   zapp      — a speedster with swept quills, gloves and sneakers; sparks
//   ember     — a fire elemental: flame mane, magma cracks, burning fists
//   crystalix — a faceted crystal golem with a gem crown
//   nova      — a cosmic hero: star-field body, halo, orbit rings, star dust
// Cartoon proportions (big head, big eyes, big gloves and shoes), glossy PBR
// materials lit by an image-based environment, squash & stretch, particles.
// Falls back to a 2D sprite when WebGL is unavailable.

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}


export default function Alien3D({ kind = 'blip', size = 140, walking = false, heading = 0, wave = true, spin = false, talking = false, brand = false, sx }) {
  const mountRef = useRef(null);
  const live = useRef({ walking, heading, wave, spin, talking });
  const [fallback, setFallback] = useState(false);
  live.current = { walking, heading, wave, spin, talking };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    if (!webglOk()) {
      setFallback(true);
      return undefined;
    }
    const stage = createAlienStage(mount, size, kind, brand);
    if (!stage) {
      setFallback(true);
      return undefined;
    }
    const { renderer, scene, camera, rig } = stage;
    const step = createPoseAnimator(rig, live);

    let raf = 0;
    let visible = true;
    let last = performance.now();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(mount);

    // Skip rendering while scrolled off screen to save battery on phones.
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!visible) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      stage.dispose();
    };
  }, [kind, size, brand]);

  if (fallback) return <AlienWalker kind={kind} brand={brand} size={size * 0.8} walking={walking} lean={heading * 8} wave={wave} sx={sx} />;
  return <Box ref={mountRef} sx={{ width: size, height: Math.round(size * 1.3), flexShrink: 0, ...sx }} />;
}
