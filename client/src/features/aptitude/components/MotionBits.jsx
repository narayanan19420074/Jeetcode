import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { Box, Typography } from '@mui/material';

// Small reusable motion-graphics pieces for the Aptitude module.

// Deterministic pseudo-random so layouts do not jump between renders.
const rnd = (i, salt = 1) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function CountUp({ value, duration = 1.1, suffix = '', decimals = 0 }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) {
      setShown(value);
      return undefined;
    }
    const controls = animate(0, value, { duration, ease: 'easeOut', onUpdate: (v) => setShown(v) });
    return () => controls.stop();
  }, [value, duration, reduce]);
  return (
    <>
      {decimals ? shown.toFixed(decimals) : Math.round(shown).toLocaleString()}
      {suffix}
    </>
  );
}

// Maths symbols drifting in the background of hero banners.
const SYMBOLS = ['%', '+', '−', '×', '÷', '=', '√', 'π', '½'];
export function FloatingSymbols({ count = 16, color = '#fff', opacity = 0.14 }) {
  const reduce = useReducedMotion();
  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: count }, (_, i) => {
        const size = 16 + rnd(i, 2) * 34;
        return (
          <motion.span
            key={i}
            style={{ position: 'absolute', left: `${rnd(i, 1) * 100}%`, top: `${rnd(i, 3) * 100}%`, fontSize: size, fontWeight: 800, color, opacity, fontFamily: '"JetBrains Mono", monospace', userSelect: 'none' }}
            animate={reduce ? undefined : { y: [0, -22 - rnd(i, 4) * 26, 0], x: [0, rnd(i, 5) * 16 - 8, 0], rotate: [0, rnd(i, 6) * 40 - 20, 0] }}
            transition={{ duration: 6 + rnd(i, 7) * 6, repeat: Infinity, ease: 'easeInOut', delay: rnd(i, 8) * 3 }}
          >
            {SYMBOLS[i % SYMBOLS.length]}
          </motion.span>
        );
      })}
    </Box>
  );
}

const CONFETTI = ['#34D399', '#FACC15', '#FB923C', '#38BDF8', '#C084FC', '#F472B6'];
export function Confetti({ pieces = 70 }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <Box aria-hidden sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1400 }}>
      {Array.from({ length: pieces }, (_, i) => (
        <motion.div
          key={i}
          style={{ position: 'absolute', top: -20, left: `${rnd(i, 1) * 100}%`, width: 8 + rnd(i, 2) * 6, height: 10 + rnd(i, 3) * 8, background: CONFETTI[i % CONFETTI.length], borderRadius: rnd(i, 4) > 0.6 ? '50%' : 2 }}
          initial={{ y: -30, rotate: 0, opacity: 1 }}
          animate={{ y: '105vh', x: (rnd(i, 5) - 0.5) * 220, rotate: 360 * (1 + rnd(i, 6) * 2), opacity: [1, 1, 0.9, 0] }}
          transition={{ duration: 2.6 + rnd(i, 7) * 2, delay: rnd(i, 8) * 0.9, ease: 'easeIn' }}
        />
      ))}
    </Box>
  );
}

// "+20 XP" bubble that floats up and fades. Re-key it to replay.
export function XpPop({ amount, color = '#FACC15' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.7 }}
      animate={{ opacity: [0, 1, 1, 0], y: [10, -14, -30, -52], scale: [0.7, 1.15, 1, 1] }}
      transition={{ duration: 1.7, times: [0, 0.2, 0.7, 1] }}
      style={{ display: 'inline-block', pointerEvents: 'none' }}
    >
      <Typography sx={{ fontWeight: 900, fontSize: 22, color, textShadow: '0 2px 10px rgba(0,0,0,.35)', fontFamily: '"JetBrains Mono", monospace' }}>+{amount} XP</Typography>
    </motion.div>
  );
}

// Animated XP bar with a moving shine.
export function XpBar({ pct, color = '#34D399', height = 12, track = 'rgba(255,255,255,.16)' }) {
  const reduce = useReducedMotion();
  return (
    <Box sx={{ position: 'relative', height, borderRadius: height, bgcolor: track, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: reduce ? `${pct}%` : 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        style={{ height: '100%', borderRadius: height, background: `linear-gradient(90deg, ${color}, #fff 160%)`, position: 'relative', overflow: 'hidden' }}
      >
        {!reduce && (
          <motion.div
            style={{ position: 'absolute', top: 0, bottom: 0, width: 40, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent)' }}
            animate={{ left: ['-20%', '120%'] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
          />
        )}
      </motion.div>
    </Box>
  );
}

// Card that tilts toward the pointer.
export function TiltCard({ children, max = 6, sx, ...rest }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [max, -max]), { stiffness: 220, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-max, max]), { stiffness: 220, damping: 20 });
  const onMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={reset} style={{ rotateX: rx, rotateY: ry, transformPerspective: 900, display: 'flex', flex: 1, minWidth: 0 }} {...rest}>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', ...sx }}>{children}</Box>
    </motion.div>
  );
}

// Stagger helpers.
export const staggerParent = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
export const popChild = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};
