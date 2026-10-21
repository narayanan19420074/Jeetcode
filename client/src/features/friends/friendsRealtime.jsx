import { useEffect } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Button } from '@mui/material';
import { io } from 'socket.io-client';
import { getAccessToken } from '../../api/apiClient';
import { friendsApi } from '../../api/friendsApi';
import { bumpUnread, clearUnread, fetchFriends, setOnlineList, setPresence, setUnread } from './friendsSlice';

// One app-wide socket for the logged-in user: live online dots, new-message badges, toasts.
// (Pair-coding rooms use their own separate socket in features/room/useRoom.js.)
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const socketOrigin = () => (API.startsWith('http') ? new URL(API).origin : window.location.origin);

let socket = null;
export const getFriendsSocket = () => socket;

const preview = (m) => (m.kind === 'room' ? 'invited you to code together' : m.kind === 'nudge' ? 'nudged you' : m.text.length > 70 ? `${m.text.slice(0, 70)}…` : m.text);

// Mount once inside the router for logged-in users. Renders nothing.
export default function FriendsRealtime() {
  const dispatch = useDispatch();
  const store = useStore();
  const navigate = useNavigate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const version = useSelector((s) => s.friends.version);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return undefined;
    // `auth` as a function = every (re)connect sends the freshest access token.
    const s = io(socketOrigin(), { withCredentials: true, auth: (cb) => cb({ token: getAccessToken() }) });
    socket = s;

    // A socket that connected before the token was ready is treated as a guest by the server and never
    // gets `presence:init`. If that happens, reconnect (a few tries) so the token is sent again.
    let ready = false;
    let tries = 0;
    let guard = null;
    const arm = () => {
      clearTimeout(guard);
      guard = setTimeout(() => {
        if (ready || tries >= 3) return;
        tries += 1;
        s.disconnect().connect();
      }, 4000);
    };

    const loadUnread = () =>
      friendsApi
        .chatUnread()
        .then(({ data }) => dispatch(setUnread(data.data.byUser)))
        .catch(() => {});

    s.on('connect', () => {
      ready = false;
      arm();
      loadUnread();
    });
    s.on('presence:init', ({ online }) => {
      ready = true;
      dispatch(setOnlineList(online || []));
    });
    s.on('presence:change', (p) => dispatch(setPresence(p)));
    s.on('friends:changed', () => dispatch(fetchFriends()));
    s.on('dm:cleared', ({ with: id }) => dispatch(clearUnread(id)));

    s.on('dm:new', (m) => {
      if (m.to !== user.id) return; // my own message echoing to this tab
      if (store.getState().friends.activeChat === m.from) return; // the open chat handles it
      dispatch(bumpUnread(m.from));
      const who = store.getState().friends.friends.find((f) => f.userId === m.from);
      const name = who ? `@${who.handle}` : 'A friend';
      enqueueSnackbar(m.kind === 'text' ? `${name}: ${preview(m)}` : `${name} ${preview(m)}`, {
        variant: m.kind === 'nudge' ? 'warning' : 'info',
        autoHideDuration: 6000,
        action: (key) => (
          <Button
            color="inherit"
            size="small"
            sx={{ fontWeight: 700 }}
            onClick={() => {
              closeSnackbar(key);
              if (m.kind === 'room' && m.roomId) navigate(`/room/${m.roomId}`);
              else navigate(`/dashboard?view=friends&chat=${m.from}`);
            }}
          >
            {m.kind === 'room' ? 'Join' : 'Open'}
          </Button>
        ),
      });
    });

    return () => {
      clearTimeout(guard);
      s.removeAllListeners();
      s.disconnect();
      if (socket === s) socket = null;
    };
  }, [isAuthenticated, user?.id, dispatch, store, navigate, enqueueSnackbar, closeSnackbar]);

  // Friends list changed (someone accepted / removed) -> ask the server who is online among the new set.
  useEffect(() => {
    if (version > 0) socket?.emit('presence:sync');
  }, [version]);

  return null;
}
