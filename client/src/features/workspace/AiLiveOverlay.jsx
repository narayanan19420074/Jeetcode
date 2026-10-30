import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { LIB_ACCENT, LIB_FONT, LIB_TRACKING } from '../dashboard/components/libraryStyle';
import { aiApi } from '../../api/aiApi';
import { extractErrorMessage } from '../../api/apiClient';
import AiGlow from './AiGlow';

const pulse = keyframes`0%, 100% { transform: scale(1); } 50% { transform: scale(1.14); }`;
const VOICE_STYLE = '\n\n(Voice reply: at most 3 short plain sentences. No markdown, no code blocks, no full solution.)';
const STATUS = { listening: 'Listening…', thinking: 'Thinking…', speaking: 'Speaking…', idle: 'Tap the mic to talk' };

const getRecognition = () => (typeof window === 'undefined' ? null : window.SpeechRecognition || window.webkitSpeechRecognition || null);

// Phone only, Library look. "Go live": talk to the hint assistant by voice. Speech to text and text to speech both come from the browser,
// the answer comes from the same hint endpoint as the chat, so the same "hints only" rules apply.
export default function AiLiveOverlay({ open, onClose, slug, language, getCode, isAuthenticated, onSignIn }) {
  const [phase, setPhase] = useState('idle');
  const [caption, setCaption] = useState('');
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const recRef = useRef(null);
  const historyRef = useRef([]);
  const aliveRef = useRef(false);
  const phaseRef = useRef('idle');
  const setPhaseBoth = (p) => {
    phaseRef.current = p;
    setPhase(p);
  };
  const supported = Boolean(getRecognition());

  const stopAll = useCallback(() => {
    aliveRef.current = false;
    try {
      recRef.current?.abort();
    } catch {
      /* already stopped */
    }
    recRef.current = null;
    window.speechSynthesis?.cancel();
  }, []);

  const speak = useCallback((text, done) => {
    const synth = window.speechSynthesis;
    if (!synth) return done();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN';
    u.onend = done;
    u.onerror = done;
    synth.cancel();
    synth.speak(u);
  }, []);

  const ask = useCallback(
    async (said) => {
      setPhaseBoth('thinking');
      setCaption(said);
      setReply('');
      try {
        const history = historyRef.current.slice(-6);
        const { data } = await aiApi.hint({ problemSlug: slug, language, code: getCode(), question: said.slice(0, 700) + VOICE_STYLE, history });
        const answer = data.data.hint;
        historyRef.current = [...history, { role: 'user', text: said }, { role: 'assistant', text: answer.slice(0, 2000) }];
        if (!aliveRef.current) return;
        setReply(answer);
        setPhaseBoth('speaking');
        speak(answer.replace(/[`*#_]/g, ''), () => aliveRef.current && listen());
      } catch (err) {
        if (!aliveRef.current) return;
        setError(extractErrorMessage(err));
        setPhaseBoth('idle');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slug, language, getCode, speak]
  );

  const listen = useCallback(() => {
    const Rec = getRecognition();
    if (!Rec || !aliveRef.current) return;
    setError('');
    const rec = new Rec();
    rec.lang = 'en-IN';
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = '';
    rec.onresult = (e) => {
      let text = '';
      for (let i = 0; i < e.results.length; i += 1) text += e.results[i][0].transcript;
      finalText = text;
      setCaption(text);
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setError('Microphone access is blocked. Allow the microphone for this site and try again.');
        aliveRef.current = false;
        setPhaseBoth('idle');
      }
    };
    rec.onend = () => {
      if (!aliveRef.current || recRef.current !== rec) return;
      if (finalText.trim()) ask(finalText.trim());
      else if (phaseRef.current === 'listening') listen(); // heard nothing: keep listening
    };
    recRef.current = rec;
    setPhaseBoth('listening');
    try {
      rec.start();
    } catch {
      setPhaseBoth('idle');
    }
  }, [ask]);

  const start = useCallback(() => {
    if (!isAuthenticated) {
      onSignIn();
      return;
    }
    aliveRef.current = true;
    listen();
  }, [isAuthenticated, onSignIn, listen]);

  // Start listening as soon as the overlay opens; clean everything up when it closes.
  useEffect(() => {
    if (open && supported) start();
    if (!open) {
      stopAll();
      setPhaseBoth('idle');
      setCaption('');
      setReply('');
      setError('');
    }
    return stopAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const live = phase !== 'idle';
  return (
    <>
      <AiGlow active={open} intensity={phase === 'speaking' ? 1.4 : 1} />
      {open && (
        <Box
          role="dialog"
          aria-label="Live AI assistant"
          sx={{
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
          }}
        >
          <Box
            component="button"
            type="button"
            aria-label={live ? 'Listening' : 'Start talking'}
            onClick={live ? undefined : start}
            sx={{
              width: 76,
              height: 76,
              border: 0,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              cursor: live ? 'default' : 'pointer',
              bgcolor: LIB_ACCENT,
              boxShadow: '0 10px 28px rgba(99, 102, 241, 0.4)',
              animation: live ? `${pulse} ${phase === 'speaking' ? 0.8 : 1.6}s ease-in-out infinite` : 'none',
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          >
            <MicRoundedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography sx={{ fontWeight: 500, fontSize: 18, fontFamily: LIB_FONT, letterSpacing: LIB_TRACKING }}>{supported ? STATUS[phase] : 'Voice is not supported in this browser'}</Typography>
          {!supported && (
            <Typography variant="body2" sx={{ color: 'var(--lib-muted)', textAlign: 'center' }}>
              Use Chrome on Android or desktop, or choose Hint to chat by text.
            </Typography>
          )}
          {caption && (
            <Typography variant="body2" sx={{ color: 'var(--lib-muted)', textAlign: 'center', fontStyle: 'italic' }}>
              “{caption}”
            </Typography>
          )}
          {reply && (
            <Typography variant="body2" sx={{ textAlign: 'center', maxHeight: 140, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
              {reply}
            </Typography>
          )}
          {error && (
            <Typography variant="body2" color="error" role="alert" sx={{ textAlign: 'center' }}>
              {error}
            </Typography>
          )}
          <Button onClick={onClose} startIcon={<CloseRoundedIcon />} disableElevation sx={{ height: 44, px: 3, borderRadius: 999, textTransform: 'none', fontWeight: 500, fontSize: 16, fontFamily: LIB_FONT, letterSpacing: LIB_TRACKING, bgcolor: 'var(--lib-player, #F1E7DD)', color: 'var(--lib-text)', '&:hover': { bgcolor: 'var(--lib-player, #F1E7DD)', filter: 'brightness(0.97)' } }}>
            End
          </Button>
        </Box>
      )}
    </>
  );
}
