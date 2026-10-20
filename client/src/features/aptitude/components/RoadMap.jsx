import { useEffect, useMemo, useRef, useState } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import Alien3D from './Alien3D';
import { starsFor, testXp } from './gamification';

// Level map. Follows the app theme (dark / light) and the product palette:
// slate surfaces, blue = current, green = cleared. A slim road winds through
// the levels; the learner's alien walks it from START to the current level.
// Geometry is in real pixels (measured width) so nothing is stretched.

const ROW = 184;
const TOP = 270;
const BOTTOM = 90;
const AMP = 0.16;
const NODE = 72;

// Desktop keeps the roomy layout with big label cards. Phones get a compact,
// Candy-Crush style map: small nodes, a road that swings almost edge to edge,
// and a short row height so many levels fit on one screen.
const DESKTOP = { ROW, TOP, BOTTOM, AMP, NODE, TURN: Math.PI / 2 };
const MOBILE = { ROW: 96, TOP: 64, BOTTOM: 80, AMP: 0.34, NODE: 52, TURN: Math.PI / 3 };

function roadPath(pts, W, g) {
  if (!pts.length) return '';
  const sx = W * 0.14;
  const sy = g.TOP / 2;
  const f = pts[0];
  let d = `M ${sx} ${sy} L ${f.x - W * 0.1} ${sy} C ${f.x} ${sy}, ${f.x} ${f.y - g.ROW / 2}, ${f.x} ${f.y}`;
  for (let i = 1; i < pts.length; i += 1) {
    const a = pts[i - 1];
    const b = pts[i];
    d += ` C ${a.x} ${a.y + g.ROW / 2}, ${b.x} ${b.y - g.ROW / 2}, ${b.x} ${b.y}`;
  }
  return d;
}

// Labels go on the side the road is NOT using.
function labelRight(pts, i, W) {
  const x = pts[i].x;
  if (Math.abs(x - W / 2) > 2) return x > W / 2;
  const ref = pts[i + 1] ?? pts[i - 1];
  if (!ref) return true;
  return ref.x < x;
}

/* ---------------------------------------------------------------- */
/* Level node: disc + progress ring                                 */
/* ---------------------------------------------------------------- */
function LevelNode({ pattern, index, status, x, y, isLast, labelOnRight, narrow, below, onClick }) {
  const theme = useTheme();
  const reduce = useReducedMotion();
  const dark = theme.palette.mode === 'dark';
  const { primary, success, warning, text, divider } = theme.palette;
  const passed = status === 'completed';
  const best = Math.round(pattern.progress.bestScore || 0);
  const stars = starsFor(pattern.progress.bestScore, pattern.passPercentage);
  const size = narrow ? MOBILE.NODE : NODE;
  const box = size + 28;
  const ringR = size / 2 + 7;
  const circ = 2 * Math.PI * ringR;
  const accent = status === 'completed' ? success.main : status === 'current' ? primary.main : divider;

  const disc =
    status === 'completed'
      ? `linear-gradient(145deg, ${success.light}, ${success.main} 55%, ${success.dark})`
      : status === 'current'
        ? `linear-gradient(145deg, ${primary.light}, ${primary.main} 55%, ${primary.dark})`
        : dark
          ? 'linear-gradient(145deg, #3B4A63, #263349)'
          : 'linear-gradient(145deg, #E2E8F0, #CBD5E1)';

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.08, type: 'spring', stiffness: 240, damping: 20 }}
      sx={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, zIndex: 2 }}
    >
      {/* progress ring */}
      <Box component="svg" width={box} height={box} viewBox={`0 0 ${box} ${box}`} sx={{ position: 'absolute', left: -14, top: -14, transform: 'rotate(-90deg)', overflow: 'visible' }}>
        <circle cx={box / 2} cy={box / 2} r={ringR} fill="none" stroke={alpha(text.secondary, 0.22)} strokeWidth="4" />
        {status !== 'locked' && (
          <motion.circle
            cx={box / 2}
            cy={box / 2}
            r={ringR}
            fill="none"
            stroke={accent}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - Math.min(100, best) / 100) }}
            transition={{ duration: 1.1, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
          />
        )}
      </Box>

      {status === 'current' && (
        <Box
          component={motion.div}
          animate={reduce ? undefined : { scale: [1, 1.5], opacity: [0.45, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          sx={{ position: 'absolute', inset: -7, borderRadius: '50%', border: '2px solid', borderColor: primary.main }}
        />
      )}

      <Box
        onClick={onClick}
        role="button"
        aria-label={`Level ${index + 1}: ${pattern.title}${status === 'locked' ? ' (locked)' : ''}`}
        aria-disabled={status === 'locked'}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: disc,
          display: 'grid',
          placeItems: 'center',
          cursor: status === 'locked' ? 'not-allowed' : 'pointer',
          boxShadow: status === 'locked' ? `inset 0 1px 0 ${alpha('#fff', dark ? 0.08 : 0.6)}` : `inset 0 2px 0 ${alpha('#fff', 0.35)}, inset 0 -6px 12px ${alpha('#000', 0.22)}, 0 10px 26px ${alpha(accent, 0.4)}`,
          transition: 'transform .18s ease',
          '&:hover': status === 'locked' ? undefined : { transform: 'scale(1.06)' },
          '&:active': status === 'locked' ? undefined : { transform: 'scale(0.97)' },
        }}
      >
        {status === 'locked' && <LockRoundedIcon sx={{ color: text.secondary, fontSize: 24 }} />}
        {passed && narrow && <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 20, fontFamily: '"JetBrains Mono", monospace' }}>{index + 1}</Typography>}
        {passed && !narrow && (isLast ? <EmojiEventsRoundedIcon sx={{ color: '#fff', fontSize: 30 }} /> : <StarRoundedIcon sx={{ color: '#fff', fontSize: 32 }} />)}
        {status === 'current' && <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: narrow ? 20 : 24, fontFamily: '"JetBrains Mono", monospace' }}>{index + 1}</Typography>}
      </Box>

      {/* compact phone label: stars on the disc, short title underneath */}
      {narrow && passed && (
        <Box sx={{ position: 'absolute', left: '50%', bottom: -9, transform: 'translateX(-50%)', display: 'flex', zIndex: 3, pointerEvents: 'none' }}>
          {[0, 1, 2].map((n) => (
            <StarRoundedIcon key={n} sx={{ fontSize: 14, mx: '-1px', color: n < stars ? warning.main : 'action.disabled', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.35))' }} />
          ))}
        </Box>
      )}
      {narrow && (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            top: size + 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 104,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 11,
            lineHeight: 1.2,
            px: 0.5,
            py: 0.15,
            borderRadius: '6px',
            bgcolor: alpha(theme.palette.background.paper, 0.88),
            color: status === 'locked' ? 'text.secondary' : 'text.primary',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {pattern.title}
        </Typography>
      )}

      {/* label card */}
      {!narrow && (
      <Box
        sx={{
          position: 'absolute',
          width: below ? 176 : narrow ? 150 : 206,
          ...(below
            ? { top: size + 24, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }
            : { top: '50%', transform: 'translateY(-50%)', ...(labelOnRight ? { left: size + 22, textAlign: 'left' } : { right: size + 22, textAlign: 'right' }) }),
          p: 1.5,
          borderRadius: '12px',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: status === 'current' ? primary.main : status === 'completed' ? alpha(success.main, 0.5) : 'divider',
          boxShadow: status === 'current' ? `0 12px 30px ${alpha(primary.main, 0.22)}` : dark ? '0 6px 18px rgba(0,0,0,.25)' : '0 6px 16px rgba(15,23,42,.06)',
          opacity: status === 'locked' ? 0.78 : 1,
        }}
      >
        <Typography variant="overline" sx={{ display: 'block', lineHeight: 1.2, fontWeight: 800, letterSpacing: '0.1em', color: status === 'current' ? primary.main : status === 'completed' ? success.main : 'text.secondary' }}>
          Level {index + 1}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3, color: 'text.primary' }}>
          {pattern.title}
        </Typography>

        {status === 'locked' ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, justifyContent: below ? 'center' : labelOnRight ? 'flex-start' : 'flex-end' }}>
            <LockRoundedIcon sx={{ fontSize: 13 }} /> Clear Level {index} to unlock
          </Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.75, justifyContent: below ? 'center' : labelOnRight ? 'flex-start' : 'flex-end' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, px: 0.75, py: 0.15, borderRadius: '6px', bgcolor: alpha(warning.main, 0.14), color: dark ? warning.light : warning.dark, fontSize: 11.5, fontWeight: 800 }}>
                <BoltRoundedIcon sx={{ fontSize: 13 }} /> {passed ? '' : '+'}
                {testXp(100, true)} XP
              </Box>
              {pattern.timeLimitMinutes ? (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, px: 0.75, py: 0.15, borderRadius: '6px', bgcolor: 'action.hover', color: 'text.secondary', fontSize: 11.5, fontWeight: 700 }}>
                  <TimerRoundedIcon sx={{ fontSize: 13 }} /> {pattern.timeLimitMinutes} min
                </Box>
              ) : null}
            </Box>
            <Box sx={{ position: 'relative', height: 6, borderRadius: 3, bgcolor: 'action.hover', mt: 1.1 }}>
              <Box component={motion.div} initial={{ width: 0 }} animate={{ width: `${Math.min(100, best)}%` }} transition={{ duration: 1, delay: 0.5 + index * 0.1 }} sx={{ height: '100%', borderRadius: 3, bgcolor: passed ? success.main : primary.main }} />
              <Box sx={{ position: 'absolute', top: -3, bottom: -3, left: `${pattern.passPercentage}%`, width: 2, bgcolor: 'text.primary', opacity: 0.55, borderRadius: 1 }} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.6 }}>
              {passed ? `Mastery ${best}% · pass mark ${pattern.passPercentage}%` : pattern.progress.attemptsCount > 0 ? `Best ${best}% · need ${pattern.passPercentage}%` : `Score ${pattern.passPercentage}% to clear`}
            </Typography>
            {passed && (
              <Box sx={{ display: 'flex', gap: 0.25, mt: 0.4, justifyContent: below ? 'center' : labelOnRight ? 'flex-start' : 'flex-end' }}>
                {[0, 1, 2].map((n) => (
                  <StarRoundedIcon
                    key={n}
                    component={motion.svg}
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 + n * 0.12, type: 'spring', stiffness: 300 }}
                    sx={{ fontSize: 17, color: n < stars ? warning.main : 'action.disabled' }}
                  />
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
      )}
    </Box>
  );
}

/* ---------------------------------------------------------------- */
/* Walker: follows the road from START to the current level         */
/* ---------------------------------------------------------------- */
function Walker({ d, kind, size, onGo, node = NODE, perch = 0 }) {
  const reduce = useReducedMotion();
  const pathRef = useRef(null);
  const [pos, setPos] = useState(null);
  const [walking, setWalking] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const path = pathRef.current;
    if (!path || !d) return undefined;
    const total = path.getTotalLength();
    const stop = Math.max(0, total - node / 2 - 30); // stand on the road just before the node
    const at = (l) => {
      const p = path.getPointAtLength(l);
      const q = path.getPointAtLength(Math.min(total, l + 4));
      return { x: p.x, y: p.y, lean: Math.max(-12, Math.min(12, (q.x - p.x) * 5)) };
    };
    if (perch) {
      // Phone: no long walk. The alien stands beside the current level.
      const end = path.getPointAtLength(total);
      setPos({ x: end.x + perch * (node / 2 + 30), y: end.y + 22, lean: 0 });
      setWalking(false);
      return undefined;
    }
    if (reduce || stop < 2) {
      setPos({ ...at(stop), lean: 0 });
      setWalking(false);
      return undefined;
    }
    setPos(at(0));
    setWalking(true);
    const controls = animate(0, stop, {
      duration: Math.min(8, Math.max(2.4, stop / 120)),
      ease: 'easeInOut',
      delay: run === 0 ? 0.9 : 0.15,
      onUpdate: (l) => setPos(at(l)),
      onComplete: () => {
        setPos((p) => (p ? { ...p, lean: 0 } : p));
        setWalking(false);
      },
    });
    return () => controls.stop();
  }, [d, run, reduce, perch, node]);

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <path ref={pathRef} d={d} />
      </svg>
      {pos && (
        <Box
          onClick={() => !walking && setRun((r) => r + 1)}
          title={walking ? undefined : 'Click to walk again'}
          sx={{ position: 'absolute', left: pos.x, top: pos.y, transform: 'translate(-50%, -84%)', zIndex: 4, cursor: walking ? 'default' : 'pointer' }}
        >
          {!walking && (
            <Box
              component={motion.button}
              type="button"
              initial={{ opacity: 0, y: 6, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                onGo();
              }}
              sx={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                ml: '-48px',
                width: 96,
                mb: 0.5,
                py: 0.6,
                border: 0,
                borderRadius: '8px',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontSize: 12.5,
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: 'pointer',
                boxShadow: (t) => `0 8px 20px ${alpha(t.palette.primary.main, 0.45)}`,
                '&:after': { content: '""', position: 'absolute', left: '50%', bottom: -5, ml: '-5px', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: (t) => `6px solid ${t.palette.primary.main}` },
              }}
            >
              Start level
            </Box>
          )}
          <Alien3D kind={kind} size={size} walking={walking} heading={pos.lean / 12} />
        </Box>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- */
/* Map                                                              */
/* ---------------------------------------------------------------- */
export default function RoadMap({ patterns, currentIndex, alienKind, onOpen, autoScroll = true }) {
  const theme = useTheme();
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  const [W, setW] = useState(0);
  const dark = theme.palette.mode === 'dark';
  const { primary, success, text } = theme.palette;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    setW(el.clientWidth);
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const narrow = W > 0 && W < 620;
  const below = W > 0 && W < 480;
  const g = narrow ? MOBILE : DESKTOP;
  const H = g.TOP + g.ROW * patterns.length + g.BOTTOM;

  const pts = useMemo(() => patterns.map((_, i) => ({ x: W * (0.5 + g.AMP * Math.sin(i * g.TURN)), y: g.TOP + g.ROW * i + g.ROW / 2 })), [patterns, W, g]);
  const fullD = useMemo(() => (W ? roadPath(pts, W, g) : ''), [pts, W, g]);
  const walkD = useMemo(() => (W ? roadPath(pts.slice(0, currentIndex + 1), W, g) : ''), [pts, W, g, currentIndex]);
  const cleared = patterns.filter((p) => p.progress.bestScore >= p.passPercentage).length;
  const trackW = narrow ? 10 : 14;

  // Phone: open the map around the current level (like Candy Crush) instead of at the top.
  const scrolled = useRef(false);
  useEffect(() => {
    if (!autoScroll || !narrow || scrolled.current || !patterns.length || !wrapRef.current) return;
    scrolled.current = true;
    const top = wrapRef.current.getBoundingClientRect().top + window.scrollY + MOBILE.TOP + MOBILE.ROW * currentIndex - window.innerHeight * 0.45;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
  }, [narrow, patterns.length, currentIndex, reduce, autoScroll]);

  return (
    <Box
      ref={wrapRef}
      sx={{
        position: 'relative',
        height: H,
        borderRadius: narrow ? 0 : '14px',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        ...(narrow ? { borderLeft: 0, borderRight: 0 } : {}),
        backgroundImage: `radial-gradient(${alpha(text.secondary, dark ? 0.22 : 0.28)} 1px, transparent 1px), radial-gradient(640px 320px at 50% 0%, ${alpha(primary.main, dark ? 0.16 : 0.08)}, transparent 70%)`,
        backgroundSize: '22px 22px, 100% 100%',
      }}
    >
      {W > 0 && (
        <>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <linearGradient id="roadLit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={success.main} />
                <stop offset="100%" stopColor={primary.main} />
              </linearGradient>
              <filter id="roadGlow" x="-20%" y="-5%" width="140%" height="110%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
            </defs>
            {/* track */}
            <path d={fullD} fill="none" stroke={alpha(text.secondary, dark ? 0.2 : 0.22)} strokeWidth={trackW + 8} strokeLinecap="round" />
            <path d={fullD} fill="none" stroke={dark ? '#0F172A' : '#F1F5F9'} strokeWidth={trackW} strokeLinecap="round" />
            {/* travelled stretch */}
            <motion.path d={walkD} fill="none" stroke="url(#roadLit)" strokeOpacity="0.35" strokeWidth={trackW + 10} strokeLinecap="round" filter="url(#roadGlow)" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.6, delay: 0.9, ease: 'easeInOut' }} />
            <motion.path d={walkD} fill="none" stroke="url(#roadLit)" strokeWidth={trackW - 6} strokeLinecap="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.6, delay: 0.9, ease: 'easeInOut' }} />
            {/* lane marker */}
            <path d={fullD} fill="none" stroke={alpha(text.secondary, 0.55)} strokeWidth="1.5" strokeDasharray="2 10" strokeLinecap="round" style={{ animation: reduce ? 'none' : 'roadFlow 1.2s linear infinite' }} />
            <style>{`@keyframes roadFlow { to { stroke-dashoffset: -24; } }`}</style>
          </svg>

          {/* START */}
          <Box sx={{ position: 'absolute', left: W * 0.14, top: g.TOP / 2, transform: 'translate(-50%, -50%)', zIndex: 3 }}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.5, borderRadius: '8px', bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800, fontSize: 11.5, letterSpacing: '0.1em', boxShadow: (t) => `0 6px 16px ${alpha(t.palette.primary.main, 0.4)}` }}
            >
              <FlagRoundedIcon sx={{ fontSize: 14 }} /> START
            </Box>
          </Box>

          {patterns.map((pattern, i) => {
            const passed = pattern.progress.bestScore >= pattern.passPercentage;
            const status = !pattern.progress.unlocked ? 'locked' : passed ? 'completed' : 'current';
            return (
              <LevelNode
                key={pattern._id}
                pattern={pattern}
                index={i}
                status={status}
                x={pts[i].x}
                y={pts[i].y}
                isLast={i === patterns.length - 1}
                labelOnRight={labelRight(pts, i, W)}
                narrow={narrow}
                below={below}
                onClick={() => status !== 'locked' && onOpen(pattern)}
              />
            );
          })}

          {patterns.length > 0 && <Walker key={`${W}-${currentIndex}-${cleared}`} d={walkD} kind={alienKind} size={narrow ? 56 : 136} node={g.NODE} perch={narrow ? (pts[currentIndex].x < W / 2 ? 1 : -1) : 0} onGo={() => onOpen(patterns[currentIndex])} />}
        </>
      )}
    </Box>
  );
}
