import { useCallback, useEffect, useRef, useState } from 'react';

// Practice timer for the workspace. Counts from timestamps (not by adding 1 each
// tick) so it stays correct when the tab is in the background.
export const formatClock = (total) => {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

export default function useStopwatch() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const base = useRef(0); // seconds banked before the current run
  const startedAt = useRef(0);

  useEffect(() => {
    if (!running) return undefined;
    const tick = () => setSeconds(base.current + Math.floor((Date.now() - startedAt.current) / 1000));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [running]);

  const start = useCallback(() => {
    startedAt.current = Date.now();
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    setRunning((r) => {
      if (r) base.current += Math.floor((Date.now() - startedAt.current) / 1000);
      return false;
    });
  }, []);

  const reset = useCallback(() => {
    base.current = 0;
    setSeconds(0);
    setRunning(false);
  }, []);

  return { seconds, running, start, pause, reset };
}
