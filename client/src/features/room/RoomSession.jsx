import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRoom } from './useRoom';
import { useCall } from './useCall';
import MiniCallBubble from './MiniCallBubble';
import { createCirclePip, pipSupported } from './docPip';

// The pair-room connection (socket, shared code, video call) lives HERE, above the
// routes, so it survives leaving /room/:id. While you are elsewhere in the app a mini
// floating circle shows the friend; on Chrome desktop it also floats over other tabs.
const RoomSessionContext = createContext(null);

export function RoomSessionProvider({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [session, setSession] = useState(null); // { roomId, displayName }

  const room = useRoom({ roomId: session?.roomId, displayName: session?.displayName });
  const call = useCall(room.socket);
  const onRoomRoute = pathname.startsWith('/room/');
  const friendName = room.peers[0]?.name;

  const join = useCallback((roomId, displayName) => {
    setSession((s) => (s && s.roomId === roomId && s.displayName === displayName ? s : { roomId, displayName }));
  }, []);

  const { stop } = call;
  // Fully leave: tell the friend the call ended, then drop the socket.
  const close = useCallback(() => {
    stop();
    setSession(null);
  }, [stop]);

  const maximize = useCallback(() => {
    if (session) navigate(`/room/${session.roomId}`);
  }, [navigate, session]);

  // ---- picture-in-picture over other tabs (Chrome desktop) ----
  const pipRef = useRef(null);
  const live = useRef({});
  live.current = { remoteStream: call.remoteStream, micOn: call.micOn, name: friendName, actions: { toggleMic: call.toggleMic, maximize, cut: close } };

  const hasLocal = Boolean(call.localStream);
  useEffect(() => {
    if (!hasLocal || !pipSupported()) return undefined;
    if (!pipRef.current) pipRef.current = createCirclePip(() => live.current);
    const pip = pipRef.current;
    const open = () => pip.open().catch(() => {}); // browsers only allow it right after a tab switch / gesture
    try {
      navigator.mediaSession?.setActionHandler('enterpictureinpicture', open);
    } catch {
      // action not supported in this browser
    }
    const onVis = () => (document.visibilityState === 'hidden' ? open() : pip.close());
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      try {
        navigator.mediaSession?.setActionHandler('enterpictureinpicture', null);
      } catch {
        // ignore
      }
      pip.close();
    };
  }, [hasLocal]);

  useEffect(() => {
    pipRef.current?.update();
  }, [call.remoteStream, call.micOn, friendName]);

  const value = useMemo(() => ({ session, room, call, join, close }), [session, room, call, join, close]);
  const showBubble = Boolean(session) && !onRoomRoute && room.status !== 'error';

  return (
    <RoomSessionContext.Provider value={value}>
      {children}
      {showBubble && (
        <MiniCallBubble
          remoteStream={call.remoteStream}
          friendName={friendName}
          micOn={call.micOn}
          hasCall={hasLocal}
          onToggleMic={call.toggleMic}
          onMaximize={maximize}
          onCut={close}
        />
      )}
    </RoomSessionContext.Provider>
  );
}

// Used by RoomPage: joins (or re-attaches to) the room and returns the live room + call.
export function useRoomSession(roomId, displayName) {
  const ctx = useContext(RoomSessionContext);
  const { join } = ctx;
  useEffect(() => {
    if (roomId && displayName) join(roomId, displayName);
  }, [roomId, displayName, join]);
  return {
    room: ctx.room,
    call: ctx.call,
    close: ctx.close,
    ready: ctx.session?.roomId === roomId && ctx.session?.displayName === displayName,
  };
}
