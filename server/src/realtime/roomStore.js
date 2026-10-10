import * as Y from 'yjs';
import { customAlphabet } from 'nanoid';

// In-memory rooms. Fine for pair sessions on a free tier: a room lives while
// people use it and is swept after IDLE_MS. A server restart/redeploy clears them.
const makeId = customAlphabet('abcdefghjkmnpqrstuvwxyz23456789', 8);

export const MAX_PEERS = 2; // video is 1:1 WebRTC, so a room holds 2 people
export const MAX_ROOMS = 500;
const IDLE_MS = 6 * 60 * 60 * 1000;

export const DEFAULT_STARTERS = {
  javascript: '// Pair room — type together, press Run to execute\nconsole.log("Hello, JeetCode!");\n',
  python: '# Pair room — type together, press Run to execute\nprint("Hello, JeetCode!")\n',
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    cout << "Hello, JeetCode!" << endl;\n    return 0;\n}\n',
};

const rooms = new Map();

export function createRoom({ language, problemSlug, title, starters, initialCode }) {
  if (rooms.size >= MAX_ROOMS) return null;
  let id = makeId();
  while (rooms.has(id)) id = makeId();

  const doc = new Y.Doc();
  const ytext = doc.getText('code');
  const mergedStarters = { ...DEFAULT_STARTERS, ...(starters || {}) };
  ytext.insert(0, initialCode ?? mergedStarters[language] ?? '');

  const room = {
    id,
    language,
    problemSlug: problemSlug || null,
    title: title || null,
    starters: mergedStarters,
    doc,
    ytext,
    peers: new Map(), // socket.id -> { id, name, clientId }
    chat: [],
    running: false,
    createdAt: Date.now(),
    lastActive: Date.now(),
  };
  rooms.set(id, room);
  return room;
}

export const getRoom = (id) => rooms.get(id);
export const touch = (room) => {
  room.lastActive = Date.now();
};

setInterval(() => {
  const now = Date.now();
  for (const [id, room] of rooms) {
    if (room.peers.size === 0 && now - room.lastActive > IDLE_MS) {
      room.doc.destroy();
      rooms.delete(id);
    }
  }
}, 15 * 60 * 1000).unref();
