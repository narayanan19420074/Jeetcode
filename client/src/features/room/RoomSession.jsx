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

  // ---- floating circle over other tabs AND other apps (Chrome desktop, Document Picture-in-Picture) ----
  // Auto: Chrome fires "enterpictureinpicture" when you leave the tab while the camera/mic is on.
  // Manual: the pop-out button in the room's top bar (a click is always allowed to open it) and it then
  // stays on screen over any app until you maximize or end the call.
  const pipRef = useRef(null);
  const autoOpened = useRef(false);
  const live = useRef({});
  live.current = { remoteStream: call.remoteStream, micOn: call.micOn, camOn: call.camOn, name: friendName, actions: { toggleMic: call.toggleMic, toggleCam: call.toggleCam, maximize, cut: close } };

  const getPip = useCallback(() => {
    if (!pipRef.current) pipRef.current = createCirclePip(() => live.current, () => (autoOpened.current = false));
    return pipRef.current;
  }, []);

  const pipOk = pipSupported();
  const popOut = useCallback(() => {
    autoOpened.current = false; // user chose it: keep it until they close it
    return getPip().open().catch(() => {});
  }, [getPip]);

  const hasLocal = Boolean(call.localStream);
  useEffect(() => {
    if (!hasLocal || !pipSupported()) return undefined;
    const pip = getPip();
    const autoOpen = () => {
      autoOpened.current = true;
      return pip.open().catch(() => {
        autoOpened.current = false; // browser wanted a click first
      });
    };
    try {
      navigator.mediaSession?.setActionHandler('enterpictureinpicture', autoOpen);
    } catch {
      // action not supported in this browser
    }
    const onVis = () => {
      if (document.visibilityState === 'hidden') autoOpen();
      else if (autoOpened.current) {
        autoOpened.current = false;
        pip.close(); // back on the tab -> the in-app view takes over
      }
    };
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
  }, [hasLocal, getPip]);

  useEffect(() => {
    pipRef.current?.update();
  }, [call.remoteStream, call.micOn, call.camOn, friendName]);

  // ---- phones / installed app: keep the call alive while the app is minimized ----
  // 1. A media session makes the OS treat the call as active media (notification with controls),
  //    which keeps the microphone and the friend's audio running in the background.
  // 2. Browsers without Document Picture-in-Picture use a standard video Picture-in-Picture window.
  // 3. When the app comes back, any camera / microphone track the OS stopped is re-acquired.
  const { recover } = call;
  const bgVideoRef = useRef(null);
  useEffect(() => {
    if (bgVideoRef.current) bgVideoRef.current.srcObject = call.remoteStream || null;
  }, [call.remoteStream, hasLocal]);

  useEffect(() => {
    if (!hasLocal) return undefined;
    const ms = navigator.mediaSession;
    const setHandler = (action, fn) => {
      try {
        ms?.setActionHandler(action, fn);
      } catch {
        // action not supported in this browser
      }
    };
    if (ms) {
      try {
        // eslint-disable-next-line no-undef
        ms.metadata = new MediaMetadata({ title: 'Pair room call', artist: friendName || 'Call in progress', album: 'JeetCode' });
        ms.playbackState = 'playing';
      } catch {
        // metadata not supported
      }
    }
    setHandler('togglemicrophone', () => live.current.actions.toggleMic());
    setHandler('togglecamera', () => live.current.actions.toggleCam());
    setHandler('hangup', () => live.current.actions.cut());

    const videoPipOk = !pipSupported() && typeof document !== 'undefined' && document.pictureInPictureEnabled;
    if (videoPipOk) {
      setHandler('enterpictureinpicture', () => {
        const v = bgVideoRef.current;
        if (v && v.srcObject && v.readyState >= 1 && !document.pictureInPictureElement) v.requestPictureInPicture().catch(() => {});
      });
    }

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
      recover();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      ['togglemicrophone', 'togglecamera', 'hangup', 'enterpictureinpicture'].forEach((a) => setHandler(a, null));
      if (ms) {
        try {
          ms.playbackState = 'none';
          ms.metadata = null;
        } catch {
          // ignore
        }
      }
    };
  }, [hasLocal, friendName, recover]);

  const value = useMemo(() => ({ session, room, call, join, close, popOut, pipOk }), [session, room, call, join, close, popOut, pipOk]);
  const showBubble = Boolean(session) && !onRoomRoute && room.status !== 'error';

  return (
    <RoomSessionContext.Provider value={value}>
      {children}
      {/* Muted copy of the friend's video, used only as the Picture-in-Picture source on phones. */}
      {hasLocal && <video ref={bgVideoRef} autoPlay playsInline muted aria-hidden style={{ position: 'fixed', right: 0, bottom: 0, width: 2, height: 2, opacity: 0.01, pointerEvents: 'none' }} />}
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
    popOut: ctx.popOut,
    pipOk: ctx.pipOk,
    ready: ctx.session?.roomId === roomId && ctx.session?.displayName === displayName,
  };
}
