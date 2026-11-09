import { Paper, IconButton, Tooltip, Typography } from '@mui/material';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { speechSupported } from '../speech';
import { COLOR_PALETTE, withAlpha, FONT_WEIGHTS, RADII_PX, Z_INDEX } from '../../../../app/design/designTokens';

// Floating control pill: pause, skip a line, mute voice, end the lesson.
export default function GuideControls({ compact, dark, accent, finished, paused, muted, onTogglePause, onSkip, onToggleMute, onEnd }) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        zIndex: Z_INDEX.tourControls,
        left: '50%',
        transform: 'translateX(-50%)',
        ...(compact ? { top: 8 } : { bottom: 16 }),
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderRadius: RADII_PX.pill,
        bgcolor: dark ? withAlpha(COLOR_PALETTE.slate[900], 0.96) : withAlpha(COLOR_PALETTE.white, 0.97),
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: dark ? `0 10px 30px ${withAlpha(COLOR_PALETTE.black, 0.5)}` : `0 10px 30px ${withAlpha(COLOR_PALETTE.slate[900], 0.2)}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, color: dark ? accent : COLOR_PALETTE.emerald[700], px: 1.5, letterSpacing: '0.06em' }}>
        {finished ? 'DONE' : paused ? 'PAUSED' : 'TEACHING'}
      </Typography>
      <Tooltip title={paused ? 'Resume' : 'Pause'}>
        <IconButton size="small" onClick={onTogglePause} aria-label={paused ? 'Resume lesson' : 'Pause lesson'}>
          {paused ? <PlayArrowRoundedIcon fontSize="small" /> : <PauseRoundedIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Skip this line">
        <IconButton size="small" onClick={onSkip} aria-label="Skip this line">
          <SkipNextRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {speechSupported() && (
        <Tooltip title={muted ? 'Turn voice on' : 'Mute voice (captions stay)'}>
          <IconButton size="small" onClick={onToggleMute} aria-label={muted ? 'Turn voice on' : 'Mute voice'}>
            {muted ? <VolumeOffRoundedIcon fontSize="small" /> : <VolumeUpRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="End lesson (Esc)">
        <IconButton size="small" onClick={onEnd} aria-label="End lesson">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Paper>
  );
}
