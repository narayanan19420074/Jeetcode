import { Server } from 'socket.io';
import * as Y from 'yjs';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../utils/tokenUtils.js';
import { submitBatch, pollBatchResults, LANGUAGE_IDS } from '../services/judge0.service.js';
import { getRoom, touch, MAX_PEERS } from './roomStore.js';

const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
const cut = (s, max = 10000) => (s && s.length > max ? s.slice(0, max) + '\n…(truncated)' : s || '');

function runLabel(statusId) {
  if (statusId === 3 || statusId === 4) return 'Finished'; // 4 = "wrong answer" only because we give no expected output
  if (statusId === 5) return 'Time limit exceeded';
  if (statusId === 6) return 'Compilation error';
  if (statusId >= 7 && statusId <= 12) return 'Runtime error';
  return 'Error';
}

export function attachRealtime(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.CLIENT_ORIGIN, credentials: true },
    maxHttpBufferSize: 1e6,
  });

  io.on('connection', (socket) => {
    let room = null;
    let me = null;

    const leave = () => {
      if (!room) return;
      room.peers.delete(socket.id);
      socket.to(room.id).emit('peer:left', { id: socket.id });
      touch(room);
      room = null;
    };

    socket.on('room:join', (payload, ack) => {
      const reply = typeof ack === 'function' ? ack : () => {};
      const { roomId, name, token, clientId } = payload || {};
      const r = getRoom(String(roomId || ''));
      if (!r) return reply({ ok: false, error: 'Room not found or expired. Create a new one.' });
      if (room) return reply({ ok: false, error: 'Already joined' });

      // Same browser rejoining (refresh / network blip): evict its stale socket first,
      // otherwise a 2-person room would look "full" until the old socket times out.
      const cid = clean(clientId, 64);
      if (cid) {
        for (const [sid, p] of r.peers) {
          if (p.clientId === cid) {
            r.peers.delete(sid);
            io.to(r.id).emit('peer:left', { id: sid });
            io.sockets.sockets.get(sid)?.disconnect(true);
          }
        }
      }
      if (r.peers.size >= MAX_PEERS) return reply({ ok: false, error: `Room is full (${MAX_PEERS} people max).` });

      let displayName = clean(name, 30) || 'Guest';
      if (token) {
        try {
          const p = verifyAccessToken(token);
          if (p?.handle) displayName = clean(p.handle, 30);
        } catch {
          /* invalid token -> stay a guest */
        }
      }

      room = r;
      me = { id: socket.id, name: displayName, clientId: cid };
      const others = [...r.peers.values()].map(({ id, name: n }) => ({ id, name: n }));
      r.peers.set(socket.id, me);
      socket.join(r.id);
      touch(r);

      reply({
        ok: true,
        you: { id: me.id, name: me.name },
        room: { id: r.id, language: r.language, problemSlug: r.problemSlug, title: r.title },
        peers: others,
        chat: r.chat,
        state: Y.encodeStateAsUpdate(r.doc),
      });
      socket.to(r.id).emit('peer:joined', { id: me.id, name: me.name });
    });

    socket.on('yjs:update', (update) => {
      if (!room) return;
      try {
        const u = new Uint8Array(update);
        Y.applyUpdate(room.doc, u, 'client');
        touch(room);
        socket.to(room.id).emit('yjs:update', u);
      } catch {
        /* malformed update — ignore */
      }
    });

    socket.on('room:language', (lang) => {
      if (!room || !LANGUAGE_IDS[lang] || lang === room.language) return;
      const from = room.language;
      room.language = lang;

      // If nobody has edited the starter yet, swap in the new language's starter.
      const text = room.ytext.toString().trim();
      const prev = (room.starters[from] || '').trim();
      const next = room.starters[lang];
      if (next != null && (text === '' || text === prev)) {
        const before = Y.encodeStateVector(room.doc);
        room.doc.transact(() => {
          room.ytext.delete(0, room.ytext.length);
          room.ytext.insert(0, next);
        }, 'server');
        io.to(room.id).emit('yjs:update', Y.encodeStateAsUpdate(room.doc, before));
      }
      io.to(room.id).emit('room:language', lang);
    });

    socket.on('chat:send', (text) => {
      if (!room) return;
      const t = clean(text, 1000);
      if (!t) return;
      const msg = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, from: me.id, name: me.name, text: t, ts: Date.now() };
      room.chat.push(msg);
      if (room.chat.length > 100) room.chat.shift();
      touch(room);
      io.to(room.id).emit('chat:message', msg);
    });

    // WebRTC signalling relay (offer/answer/ICE) between the two peers.
    socket.on('rtc:signal', (payload) => {
      if (!room || !payload || typeof payload !== 'object') return;
      if (JSON.stringify(payload).length > 20000) return;
      socket.to(room.id).emit('rtc:signal', { ...payload, from: socket.id });
    });

    // Run the shared code (source of truth = server's copy of the doc) on Judge0.
    socket.on('code:run', async (payload) => {
      if (!room || room.running) return;
      const r = room;
      r.running = true;
      io.to(r.id).emit('run:started', { by: me.name });
      try {
        const [token] = await submitBatch([
          {
            sourceCode: r.ytext.toString(),
            languageId: LANGUAGE_IDS[r.language],
            stdin: typeof payload?.stdin === 'string' ? payload.stdin.slice(0, 10000) : '',
            expectedOutput: '',
          },
        ]);
        const [res] = await pollBatchResults([token]);
        io.to(r.id).emit('run:result', {
          by: me.name,
          status: runLabel(res.statusId),
          ok: res.statusId === 3 || res.statusId === 4,
          stdout: cut(res.stdout),
          stderr: cut(res.stderr),
          time: res.time,
        });
      } catch (err) {
        io.to(r.id).emit('run:result', { by: me.name, status: 'Error', ok: false, stdout: '', stderr: err?.message || 'Run failed' });
      } finally {
        r.running = false;
      }
    });

    socket.on('disconnect', leave);
  });

  return io;
}
