import { createSlice } from '@reduxjs/toolkit';

const storedMode = typeof window !== 'undefined' ? localStorage.getItem('jeetcode-theme-mode') : null;

const initialState = {
  mode: storedMode === 'light' || storedMode === 'dark' ? storedMode : 'dark',
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleThemeMode: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('jeetcode-theme-mode', state.mode);
      }
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleThemeMode, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
