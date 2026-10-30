import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import uiReducer, { toggleThemeMode } from './uiSlice';
import authReducer, { userUpdated } from '../features/auth/authSlice';
import workspaceReducer from '../features/workspace/workspaceSlice';
import aptitudeReducer from '../features/aptitude/aptitudeSlice';
import friendsReducer from '../features/friends/friendsSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import { usersApi } from '../api/usersApi';

// The light/dark toggle (navbar, home page, admin bar) is saved on this device straight away.
// For a signed-in user it is also saved to the account. Without this, the next page load
// restores the older theme from the account (see hydrateFromAccount) and the toggle appears to reset.
const themeSync = createListenerMiddleware();
themeSync.startListening({
  actionCreator: toggleThemeMode,
  effect: async (_action, api) => {
    const state = api.getState();
    if (!state.auth.isAuthenticated) return;
    try {
      const { data } = await usersApi.updatePreferences({ appearance: { theme: state.ui.themePref } });
      api.dispatch(userUpdated({ preferences: data.data.preferences }));
    } catch {
      // Offline or signed out: the choice is still saved on this device.
    }
  },
});

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    workspace: workspaceReducer,
    aptitude: aptitudeReducer,
    friends: friendsReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefault) => getDefault().prepend(themeSync.middleware),
});

export default store;
