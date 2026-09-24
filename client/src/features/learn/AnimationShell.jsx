import { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';

// Drives any step-based animation: current step index + play/pause/next/
// prev/reset/skipToEnd. Autoplay advances one step every `stepDurationMs`
// and stops automatically at the last step. `autoplay` (default true)
// starts playing on mount — pass false for manual-only visuals.
export function useStepPlayer(totalSteps, stepDurationMs = 1800, autoplay = true) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!playing) return undefined;
    intervalRef.current = setInterval(() => {
      setStep((s) => {
        if (s >= totalSteps - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, stepDurationMs);
    return () => clearInterval(intervalRef.current);
  }, [playing, totalSteps, stepDurationMs]);

  return {
    step,
    playing,
    setStep,
    next: () => setStep((s) => Math.min(s + 1, totalSteps - 1)),
    prev: () => setStep((s) => Math.max(s - 1, 0)),
    skipToEnd: () => {
      setPlaying(false);
      setStep(totalSteps - 1);
    },
    reset: () => {
      setStep(0);
      setPlaying(false);
    },
    // Read step/playing from state directly (not nested inside a setState
    // updater) — React 19 StrictMode double-invokes updater functions,
    // which double-fired the old nested setPlaying call.
    togglePlay: () => {
      if (step >= totalSteps - 1 && !playing) {
        setStep(0);
        setPlaying(true);
      } else {
        setPlaying((p) => !p);
      }
    },
  };
}

export function AnimationControls({
  step,
  totalSteps,
  playing,
  onPrev,
  onNext,
  onSkipToEnd,
  onTogglePlay,
  onReset,
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
      <Tooltip title="Previous step">
        <span>
          <IconButton size="small" onClick={onPrev} disabled={step === 0}>
            <SkipPreviousRoundedIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={playing ? 'Pause' : 'Play'}>
        <IconButton
          size="small"
          onClick={onTogglePlay}
          sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          {playing ? <PauseRoundedIcon fontSize="small" /> : <PlayArrowRoundedIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Next step">
        <span>
          <IconButton size="small" onClick={onNext} disabled={step === totalSteps - 1}>
            <SkipNextRoundedIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Skip to end">
        <span>
          <IconButton size="small" onClick={onSkipToEnd} disabled={step === totalSteps - 1}>
            <FastForwardRoundedIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Restart">
        <IconButton size="small" onClick={onReset}>
          <ReplayRoundedIcon />
        </IconButton>
      </Tooltip>
      <Box sx={{ flexGrow: 1 }} />
      <Stack direction="row" spacing={0.5}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: i <= step ? 'primary.main' : 'action.disabledBackground',
              transition: 'background-color 0.3s ease',
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}