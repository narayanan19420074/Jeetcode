import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

// Cloudflare Turnstile bot check. Renders nothing when VITE_TURNSTILE_SITE_KEY is not set.
// Usage: <TurnstileWidget ref={ref} onToken={setToken} />. Call ref.current.reset() after a failed
// submit, because a token can only be used once.
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise = null;

function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = resolve;
      s.onerror = () => {
        scriptPromise = null; // allow a retry on the next mount
        reject(new Error('Turnstile failed to load'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

const TurnstileWidget = forwardRef(function TurnstileWidget({ onToken, action }, ref) {
  const boxRef = useRef(null);
  const widgetId = useRef(null);
  const callback = useRef(onToken);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    callback.current = onToken;
  });

  useImperativeHandle(ref, () => ({
    reset() {
      callback.current(null);
      if (window.turnstile && widgetId.current != null) window.turnstile.reset(widgetId.current);
    },
  }), []);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return undefined;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !boxRef.current) return;
        widgetId.current = window.turnstile.render(boxRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action,
          theme: 'auto',
          callback: (token) => callback.current(token),
          'expired-callback': () => callback.current(null),
          'error-callback': () => callback.current(null),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (widgetId.current != null && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* widget already gone */
        }
      }
      widgetId.current = null;
    };
  }, [action]);

  if (!TURNSTILE_SITE_KEY) return null;

  return (
    <Box>
      <Box ref={boxRef} sx={{ display: 'flex', justifyContent: 'center', minHeight: 65 }} />
      {failed && (
        <Typography variant="caption" color="error" sx={{ display: 'block', textAlign: 'center' }}>
          The verification check could not load. Refresh the page or turn off content blockers for this site.
        </Typography>
      )}
    </Box>
  );
});

export default TurnstileWidget;
