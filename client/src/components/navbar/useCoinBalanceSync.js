import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { storeApi } from '../../api/storeApi';
import { userUpdated } from '../../features/auth/authSlice';

const BALANCE_POLL_INTERVAL_MS = 45000;

function useLatestRef(value) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

// Coins are earned on the server (solves, quests), so the client cannot know about them without asking.
// Check on every page change, every 45 seconds, and when the browser tab becomes visible again.
export default function useCoinBalanceSync({ isAuthenticated, pathname, coins }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const coinsRef = useLatestRef(coins);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let stopped = false;
    const applyBalance = (next) => {
      const previous = coinsRef.current;
      if (next === previous) return;
      if (next > previous) enqueueSnackbar(`+${next - previous} coins earned`, { variant: 'success' });
      dispatch(userUpdated({ coins: next }));
    };
    const poll = () => {
      if (document.visibilityState === 'hidden') return;
      storeApi
        .balance()
        .then(({ data }) => !stopped && applyBalance(data.data.coins))
        .catch(() => {});
    };
    poll();
    const intervalId = setInterval(poll, BALANCE_POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', poll);
    return () => {
      stopped = true;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', poll);
    };
  }, [isAuthenticated, pathname, dispatch, enqueueSnackbar, coinsRef]);
}
