import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { leaderboardApi, studyPlanApi } from '../../api/studyPlanApi';
import { apiClient } from '../../api/apiClient';
import { contestApi } from '../../api/contestApi';
import { problemsApi } from '../../api/problemsApi';
import { questApi } from '../../api/questApi';
import { featuredPageForToday, utcKey } from '../dashboard/dashboardUtils';
import { addNotification, hydrate, loadStored, saveStored } from './notificationsSlice';

const LB_POLL_MS = 5 * 60 * 1000;
const HOUR_MS = 3600000;
const DAY_MS = 86400000;
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

  // Updates + Events: claimable quest rewards, the free-Pro offer ending, the contest, today's challenge, study-plan adds.
  // Every id is stable (contest id, UTC day, quest id), so a refresh or the next poll never repeats a notification.
  useEffect(() => {
    if (!isAuthenticated || !userId || !ready) return undefined;
    let cancelled = false;
    const add = (n) => !cancelled && dispatch(addNotification(n));

    const check = () => {
      // contest
      contestApi
        .get()
        .then(({ data }) => {
          const c = data.data;
          if (cancelled || !c) return;
          const startsIn = Date.parse(c.startsAt) - Date.now();
          const link = '/contest';
          if (c.status === 'live') {
            add({ id: `ev:contest:${c.id}:live`, type: 'contest', text: `${c.title} is live now`, link });
          } else if (c.status === 'upcoming') {
            const when = new Date(c.startsAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
            add({ id: `ev:contest:${c.id}:upcoming`, type: 'contest', text: c.applied ? `${c.title} starts ${when} IST. You are in.` : `${c.title} starts ${when} IST. Apply now.`, link });
            if (startsIn <= HOUR_MS) {
              add({ id: `ev:contest:${c.id}:soon`, type: 'contest', text: `${c.title} starts in under an hour`, link });
            }
          }
        })
        .catch(() => {});

      // today's challenge (same deterministic pick as the dashboard), only while it is still unsolved
      problemsApi
        .getProgress()
        .then(({ data }) => {
          const t = data.data.total;
          const total = t.Easy + t.Medium + t.Hard;
          return total > 0 ? problemsApi.list({ page: featuredPageForToday(total), limit: 1 }) : null;
        })
        .then((res) => {
          const p = res?.data?.data?.items?.[0];
          if (cancelled || !p || p.solvedByMe) return;
          add({ id: `ev:daily:${utcKey(new Date())}`, type: 'daily', text: `Today’s challenge: ${p.title} (${p.difficulty})`, link: `/workspace/${p.slug}` });
        })
        .catch(() => {});

      // quest rewards that are ready to claim
      questApi
        .get()
        .then(({ data }) => {
          const st = data.data;
          [...(st.milestones || []), ...(st.quests || [])]
            .filter((q) => q.claimable && !q.claimed)
            .forEach((q) => add({ id: `up:quest:${q.id}`, type: 'quest', text: `Reward ready: ${q.reward.label} (${q.title})`, link: '/dashboard?view=quests' }));
        })
        .catch(() => {});

      // launch offer ending soon
      apiClient
        .get('/health')
        .then((res) => {
          const d = res.data?.freeAccessUntil ? new Date(res.data.freeAccessUntil) : null;
          if (!d) return;
          const left = Math.ceil((d.getTime() - Date.now()) / DAY_MS);
          if (left > 0 && left <= 3) {
            add({ id: `up:offer:${d.toISOString().slice(0, 10)}`, type: 'offer', text: `Free Pro access ends in ${left} day${left === 1 ? '' : 's'}`, link: '/pricing' });
          }
        })
        .catch(() => {});

      // added to a study plan
      studyPlanApi
        .notifications()
        .then(({ data }) => {
          (data.data.items || [])
            .filter((n) => !n.read)
            .forEach((n) => add({ id: `plan:${n.id}`, type: 'plan', text: `${n.actor.name} added you to “${n.plan.title}”`, link: '/dashboard?view=plans', createdAt: n.createdAt }));
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
