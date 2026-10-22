import { createSlice } from '@reduxjs/toolkit';
import { logoutUser } from '../auth/authSlice';

// In-app notification centre (navbar bell). Everything is created on the client from things the app already
// knows: friend requests, accepted requests, pair-room invites, nudges and friends-leaderboard moves.
// Items are kept in localStorage per user so they survive a refresh.
const MAX_ITEMS = 50;
const storeKey = (userId) => `jc:notifications:${userId}`;

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

const initialState = { items: [], ready: false };

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    hydrate: (state, { payload }) => {
      state.items = payload;
      state.ready = true;
    },
    // payload: { id, type, text, link?, createdAt? }. Same id twice = ignored (so reloads don't repeat it).
    addNotification: (state, { payload }) => {
      if (state.items.some((n) => n.id === payload.id)) return;
      state.items.unshift({ read: false, createdAt: new Date().toISOString(), ...payload });
      state.items = state.items.slice(0, MAX_ITEMS);
    },
    markAllRead: (state) => {
      state.items.forEach((n) => { n.read = true; });
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

export const { hydrate, addNotification, markAllRead, markRead, clearAll } = notificationsSlice.actions;
export const selectUnreadNotifications = (s) => s.notifications.items.filter((n) => !n.read).length;
export default notificationsSlice.reducer;
