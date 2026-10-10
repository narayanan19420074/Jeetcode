import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import * as Y from 'yjs';
import { getAccessToken } from '../../api/apiClient';

export const REMOTE = 'remote-socket';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const socketOrigin = () => (API.startsWith('http') ? new URL(API).origin : window.location.origin);

function getClientId() {
  try {
    let id = sessionStorage.getItem('jc-room-client-id');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('jc-room-client-id', id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export function useRoom({ roomId, displayName }) {
  const doc = useMemo(() => new Y.Doc(), [roomId]); // eslint-disable-line react-hooks/exhaustive-deps
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('connecting'); // connecting | joined | error | reconnecting
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [me, setMe] = useState(null);
  const [peers, setPeers] = useState([]);
  const [chat, setChat] = useState([]);
  const [language, setLang] = useState('javascript');
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const joinedBefore = useRef(false);

  useEffect(() => {
    if (!roomId || !displayName) return undefined;
    const s = io(socketOrigin(), { withCredentials: true });
    setSocket(s);

    const onDocUpdate = (update, origin) => {
      if (origin !== REMOTE) s.emit('yjs:update', update);
    };
    doc.on('update', onDocUpdate);

    const join = () => {
      s.emit('room:join', { roomId, name: displayName, token: getAccessToken(), clientId: getClientId() }, (res) => {
        if (!res?.ok) {
          setError(res?.error || 'Could not join room');
          setStatus('error');
          return;
        }
        Y.applyUpdate(doc, new Uint8Array(res.state), REMOTE);
        // after a reconnect, push whatever we typed while offline (CRDT merges it)
        if (joinedBefore.current) s.emit('yjs:update', Y.encodeStateAsUpdate(doc));
        joinedBefore.current = true;
        setMe(res.you);
        setMeta(res.room);
        setLang(res.room.language);
        setPeers(res.peers);
        setChat(res.chat || []);
        setError(null);
        setStatus('joined');
      });
    };

    s.on('connect', join);
    s.on('disconnect', () => setStatus((st) => (st === 'error' ? st : 'reconnecting')));
    s.on('yjs:update', (u) => Y.applyUpdate(doc, new Uint8Array(u), REMOTE));
    s.on('peer:joined', (p) => setPeers((prev) => [...prev.filter((x) => x.id !== p.id), p]));
    s.on('peer:left', ({ id }) => setPeers((prev) => prev.filter((x) => x.id !== id)));
    s.on('room:language', setLang);
    s.on('chat:message', (m) => setChat((prev) => [...prev, m].slice(-100)));
    s.on('run:started', () => {
      setRunning(true);
      setRunResult(null);
    });
    s.on('run:result', (r) => {
      setRunning(false);
      setRunResult(r);
    });

    return () => {
      doc.off('update', onDocUpdate);
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
    };
  }, [roomId, displayName, doc]);

  const changeLanguage = useCallback((l) => socket?.emit('room:language', l), [socket]);
  const sendChat = useCallback((t) => socket?.emit('chat:send', t), [socket]);
  const run = useCallback((stdin) => socket?.emit('code:run', { stdin }), [socket]);

  return { doc, socket, status, error, meta, me, peers, chat, language, changeLanguage, sendChat, run, running, runResult };
}
