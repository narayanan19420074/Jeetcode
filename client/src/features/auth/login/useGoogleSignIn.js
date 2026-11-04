import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { googleSignIn } from '../authSlice';
import { GOOGLE_CLIENT_ID } from './loginConfig';
import { useRedirectAfterSignIn } from './useLoginForm';

const GSI_POLL_INTERVAL_MS = 200;
const GSI_MAX_TRIES = 50; // about 10 seconds

const GOOGLE_BUTTON_OPTIONS = { type: 'icon', theme: 'outline', size: 'large', shape: 'rectangular' };

// Google Identity Services renders its real button into `googleButtonRef`. That button is laid over our own MUI
// Google icon, invisible, so the icon always shows (Google's iframe sometimes paints an empty square) while clicks
// still reach Google. The GSI script in index.html is `async defer`, so on a fresh page load it may not exist yet
// when this hook mounts: poll briefly until it does.
export default function useGoogleSignIn() {
  const dispatch = useDispatch();
  const redirectAfterSignIn = useRedirectAfterSignIn();
  const googleButtonRef = useRef(null);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;
    let timer;
    let tries = 0;
    const handleCredential = async (response) => {
      const result = await dispatch(googleSignIn({ idToken: response.credential }));
      if (googleSignIn.fulfilled.match(result)) redirectAfterSignIn(result.payload.user);
    };
    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) {
        if (tries++ < GSI_MAX_TRIES) timer = setTimeout(renderGoogleButton, GSI_POLL_INTERVAL_MS);
        return;
      }
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredential });
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, GOOGLE_BUTTON_OPTIONS);
      setGoogleReady(true);
    };
    renderGoogleButton();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { googleButtonRef, googleReady };
}
