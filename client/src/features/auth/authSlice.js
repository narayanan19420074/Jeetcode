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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // register
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        setAccessToken(action.payload.accessToken);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload;
      })
      // login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        setAccessToken(action.payload.accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload;
      })
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
