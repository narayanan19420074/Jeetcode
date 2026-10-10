import { createSlice } from '@reduxjs/toolkit';

// UI preferences: theme mode + the appearance / accessibility / editor options
// from Settings. They live in localStorage so they apply instantly (no flash,
// works logged-out) and are mirrored to the user's account by the Settings
// page, so they follow the user to other devices (see hydrateFromAccount).

const LS_KEY = 'jeetcode-ui-prefs';
const LEGACY_MODE_KEY = 'jeetcode-theme-mode';

export const DEFAULT_EDITOR = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: false,
  minimap: false,
  lineNumbers: true,
  ligatures: false,
  autoClose: true,
  theme: 'auto',
  defaultLanguage: 'javascript',
};

const defaults = {
  themePref: 'dark', // 'light' | 'dark' | 'system'
  accent: 'blue',
  density: 'comfortable',
  fontScale: 'md',
  contrast: 'normal',
  reduceMotion: 'system', // 'system' | 'on' | 'off'
  underlineLinks: false,
  editor: DEFAULT_EDITOR,
};

const systemPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : true;

const resolveMode = (themePref, systemDark) => (themePref === 'system' ? (systemDark ? 'dark' : 'light') : themePref);

function load() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {};
  } catch {
    saved = {};
  }
  // Older builds only stored 'light' | 'dark' under a different key.
  if (!saved.themePref) {
    try {
      const legacy = localStorage.getItem(LEGACY_MODE_KEY);
      if (legacy === 'light' || legacy === 'dark') saved.themePref = legacy;
    } catch {
      // ignore
    }
  }
  return { ...defaults, ...saved, editor: { ...DEFAULT_EDITOR, ...(saved.editor || {}) } };
}

const persist = (state) => {
  try {
    const { themePref, accent, density, fontScale, contrast, reduceMotion, underlineLinks, editor } = state;
    localStorage.setItem(LS_KEY, JSON.stringify({ themePref, accent, density, fontScale, contrast, reduceMotion, underlineLinks, editor }));
    localStorage.setItem(LEGACY_MODE_KEY, state.mode);
  } catch {
    // storage unavailable (private mode / quota) — preferences still apply for this session
  }
};

const base = typeof window !== 'undefined' ? load() : defaults;
const systemDark = systemPrefersDark();

const initialState = {
  ...base,
  systemDark,
  mode: resolveMode(base.themePref, systemDark), // always 'light' | 'dark' — what the rest of the app reads
  sidebarOpen: true,
};

const merge = (state, patch) => {
  const { editor, ...rest } = patch;
  Object.assign(state, rest);
  if (editor) state.editor = { ...state.editor, ...editor };
  state.mode = resolveMode(state.themePref, state.systemDark);
  persist(state);
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Navbar sun/moon button: flips to the opposite of what is on screen now.
    toggleThemeMode: (state) => {
      merge(state, { themePref: state.mode === 'dark' ? 'light' : 'dark' });
    },
    // Local, instant update from Settings. Accepts any subset of:
    // { themePref, accent, density, fontScale, contrast, reduceMotion, underlineLinks, editor }
    setUiPrefs: (state, action) => merge(state, action.payload),
    setSystemDark: (state, action) => {
      state.systemDark = action.payload;
      state.mode = resolveMode(state.themePref, state.systemDark);
      persist(state);
    },
    // Called once per login/bootstrap with the account's saved preferences.
    // Appearance only wins if the user ever saved it (syncedAt) — otherwise a
    // visitor's local choice isn't overwritten by the server default.
    hydrateFromAccount: (state, action) => {
      const p = action.payload || {};
      const patch = {};
      if (p.appearance?.syncedAt) {
        const { theme, accent, density, fontScale, contrast } = p.appearance;
        Object.assign(patch, { themePref: theme, accent, density, fontScale, contrast });
      }
      if (p.accessibility) Object.assign(patch, { reduceMotion: p.accessibility.reduceMotion, underlineLinks: p.accessibility.underlineLinks });
      if (p.editor) patch.editor = p.editor;
      merge(state, patch);
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleThemeMode, setUiPrefs, setSystemDark, hydrateFromAccount, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
