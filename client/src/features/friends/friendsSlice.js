import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { logoutUser } from '../auth/authSlice';

// One shared friends list for the whole app (dashboard sidebar badge, Friends tab,
// leaderboard friends card). The server is the source of truth: every change calls the
// API and then reloads the list, so all screens always show the same thing.
const initialState = {
  friends: [],
  incoming: [],
  outgoing: [],
  maxFriends: 200,
  loaded: false,
  loading: false,
  error: '',
  version: 0, // bumps whenever the set of friends changes — leaderboard views refetch on it
};

export const fetchFriends = createAsyncThunk('friends/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await friendsApi.list();
    return data.data;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

// Call the API, then re-sync from the server. Fulfilled payload = the server's message (if any).
const mutation = (name, call) =>
  createAsyncThunk(`friends/${name}`, async (arg, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await call(arg);
      await dispatch(fetchFriends());
      return data.message && data.message !== 'Success' ? data.message : '';
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  });

export const sendFriendRequest = mutation('send', (handle) => friendsApi.sendRequest(handle));
export const acceptFriendRequest = mutation('accept', (id) => friendsApi.accept(id));
export const declineFriendRequest = mutation('decline', (id) => friendsApi.decline(id));
export const cancelFriendRequest = mutation('cancel', (id) => friendsApi.cancel(id));
export const removeFriend = mutation('remove', (userId) => friendsApi.remove(userId));
export const acceptFriendInvite = mutation('invite', (handle) => friendsApi.acceptInvite(handle));

const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        if (!state.loaded) state.loading = true;
      })
      .addCase(fetchFriends.fulfilled, (state, { payload }) => {
        const before = state.friends.map((f) => f.userId).sort().join(',');
        const after = payload.friends.map((f) => f.userId).sort().join(',');
        if (state.loaded && before !== after) state.version += 1;
        state.friends = payload.friends;
        state.incoming = payload.incoming;
        state.outgoing = payload.outgoing;
        state.maxFriends = payload.maxFriends;
        state.loaded = true;
        state.loading = false;
        state.error = '';
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Could not load friends';
      })
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export default friendsSlice.reducer;
