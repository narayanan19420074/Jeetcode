import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import VideocamOffRoundedIcon from '@mui/icons-material/VideocamOffRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

const SIZE = 60; // collapsed bubble diameter
const GAP = 8;
const BUBBLE_W = SIZE;
const BUBBLE_H = SIZE * 2 + GAP;
const MARGIN = 8;

const initialOf = (name) => (name || '').trim()[0]?.toUpperCase() || '';

// <video> bound to a MediaStream. Always mounted for the friend so audio keeps playing.
function Vid({ stream, muted, mirror, show }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream || null;
  }, [stream]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      style={{ width: '100%', height: '100%', objectFit: 'cover', transform: mirror ? 'scaleX(-1)' : 'none', display: show ? 'block' : 'none' }}
    />
  );
}

// Round tile: video when available, otherwise the person's initial.
function Circle({ stream, muted, mirror, name, videoOn = true, size, badge }) {
  const show = !!stream && videoOn;
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        bgcolor: '#1E293B',
        border: '2px solid',
        borderColor: 'background.paper',
        boxShadow: 4,
      }}
    >
      <Vid stream={stream} muted={muted} mirror={mirror} show={show} />
      {!show && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.38 }}>
          {initialOf(name) || <PersonRoundedIcon sx={{ fontSize: size * 0.5, opacity: 0.7 }} />}
        </Box>
      )}
      {badge}
    </Box>
  );
}

// Floating call UI: two draggable circles (friend on top, you below). Tap -> expands
// into a small window with mute / camera / end. Ending the call only stops audio+video.
export default function FloatingCall({ call, friendName, myName, hasFriend }) {
  const { localStream, remoteStream, conn, micOn, camOn, stop, toggleMic, toggleCam } = call;
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const drag = useRef(null);

  const clamp = useCallback(
    (x, y) => ({
      x: Math.min(Math.max(MARGIN, x), window.innerWidth - BUBBLE_W - MARGIN),
      y: Math.min(Math.max(MARGIN, y), window.innerHeight - BUBBLE_H - MARGIN),
    }),
    []
  );

  useEffect(() => {
    setPos((p) => p || clamp(12, window.innerHeight - BUBBLE_H - 190));
    const onResize = () => setPos((p) => (p ? clamp(p.x, p.y) : p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [clamp]);

  if (!localStream) return null;

  const connecting = hasFriend && !['connected', 'completed'].includes(conn);
  const status = !hasFriend ? 'Waiting for friend…' : connecting ? 'Connecting…' : friendName;

  const onDown = (e) => {
    if (!pos) return;
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    setPos(clamp(d.ox + dx, d.oy + dy));
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) setOpen(true);
  };

  if (!open) {
    return (
      <Box
        role="button"
        tabIndex={0}
        aria-label="Open call window"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (drag.current = null)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpen(true)}
        sx={{
          position: 'fixed',
          left: pos?.x ?? 12,
          top: pos?.y ?? 120,
          zIndex: 1250,
          display: 'flex',
          flexDirection: 'column',
          gap: `${GAP}px`,
          touchAction: 'none',
          userSelect: 'none',
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <Circle
          stream={remoteStream}
          name={hasFriend ? friendName : ''}
          size={SIZE}
          badge={
            <Box
              sx={{
                position: 'absolute',
                right: 4,
                bottom: 4,
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: hasFriend ? 'success.main' : 'grey.500',
                border: '2px solid',
                borderColor: 'background.paper',
              }}
            />
          }
        />
        <Circle
          stream={localStream}
          muted
          mirror
          videoOn={camOn}
          name={myName}
          size={SIZE}
          badge={
            !micOn && (
              <Box sx={{ position: 'absolute', right: 0, bottom: 0, left: 0, height: 18, display: 'grid', placeItems: 'center', bgcolor: 'rgba(220,38,38,.9)', color: '#fff' }}>
                <MicOffRoundedIcon sx={{ fontSize: 13 }} />
              </Box>
            )
          }
        />
      </Box>
    );
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        zIndex: 1250,
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 'calc(16px + env(safe-area-inset-bottom))',
        width: 'min(92vw, 360px)',
        p: 1,
        borderRadius: '28px',
      }}
    >
      <Box sx={{ position: 'relative', height: 230, borderRadius: '22px', overflow: 'hidden', bgcolor: '#0F172A' }}>
        <Vid stream={remoteStream} show={!!remoteStream} />
        {!remoteStream && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'grey.400' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 64, height: 64, mx: 'auto', mb: 1, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: '#1E293B', color: '#fff', fontSize: 26, fontWeight: 700 }}>
                {hasFriend ? initialOf(friendName) : <PersonRoundedIcon />}
              </Box>
              <Typography variant="caption">{status}</Typography>
            </Box>
          </Box>
        )}

        {/* friend name, top-left */}
        <Typography
          variant="caption"
          sx={{ position: 'absolute', left: 10, top: 10, px: 1, py: 0.25, borderRadius: 99, bgcolor: 'rgba(0,0,0,.55)', color: '#fff', fontWeight: 600 }}
        >
          {remoteStream ? friendName : status}
        </Typography>

        {/* minimise, top-right */}
        <Tooltip title="Minimise">
          <IconButton
            size="small"
            aria-label="Minimise call window"
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8, width: 32, height: 32, bgcolor: 'rgba(0,0,0,.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,.75)' } }}
          >
            <CloseFullscreenRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* you, bottom-left */}
        <Box sx={{ position: 'absolute', left: 10, bottom: 10 }}>
          <Circle stream={localStream} muted mirror videoOn={camOn} name={myName} size={72} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, pt: 1.25, pb: 0.5 }}>
        <Tooltip title={micOn ? 'Mute' : 'Unmute'}>
          <IconButton
            onClick={toggleMic}
            aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
            sx={{ width: 48, height: 48, bgcolor: micOn ? 'action.hover' : 'error.main', color: micOn ? 'text.primary' : '#fff', '&:hover': { bgcolor: micOn ? 'action.selected' : 'error.dark' } }}
          >
            {micOn ? <MicRoundedIcon /> : <MicOffRoundedIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={camOn ? 'Camera off' : 'Camera on'}>
          <IconButton
            onClick={toggleCam}
            aria-label={camOn ? 'Turn camera off' : 'Turn camera on'}
            sx={{ width: 48, height: 48, bgcolor: camOn ? 'action.hover' : 'error.main', color: camOn ? 'text.primary' : '#fff', '&:hover': { bgcolor: camOn ? 'action.selected' : 'error.dark' } }}
          >
            {camOn ? <VideocamRoundedIcon /> : <VideocamOffRoundedIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="End call (code & chat continue)">
          <IconButton
            onClick={() => {
              setOpen(false);
              stop();
            }}
            aria-label="End call"
            sx={{ width: 64, height: 48, borderRadius: 99, bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: 'error.dark' } }}
          >
            <CallEndRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
}
