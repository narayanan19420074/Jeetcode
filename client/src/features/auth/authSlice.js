import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';
import { setAccessToken, extractErrorMessage } from '../../api/apiClient';

const initialState = {
  isAuthenticated: false,
  user: null,
  role: 'guest', // 'guest' | 'learner' | 'admin'
  status: 'idle', // 'idle' | 'loading' | 'error'
  error: null,
  bootstrapped: false, // true once the initial silent-refresh-on-load attempt has finished
};

export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.register(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const loginUser = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.login(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

// OAuth thunks — all 3 return the exact same {accessToken, user} shape as
// loginUser, so they share loginUser's fulfilled/rejected reducer logic
// below instead of duplicating it.

export const googleSignIn = createAsyncThunk('auth/google', async ({ idToken }, { rejectWithValue }) => {
  try {
    const { data } = await authApi.googleSignIn(idToken);
    return data.data;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const githubSignIn = createAsyncThunk('auth/github', async ({ code }, { rejectWithValue }) => {
  try {
    const { data } = await authApi.githubSignIn(code);
    return data.data;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const linkedinSignIn = createAsyncThunk(
  'auth/linkedin',
  async ({ code, redirectUri }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.linkedinSignIn(code, redirectUri);
      return data.data;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

// Called once on app boot. Tries to silently restore a session from the
// httpOnly refresh cookie — succeeds quietly if the user was already
// logged in, fails quietly (falls back to guest) if not. Never shown as
// an error to the user.
export const bootstrapSession = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authApi.refresh();
    return data.data;
  } catch {
    return rejectWithValue(null);
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authApi.logout().catch(() => {});
  return null;
});

// Shared success/failure handlers — register/login/google/github/linkedin
// all resolve to the same {accessToken, user} payload shape, so one pair
// of reducer functions covers all 5 instead of repeating the same 6 lines
// per provider.
const handleAuthFulfilled = (state, action) => {
  state.status = 'idle';
  state.isAuthenticated = true;
  state.user = action.payload.user;
  state.role = action.payload.user.role;
  setAccessToken(action.payload.accessToken);
};

const handleAuthRejected = (state, action) => {
  state.status = 'error';
  state.error = action.payload;
};

const handleAuthPending = (state) => {
  state.status = 'loading';
  state.error = null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // register
      .addCase(registerUser.pending, handleAuthPending)
      .addCase(registerUser.fulfilled, handleAuthFulfilled)
      .addCase(registerUser.rejected, handleAuthRejected)
      // login
      .addCase(loginUser.pending, handleAuthPending)
      .addCase(loginUser.fulfilled, handleAuthFulfilled)
      .addCase(loginUser.rejected, handleAuthRejected)
      // google
      .addCase(googleSignIn.pending, handleAuthPending)
      .addCase(googleSignIn.fulfilled, handleAuthFulfilled)
      .addCase(googleSignIn.rejected, handleAuthRejected)
      // github
      .addCase(githubSignIn.pending, handleAuthPending)
      .addCase(githubSignIn.fulfilled, handleAuthFulfilled)
      .addCase(githubSignIn.rejected, handleAuthRejected)
      // linkedin
      .addCase(linkedinSignIn.pending, handleAuthPending)
      .addCase(linkedinSignIn.fulfilled, handleAuthFulfilled)
      .addCase(linkedinSignIn.rejected, handleAuthRejected)
      // bootstrap (silent)
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.bootstrapped = true;
        setAccessToken(action.payload.accessToken);
      })
      .addCase(bootstrapSession.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = 'guest';
        state.bootstrapped = true;
      })
      // logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = 'guest';
        setAccessToken(null);
      });
  },
});

export default authSlice.reducer;
