// Minimal service worker: makes JeetCode installable and shows a friendly page
// when the phone is offline. It deliberately does NOT cache the app itself, so a
// new deploy is always picked up straight away (no stale-bundle bugs).
const OFFLINE_CACHE = 'jeetcode-offline-v5';
const OFFLINE_URL = '/offline.html';

// cache: 'reload' skips the browser HTTP cache (the server sends max-age=1h for
// static files), so the stored offline page is always the newest deployed one.
const fresh = (url) => new Request(url, { cache: 'reload' });
const refreshOffline = () =>
  caches.open(OFFLINE_CACHE).then((c) => c.addAll([fresh(OFFLINE_URL), fresh('/icon-192.png')]));

let lastRefresh = 0;

self.addEventListener('install', (event) => {
  event.waitUntil(refreshOffline());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== OFFLINE_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Only page navigations are handled; API calls, sockets and assets go straight to the network.
// While online, the offline page is re-fetched in the background (at most every 10 min)
// so a new deploy of offline.html reaches the phone without any manual cache clearing.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode !== 'navigate') return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (Date.now() - lastRefresh > 10 * 60 * 1000) {
          lastRefresh = Date.now();
          try {
            event.waitUntil(refreshOffline().catch(() => {}));
          } catch (e) {
            /* ignore */
          }
        }
        return res;
      })
      .catch(() => caches.match(OFFLINE_URL))
  );
});
