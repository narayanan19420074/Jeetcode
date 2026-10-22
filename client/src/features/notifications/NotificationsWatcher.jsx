import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { leaderboardApi } from '../../api/studyPlanApi';
import { addNotification, hydrate, loadStored, saveStored } from './notificationsSlice';

const LB_POLL_MS = 5 * 60 * 1000;
const rankKey = (userId) => `jc:friendsRank:${userId}`;

// Mount once for logged-in users (renders nothing). Turns friend / leaderboard changes into notifications.
// Room invites and nudges are added from friendsRealtime.jsx, where the socket events arrive.
export default function NotificationsWatcher() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { friends, incoming, outgoing, loaded } = useSelector((s) => s.friends);
  const { items, ready } = useSelector((s) => s.notifications);
  const userId = user?.id;
  const prevOutgoing = useRef(null);

  // load saved items for this user
  useEffect(() => {
    if (isAuthenticated && userId) dispatch(hydrate(loadStored(userId)));
  }, [isAuthenticated, userId, dispatch]);

  // save on every change
  useEffect(() => {
    if (ready && userId) saveStored(userId, items);
  }, [items, ready, userId]);

  // someone sent me a friend request
  useEffect(() => {
    if (!ready || !loaded) return;
    incoming.forEach((r) =>
      dispatch(addNotification({ id: `req:${r.requestId}`, type: 'request', text: `@${r.user.handle} sent you a friend request`, link: '/dashboard?view=friends' }))
    );
  }, [incoming, ready, loaded, dispatch]);

  // someone I invited accepted (they moved from "sent" to "friends")
  useEffect(() => {
    if (!ready || !loaded) return;
    const ids = new Set(friends.map((f) => f.userId));
    (prevOutgoing.current || []).forEach((o) => {
      if (ids.has(o.userId)) dispatch(addNotification({ id: `acc:${o.userId}`, type: 'accepted', text: `@${o.handle} accepted your friend request`, link: '/dashboard?view=friends' }));
    });
    prevOutgoing.current = outgoing.map((o) => ({ userId: o.user.userId, handle: o.user.handle }));
  }, [friends, outgoing, ready, loaded, dispatch]);

  // friends leaderboard: tell me when my rank among friends changes
  useEffect(() => {
    if (!isAuthenticated || !userId || !ready) return undefined;
    let cancelled = false;
    const check = () => {
      leaderboardApi
        .get({ period: 'all', scope: 'friends', track: 'overall', limit: 50 })
        .then(({ data }) => {
          const d = data.data;
          if (cancelled || !d.me || d.total < 2) return;
          let prev = null;
          try { prev = JSON.parse(localStorage.getItem(rankKey(userId)) || 'null'); } catch { /* ignore */ }
          const rank = d.me.rank;
          try { localStorage.setItem(rankKey(userId), JSON.stringify({ rank })); } catch { /* ignore */ }
          if (!prev || prev.rank === rank) return;
          const id = `lb:${Date.now()}`;
          const link = '/dashboard?view=leaderboard&scope=friends';
          if (rank === 1) dispatch(addNotification({ id, type: 'leaderboard', text: 'You are #1 on the friends leaderboard 🏆', link }));
          else if (rank < prev.rank) dispatch(addNotification({ id, type: 'leaderboard', text: `You moved up to #${rank} on the friends leaderboard`, link }));
          else {
            const who = d.neighbors?.above?.handle;
            dispatch(addNotification({ id, type: 'leaderboard', text: who ? `@${who} is ahead of you now. You are #${rank} on the friends leaderboard` : `You dropped to #${rank} on the friends leaderboard`, link }));
          }
        })
        .catch(() => {});
    };
    check();
    const t = setInterval(check, LB_POLL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { cancelled = true; clearInterval(t); document.removeEventListener('visibilitychange', onVisible); };
  }, [isAuthenticated, userId, ready, dispatch]);

  return null;
}
