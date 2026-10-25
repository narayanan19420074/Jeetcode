import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, ButtonBase } from '@mui/material';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

// Mini floating call, drawn like a watch: the friend's video is the glass, a raised frame
// goes around it, and mute / maximize / end-call sit in the channel between glass and frame
// like the buttons of a remote. Neumorphic surfaces, vibrant icons. Drag the watch anywhere.
const S = 176; // whole watch
const GLASS = 100;
const CHANNEL = 160; // inner edge of the frame
const BTN = 26;
const BTN_R = 65; // distance of the buttons from the centre (middle of the channel)
const MARGIN = 6;
const polar = (deg) => ({ x: S / 2 + BTN_R * Math.cos((deg * Math.PI) / 180), y: S / 2 + BTN_R * Math.sin((deg * Math.PI) / 180) });
const POS = { max: polar(-90), mute: polar(30), cut: polar(150) };

// Neumorphic tones that follow light / dark mode.
const tones = (t) =>
  t.palette.mode === 'dark'
    ? { base: '#232834', hi: '#2f3647', lo: '#151820', inner: '#1b1f2a' }
    : { base: '#e6eaf2', hi: '#ffffff', lo: '#b4bbcb', inner: '#d3d8e4' };

const raised = (t, d) => {
  const c = tones(t);
  return `${d}px ${d}px ${d * 2}px ${c.lo}, -${d}px -${d}px ${d * 2}px ${c.hi}`;
};
const pressed = (t, d) => {
  const c = tones(t);
  return `inset ${d}px ${d}px ${d * 2}px ${c.lo}, inset -${d}px -${d}px ${d * 2}px ${c.hi}`;
};

function Vid({ stream, show }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream || null;
  }, [stream]);
  // Always mounted and unmuted so the friend's voice never drops while minimized.
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: show ? 'block' : 'none' }}
    />
  );
}

function CrownBtn({ label, color, at, onClick, children, disabled }) {
  return (
    <ButtonBase
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      sx={(t) => ({
        position: 'absolute',
        left: at.x - BTN / 2,
        top: at.y - BTN / 2,
        width: BTN,
        height: BTN,
        borderRadius: '50%',
        color,
        bgcolor: tones(t).base,
        boxShadow: raised(t, 2),
        transition: 'box-shadow 120ms',
        '&:active': { boxShadow: pressed(t, 2) },
        '&.Mui-disabled': { opacity: 0.45, color },
        '&.Mui-focusVisible': { outline: `2px solid ${color}`, outlineOffset: 2 },
        '& svg': { fontSize: 16 },
      })}
    >
      {children}
    </ButtonBase>
  );
}

export default function MiniCallBubble({ remoteStream, friendName, micOn, hasCall, onToggleMic, onMaximize, onCut }) {
  const [pos, setPos] = useState(null);
  const drag = useRef(null);

  const clamp = useCallback(
    (x, y) => ({
      x: Math.min(Math.max(MARGIN, x), Math.max(MARGIN, window.innerWidth - S - MARGIN)),
      y: Math.min(Math.max(MARGIN, y), Math.max(MARGIN, window.innerHeight - S - MARGIN)),
    }),
    []
  );

  useEffect(() => {
    setPos((p) => p || clamp(window.innerWidth - S - 10, window.innerHeight - S - 90));
    const onResize = () => setPos((p) => (p ? clamp(p.x, p.y) : p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [clamp]);

  const onDown = (e) => {
    if (!pos || e.target.closest?.('button')) return; // buttons click, the rest drags
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    setPos(clamp(d.ox + e.clientX - d.sx, d.oy + e.clientY - d.sy));
  };
  const onUp = () => {
    drag.current = null;
  };

  const hasVideo = !!remoteStream && remoteStream.getVideoTracks().length > 0;
  const initial = (friendName || '').trim()[0]?.toUpperCase();

  return (
    <Box
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      aria-label="Call watch, drag to move"
      sx={(t) => ({
        position: 'fixed',
        zIndex: 1300,
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        width: S,
        height: S,
        borderRadius: '50%',
        visibility: pos ? 'visible' : 'hidden',
        touchAction: 'none',
        userSelect: 'none',
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        // the frame
        background: `linear-gradient(145deg, ${tones(t).hi}, ${tones(t).base} 55%, ${tones(t).lo})`,
        boxShadow: raised(t, 7),
      })}
    >
      {/* the channel the buttons sit in */}
      <Box
        sx={(t) => ({
          position: 'absolute',
          left: (S - CHANNEL) / 2,
          top: (S - CHANNEL) / 2,
          width: CHANNEL,
          height: CHANNEL,
          borderRadius: '50%',
          bgcolor: tones(t).base,
          boxShadow: pressed(t, 4),
        })}
      />

      {/* the glass: friend's video */}
      <Box
        sx={(t) => ({
          position: 'absolute',
          left: (S - GLASS) / 2,
          top: (S - GLASS) / 2,
          width: GLASS,
          height: GLASS,
          p: '3px',
          borderRadius: '50%',
          background: 'conic-gradient(from 200deg, #8B5CF6, #06B6D4, #22C55E, #F59E0B, #EC4899, #8B5CF6)',
          boxShadow: raised(t, 3),
        })}
      >
        <Box
          sx={(t) => ({
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            bgcolor: tones(t).inner,
            display: 'grid',
            placeItems: 'center',
            color: 'text.primary',
            fontWeight: 700,
            fontSize: 36,
          })}
        >
          <Vid stream={remoteStream} show={hasVideo} />
          {!hasVideo && (initial || <PersonRoundedIcon sx={{ fontSize: 40, opacity: 0.7 }} />)}
        </Box>
      </Box>

      <CrownBtn label="Maximize" color="#3B82F6" at={POS.max} onClick={onMaximize}>
        <OpenInFullRoundedIcon />
      </CrownBtn>
      <CrownBtn label={micOn ? 'Mute' : 'Unmute'} color={micOn ? '#22C55E' : '#EF4444'} at={POS.mute} onClick={onToggleMic} disabled={!hasCall}>
        {micOn ? <MicRoundedIcon /> : <MicOffRoundedIcon />}
      </CrownBtn>
      <CrownBtn label="End call" color="#F43F5E" at={POS.cut} onClick={onCut}>
        <CallEndRoundedIcon />
      </CrownBtn>
    </Box>
  );
}
