import { ButtonBase, IconButton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { LIB_ACCENT, LIB_TRACKING, libIconBtnSx } from '../dashboard/components/libraryStyle';
import { tint } from '../dashboard/dashboardUtils';
import { formatClock } from './useStopwatch';
import { WsIconButton } from './wsUi';
import { wsSurface } from './workspaceTheme';
import { WS, mono } from './wsTokens';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../app/design/designTokens';

// Practice timer (personal, not shared): tap the clock to start, tap the time to pause.
// lib: the phone workspace look (Library style: 40px round buttons and a 40px time pill).
export default function TimerControl({ sw, size = 'md', lib = false }) {
  if (lib) {
    if (!sw.running && sw.seconds === 0) {
      return (
        <IconButton onClick={sw.start} aria-label="Start timer" sx={libIconBtnSx}>
          <TimerOutlinedIcon />
        </IconButton>
      );
    }
    return (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <ButtonBase
          onClick={sw.running ? sw.pause : sw.start}
          aria-label={sw.running ? 'Pause timer' : 'Resume timer'}
          sx={{
            height: 40,
            px: 2,
            gap: 1,
            flexShrink: 0,
            borderRadius: RADII_PX.pill,
            fontFamily: 'inherit',
            fontSize: FONT_SIZES.title,
            fontWeight: FONT_WEIGHTS.medium,
            letterSpacing: LIB_TRACKING,
            fontVariantNumeric: 'tabular-nums',
            color: sw.running ? LIB_ACCENT : 'var(--lib-chip-text)',
            bgcolor: sw.running ? tint(LIB_ACCENT, 14) : 'var(--lib-chip)',
            '& svg': { fontSize: FONT_SIZES.heading },
          }}
        >
          {sw.running ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
          {formatClock(sw.seconds)}
        </ButtonBase>
        <IconButton onClick={sw.reset} aria-label="Reset timer" sx={libIconBtnSx}>
          <RestartAltRoundedIcon />
        </IconButton>
      </Stack>
    );
  }
  const h = size === 'xl' ? 44 : size === 'lg' ? WS.ctrlLg : WS.ctrl;
  if (!sw.running && sw.seconds === 0) {
    return (
      <WsIconButton title="Start timer" size={size} onClick={sw.start}>
        <TimerOutlinedIcon />
      </WsIconButton>
    );
  }
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
      <ButtonBase
        onClick={sw.running ? sw.pause : sw.start}
        aria-label={sw.running ? 'Pause timer' : 'Resume timer'}
        sx={(t) => ({
          height: h,
          px: 1,
          gap: 0.5,
          borderRadius: `${WS.radius}px`,
          color: sw.running ? t.palette.primary.main : t.palette.text.secondary,
          bgcolor: sw.running ? alpha(t.palette.primary.main, 0.12) : wsSurface(t).raised,
          '& svg': { fontSize: FONT_SIZES.subheading },
        })}
      >
        {sw.running ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
        <Typography sx={{ ...mono, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold, color: 'inherit' }}>{formatClock(sw.seconds)}</Typography>
      </ButtonBase>
      <WsIconButton title="Reset timer" size={size} onClick={sw.reset}>
        <RestartAltRoundedIcon sx={{ fontSize: `${FONT_SIZES.iconCompact} !important` }} />
      </WsIconButton>
    </Stack>
  );
}
