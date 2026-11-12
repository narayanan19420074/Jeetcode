import { useCallback, useRef } from 'react';
import { getFriendsSocket } from '../../../../friends/friendsRealtime';

const TYPING_SIGNAL_INTERVAL_MS = 2500;

// Tells the friend "typing…" while you write. It is throttled so a fast typist does not flood the connection.
export default function useTypingSignal(friendId) {
  const lastSentAt = useRef(0);
  return useCallback(() => {
    const now = Date.now();
    if (now - lastSentAt.current < TYPING_SIGNAL_INTERVAL_MS) return;
    lastSentAt.current = now;
    getFriendsSocket()?.emit('dm:typing', { to: friendId });
  }, [friendId]);
}
