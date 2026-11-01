import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { aiApi } from '../../../api/aiApi';
import { LIVE_PHASE, LiveVoiceSession } from './liveVoiceSession';

const EMPTY_TRANSCRIPT = { user: '', model: '' };

const fetchLiveCredentials = (slug) => aiApi.liveSession({ problemSlug: slug }).then((response) => response.data.data);

// Owns the LiveVoiceSession object: opens it while `active`, closes it otherwise (or when the
// problem changes or `attempt` is bumped), and forwards every code edit so the assistant sees the latest code.
function useSessionLifecycle({ active, slug, language, code, attempt, events, onReset }) {
  const sessionRef = useRef(null);
  const latestCode = useRef({ language, code });

  useEffect(() => {
    latestCode.current = { language, code };
    sessionRef.current?.updateCode(language, code);
  }, [language, code]);

  useEffect(() => {
    if (!active) return undefined;
    const session = new LiveVoiceSession(events);
    sessionRef.current = session;
    session.start({ fetchCredentials: () => fetchLiveCredentials(slug), ...latestCode.current });
    return () => {
      session.close();
      sessionRef.current = null;
      onReset();
    };
  }, [active, slug, attempt, events, onReset]);

  return sessionRef;
}

// One Gemini Live voice conversation while `active` is true. `code` is the editor's current code:
// the assistant always sees the latest version, so it can talk about what is on the learner's screen.
export default function useGeminiLive({ active, slug, language, code }) {
  const [phase, setPhase] = useState(LIVE_PHASE.idle);
  const [transcript, setTranscript] = useState(EMPTY_TRANSCRIPT);
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(false);
  const [attempt, setAttempt] = useState(0); // bumped to start a fresh session after an error

  const events = useMemo(() => ({ onPhase: setPhase, onTranscript: setTranscript, onError: setError }), []);
  const onReset = useCallback(() => {
    setPhase(LIVE_PHASE.idle);
    setTranscript(EMPTY_TRANSCRIPT);
    setError('');
    setMuted(false);
  }, []);

  const sessionRef = useSessionLifecycle({ active, slug, language, code, attempt, events, onReset });
  useEffect(() => {
    sessionRef.current?.setMuted(muted);
  }, [muted, sessionRef]);

  const toggleMute = useCallback(() => setMuted((wasMuted) => !wasMuted), []);
  const restart = useCallback(() => setAttempt((count) => count + 1), []);

  return { phase, transcript, error, muted, toggleMute, restart };
}
