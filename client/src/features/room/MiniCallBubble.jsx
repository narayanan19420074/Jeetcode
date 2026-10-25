import { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

// Mini floating call, drawn like a TV remote: the friend's video is the centre, and a ring
// of three big segment buttons (maximize / mute / end call) wraps all the way around it,
// each icon in the middle of its segment. Neumorphic surfaces, vibrant icons.
// Button states:  normal = neutral key + coloured icon   |   hover = lighter key
//                 pressed = tinted key                   |   ON (muted) = solid colour key + white icon
// Drag the watch anywhere (from any part of it).
const S = 176; // whole watch
const C = S / 2;
const GLASS = 100;
const R_IN = 54;
const R_OUT = 80;
const R_ICON = (R_IN + R_OUT) / 2;
const SPAN = 114; // each key covers 114 of 120 degrees -> a hairline gap only
const MARGIN = 6;
const DRAG_PX = 6;

const rad = (d) => (d * Math.PI) / 180;
const pt = (r, deg) => [C + r * Math.cos(rad(deg)), C + r * Math.sin(rad(deg))];
const sector = (mid) => {
  const [a0, a1] = [mid - SPAN / 2, mid + SPAN / 2];
  const [x0, y0] = pt(R_OUT, a0);
  const [x1, y1] = pt(R_OUT, a1);
  const [x2, y2] = pt(R_IN, a1);
  const [x3, y3] = pt(R_IN, a0);
  return `M${x0} ${y0} A${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${R_IN} ${R_IN} 0 0 0 ${x3} ${y3}Z`;
};

const KEYS = [
  { id: 'max', mid: -90, color: '#3B82F6', label: 'Maximize' },
  { id: 'mute', mid: 30, color: '#22C55E', label: 'Mute' },
  { id: 'cut', mid: 150, color: '#F43F5E', label: 'End call' },
];

// Neumorphic tones that follow light / dark mode.
const tones = (t) =>
  t.palette.mode === 'dark'
    ? { base: '#232834', key: '#2a3040', keyHover: '#323a4d', hi: '#2f3647', lo: '#151820', inner: '#1b1f2a' }
    : { base: '#e6eaf2', key: '#eef1f7', keyHover: '#ffffff', hi: '#ffffff', lo: '#b4bbcb', inner: '#d3d8e4' };

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

export default function MiniCallBubble({ remoteStream, friendName, micOn, hasCall, onToggleMic, onMaximize, onCut }) {
  const [pos, setPos] = useState(null);
  const [down, setDown] = useState(null); // key id currently pressed
  const [hover, setHover] = useState(null);
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

  // Press anywhere; it only becomes a drag after moving a few pixels, so taps still click the keys.
  const onDown = (e) => {
    if (!pos) return;
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false, id: e.pointerId };
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_PX) return;
    if (!d.moved) {
      d.moved = true;
      setDown(null);
      e.currentTarget.setPointerCapture?.(d.id);
    }
    setPos(clamp(d.ox + dx, d.oy + dy));
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    setDown(null);
    if (d?.moved) suppress.current = true;
  };
  const suppress = useRef(false);
  const press = (key, fn, disabled) => (e) => {
    e.stopPropagation();
    if (suppress.current) {
      suppress.current = false;
      return;
    }
    if (!disabled) fn();
  };

  const hasVideo = !!remoteStream && remoteStream.getVideoTracks().length > 0;
  const initial = (friendName || '').trim()[0]?.toUpperCase();

  const keyProps = {
    max: { fn: onMaximize, on: false, disabled: false, Icon: OpenInFullRoundedIcon, label: 'Maximize' },
    mute: { fn: onToggleMic, on: !micOn, disabled: !hasCall, Icon: micOn ? MicRoundedIcon : MicOffRoundedIcon, label: micOn ? 'Mute' : 'Unmute' },
    cut: { fn: onCut, on: false, disabled: false, Icon: CallEndRoundedIcon, label: 'End call' },
  };
  const MUTED_RED = '#EF4444';

  return (
    <Box
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      aria-label="Call, drag to move"
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
      {/* sunken bed the keys sit in */}
      <Box
        sx={(t) => ({
          position: 'absolute',
          inset: 7,
          borderRadius: '50%',
          bgcolor: tones(t).base,
          boxShadow: pressed(t, 4),
        })}
      />

      {/* the glass: friend's video (plain sunken disc, no coloured ring) */}
      <Box
        sx={(t) => ({
          position: 'absolute',
          left: (S - GLASS) / 2,
          top: (S - GLASS) / 2,
          width: GLASS,
          height: GLASS,
          borderRadius: '50%',
          overflow: 'hidden',
          bgcolor: tones(t).inner,
          boxShadow: pressed(t, 3),
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

      {/* ring of three keys */}
      <Box
        component="svg"
        viewBox={`0 0 ${S} ${S}`}
        width={S}
        height={S}
        sx={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        {KEYS.map((k) => {
          const p = keyProps[k.id];
          const accent = k.id === 'mute' && p.on ? MUTED_RED : k.color;
          return (
            <Box
              key={k.id}
              component="path"
              d={sector(k.mid)}
              role="button"
              tabIndex={p.disabled ? -1 : 0}
              aria-label={p.label}
              aria-pressed={k.id === 'mute' ? p.on : undefined}
              aria-disabled={p.disabled || undefined}
              onPointerEnter={() => setHover(k.id)}
              onPointerLeave={() => setHover((h) => (h === k.id ? null : h))}
              onPointerDown={() => !p.disabled && setDown(k.id)}
              onClick={press(k.id, p.fn, p.disabled)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), !p.disabled && p.fn())}
              sx={(t) => {
                const c = tones(t);
                const isDown = down === k.id;
                const fill = p.on ? accent : isDown ? `${accent}55` : hover === k.id ? c.keyHover : c.key;
                return {
                  fill,
                  cursor: p.disabled ? 'not-allowed' : 'pointer',
                  opacity: p.disabled ? 0.5 : 1,
                  outline: 'none',
                  transition: 'fill 120ms, filter 120ms',
                  // raised key; sinks when pressed or switched on
                  filter: p.on || isDown ? `drop-shadow(1px 1px 1px ${c.lo})` : `drop-shadow(2px 2px 2px ${c.lo}) drop-shadow(-2px -2px 2px ${c.hi})`,
                  '&:focus-visible': { stroke: accent, strokeWidth: 2 },
                };
              }}
            >
              <title>{p.label}</title>
            </Box>
          );
        })}
      </Box>

      {/* icons sit in the middle of each key */}
      {KEYS.map((k) => {
        const p = keyProps[k.id];
        const [x, y] = pt(R_ICON, k.mid);
        const accent = k.id === 'mute' && p.on ? '#EF4444' : k.color;
        return (
          <Box
            key={k.id}
            sx={{
              position: 'absolute',
              left: x - 11,
              top: y - 11,
              width: 22,
              height: 22,
              display: 'grid',
              placeItems: 'center',
              pointerEvents: 'none',
              color: p.on ? '#fff' : accent,
              opacity: p.disabled ? 0.5 : 1,
              '& svg': { fontSize: 21 },
            }}
          >
            <p.Icon />
          </Box>
        );
      })}
    </Box>
  );
}
