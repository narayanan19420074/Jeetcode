import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, ButtonBase } from '@mui/material';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

// Mini floating call: friend's video in a circle, mute / maximize / end-call around it.
// Neumorphic buttons, vibrant icons. Drag the circle to move it anywhere.
const W = 220;
const H = 200;
const MARGIN = 6;

// Neumorphic tones that follow light / dark mode.
const tones = (t) =>
  t.palette.mode === 'dark'
    ? { base: '#232834', hi: '#2d3444', lo: '#171a22', inner: '#1b1f2a' }
    : { base: '#e6eaf2', hi: '#ffffff', lo: '#b8bfcd', inner: '#d5dae6' };

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

function RoundBtn({ label, color, x, y, onClick, children, disabled }) {
  return (
    <ButtonBase
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      sx={(t) => ({
        position: 'absolute',
        left: x - 20,
        top: y - 20,
        width: 40,
        height: 40,
        borderRadius: '50%',
        color,
        bgcolor: tones(t).base,
        boxShadow: raised(t, 4),
        transition: 'box-shadow 120ms, transform 120ms',
        '&:active': { boxShadow: pressed(t, 3) },
        '&.Mui-disabled': { opacity: 0.45, color },
        '&.Mui-focusVisible': { outline: `2px solid ${color}`, outlineOffset: 2 },
        '& svg': { fontSize: 22 },
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
      x: Math.min(Math.max(MARGIN, x), Math.max(MARGIN, window.innerWidth - W - MARGIN)),
      y: Math.min(Math.max(MARGIN, y), Math.max(MARGIN, window.innerHeight - H - MARGIN)),
    }),
    []
  );

  useEffect(() => {
    setPos((p) => p || clamp(window.innerWidth - W - 8, window.innerHeight - H - 84));
    const onResize = () => setPos((p) => (p ? clamp(p.x, p.y) : p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [clamp]);

  const onDown = (e) => {
    if (!pos) return;
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
      sx={{ position: 'fixed', zIndex: 1300, left: pos?.x ?? 0, top: pos?.y ?? 0, width: W, height: H, visibility: pos ? 'visible' : 'hidden', pointerEvents: 'none' }}
    >
      {/* the circle (drag handle) */}
      <Box
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        aria-label="Friend video, drag to move"
        sx={(t) => ({
          position: 'absolute',
          left: 54,
          top: 62,
          width: 112,
          height: 112,
          p: '4px',
          borderRadius: '50%',
          pointerEvents: 'auto',
          touchAction: 'none',
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
          background: 'conic-gradient(from 200deg, #8B5CF6, #06B6D4, #22C55E, #F59E0B, #EC4899, #8B5CF6)',
          boxShadow: raised(t, 6),
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
            fontSize: 40,
          })}
        >
          <Vid stream={remoteStream} show={hasVideo} />
          {!hasVideo && (initial || <PersonRoundedIcon sx={{ fontSize: 44, opacity: 0.7 }} />)}
        </Box>
      </Box>

      {/* three buttons on an arc above the circle */}
      <Box sx={{ pointerEvents: 'auto' }}>
        <RoundBtn
          label={micOn ? 'Mute' : 'Unmute'}
          color={micOn ? '#22C55E' : '#EF4444'}
          x={46}
          y={81}
          onClick={onToggleMic}
          disabled={!hasCall}
        >
          {micOn ? <MicRoundedIcon /> : <MicOffRoundedIcon />}
        </RoundBtn>
        <RoundBtn label="Maximize" color="#3B82F6" x={110} y={44} onClick={onMaximize}>
          <OpenInFullRoundedIcon />
        </RoundBtn>
        <RoundBtn label="End call" color="#F43F5E" x={174} y={81} onClick={onCut}>
          <CallEndRoundedIcon />
        </RoundBtn>
      </Box>
    </Box>
  );
}
