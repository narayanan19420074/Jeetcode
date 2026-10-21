// Tiny bridge so controllers/services can push realtime events without importing socket.js
// (which would be a circular import). socket.js calls setIo() once at startup.
//
// Presence = which users have at least one authenticated socket open right now.
// In-memory is fine for a single Render instance; with several instances this would need
// the socket.io Redis adapter.
let io = null;
export const setIo = (instance) => {
  io = instance;
};

export const userRoom = (id) => `user:${id}`;

export function emitToUser(userId, event, payload) {
  if (io) io.to(userRoom(String(userId))).emit(event, payload);
}

const online = new Map(); // userId -> Set(socket ids)

// true when this is the user's first open socket (they just came online)
export function addPresence(userId, socketId) {
  const id = String(userId);
  let set = online.get(id);
  if (!set) {
    set = new Set();
    online.set(id, set);
  }
  const first = set.size === 0;
  set.add(socketId);
  return first;
}

// true when that was the user's last open socket (they just went offline)
export function removePresence(userId, socketId) {
  const id = String(userId);
  const set = online.get(id);
  if (!set) return false;
  set.delete(socketId);
  if (set.size === 0) {
    online.delete(id);
    return true;
  }
  return false;
}

export const isOnline = (userId) => online.has(String(userId));

// Tell both people (and their other tabs) that the friends list / requests changed.
export function notifyFriendsChanged(...userIds) {
  for (const id of userIds) emitToUser(id, 'friends:changed', {});
}
