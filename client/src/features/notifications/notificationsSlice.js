import { createSlice } from '@reduxjs/toolkit';
import { logoutUser } from '../auth/authSlice';

// In-app notification centre (navbar bell, tabs: Social / Updates / Events). Everything is created on the client from
// things the app already knows: friend requests, room invites, nudges, leaderboard moves, claimable quest rewards,
// the contest and today's challenge. See notificationMeta.js for which type lands in which tab.
// Items are kept in localStorage per user so they survive a refresh.
const MAX_ITEMS = 50;
// Ids of every notification already shown. Many notifications are re-created by the watcher on each poll
// (today's challenge, the contest, quest rewards), so a cleared or trimmed one must not come back.
const MAX_SEEN = 500;
const storeKey = (userId) => `jc:notifications:${userId}`;
const seenKey = (userId) => `jc:notifications:seen:${userId}`;

export const loadStored = (userId) => {
  try {
    const raw = JSON.parse(localStorage.getItem(storeKey(userId)) || '[]');
    return Array.isArray(raw) ? raw.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
};
export const saveStored = (userId, items) => {
  try {
    localStorage.setItem(storeKey(userId), JSON.stringify(items));
  } catch {
    /* storage unavailable: the list just lives in memory */
  }
};

export const loadSeen = (userId) => {
  try {
    const raw = JSON.parse(localStorage.getItem(seenKey(userId)) || '[]');
    return Array.isArray(raw) ? raw.slice(-MAX_SEEN) : [];
  } catch {
    return [];
  }
};
export const saveSeen = (userId, seen) => {
  try {
    localStorage.setItem(seenKey(userId), JSON.stringify(seen));
  } catch {
    /* storage unavailable: the list just lives in memory */
  }
};

const initialState = { items: [], seen: [], ready: false };

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // payload: { items, seen }
    hydrate: (state, { payload }) => {
      state.items = payload.items;
      state.seen = [...new Set([...payload.seen, ...payload.items.map((n) => n.id)])].slice(-MAX_SEEN);
      state.ready = true;
    },
    // payload: { id, type, text, link?, createdAt? }. An id that was already shown (even if cleared since) is ignored,
    // so reloads and polls never repeat it.
    addNotification: (state, { payload }) => {
      if (state.seen.includes(payload.id) || state.items.some((n) => n.id === payload.id)) return;
      state.seen.push(payload.id);
      state.seen = state.seen.slice(-MAX_SEEN);
      state.items.unshift({ read: false, createdAt: new Date().toISOString(), ...payload });
      state.items = state.items.slice(0, MAX_ITEMS);
    },
    markAllRead: (state) => {
      state.items.forEach((n) => { n.read = true; });
    },
    markIdsRead: (state, { payload }) => {
      const ids = new Set(payload);
      state.items.forEach((n) => { if (ids.has(n.id)) n.read = true; });
    },
    markRead: (state, { payload }) => {
      const n = state.items.find((x) => x.id === payload);
      if (n) n.read = true;
    },
    clearAll: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const { hydrate, addNotification, markAllRead, markIdsRead, markRead, clearAll } = notificationsSlice.actions;
export const selectUnreadNotifications = (s) => s.notifications.items.filter((n) => !n.read).length;
export default notificationsSlice.reducer;
