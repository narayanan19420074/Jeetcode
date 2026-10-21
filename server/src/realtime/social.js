import { addPresence, removePresence, isOnline, emitToUser, userRoom } from './hub.js';
import { getFriendIds } from '../services/friend.service.js';
import { sendMessage } from '../services/chat.service.js';
import { logger } from '../utils/logger.js';

const OFFLINE_GRACE_MS = 5000; // page refresh / brief network blip should not flash "offline"
const FRIEND_CACHE_MS = 60 * 1000;

// Called for every socket that connected WITH a valid access token (the pair-room sockets
// connect without one and never reach this). Handles: presence, live DMs, typing.
export function registerSocial(socket, user) {
  const uid = String(user.sub);
  socket.join(userRoom(uid));

  let cache = { at: 0, ids: new Set() };
  const friends = async (force = false) => {
    if (force || Date.now() - cache.at > FRIEND_CACHE_MS) {
      cache = { at: Date.now(), ids: new Set(await getFriendIds(uid)) };
    }
    return cache.ids;
  };

  const announce = async (status) => {
    const ids = await friends(true);
    for (const fid of ids) if (isOnline(fid)) emitToUser(fid, 'presence:change', { userId: uid, online: status });
    return ids;
  };

  // Who of my friends is online right now (also re-sent after the friends list changes).
  const sync = async () => {
    const ids = await friends(true);
    socket.emit('presence:init', { online: [...ids].filter(isOnline) });
    if (isOnline(uid)) for (const fid of ids) if (isOnline(fid)) emitToUser(fid, 'presence:change', { userId: uid, online: true });
  };

  const first = addPresence(uid, socket.id);
  (first ? announce(true).then(sync) : sync()).catch((err) => logger.warn('presence init failed', err?.message));

  socket.on('presence:sync', () => {
    sync().catch(() => {});
  });

  // Live chat. Ack gives the sender the saved message (or an error string).
  const stamps = [];
  socket.on('dm:send', async (payload, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    const now = Date.now();
    while (stamps.length && now - stamps[0] > 10000) stamps.shift();
    if (stamps.length >= 20) return reply({ ok: false, error: 'Slow down a little' });
    stamps.push(now);
    try {
      const msg = await sendMessage({ from: uid, to: String(payload?.to || ''), text: payload?.text });
      reply({ ok: true, message: msg });
    } catch (err) {
      reply({ ok: false, error: err?.isOperational ? err.message : 'Could not send' });
    }
  });

  socket.on('dm:typing', async (payload) => {
    const to = String(payload?.to || '');
    if (!to || !(await friends()).has(to)) return;
    emitToUser(to, 'dm:typing', { from: uid });
  });

  socket.on('disconnect', () => {
    if (!removePresence(uid, socket.id)) return;
    setTimeout(() => {
      if (!isOnline(uid)) announce(false).catch(() => {});
    }, OFFLINE_GRACE_MS).unref();
  });
}
