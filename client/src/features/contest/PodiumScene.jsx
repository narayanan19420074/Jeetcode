import { useEffect, useRef } from 'react';
import { buildScene } from './podium/buildPodiumScene';

// 3D glass podium. Locked until `revealed` turns true, then: fireworks, blocks rise 3rd -> 2nd -> 1st,
// winner plates pop in, trophy spins. Drag sideways to turn it. Plain three.js (no extra packages).

export default function PodiumScene({ winners, revealed, reduce = false, dark = false, onFail }) {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const revealedRef = useRef(revealed);

  useEffect(() => {
    let api = null;
    try {
      api = buildScene(hostRef.current, winners, { reveal: revealedRef.current, reduce, dark });
    } catch {
      onFail?.();
      return undefined;
    }
    apiRef.current = api;
    return () => {
      api.dispose();
      apiRef.current = null;
    };
  }, [winners, reduce, dark, onFail]);

  useEffect(() => {
    revealedRef.current = revealed;
    if (revealed) apiRef.current?.reveal();
  }, [revealed]);

  return <div ref={hostRef} role="img" aria-label="3D winners podium. Drag sideways to turn it." style={{ width: '100%', height: '100%' }} />;
}
