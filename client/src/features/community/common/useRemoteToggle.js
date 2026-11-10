import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import useSignInRedirect from '../../workspace/community/communityBits/useSignInRedirect';
import { extractErrorMessage } from '../../../api/apiClient';

// An on/off action saved on the server (save, repost, follow). The switch flips at once and flips back with an error
// message if the server refuses it. Guests are sent to sign in because these actions belong to an account.
export default function useRemoteToggle({ initial, enable, disable }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const redirectToSignIn = useSignInRedirect();
  const { enqueueSnackbar } = useSnackbar();
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setOn(initial);
  }, [initial]);

  const toggle = async () => {
    if (!isAuthenticated) return redirectToSignIn();
    if (busy) return;
    const next = !on;
    setOn(next);
    setBusy(true);
    try {
      await (next ? enable() : disable());
    } catch (err) {
      setOn(!next);
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };
  return { on, busy, toggle };
}
