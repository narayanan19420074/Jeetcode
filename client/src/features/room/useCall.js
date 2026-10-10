import { useCallback, useEffect, useRef, useState } from 'react';

// Free STUN works for most home/office networks. Strict mobile/corporate NATs
// need a TURN relay — set VITE_TURN_URL / VITE_TURN_USERNAME / VITE_TURN_CREDENTIAL.
const ICE_SERVERS = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }];
if (import.meta.env.VITE_TURN_URL) {
  ICE_SERVERS.push({
    urls: import.meta.env.VITE_TURN_URL.split(',').map((u) => u.trim()),
    username: import.meta.env.VITE_TURN_USERNAME,
    credential: import.meta.env.VITE_TURN_CREDENTIAL,
  });
}

// 1:1 WebRTC using the "perfect negotiation" pattern; signalling goes over the room socket.
export function useCall(socket) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [conn, setConn] = useState('idle');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState(null);
  const api = useRef(null);

  useEffect(() => {
    if (!socket) return undefined;
    let pc = null;
    let remoteMS = null;
    let makingOffer = false;
    let ignoreOffer = false;
    let local = null;

    const closePC = () => {
      if (pc) {
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.onnegotiationneeded = null;
        pc.oniceconnectionstatechange = null;
        pc.close();
        pc = null;
      }
      remoteMS = null;
      setRemoteStream(null);
      setConn('idle');
    };

    const addLocalTracks = (p) => {
      if (!local) return;
      const have = p.getSenders().map((s) => s.track);
      local.getTracks().forEach((t) => {
        if (!have.includes(t)) p.addTrack(t, local);
      });
    };

    const ensurePC = () => {
      if (pc) return pc;
      const p = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pc = p;
      p.onicecandidate = ({ candidate }) => candidate && socket.emit('rtc:signal', { candidate });
      p.onnegotiationneeded = async () => {
        try {
          makingOffer = true;
          await p.setLocalDescription();
          socket.emit('rtc:signal', { description: p.localDescription });
        } catch (e) {
          console.error(e);
        } finally {
          makingOffer = false;
        }
      };
      p.ontrack = ({ track }) => {
        if (!remoteMS) remoteMS = new MediaStream();
        remoteMS.addTrack(track);
        setRemoteStream(remoteMS);
      };
      p.oniceconnectionstatechange = () => {
        setConn(p.iceConnectionState);
        if (p.iceConnectionState === 'failed') p.restartIce();
      };
      addLocalTracks(p);
      return p;
    };

    const onSignal = async ({ from, description, candidate, bye }) => {
      if (bye) return closePC();
      const p = ensurePC();
      const polite = socket.id < from;
      try {
        if (description) {
          const collision = description.type === 'offer' && (makingOffer || p.signalingState !== 'stable');
          ignoreOffer = !polite && collision;
          if (ignoreOffer) return;
          await p.setRemoteDescription(description);
          if (description.type === 'offer') {
            await p.setLocalDescription();
            socket.emit('rtc:signal', { description: p.localDescription });
          }
        } else if (candidate) {
          try {
            await p.addIceCandidate(candidate);
          } catch (e) {
            if (!ignoreOffer) throw e;
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    // Friend (re)joined while our camera is on -> start a fresh connection to them.
    const onPeerJoined = () => {
      if (local) {
        closePC();
        ensurePC();
      }
    };

    const start = async () => {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera/mic ku HTTPS venum (localhost or deployed https link la mattum work aagum).');
        return;
      }
      try {
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // no camera -> audio only
        }
        local = stream;
        setLocalStream(stream);
        setMicOn(true);
        setCamOn(stream.getVideoTracks().length > 0);
        addLocalTracks(ensurePC());
      } catch (e) {
        setError(`Mic/camera access kedaikala: ${e.message}`);
      }
    };

    const stop = () => {
      socket.emit('rtc:signal', { bye: true });
      local?.getTracks().forEach((t) => t.stop());
      local = null;
      setLocalStream(null);
      closePC();
    };

    const toggle = (kind, set) => {
      const tracks = kind === 'audio' ? local?.getAudioTracks() : local?.getVideoTracks();
      if (!tracks?.length) return;
      const next = !tracks[0].enabled;
      tracks.forEach((t) => (t.enabled = next));
      set(next);
    };

    api.current = {
      start,
      stop,
      toggleMic: () => toggle('audio', setMicOn),
      toggleCam: () => toggle('video', setCamOn),
    };

    socket.on('rtc:signal', onSignal);
    socket.on('peer:left', closePC);
    socket.on('peer:joined', onPeerJoined);

    return () => {
      socket.off('rtc:signal', onSignal);
      socket.off('peer:left', closePC);
      socket.off('peer:joined', onPeerJoined);
      local?.getTracks().forEach((t) => t.stop());
      local = null;
      closePC();
      setLocalStream(null);
      api.current = null;
    };
  }, [socket]);

  return {
    localStream,
    remoteStream,
    conn,
    micOn,
    camOn,
    error,
    start: useCallback(() => api.current?.start(), []),
    stop: useCallback(() => api.current?.stop(), []),
    toggleMic: useCallback(() => api.current?.toggleMic(), []),
    toggleCam: useCallback(() => api.current?.toggleCam(), []),
  };
}
