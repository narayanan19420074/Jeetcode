import { useEffect, useState } from 'react';
import { apiClient } from '../api/apiClient';

// Several components ask at once (navbar bar and phone menu), so one /health
// request is shared and reused for a minute instead of one request per component.
const CACHE_TTL_MS = 60000;
let cachedRequest = null;
let cachedAt = 0;

// An admin (or the launch offer) can switch Pro on for every signed-in user. The API reports that on /health.
function fetchProForEveryone() {
  if (!cachedRequest || Date.now() - cachedAt > CACHE_TTL_MS) {
    cachedAt = Date.now();
    cachedRequest = apiClient
      .get('/health')
      .then((response) => Boolean(response.data?.proForEveryone))
      .catch(() => false);
  }
  return cachedRequest;
}

// True when the signed-in user has Pro of their own, or Pro is switched on for everyone. Guests never have Pro.
export default function useHasProAccess(user) {
  const isSignedIn = Boolean(user);
  const [proForEveryone, setProForEveryone] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return undefined;
    let cancelled = false;
    fetchProForEveryone().then((enabled) => {
      if (!cancelled) setProForEveryone(enabled);
    });
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  return Boolean(user?.isPro) || (isSignedIn && proForEveryone);
}
