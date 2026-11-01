import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { sameSet } from './libraryConstants';

// Behaviour of the sideways-scrolling row of topic group pills: edge arrows, mouse wheel,
// click-and-drag, and gliding the selected pill into view.

const EDGE_TOLERANCE = 4;
const DRAG_THRESHOLD = 5;

// Arrows show only on the side that still has hidden pills.
function useScrollEdges(scrollRef, watched) {
  const [edges, setEdges] = useState({ left: false, right: false });
  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const left = el.scrollLeft > EDGE_TOLERANCE;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - EDGE_TOLERANCE;
    setEdges((e) => (e.left === left && e.right === right ? e : { left, right }));
  }, [scrollRef]);

  useLayoutEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [watched, update, scrollRef]);

  return { edges, update };
}

// Mouse wheel scrolls the row sideways (desktop). Native listener so we can preventDefault.
function useWheelScroll(scrollRef) {
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [scrollRef]);
}

// Auto-move: the selected pill glides into the middle of the row.
function useCenterActivePill(scrollRef, activeKey) {
  useEffect(() => {
    const el = scrollRef.current;
    const node = el?.querySelector('[aria-pressed="true"]');
    if (!el || !node) return;
    const target = node.offsetLeft - (el.clientWidth - node.offsetWidth) / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [scrollRef, activeKey]);
}

// Click-and-drag with a mouse (touch already pans natively). A drag must not count as a click on a pill.
function useDragScroll(scrollRef) {
  const drag = useRef({ down: false, moved: false, startX: 0, startLeft: 0 });
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') return;
    drag.current = { down: true, moved: false, startX: e.clientX, startLeft: scrollRef.current.scrollLeft };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > DRAG_THRESHOLD) d.moved = true;
    if (d.moved) scrollRef.current.scrollLeft = d.startLeft - dx;
  };
  const endDrag = () => {
    drag.current.down = false;
  };
  const swallowClickAfterDrag = (e) => {
    if (!drag.current.moved) return;
    e.stopPropagation();
    e.preventDefault();
    drag.current.moved = false;
  };
  return { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerLeave: endDrag, onClickCapture: swallowClickAfterDrag };
}

export default function usePillScroller(groups, selectedTags) {
  const ref = useRef(null);
  const { edges, update } = useScrollEdges(ref, groups);
  const dragHandlers = useDragScroll(ref);
  useWheelScroll(ref);

  const noTags = selectedTags.length === 0;
  const activeKey = noTags ? 'all' : groups.find((g) => sameSet(selectedTags, g.tags))?.key ?? '';
  useCenterActivePill(ref, activeKey);

  const nudge = (dir) => ref.current?.scrollBy({ left: dir * Math.max(160, ref.current.clientWidth * 0.6), behavior: 'smooth' });
  return { ref, edges, noTags, nudge, rowHandlers: { ...dragHandlers, onScroll: update } };
}
