import { ButtonBase, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { formatClock } from './useStopwatch';
import { WsIconButton } from './wsUi';
import { wsSurface } from './workspaceTheme';
import { WS, mono } from './wsTokens';

// Practice timer (personal, not shared): tap the clock to start, tap the time to pause.
export default function TimerControl({ sw, size = 'md' }) {
  const h = size === 'xl' ? 44 : size === 'lg' ? WS.ctrlLg : WS.ctrl;
  if (!sw.running && sw.seconds === 0) {
    return (
      <WsIconButton title="Start timer" size={size} onClick={sw.start}>
        <TimerOutlinedIcon />
      </WsIconButton>
    );
  }
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25 }}>
      <ButtonBase
        onClick={sw.running ? sw.pause : sw.start}
        aria-label={sw.running ? 'Pause timer' : 'Resume timer'}
        sx={(t) => ({
          height: h,
          px: 1.1,
          gap: 0.6,
          borderRadius: `${WS.radius}px`,
          color: sw.running ? t.palette.primary.main : t.palette.text.secondary,
          bgcolor: sw.running ? alpha(t.palette.primary.main, 0.12) : wsSurface(t).raised,
          '& svg': { fontSize: 17 },
        })}
      >
        {sw.running ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
        <Typography sx={{ ...mono, fontSize: '0.8rem', fontWeight: 600, color: 'inherit' }}>{formatClock(sw.seconds)}</Typography>
      </ButtonBase>
      <WsIconButton title="Reset timer" size={size} onClick={sw.reset}>
        <RestartAltRoundedIcon sx={{ fontSize: '17px !important' }} />
      </WsIconButton>
    </Stack>
  );
}
