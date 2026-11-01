import { useCallback, useEffect, useRef, useState } from 'react';
import { PROMO_AUTO_MS, PROMO_CARD_W, PROMO_GAP, PROMO_IDLE_MS } from './promoCarouselConfig';

const END_TOLERANCE = 2;

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduce';

const stepSize = (track) => {
  const first = track?.firstElementChild;
  return first ? first.getBoundingClientRect().width + PROMO_GAP : PROMO_CARD_W + PROMO_GAP;
};

const isAtEnd = (el) => el.scrollLeft + el.clientWidth >= el.scrollWidth - END_TOLERANCE;

// Which arrows to show: none at the edge the row is already scrolled to.
function useCarouselEdges(trackRef, cardCount) {
  const [edge, setEdge] = useState({ start: true, end: false });
  const measure = useCallback(() => {
    const el = trackRef.current;
    if (el) setEdge({ start: el.scrollLeft <= END_TOLERANCE, end: isAtEnd(el) });
  }, [trackRef]);

  useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, trackRef, cardCount]);
  return { edge, measure };
}

// Only run the auto-advance while the carousel is on screen.
function useIsOnScreen(rootRef) {
  const onScreen = useRef(true);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => {
      onScreen.current = entry.isIntersecting;
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [rootRef]);
  return onScreen;
}

// One banner every few seconds, looping back to the first. It pauses while the tab is hidden and never runs
// when the user asked for reduced motion; `isPaused` covers hover, focus, touch and being off screen.
function useAutoAdvance(trackRef, cardCount, isPaused) {
  useEffect(() => {
    if (cardCount < 2) return undefined;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el || document.hidden || isPaused() || prefersReducedMotion()) return;
      if (isAtEnd(el)) el.scrollTo({ left: 0, behavior: 'smooth' });
      else el.scrollBy({ left: stepSize(el), behavior: 'smooth' });
    }, PROMO_AUTO_MS);
    return () => clearInterval(id);
  }, [trackRef, cardCount, isPaused]);
}

// Touch, wheel, hover and arrow clicks pause the auto-advance for a while.
function useCarouselInteraction(trackRef) {
  const hovering = useRef(false);
  const idleUntil = useRef(0);
  const isPaused = useCallback(() => hovering.current || Date.now() < idleUntil.current, []);
  const touched = () => {
    idleUntil.current = Date.now() + PROMO_IDLE_MS;
  };
  const scrollByCards = (dir) => {
    touched();
    const el = trackRef.current;
    el?.scrollBy({ left: dir * stepSize(el) * 2, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };
  const setHover = (value) => () => {
    hovering.current = value;
  };
  return {
    isPaused,
    scrollByCards,
    rootProps: { onMouseEnter: setHover(true), onMouseLeave: setHover(false), onFocus: setHover(true), onBlur: setHover(false) },
    touchProps: { onTouchStart: touched, onWheel: touched, onPointerDown: touched },
  };
}

export default function usePromoCarousel(cardCount) {
  const trackRef = useRef(null);
  const rootRef = useRef(null);
  const onScreen = useIsOnScreen(rootRef);
  const { edge, measure } = useCarouselEdges(trackRef, cardCount);
  const { isPaused, scrollByCards, rootProps, touchProps } = useCarouselInteraction(trackRef);
  const paused = useCallback(() => isPaused() || !onScreen.current, [isPaused, onScreen]);
  useAutoAdvance(trackRef, cardCount, paused);
  return { rootRef, trackRef, edge, scrollByCards, rootProps, trackProps: { ...touchProps, onScroll: measure } };
}
