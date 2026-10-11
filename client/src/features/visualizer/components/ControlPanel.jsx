import { Box, IconButton, Slider, Typography, Tooltip } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

export default function ControlPanel({ isPlaying, onPlayPause, onNext, onPrev, onReset, stepIndex, totalSteps, speed, onSpeedChange }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
      <Tooltip title="Restart">
        <IconButton data-teach="restart" onClick={onReset}><RestartAltRoundedIcon /></IconButton>
      </Tooltip>
      <Tooltip title="Previous step">
        <IconButton data-teach="prev" onClick={onPrev} disabled={stepIndex === 0}><SkipPreviousRoundedIcon /></IconButton>
      </Tooltip>
      <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
        <IconButton data-teach="play" onClick={onPlayPause} sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}>
          {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Next step">
        <IconButton data-teach="next" onClick={onNext} disabled={stepIndex >= totalSteps - 1}><SkipNextRoundedIcon /></IconButton>
      </Tooltip>

      <Typography data-teach="step-count" variant="caption" sx={{ fontFamily: (t) => t.typography.monospace.fontFamily, color: 'text.secondary', minWidth: 64 }}>
        {stepIndex + 1} / {totalSteps}
      </Typography>

      <Box data-teach="speed" sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto', minWidth: 160 }}>
        <Typography variant="caption" color="text.secondary">Speed</Typography>
        <Slider size="small" value={speed} min={1} max={5} step={1} onChange={(e, val) => onSpeedChange(val)} sx={{ width: 100 }} />
      </Box>
    </Box>
  );
}
