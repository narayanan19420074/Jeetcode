import { useCallback, useEffect, useState } from 'react';

export const PLAYBACK_SPEEDS = [
  { label: '0.5×', intervalMs: 1400 },
  { label: '1×', intervalMs: 700 },
  { label: '2×', intervalMs: 350 },
  { label: '4×', intervalMs: 150 },
];
const DEFAULT_INTERVAL_MS = PLAYBACK_SPEEDS[1].intervalMs;

// Which step is shown, and automatic playback. A new trace (resetKey) starts again from the first step.
export default function useStepPlayer(stepCount, resetKey) {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [intervalMs, setIntervalMs] = useState(DEFAULT_INTERVAL_MS);
  const lastIndex = Math.max(0, stepCount - 1);

  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [resetKey]);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => setStepIndex((index) => Math.min(index + 1, lastIndex)), intervalMs);
    return () => clearInterval(timer);
  }, [playing, intervalMs, lastIndex]);

  useEffect(() => {
    if (playing && stepIndex >= lastIndex) setPlaying(false);
  }, [playing, stepIndex, lastIndex]);

  const seek = useCallback((index) => setStepIndex(Math.max(0, Math.min(index, lastIndex))), [lastIndex]);
  const togglePlay = () => {
    if (!playing && stepIndex >= lastIndex) setStepIndex(0); // pressing Play at the end starts over
    setPlaying((value) => !value);
  };

  return {
    stepIndex,
    playing,
    intervalMs,
    setIntervalMs,
    togglePlay,
    seek,
    first: () => seek(0),
    last: () => seek(lastIndex),
    previous: () => seek(stepIndex - 1),
    next: () => seek(stepIndex + 1),
  };
}
