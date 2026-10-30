import { motion, useReducedMotion } from 'framer-motion';
import { Box } from '@mui/material';
import { Eye, Mouth } from './Aliens';

// Full-body alien with a walk cycle, drawn with gradients, a specular
// highlight and a contact shadow so it reads as a 3D toy-like figure. The same
// five evolution stages as <Alien />, but with legs and arms so it can walk the
// level road.

const PAL = {
  blip: { l: '#BBF7D0', m: '#34D399', d: '#047857', x: '#064E3B' },
  zapp: { l: '#FEF9C3', m: '#FACC15', d: '#A16207', x: '#713F12' },
  ember: { l: '#FECACA', m: '#EF4444', d: '#7F1D1D', x: '#450A0A' },
  crystalix: { l: '#E0F2FE', m: '#38BDF8', d: '#075985', x: '#0C4A6E' },
  nova: { l: '#F3E8FF', m: '#A855F7', d: '#4C1D95', x: '#2E1065' },
};

const BRAND_BLIP = { l: '#FBC27A', m: '#F07C24', d: '#D9480F', x: '#7C2D12' };

const pivot = (x, y) => ({ transformBox: 'view-box', transformOrigin: `${x}px ${y}px` });
const STEP = 0.6; // seconds per full stride

function Leg({ x, forward, walking, c }) {
  return (
    <motion.g
      style={pivot(x, 104)}
      animate={walking ? { rotate: forward ? [-28, 28, -28] : [28, -28, 28] } : { rotate: 0 }}
      transition={walking ? { duration: STEP, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.25 }}
    >
      <rect x={x - 6.5} y={102} width="13" height="28" rx="6.5" fill={c.d} />
      <rect x={x - 6.5} y={102} width="6" height="28" rx="3" fill={c.m} opacity="0.35" />
      <ellipse cx={x + 1} cy={131} rx="12" ry="6.5" fill={c.x} />
      <ellipse cx={x - 2} cy={129} rx="6" ry="2.6" fill="#fff" opacity="0.22" />
    </motion.g>
  );
}

function Arm({ x, side, forward, walking, wave, c }) {
  let animate = { rotate: 0 };
  let transition = { duration: 0.25 };
  if (walking) {
    animate = { rotate: forward ? [30, -30, 30] : [-30, 30, -30] };
    transition = { duration: STEP, repeat: Infinity, ease: 'easeInOut' };
  } else if (wave) {
    animate = { rotate: [-130, -165, -130, -165, -130] };
    transition = { duration: 1.4, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' };
  }
  return (
    <motion.g style={pivot(x, 80)} animate={animate} transition={transition}>
      <rect x={x - 5.5} y={78} width="11" height="26" rx="5.5" fill={side === 'back' ? c.d : c.m} />
      <circle cx={x} cy={106} r="7.5" fill={side === 'back' ? c.d : c.m} />
      <circle cx={x - 2} cy={104} r="2.6" fill="#fff" opacity="0.35" />
    </motion.g>
  );
}

// Species extras drawn BEHIND the body (ears, horns, crown, antenna, ring).
function Back({ kind, c, reduce }) {
  if (kind === 'blip')
    return (
      <g>
        <motion.g style={pivot(60, 50)} animate={reduce ? undefined : { rotate: [-9, 9, -9] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <path d="M60 52 L60 28" stroke={c.d} strokeWidth="4" strokeLinecap="round" />
          <circle cx="60" cy="23" r="8" fill="#ECFDF5" />
          <circle cx="60" cy="23" r="8" fill={c.m} opacity="0.55" />
        </motion.g>
      </g>
    );
  if (kind === 'zapp')
    return (
      <g>
        <path d="M32 58 L16 20 L48 46 Z" fill={c.d} />
        <path d="M88 58 L104 20 L72 46 Z" fill={c.d} />
        <path d="M32 56 L24 32 L44 48 Z" fill={c.l} opacity="0.8" />
        <path d="M88 56 L96 32 L76 48 Z" fill={c.l} opacity="0.8" />
      </g>
    );
  if (kind === 'ember')
    return (
      <g>
        <path d="M32 58 C20 52 16 38 22 26 C32 30 40 42 42 54 Z" fill={c.x} />
        <path d="M88 58 C100 52 104 38 98 26 C88 30 80 42 78 54 Z" fill={c.x} />
        {[
          ['M46 52 C38 38 48 28 50 14 C62 24 64 40 58 52 Z', '#F97316', 0, 1.2],
          ['M60 52 C54 32 66 22 70 8 C84 22 82 40 72 52 Z', '#FB923C', 0.2, 1.28],
          ['M74 52 C70 40 78 32 84 24 C92 36 90 46 84 52 Z', '#FDBA74', 0.4, 1.16],
        ].map(([d, f, delay, h]) => (
          <motion.path key={d} d={d} fill={f} style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }} animate={reduce ? undefined : { scaleY: [1, h, 0.9, 1], scaleX: [1, 0.92, 1.06, 1] }} transition={{ duration: 1.1, repeat: Infinity, delay }} />
        ))}
      </g>
    );
  if (kind === 'crystalix')
    return (
      <g>
        <path d="M40 54 L46 22 L54 44 L60 14 L66 44 L74 22 L80 54 Z" fill="#7DD3FC" stroke="#0EA5E9" strokeWidth="2" strokeLinejoin="round" />
        <path d="M46 22 L54 44 L40 54 Z" fill="#fff" opacity="0.5" />
        <path d="M60 14 L66 44 L54 44 Z" fill="#fff" opacity="0.35" />
      </g>
    );
  return (
    <motion.g style={pivot(60, 82)} animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}>
      <ellipse cx="60" cy="82" rx="54" ry="14" fill="none" stroke="#E9D5FF" strokeWidth="2.4" strokeDasharray="5 7" opacity="0.9" transform="rotate(-14 60 82)" />
      <circle cx="113" cy="70" r="5" fill="#FDE68A" />
    </motion.g>
  );
}

// Species details drawn ON the body.
function Front({ kind, c, reduce }) {
  if (kind === 'zapp')
    return <path d="M62 52 L55 63 L60 63 L57 72 L67 60 L62 60 Z" fill="#2563EB" stroke="#1E3A8A" strokeWidth="1.2" strokeLinejoin="round" />;
  if (kind === 'ember')
    return (
      <g>
        <path d="M36 66 L54 72" stroke={c.x} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M84 66 L66 72" stroke={c.x} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M54 97 L57 104 L60 97 Z" fill="#fff" />
        <path d="M60 97 L63 104 L66 97 Z" fill="#fff" />
      </g>
    );
  if (kind === 'crystalix')
    return (
      <g opacity="0.55">
        <path d="M60 46 L30 84 L60 76 Z" fill="#fff" opacity="0.5" />
        <path d="M60 46 L90 84 L60 76 Z" fill={c.l} opacity="0.35" />
        <path d="M30 84 L40 108 L60 76 Z" fill={c.d} opacity="0.3" />
      </g>
    );
  if (kind === 'nova')
    return (
      <g>
        <motion.circle cx="60" cy="58" r="4.6" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} animate={reduce ? undefined : { scale: [1, 1.35, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
        {[
          [36, 62],
          [86, 66],
          [88, 98],
          [34, 98],
        ].map(([x, y], i) => (
          <motion.circle key={i} cx={x} cy={y} r="1.8" fill="#FDE68A" animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.3 }} />
        ))}
      </g>
    );
  return null;
}

/**
 * <AlienWalker kind="zapp" size={96} walking lean={4} wave />
 *  walking  — plays the walk cycle (legs, arms, body bob)
 *  lean     — degrees of sideways tilt while following a curve
 *  wave     — waves a hand when standing still
 */
export default function AlienWalker({ kind = 'blip', size = 96, walking = false, lean = 0, wave = true, mood = 'happy', brand = false, sx }) {
  const reduce = useReducedMotion();
  const c = brand && kind === 'blip' ? BRAND_BLIP : PAL[kind] ?? PAL.blip;
  const moving = walking && !reduce;
  const gid = `walker-${kind}`;
  const single = kind === 'blip';

  return (
    <Box sx={{ width: size, height: size * 1.25, flexShrink: 0, ...sx }}>
      <svg viewBox="0 0 120 150" width="100%" height="100%" style={{ overflow: 'visible', transform: `rotate(${lean}deg)`, transformOrigin: '50% 95%', transition: 'transform .15s linear' }}>
        <defs>
          <radialGradient id={gid} cx="34%" cy="26%" r="85%">
            <stop offset="0%" stopColor={c.l} />
            <stop offset="42%" stopColor={c.m} />
            <stop offset="100%" stopColor={c.d} />
          </radialGradient>
        </defs>

        <motion.ellipse cx="60" cy="140" rx="30" ry="5.5" fill="#000" opacity="0.35" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} animate={moving ? { scaleX: [1, 0.8, 1], opacity: [0.35, 0.22, 0.35] } : undefined} transition={{ duration: STEP / 2, repeat: Infinity }} />

        <motion.g animate={moving ? { y: [0, -5, 0] } : wave && !reduce ? { y: [0, -2, 0] } : undefined} transition={{ duration: moving ? STEP / 2 : 2.4, repeat: Infinity, ease: 'easeInOut' }}>
          <Leg x={46} forward={false} walking={moving} c={c} />
          <Leg x={74} forward walking={moving} c={c} />
          <Arm x={30} side="back" forward walking={moving} wave={false} c={c} />
          <Back kind={kind} c={c} reduce={reduce} />

          <path d="M28 84 C28 58 42 46 60 46 C78 46 92 58 92 84 C92 104 80 114 60 114 C40 114 28 104 28 84 Z" fill={`url(#${gid})`} />
          <path d="M30 88 C32 106 46 114 60 114 C74 114 88 106 90 88 C84 102 72 108 60 108 C48 108 36 102 30 88 Z" fill={c.x} opacity="0.4" />
          <ellipse cx="60" cy="96" rx="20" ry="11" fill={c.l} opacity="0.28" />
          <ellipse cx="43" cy="60" rx="12" ry="6.5" fill="#fff" opacity="0.4" transform="rotate(-32 43 60)" />
          <path d="M28 84 C28 58 42 46 60 46 C78 46 92 58 92 84" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="2" />

          <Front kind={kind} c={c} reduce={reduce} />
          {single ? (
            <Eye cx={60} cy={78} r={14} look={0} reduce={reduce} />
          ) : (
            <>
              <Eye cx={46} cy={78} r={8.6} look={1} reduce={reduce} />
              <Eye cx={74} cy={78} r={8.6} look={1} reduce={reduce} />
            </>
          )}
          <Mouth cx={60} cy={single ? 99 : 96} w={single ? 16 : 14} mood={mood} />
          <circle cx="34" cy="90" r="3.6" fill="#F472B6" opacity="0.5" />
          <circle cx="86" cy="90" r="3.6" fill="#F472B6" opacity="0.5" />

          <Arm x={90} side="front" forward={false} walking={moving} wave={wave && !walking} c={c} />
        </motion.g>
      </svg>
    </Box>
  );
}
