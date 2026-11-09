import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BLIP, BUBBLE_W, MARGIN, PAD, TOP_SAFE } from './guideConstants';
import { placeAgent } from './placeAgent';

// Live rectangle of the spotlighted element; polled because layout can shift while Blip talks.
export function useSpotlightRect(target) {
  const [rect, setRect] = useState(null);
  useEffect(() => {
    let last = '';
    const tick = () => {
      const el = target ? document.querySelector(target) : null;
      let next = null;
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) next = { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
      }
      const key = next ? [next.left, next.top, next.width, next.height].map(Math.round).join() : '';
      if (key !== last) {
        last = key;
        setRect(next);
      }
    };
    tick();
    const iv = setInterval(tick, 100);
    return () => clearInterval(iv);
  }, [target]);
  return rect;
}

// Viewport size plus the measured size of Blip's box (it changes with the bubble text).
export function useAgentBox() {
  const [size, setSize] = useState({ w: BLIP + BUBBLE_W + 8, h: 150 });
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const agentRef = useRef(null);

  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useLayoutEffect(() => {
    const el = agentRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setSize((s) => (Math.abs(s.w - w) > 1 || Math.abs(s.h - h) > 1 ? { w, h } : s));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { agentRef, size, vp };
}

// Where Blip stands: docked to a screen edge on phones, next to the target on larger screens.
export function computeAgentPlace({ compact, rect, size, vp }) {
  if (!compact) return placeAgent(rect, size, vp.w, vp.h);
  // Phones: dock Blip along the bottom edge, or the top edge when the
  // spotlighted control happens to sit under him.
  const bottomY = vp.h - size.h - MARGIN;
  const topY = TOP_SAFE - 16;
  const covers = (y) => rect && rect.bottom + PAD > y && rect.top - PAD < y + size.h;
  return { x: MARGIN, y: covers(bottomY) && !covers(topY) ? topY : bottomY };
}

// Makes Blip "walk" (and turn towards the move) whenever he relocates a noticeable distance.
export function useAgentTravel(place, reduce) {
  const [travelling, setTravelling] = useState(false);
  const [heading, setHeading] = useState(0);
  const lastPos = useRef(null);
  const travelTimer = useRef(null);

  useEffect(() => () => clearTimeout(travelTimer.current), []);

  useEffect(() => {
    const prev = lastPos.current;
    lastPos.current = place;
    if (!prev) return;
    const dx = place.x - prev.x;
    const dy = place.y - prev.y;
    if (Math.abs(dx) + Math.abs(dy) < 24) return;
    setHeading(Math.max(-1, Math.min(1, dx / 220)));
    setTravelling(true);
    clearTimeout(travelTimer.current);
    travelTimer.current = setTimeout(() => { setTravelling(false); setHeading(0); }, reduce ? 150 : 850);
  }, [place.x, place.y, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  return { travelling, heading };
}
