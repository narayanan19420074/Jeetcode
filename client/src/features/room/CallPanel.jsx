import { useEffect, useRef } from 'react';
import { Box, Stack, Button, IconButton, Tooltip, Typography, Alert, Chip } from '@mui/material';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import VideocamOffRoundedIcon from '@mui/icons-material/VideocamOffRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';

function VideoTile({ stream, muted, label, mirror, height }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream || null;
  }, [stream]);
  return (
    <Box sx={{ position: 'relative', height, borderRadius: 2, overflow: 'hidden', bgcolor: '#0F172A' }}>
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: mirror ? 'scaleX(-1)' : 'none' }}
      />
      {!stream && (
        <Typography variant="caption" sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'grey.500' }}>
          {label}
        </Typography>
      )}
      <Chip size="small" label={label} sx={{ position: 'absolute', left: 6, bottom: 6, bgcolor: 'rgba(0,0,0,.55)', color: '#fff' }} />
    </Box>
  );
}

export default function CallPanel({ call, friendName, hasFriend }) {
  const { localStream, remoteStream, conn, micOn, camOn, error, start, stop, toggleMic, toggleCam } = call;
  const connecting = localStream && hasFriend && !['connected', 'completed'].includes(conn);

  return (
    <Stack spacing={1} sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <VideoTile stream={remoteStream} label={friendName || 'Waiting for friend…'} height={150} />
      {localStream && <VideoTile stream={localStream} muted mirror label="You" height={90} />}

      {error && <Alert severity="warning" sx={{ py: 0 }}>{error}</Alert>}

      {!localStream ? (
        <Button variant="contained" disableElevation startIcon={<VideocamRoundedIcon />} onClick={start}>
          Start call (mic + cam)
        </Button>
      ) : (
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
          <Tooltip title={micOn ? 'Mute' : 'Unmute'}>
            <IconButton onClick={toggleMic} color={micOn ? 'default' : 'error'}>
              {micOn ? <MicRoundedIcon /> : <MicOffRoundedIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={camOn ? 'Camera off' : 'Camera on'}>
            <IconButton onClick={toggleCam} color={camOn ? 'default' : 'error'}>
              {camOn ? <VideocamRoundedIcon /> : <VideocamOffRoundedIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="End call">
            <IconButton onClick={stop} color="error">
              <CallEndRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
      {connecting && <Typography variant="caption" color="text.secondary" align="center">Connecting… ({conn})</Typography>}
      {localStream && !hasFriend && (
        <Typography variant="caption" color="text.secondary" align="center">
          Friend join aana udane connect aagum
        </Typography>
      )}
    </Stack>
  );
}
