import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { keyframes } from '@emotion/react';
import { Box, IconButton, Paper, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { runTour } from './teachScript';
import { speak, splitSentences, toSpoken, warmUpVoices, cancelSpeech, speechSupported } from './speech';

// Blip's guided tour of the Algorithm Visualizer.
//
// This component is the "engine + stage": it owns the floating mascot, the
// speech bubble, the spotlight and the little control pill. *What* Blip says
// lives in teachScript.js / lessons.js. The page it teaches is reached only
// through the `page` hooks object (see VisualizerPage.jsx).

const Alien3D = lazy(() => import('../../aptitude/components/Alien3D'));

const CANCEL = Symbol('teach-cancel');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MUTE_KEY = 'jeetcode-teach-muted';
const BLIP = 124;
const BUBBLE_W = 300;
const MARGIN = 12;
const PAD = 8;
const TOP_SAFE = 72; // keeps Blip clear of the site navbar
const BOTTOM_SAFE = 72; // ...and of the control pill

const readMuted = () => {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
};
const writeMuted = (v) => {
  try { localStorage.setItem(MUTE_KEY, v ? '1' : '0'); } catch { /* storage unavailable */ }
};

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 100vmax rgba(8, 12, 24, 0.5), 0 0 0 0 rgba(52, 211, 153, 0.55); }
  50% { box-shadow: 0 0 0 100vmax rgba(8, 12, 24, 0.5), 0 0 0 9px rgba(52, 211, 153, 0); }
`;
const rise = keyframes`
  from { opacity: 0; transform: translateY(6px) scale(0.98); }
  to { opacity: 1; transform: none; }
`;
const ripple = keyframes`
  from { transform: translate(-50%, -50%) scale(0.2); opacity: 0.9; }
  to { transform: translate(-50%, -50%) scale(2.4); opacity: 0; }
`;

/* Where should Blip hover so he is next to the target but never on top of it? */
function placeAgent(rect, size, vw, vh) {
  const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const maxX = Math.max(MARGIN, vw - size.w - MARGIN);
  const maxY = Math.max(TOP_SAFE, vh - size.h - BOTTOM_SAFE);
  const corners = [
    { x: maxX, y: maxY },
    { x: MARGIN, y: maxY },
    { x: maxX, y: TOP_SAFE },
    { x: MARGIN, y: TOP_SAFE },
  ];
  if (!rect) return corners[0];

  const t = { left: rect.left - PAD, top: rect.top - PAD, right: rect.right + PAD, bottom: rect.bottom + PAD };
  const cx = cl(rect.left + rect.width / 2 - size.w / 2, MARGIN, maxX);
  const cy = cl(rect.top + rect.height / 2 - size.h / 2, TOP_SAFE, maxY);
  const near = [
    { x: cx, y: t.bottom + 6 },
    { x: cx, y: t.top - 6 - size.h },
    { x: t.right + 8, y: cy },
    { x: t.left - 8 - size.w, y: cy },
  ];
  const big = rect.width * rect.height > vw * vh * 0.22;
  const candidates = big ? [...corners, ...near] : [...near, ...corners];

  const fits = (p) => p.x >= MARGIN - 0.5 && p.y >= TOP_SAFE - 0.5 && p.x <= maxX + 0.5 && p.y <= maxY + 0.5;
  const overlap = (p) => {
    const ox = Math.max(0, Math.min(p.x + size.w, t.right) - Math.max(p.x, t.left));
    const oy = Math.max(0, Math.min(p.y + size.h, t.bottom) - Math.max(p.y, t.top));
    return ox * oy;
  };
  let best = null;
  for (const p of candidates) {
    if (!fits(p)) continue;
    const o = overlap(p);
    if (o === 0) return p;
    if (!best || o < best.o) best = { p, o };
  }
  return best ? best.p : corners[0];
}

export default function TeachGuide({ page, onClose }) {
  const theme = useTheme();
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)');
  const compact = useMediaQuery('(max-width:639.95px)');
  const dark = theme.palette.mode === 'dark';

  const [caption, setCaption] = useState({ text: '', sentences: [], idx: 0 });
  const [target, setTarget] = useState(null);
  const [rect, setRect] = useState(null);
  const [talking, setTalking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(readMuted);
  const [travelling, setTravelling] = useState(false);
  const [heading, setHeading] = useState(0);
  const [tap, setTap] = useState(null);
  const [finished, setFinished] = useState(false);
  const [size, setSize] = useState({ w: BLIP + BUBBLE_W + 8, h: 150 });
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

  const runRef = useRef(0);
  const pausedRef = useRef(false);
  const skipRef = useRef(false);
  const mutedRef = useRef(muted);
  const speechRef = useRef(null);
  const compactRef = useRef(compact);
  const onCloseRef = useRef(onClose);
  const agentRef = useRef(null);
  const lastPos = useRef(null);
  const travelTimer = useRef(null);
  mutedRef.current = muted;
  compactRef.current = compact;
  onCloseRef.current = onClose;

  /* ----------------------------- engine ----------------------------- */
  useEffect(() => {
    warmUpVoices();
    runRef.current += 1;
    const id = runRef.current;

    const alive = () => {
      if (runRef.current !== id) throw CANCEL;
    };
    const gate = async () => {
      alive();
      while (pausedRef.current) {
        await sleep(80);
        alive();
      }
    };
    const wait = async (ms) => {
      let left = ms;
      while (left > 0) {
        await gate();
        const slice = Math.min(60, left);
        await sleep(slice);
        left -= slice;
      }
      alive();
    };
    const until = async (fn, timeout = 30000) => {
      let t = 0;
      while (!fn() && t < timeout) {
        await wait(120);
        t += 120;
      }
    };

    // Speak a single sentence. Resolves 'done' | 'skip'. If the learner
    // pauses mid-sentence we stop talking and say it again on resume.
    const speakSentence = async (sentence) => {
      for (;;) {
        await gate();
        const handle = speak(toSpoken(sentence), { muted: mutedRef.current });
        speechRef.current = handle;
        let outcome = null;
        handle.promise.then(() => { if (!outcome) outcome = 'done'; });
        while (!outcome) {
          await sleep(50);
          if (runRef.current !== id) { handle.cancel(); throw CANCEL; }
          if (skipRef.current) { outcome = 'skip'; handle.cancel(); } else if (pausedRef.current) { outcome = 'pause'; handle.cancel(); }
        }
        if (outcome === 'pause') continue;
        return outcome;
      }
    };

    const say = async (text) => {
      const sentences = splitSentences(text);
      skipRef.current = false;
      setCaption({ text, sentences, idx: 0 });
      setTalking(true);
      try {
        for (let i = 0; i < sentences.length; i += 1) {
          setCaption({ text, sentences, idx: i });
          const outcome = await speakSentence(sentences[i]);
          if (outcome === 'skip') break;
        }
      } finally {
        setTalking(false);
        skipRef.current = false;
      }
      await wait(220);
    };

    const find = (sel) => (sel ? document.querySelector(sel) : null);
    const has = (sel) => {
      const el = find(sel);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 8;
    };

    const point = (sel) => {
      const el = find(sel);
      setTarget(el ? sel : null);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (compactRef.current) {
        if (r.top > vh * 0.42 || r.top < TOP_SAFE) window.scrollBy({ top: r.top - 96, behavior: 'smooth' });
      } else if (r.top < 0 || r.bottom > vh) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    };

    const click = async (sel) => {
      const el = find(sel);
      if (!el) return;
      const r = el.getBoundingClientRect();
      setTap({ x: r.left + r.width / 2, y: r.top + r.height / 2, key: Date.now() });
      await wait(520);
      if (!el.disabled) el.click();
      await wait(280);
      setTap(null);
    };

    const api = { say, point, click, wait, until, has, page };

    // Start on the next tick: React StrictMode (dev) mounts, unmounts and
    // remounts effects, and we do not want the first, cancelled run to start talking.
    let startTimer = null;
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
    startTimer = setTimeout(start, 60);

    return () => {
      clearTimeout(startTimer);
      runRef.current += 1;
      speechRef.current?.cancel?.();
      cancelSpeech();
      clearTimeout(travelTimer.current);
      page.end();
    };
    // The tour starts once per mount; `page` is a stable object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------- spotlight geometry (follows layout changes) -------- */
  useEffect(() => {
    let last = '';
    const tick = () => {
      const el = target ? document.querySelector(target) : null;
      let next = null;
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) next = { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
      }
      const key = next ? [next.left, next.top, next.width, next.height].map(Math.round).join() : '';
      if (key !== last) {
        last = key;
        setRect(next);
      }
    };
    tick();
    const iv = setInterval(tick, 100);
    return () => clearInterval(iv);
  }, [target]);

  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useLayoutEffect(() => {
    const el = agentRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setSize((s) => (Math.abs(s.w - w) > 1 || Math.abs(s.h - h) > 1 ? { w, h } : s));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* --------------------------- controls ----------------------------- */
  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  };
  const skip = () => { skipRef.current = true; };
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    writeMuted(next);
    if (next) { speechRef.current?.cancel?.(); cancelSpeech(); }
  };
  const end = () => {
    runRef.current += 1; // cancels the running tour
    speechRef.current?.cancel?.();
    cancelSpeech();
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

  /* ----------------------------- layout ----------------------------- */
  let place;
  if (compact) {
    // Phones: dock Blip along the bottom edge, or the top edge when the
    // spotlighted control happens to sit under him.
    const bottomY = vp.h - size.h - MARGIN;
    const topY = TOP_SAFE - 16;
    const covers = (y) => rect && rect.bottom + PAD > y && rect.top - PAD < y + size.h;
    place = { x: MARGIN, y: covers(bottomY) && !covers(topY) ? topY : bottomY };
  } else {
    place = placeAgent(rect, size, vp.w, vp.h);
  }
  const flip = compact ? false : place.x + size.w / 2 > vp.w / 2; // Blip on the right, bubble on the left

  useEffect(() => {
    const prev = lastPos.current;
    lastPos.current = place;
    if (!prev) return;
    const dx = place.x - prev.x;
    const dy = place.y - prev.y;
    if (Math.abs(dx) + Math.abs(dy) < 24) return;
    setHeading(Math.max(-1, Math.min(1, dx / 220)));
    setTravelling(true);
    clearTimeout(travelTimer.current);
    travelTimer.current = setTimeout(() => { setTravelling(false); setHeading(0); }, reduce ? 150 : 850);
  }, [place.x, place.y, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  const fly = reduce ? 'none' : 'transform 0.85s cubic-bezier(0.34, 1.25, 0.5, 1)';
  const accent = '#34d399';
  const hasText = caption.sentences.length > 0;

  const agent = (
    <Box
      ref={agentRef}
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1460,
        transform: `translate(${Math.round(place.x)}px, ${Math.round(place.y)}px)`,
        transition: fly,
        willChange: 'transform',
        display: 'flex',
        flexDirection: flip ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 0.5,
        width: compact ? `calc(100vw - ${MARGIN * 2}px)` : 'auto',
        pointerEvents: 'none',
      }}
    >
      <Box sx={{ width: BLIP, height: BLIP, flexShrink: 0, filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.35))' }}>
        <Suspense fallback={<Box sx={{ width: BLIP, height: BLIP }} />}>
          <Alien3D kind="blip" size={BLIP} walking={travelling} heading={heading} wave={false} talking={talking} />
        </Suspense>
      </Box>

      {hasText && (
        <Paper
          key={caption.text}
          role="status"
          elevation={0}
          sx={{
            position: 'relative',
            width: compact ? 'auto' : BUBBLE_W,
            flex: compact ? 1 : 'none',
            mb: 1.5,
            px: 1.75,
            py: 1.25,
            borderRadius: 3,
            bgcolor: dark ? '#0f1b2d' : '#ffffff',
            color: 'text.primary',
            border: `1.5px solid ${accent}`,
            boxShadow: dark ? '0 14px 40px rgba(0,0,0,0.55)' : '0 14px 40px rgba(15,23,42,0.22)',
            animation: reduce ? 'none' : `${rise} 0.28s ease-out`,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 22,
              [flip ? 'right' : 'left']: -7,
              width: 12,
              height: 12,
              bgcolor: dark ? '#0f1b2d' : '#ffffff',
              borderLeft: flip ? 'none' : `1.5px solid ${accent}`,
              borderBottom: flip ? 'none' : `1.5px solid ${accent}`,
              borderRight: flip ? `1.5px solid ${accent}` : 'none',
              borderTop: flip ? `1.5px solid ${accent}` : 'none',
              transform: flip ? 'rotate(225deg) skew(10deg, 10deg)' : 'rotate(45deg) skew(10deg, 10deg)',
            },
          }}
        >
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, letterSpacing: '0.08em', color: dark ? accent : '#047857', mb: 0.25 }}>
            BLIP
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.5, fontSize: 14.5 }}>
            {caption.sentences.map((s, i) => (
              <Box
                key={`${i}-${s}`}
                component="span"
                sx={{
                  opacity: i === caption.idx ? 1 : i < caption.idx ? 0.62 : 0.58,
                  fontWeight: i === caption.idx ? 600 : 400,
                  transition: 'opacity 0.25s',
                }}
              >
                {s}{' '}
              </Box>
            ))}
          </Typography>
        </Paper>
      )}
    </Box>
  );

  const spotlight = rect && (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1405,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
        transform: `translate(${Math.round(rect.left - PAD)}px, ${Math.round(rect.top - PAD)}px)`,
        transition: reduce ? 'none' : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), width 0.5s cubic-bezier(0.22, 1, 0.36, 1), height 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        borderRadius: '14px',
        border: `2px solid ${accent}`,
        boxShadow: '0 0 0 100vmax rgba(8, 12, 24, 0.5)',
        animation: reduce ? 'none' : `${pulse} 1.8s ease-in-out infinite`,
        pointerEvents: 'none',
      }}
    />
  );

  const controls = (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        zIndex: 1470,
        left: '50%',
        transform: 'translateX(-50%)',
        ...(compact ? { top: 8 } : { bottom: 16 }),
        display: 'flex',
        alignItems: 'center',
        gap: 0.25,
        px: 0.75,
        py: 0.5,
        borderRadius: 99,
        bgcolor: dark ? 'rgba(15,27,45,0.96)' : 'rgba(255,255,255,0.97)',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: dark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(15,23,42,0.2)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 800, color: dark ? accent : '#047857', px: 1.25, letterSpacing: '0.06em' }}>
        {finished ? 'DONE' : paused ? 'PAUSED' : 'TEACHING'}
      </Typography>
      <Tooltip title={paused ? 'Resume' : 'Pause'}>
        <IconButton size="small" onClick={togglePause} aria-label={paused ? 'Resume lesson' : 'Pause lesson'}>
          {paused ? <PlayArrowRoundedIcon fontSize="small" /> : <PauseRoundedIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Skip this line">
        <IconButton size="small" onClick={skip} aria-label="Skip this line">
          <SkipNextRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {speechSupported() && (
        <Tooltip title={muted ? 'Turn voice on' : 'Mute voice (captions stay)'}>
          <IconButton size="small" onClick={toggleMute} aria-label={muted ? 'Turn voice on' : 'Mute voice'}>
            {muted ? <VolumeOffRoundedIcon fontSize="small" /> : <VolumeUpRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="End lesson (Esc)">
        <IconButton size="small" onClick={end} aria-label="End lesson">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Paper>
  );

  return createPortal(
    <>
      {/* Blocks clicks so the learner cannot disturb the demo; dims the page
          when Blip is just talking (no spotlight). */}
      <Box
        aria-hidden
        onClick={(e) => e.stopPropagation()}
        sx={{ position: 'fixed', inset: 0, zIndex: 1400, bgcolor: rect ? 'transparent' : 'rgba(8,12,24,0.38)', transition: 'background-color 0.4s' }}
      />
      {spotlight}
      {tap && (
        <Box
          key={tap.key}
          aria-hidden
          sx={{
            position: 'fixed',
            left: tap.x,
            top: tap.y,
            zIndex: 1450,
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: `3px solid ${accent}`,
            bgcolor: 'rgba(52,211,153,0.28)',
            animation: `${ripple} 0.7s ease-out forwards`,
            pointerEvents: 'none',
          }}
        />
      )}
      {agent}
      {controls}
    </>,
    document.body,
  );
}
