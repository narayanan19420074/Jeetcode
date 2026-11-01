import { Box, Button, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { LIB_ACCENT, LIB_FONT, LIB_TRACKING } from '../dashboard/components/libraryStyle';
import AiGlow from './AiGlow';
import { isMicCaptureSupported } from './live/micCapture';
import { LIVE_PHASE } from './live/liveVoiceSession';
import useGeminiLive from './live/useGeminiLive';

const pulse = keyframes`0%, 100% { transform: scale(1); } 50% { transform: scale(1.14); }`;

const STATUS_LABEL = {
  [LIVE_PHASE.idle]: 'Connecting…',
  [LIVE_PHASE.connecting]: 'Connecting…',
  [LIVE_PHASE.listening]: 'Listening…',
  [LIVE_PHASE.speaking]: 'Speaking…',
  [LIVE_PHASE.error]: 'Could not stay connected',
};

const SHEET_SX = {
  position: 'fixed',
  zIndex: 1360,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1.5,
  px: 2,
  pt: 3,
  pb: 'calc(24px + env(safe-area-inset-bottom))',
  borderRadius: '24px 24px 0 0',
  fontFamily: LIB_FONT,
  letterSpacing: LIB_TRACKING,
  color: 'var(--lib-text)',
  bgcolor: 'var(--lib-bg, #FDF8F4)',
  boxShadow: '0 -12px 40px rgba(0,0,0,0.22)',
};

const END_BUTTON_SX = {
  height: 44,
  px: 3,
  borderRadius: 999,
  textTransform: 'none',
  fontWeight: 500,
  fontSize: 16,
  fontFamily: LIB_FONT,
  letterSpacing: LIB_TRACKING,
  bgcolor: 'var(--lib-player, #F1E7DD)',
  color: 'var(--lib-text)',
  '&:hover': { bgcolor: 'var(--lib-player, #F1E7DD)', filter: 'brightness(0.97)' },
};

function statusLabel({ supported, phase, muted }) {
  if (!supported) return 'Voice is not supported in this browser';
  if (phase === LIVE_PHASE.listening && muted) return 'Muted. Tap the mic to unmute';
  return STATUS_LABEL[phase];
}

const orbSx = ({ canPress, muted, pulseSeconds }) => ({
  width: 76,
  height: 76,
  border: 0,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  color: '#fff',
  cursor: canPress ? 'pointer' : 'default',
  bgcolor: muted ? 'var(--lib-muted, #6F655B)' : LIB_ACCENT,
  boxShadow: '0 10px 28px rgba(99, 102, 241, 0.4)',
  animation: pulseSeconds ? `${pulse} ${pulseSeconds}s ease-in-out infinite` : 'none',
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
});

// Fast pulse while the assistant speaks, slow while it listens, none when muted or not connected.
function pulseSecondsFor(phase, muted) {
  if (phase === LIVE_PHASE.speaking) return 0.8;
  return phase === LIVE_PHASE.listening && !muted ? 1.6 : 0;
}

// The mic button is the only control: it restarts after an error, otherwise it mutes and unmutes.
function LiveOrb({ phase, muted, onRestart, onToggleMute }) {
  const isError = phase === LIVE_PHASE.error;
  const canPress = isError || phase === LIVE_PHASE.listening || phase === LIVE_PHASE.speaking;
  const Icon = muted ? MicOffRoundedIcon : MicRoundedIcon;
  const label = isError ? 'Start again' : muted ? 'Unmute microphone' : 'Mute microphone';
  return (
    <Box
      component="button"
      type="button"
      aria-label={label}
      disabled={!canPress}
      onClick={isError ? onRestart : onToggleMute}
      sx={orbSx({ canPress, muted, pulseSeconds: pulseSecondsFor(phase, muted) })}
    >
      <Icon sx={{ fontSize: 36 }} />
    </Box>
  );
}

// What the learner said and what the assistant is saying, as live captions.
function LiveCaptions({ transcript, error }) {
  return (
    <>
      {transcript.user && (
        <Typography variant="body2" sx={{ color: 'var(--lib-muted)', textAlign: 'center', fontStyle: 'italic' }}>
          “{transcript.user}”
        </Typography>
      )}
      {transcript.model && (
        <Typography variant="body2" sx={{ textAlign: 'center', maxHeight: 140, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
          {transcript.model}
        </Typography>
      )}
      {error && (
        <Typography variant="body2" color="error" role="alert" sx={{ textAlign: 'center' }}>
          {error}
        </Typography>
      )}
    </>
  );
}

function LiveHint({ supported, showTip }) {
  if (supported && !showTip) return null;
  return (
    <Typography variant="body2" sx={{ color: 'var(--lib-muted)', textAlign: 'center' }}>
      {supported ? 'Tip: use headphones so the assistant does not hear itself.' : 'Use Chrome over HTTPS, or choose Hint to chat by text.'}
    </Typography>
  );
}

// Phone only, Library look. "Go live": a real-time voice conversation with Gemini Live about the code on the screen.
// The assistant always sees the latest code, and the same "hints only, no full solution" rules apply as in the chat.
export default function AiLiveOverlay({ open, onClose, slug, language, code }) {
  const supported = isMicCaptureSupported();
  const live = useGeminiLive({ active: open && supported, slug, language, code });
  const hasCaptions = Boolean(live.transcript.user || live.transcript.model || live.error);

  return (
    <>
      <AiGlow active={open} intensity={live.phase === LIVE_PHASE.speaking ? 1.4 : 1} />
      {open && (
        <Box role="dialog" aria-label="Live AI assistant" sx={SHEET_SX}>
          <LiveOrb phase={live.phase} muted={live.muted} onRestart={live.restart} onToggleMute={live.toggleMute} />
          <Typography sx={{ fontWeight: 500, fontSize: 18, fontFamily: LIB_FONT, letterSpacing: LIB_TRACKING }}>
            {statusLabel({ supported, phase: live.phase, muted: live.muted })}
          </Typography>
          <LiveHint supported={supported} showTip={!hasCaptions} />
          <LiveCaptions transcript={live.transcript} error={live.error} />
          <Button onClick={onClose} startIcon={<CloseRoundedIcon />} disableElevation sx={END_BUTTON_SX}>
            End
          </Button>
        </Box>
      )}
    </>
  );
}
