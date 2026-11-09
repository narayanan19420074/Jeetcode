import { useEffect, useRef, useState } from 'react';
import { runTour } from '../teachScript';
import { warmUpVoices, cancelSpeech } from '../speech';
import { CANCEL, sleep, readMuted, writeMuted } from './guideConstants';
import { createTourApi } from './tourRunner';

// Owns the tour run and everything the learner can do to it (pause, skip, mute, end).
export function useTourEngine({ page, onClose, compact }) {
  const [caption, setCaption] = useState({ text: '', sentences: [], idx: 0 });
  const [target, setTarget] = useState(null);
  const [talking, setTalking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(readMuted);
  const [tap, setTap] = useState(null);
  const [finished, setFinished] = useState(false);

  const runRef = useRef(0);
  const pausedRef = useRef(false);
  const skipRef = useRef(false);
  const mutedRef = useRef(muted);
  const speechRef = useRef(null);
  const compactRef = useRef(compact);
  const onCloseRef = useRef(onClose);
  mutedRef.current = muted;
  compactRef.current = compact;
  onCloseRef.current = onClose;

  useEffect(() => {
    warmUpVoices();
    runRef.current += 1;
    const id = runRef.current;
    const refs = { runRef, pausedRef, skipRef, mutedRef, speechRef, compactRef };
    const api = createTourApi(id, refs, { setCaption, setTalking, setTarget, setTap }, page);

    // Start on the next tick: React StrictMode (dev) mounts, unmounts and
    // remounts effects, and we do not want the first, cancelled run to start talking.
    const start = async () => {
      try {
        await runTour(api);
        setFinished(true);
        await sleep(1100);
      } catch (e) {
        if (e !== CANCEL) console.error('[teach]', e); // eslint-disable-line no-console
      } finally {
        if (runRef.current === id) onCloseRef.current();
      }
    };
    const startTimer = setTimeout(start, 60);

    return () => {
      clearTimeout(startTimer);
      runRef.current += 1;
      speechRef.current?.cancel?.();
      cancelSpeech();
      page.end();
    };
    // The tour starts once per mount; `page` is a stable object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopVoice = () => {
    speechRef.current?.cancel?.();
    cancelSpeech();
  };
  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  };
  const skip = () => { skipRef.current = true; };
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    writeMuted(next);
    if (next) stopVoice();
  };
  const end = () => {
    runRef.current += 1; // cancels the running tour
    stopVoice();
    onCloseRef.current();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') end();
      else if (e.key === 'ArrowRight') skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { caption, target, talking, tap, finished, paused, muted, togglePause, skip, toggleMute, end };
}
