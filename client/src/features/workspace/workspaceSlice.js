import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { submissionsApi } from '../../api/submissionsApi';
import { problemsApi } from '../../api/problemsApi';
import { extractErrorMessage } from '../../api/apiClient';

const STORAGE_KEY = 'jeetcode-draft-code';

// Draft code persistence is a real, useful feature (protects against
// accidental refresh) — not dummy data — so it stays exactly as before.
const loadDrafts = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};
const persistDrafts = (drafts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // Local storage may be unavailable (private browsing, quota) — fail silently.
  }
};

const initialState = {
  activeLanguage: 'javascript',
  codeByProblem: loadDrafts(),

  currentProblem: null,
  problemStatus: 'idle', // 'idle' | 'loading' | 'error'
  problemError: null,

  runStatus: 'idle', // 'idle' | 'running' | 'success' | 'error'
  runResult: null, // full Submission doc from the backend
  submitStatus: 'idle',
  submitResult: null,
  lastResultKind: null, // 'run' | 'submit' — which result the console should show
  consoleError: null, // server/network error from the last run/submit (no result to show)

  aiDrawerOpen: false,
};

// Polls GET /submissions/:id until the backend reports a terminal status.
// With a real Redis+worker queue this is what actually resolves the
// "Run"/"Submit" buttons; with the inline dev fallback the first response
// is already terminal, so this resolves on attempt 1.
async function pollUntilDone(submissionId, { maxAttempts = 20, intervalMs = 1000 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await submissionsApi.get(submissionId);
    const submission = data.data;
    if (submission.status !== 'Pending' && submission.status !== 'Judging') {
      return submission;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Judging is taking longer than expected. Check back in a moment.');
}

export const fetchProblem = createAsyncThunk('workspace/fetchProblem', async (slug, { rejectWithValue }) => {
  try {
    const { data } = await problemsApi.getBySlug(slug);
    return data.data;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const runCode = createAsyncThunk(
  'workspace/runCode',
  async ({ problemSlug, language, code }, { rejectWithValue }) => {
    try {
      const { data } = await submissionsApi.create({ problemSlug, language, code, mode: 'run' });
      return await pollUntilDone(data.data._id);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const submitCode = createAsyncThunk(
  'workspace/submitCode',
  async ({ problemSlug, language, code }, { rejectWithValue }) => {
    try {
      const { data } = await submissionsApi.create({ problemSlug, language, code, mode: 'submit' });
      return await pollUntilDone(data.data._id);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

// A run/submit that finishes after the user already opened another problem
// must not write its result into the new problem's console.
const isForCurrentProblem = (state, action) => {
  const arg = action.meta?.arg?.problemSlug;
  const current = state.currentProblem?.slug;
  if (!arg) return true;
  if (!current) return false; // next problem still loading
  return arg.toLowerCase() === current.toLowerCase();
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.activeLanguage = action.payload;
    },
    updateCode: (state, action) => {
      const { problemId, language, code } = action.payload;
      if (!state.codeByProblem[problemId]) state.codeByProblem[problemId] = {};
      state.codeByProblem[problemId][language] = code;
      persistDrafts(state.codeByProblem);
    },
    toggleAiDrawer: (state) => {
      state.aiDrawerOpen = !state.aiDrawerOpen;
    },
    resetSubmitResult: (state) => {
      state.submitResult = null;
      state.submitStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProblem.pending, (state) => {
        state.problemStatus = 'loading';
        state.problemError = null;
        state.currentProblem = null;
        // New problem => forget the previous problem's run/submit results,
        // otherwise the old "Accepted" console output leaks onto it.
        state.runStatus = 'idle';
        state.runResult = null;
        state.submitStatus = 'idle';
        state.submitResult = null;
        state.lastResultKind = null;
        state.consoleError = null;
      })
      .addCase(fetchProblem.fulfilled, (state, action) => {
        state.problemStatus = 'idle';
        state.currentProblem = action.payload;
      })
      .addCase(fetchProblem.rejected, (state, action) => {
        state.problemStatus = 'error';
        state.problemError = action.payload;
      })

      .addCase(runCode.pending, (state) => {
        state.runStatus = 'running';
        state.runResult = null;
        state.lastResultKind = 'run';
        state.consoleError = null;
      })
      .addCase(runCode.fulfilled, (state, action) => {
        // Ignore a late response that belongs to a problem we've already left.
        if (!isForCurrentProblem(state, action)) return;
        state.runStatus = action.payload.status === 'Accepted' ? 'success' : 'error';
        state.runResult = action.payload;
      })
      .addCase(runCode.rejected, (state, action) => {
        if (!isForCurrentProblem(state, action)) return;
        state.runStatus = 'error';
        state.runResult = null;
        state.consoleError = action.payload;
      })

      .addCase(submitCode.pending, (state) => {
        state.submitStatus = 'running';
        state.submitResult = null;
        state.lastResultKind = 'submit';
        state.consoleError = null;
      })
      .addCase(submitCode.fulfilled, (state, action) => {
        if (!isForCurrentProblem(state, action)) return;
        state.submitStatus = 'idle';
        state.submitResult = action.payload;
      })
      .addCase(submitCode.rejected, (state, action) => {
        if (!isForCurrentProblem(state, action)) return;
        state.submitStatus = 'error';
        state.submitResult = null;
        state.consoleError = action.payload;
      });
  },
});

export const { setLanguage, updateCode, toggleAiDrawer, resetSubmitResult } = workspaceSlice.actions;
export default workspaceSlice.reducer;
