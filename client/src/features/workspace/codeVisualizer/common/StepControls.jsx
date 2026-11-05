import { Box, IconButton, MenuItem, Slider, Typography } from '@mui/material';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { SIZES } from '../../../../app/design/designTokens';
import { WsSelect } from '../../wsUi';
import { PLAYBACK_SPEEDS } from './useStepPlayer';

function ControlButton({ label, onClick, disabled, children }) {
  return (
    <IconButton aria-label={label} title={label} onClick={onClick} disabled={disabled}>
      {children}
    </IconButton>
  );
}

function TransportButtons({ player, stepCount }) {
  const atStart = player.stepIndex === 0;
  const atEnd = player.stepIndex >= stepCount - 1;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <ControlButton label="First step" onClick={player.first} disabled={atStart}>
        <FirstPageRoundedIcon />
      </ControlButton>
      <ControlButton label="Previous step" onClick={player.previous} disabled={atStart}>
        <NavigateBeforeRoundedIcon />
      </ControlButton>
      <ControlButton label={player.playing ? 'Pause' : 'Play'} onClick={player.togglePlay}>
        {player.playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
      </ControlButton>
      <ControlButton label="Next step" onClick={player.next} disabled={atEnd}>
        <NavigateNextRoundedIcon />
      </ControlButton>
      <ControlButton label="Last step" onClick={player.last} disabled={atEnd}>
        <LastPageRoundedIcon />
      </ControlButton>
    </Box>
  );
}

function SpeedSelect({ player }) {
  return (
    <WsSelect
      value={player.intervalMs}
      onChange={(event) => player.setIntervalMs(event.target.value)}
      inputProps={{ 'aria-label': 'Playback speed' }}
      sx={{ minWidth: SIZES.codeVisualizer.speedSelect }}
    >
      {PLAYBACK_SPEEDS.map((speed) => (
        <MenuItem key={speed.label} value={speed.intervalMs}>
          {speed.label}
        </MenuItem>
      ))}
    </WsSelect>
  );
}

// Transport buttons, a scrubber over every step, the step counter and the playback speed.
export default function StepControls({ player, stepCount, description }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary" aria-live="polite" noWrap>
        {description}
      </Typography>
      <Slider
        size="small"
        min={0}
        max={Math.max(0, stepCount - 1)}
        value={player.stepIndex}
        onChange={(_, value) => player.seek(value)}
        aria-label="Step"
      />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <TransportButtons player={player} stepCount={stepCount} />
        <Typography variant="caption" color="text.secondary">
          Step {player.stepIndex + 1} of {stepCount}
        </Typography>
        <SpeedSelect player={player} />
      </Box>
    </Box>
  );
}
