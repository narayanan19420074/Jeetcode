import { useEffect, useRef, useState } from 'react';

// Full-screen mini-game (jet dodge) shown when the phone loses network while the
// app is already open. The game itself lives in /public/offline.html — the same
// page the service worker serves when a page load fails offline. We fetch it once
// while online and use it as srcDoc, so it still works with no network / no SW.
export default function OfflineGame() {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine === false);
  const [dismissed, setDismissed] = useState(false);
  const [html, setHtml] = useState(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const goOff = () => {
      setOffline(true);
      setDismissed(false);
    };
    const goOn = () => setOffline(false);
    window.addEventListener('offline', goOff);
    window.addEventListener('online', goOn);
    return () => {
      window.removeEventListener('offline', goOff);
      window.removeEventListener('online', goOn);
    };
  }, []);

  // Grab the game page while we still have network.
  useEffect(() => {
    let alive = true;
    fetch('/offline.html', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.text() : null))
      .then((txt) => {
        if (alive && txt && txt.includes('<canvas')) setHtml(txt);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // "Close" button inside the game asks us to hide it.
  useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === 'jc-offline-close' && e.source === frameRef.current?.contentWindow) setDismissed(true);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  if (!offline || dismissed) return null;

  return (
    <iframe
      ref={frameRef}
      title="Offline game"
      onLoad={() => frameRef.current?.contentWindow?.focus()}
      {...(html ? { srcDoc: html } : { src: '/offline.html' })}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, zIndex: 2000, background: '#FFFFFF' }}
    />
  );
}
