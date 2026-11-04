import { useEffect, useState } from 'react';
import { apiClient } from '../../api/apiClient';

// Returns the date until which Pro is free ("12 November"), or null when there is no launch offer.
export function useLaunchOffer() {
  const [offerEndsAt, setOfferEndsAt] = useState(null);
  useEffect(() => {
    let cancelled = false;
    apiClient
      .get('/health')
      .then((res) => {
        const endsAt = res.data?.freeAccessUntil ? new Date(res.data.freeAccessUntil) : null;
        if (!cancelled && endsAt && endsAt > new Date()) setOfferEndsAt(endsAt);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return offerEndsAt ? offerEndsAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) : null;
}

// True while the element is on screen. Plain IntersectionObserver, no library.
export function useOnScreen(ref) {
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return onScreen;
}
