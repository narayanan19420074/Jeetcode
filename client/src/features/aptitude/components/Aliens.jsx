import { motion, useReducedMotion } from 'framer-motion';
import { Box } from '@mui/material';

// Original alien mascots for the aptitude module. They are evolution stages:
// the learner's XP decides which one shows up. All are drawn as inline SVG and
// animated with framer-motion (float, blink, flicker, orbit).

const fillBox = { transformBox: 'fill-box', transformOrigin: 'center' };

export function Eye({ cx, cy, r = 9, look = 0, reduce }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fff" />
      <motion.g
        style={fillBox}
        animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.46, 0.5, 0.54, 1], delay: cx / 100 }}
      >
        <circle cx={cx + look} cy={cy + 1} r={r * 0.52} fill="#0F172A" />
        <circle cx={cx + look - r * 0.18} cy={cy - r * 0.2} r={r * 0.17} fill="#fff" />
      </motion.g>
    </g>
  );
}

export function Mouth({ cx, cy, w = 14, mood }) {
  if (mood === 'cheer') {
    return <path d={`M ${cx - w / 2} ${cy} Q ${cx} ${cy + w * 0.9} ${cx + w / 2} ${cy} Z`} fill="#7F1D1D" stroke="#0F172A" strokeWidth="1.6" strokeLinejoin="round" />;
  }
  if (mood === 'sad') {
    return <path d={`M ${cx - w / 2} ${cy + 3} Q ${cx} ${cy - 5} ${cx + w / 2} ${cy + 3}`} fill="none" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />;
  }
  return <path d={`M ${cx - w / 2} ${cy} Q ${cx} ${cy + 7} ${cx + w / 2} ${cy}`} fill="none" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />;
}

/* ---- Blip: round green blob with one big eye and a glowing antenna -------- */
function Blip({ mood, reduce }) {
  return (
    <g>
      <motion.g style={fillBox} animate={reduce ? undefined : { rotate: [-8, 8, -8] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
        <path d="M60 40 L60 22" stroke="#047857" strokeWidth="4" strokeLinecap="round" />
        <motion.circle cx="60" cy="18" r="7" fill="#A7F3D0" style={fillBox} animate={reduce ? undefined : { opacity: [0.6, 1, 0.6], scale: [0.85, 1.15, 0.85] }} transition={{ duration: 1.6, repeat: Infinity }} />
      </motion.g>
      <ellipse cx="38" cy="104" rx="11" ry="6" fill="#059669" />
      <ellipse cx="82" cy="104" rx="11" ry="6" fill="#059669" />
      <path d="M26 74 C26 48 42 38 60 38 C78 38 94 48 94 74 C94 96 80 106 60 106 C40 106 26 96 26 74 Z" fill="#34D399" />
      <path d="M36 92 C46 102 74 102 84 92 C80 104 70 108 60 108 C50 108 40 104 36 92 Z" fill="#10B981" />
      <ellipse cx="42" cy="56" rx="9" ry="5" fill="#fff" opacity="0.28" transform="rotate(-25 42 56)" />
      <Eye cx={60} cy={68} r={15} look={mood === 'sad' ? 0 : 2} reduce={reduce} />
      <Mouth cx={60} cy={90} w={16} mood={mood} />
      <circle cx="34" cy="82" r="4" fill="#F472B6" opacity="0.55" />
      <circle cx="86" cy="82" r="4" fill="#F472B6" opacity="0.55" />
    </g>
  );
}

/* ---- Zapp: electric yellow sprinter with lightning ears ------------------- */
function Zapp({ mood, reduce }) {
  return (
    <g>
      <path d="M32 50 L18 14 L46 40 Z" fill="#EAB308" />
      <path d="M88 50 L102 14 L74 40 Z" fill="#EAB308" />
      <path d="M32 50 L24 26 L42 42 Z" fill="#FDE047" />
      <path d="M88 50 L96 26 L78 42 Z" fill="#FDE047" />
      <rect x="40" y="96" width="14" height="14" rx="5" fill="#CA8A04" />
      <rect x="66" y="96" width="14" height="14" rx="5" fill="#CA8A04" />
      <rect x="24" y="36" width="72" height="68" rx="30" fill="#FACC15" />
      <rect x="24" y="36" width="72" height="68" rx="30" fill="none" stroke="#EAB308" strokeWidth="3" />
      <path d="M64 70 L52 88 L61 88 L56 102 L72 82 L63 82 Z" fill="#2563EB" stroke="#1E3A8A" strokeWidth="1.5" strokeLinejoin="round" />
      <Eye cx={46} cy={58} r={8.5} look={1} reduce={reduce} />
      <Eye cx={74} cy={58} r={8.5} look={1} reduce={reduce} />
      <Mouth cx={60} cy={76} w={12} mood={mood} />
      {[
        [16, 70],
        [104, 66],
        [10, 46],
      ].map(([x, y], i) => (
        <motion.path
          key={i}
          d={`M${x} ${y - 6} L${x - 3} ${y + 1} L${x + 1} ${y + 1} L${x - 2} ${y + 7}`}
          stroke="#38BDF8"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={reduce ? undefined : { opacity: [0, 1, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.35 }}
        />
      ))}
    </g>
  );
}

/* ---- Ember: fire crest, horns and fangs ------------------------------------ */
function Ember({ mood, reduce }) {
  const flame = (d, fill, delay, h) => (
    <motion.path d={d} fill={fill} style={{ ...fillBox, transformOrigin: 'center bottom' }} animate={reduce ? undefined : { scaleY: [1, h, 0.92, 1], scaleX: [1, 0.92, 1.06, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay }} />
  );
  return (
    <g>
      {flame('M44 44 C34 30 44 20 46 8 C58 18 62 32 54 44 Z', '#F97316', 0, 1.18)}
      {flame('M58 44 C50 24 62 14 66 2 C80 14 80 32 70 44 Z', '#FB923C', 0.2, 1.25)}
      {flame('M72 44 C68 32 76 24 82 16 C90 28 88 38 82 44 Z', '#FDBA74', 0.4, 1.15)}
      <path d="M30 50 C20 44 16 32 20 22 C30 26 38 36 40 46 Z" fill="#7C2D12" />
      <path d="M90 50 C100 44 104 32 100 22 C90 26 82 36 80 46 Z" fill="#7C2D12" />
      <rect x="38" y="98" width="16" height="12" rx="5" fill="#9A3412" />
      <rect x="66" y="98" width="16" height="12" rx="5" fill="#9A3412" />
      <path d="M22 76 C22 52 38 42 60 42 C82 42 98 52 98 76 C98 94 84 104 60 104 C36 104 22 94 22 76 Z" fill="#EF4444" />
      <path d="M32 90 C44 102 76 102 88 90 C84 102 72 106 60 106 C48 106 36 102 32 90 Z" fill="#B91C1C" />
      <path d="M34 62 L52 68 L34 72 Z" fill="#0F172A" opacity="0" />
      <Eye cx={46} cy={66} r={8} look={1} reduce={reduce} />
      <Eye cx={74} cy={66} r={8} look={-1} reduce={reduce} />
      <path d="M36 56 L54 62" stroke="#7F1D1D" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M84 56 L66 62" stroke="#7F1D1D" strokeWidth="3.4" strokeLinecap="round" />
      <Mouth cx={60} cy={86} w={20} mood={mood} />
      {mood !== 'sad' && (
        <>
          <path d="M53 87 L56 93 L59 87 Z" fill="#fff" />
          <path d="M61 87 L64 93 L67 87 Z" fill="#fff" />
        </>
      )}
    </g>
  );
}

/* ---- Crystalix: faceted ice-crystal strategist ----------------------------- */
function Crystalix({ mood, reduce }) {
  return (
    <g>
      <path d="M44 40 L52 10 L60 34 L68 10 L76 40 Z" fill="#7DD3FC" stroke="#0EA5E9" strokeWidth="2" strokeLinejoin="round" />
      <path d="M52 10 L60 34 L44 40 Z" fill="#E0F2FE" opacity="0.7" />
      <path d="M60 22 L24 52 L18 84 L40 108 L80 108 L102 84 L96 52 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M60 22 L24 52 L60 64 Z" fill="#BAE6FD" />
      <path d="M60 22 L96 52 L60 64 Z" fill="#7DD3FC" />
      <path d="M24 52 L18 84 L60 64 Z" fill="#0EA5E9" />
      <path d="M96 52 L102 84 L60 64 Z" fill="#0284C7" />
      <path d="M18 84 L40 108 L60 64 Z" fill="#38BDF8" />
      <path d="M102 84 L80 108 L60 64 Z" fill="#0EA5E9" />
      <motion.path
        d="M30 50 L44 44 L36 98 L26 90 Z"
        fill="#fff"
        opacity="0.4"
        animate={reduce ? undefined : { x: [0, 52, 52], opacity: [0, 0.5, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.2 }}
      />
      <Eye cx={46} cy={74} r={8} look={1} reduce={reduce} />
      <Eye cx={74} cy={74} r={8} look={1} reduce={reduce} />
      <Mouth cx={60} cy={92} w={12} mood={mood} />
      {[
        [14, 36],
        [108, 40],
        [106, 104],
      ].map(([x, y], i) => (
        <motion.path key={i} d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`} fill="#E0F2FE" animate={reduce ? undefined : { scale: [0.5, 1, 0.5], opacity: [0.4, 1, 0.4] }} style={fillBox} transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }} />
      ))}
    </g>
  );
}

/* ---- Nova: cosmic grandmaster with three eyes and an orbit ring ------------ */
function Nova({ mood, reduce }) {
  return (
    <g>
      <motion.g style={fillBox} animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}>
        <ellipse cx="60" cy="64" rx="56" ry="17" fill="none" stroke="#E9D5FF" strokeWidth="2.4" strokeDasharray="5 7" transform="rotate(-18 60 64)" opacity="0.8" />
        <circle cx="112" cy="50" r="5" fill="#FDE68A" />
      </motion.g>
      <circle cx="60" cy="64" r="38" fill="#7E22CE" />
      <circle cx="60" cy="64" r="38" fill="url(#novaShade)" />
      <defs>
        <radialGradient id="novaShade" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#A855F7" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3B0764" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      {[
        [34, 48, 2],
        [86, 46, 1.6],
        [90, 84, 2],
        [30, 82, 1.5],
        [60, 36, 1.4],
      ].map(([x, y, r], i) => (
        <motion.circle key={i} cx={x} cy={y} r={r} fill="#FDE68A" animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }} />
      ))}
      <Eye cx={44} cy={64} r={8} look={1} reduce={reduce} />
      <Eye cx={76} cy={64} r={8} look={-1} reduce={reduce} />
      <motion.circle cx="60" cy="50" r="4.6" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.6" animate={reduce ? undefined : { scale: [1, 1.35, 1] }} style={fillBox} transition={{ duration: 1.8, repeat: Infinity }} />
      <Mouth cx={60} cy={84} w={14} mood={mood} />
    </g>
  );
}

const BODIES = { blip: Blip, zapp: Zapp, ember: Ember, crystalix: Crystalix, nova: Nova };

/**
 * <Alien kind="zapp" size={140} mood="happy|cheer|sad" glow="#hex" />
 * `still` removes the idle float for dense lists.
 */
export default function Alien({ kind = 'blip', size = 120, mood = 'happy', glow, still = false, sx }) {
  const reduce = useReducedMotion();
  const Body = BODIES[kind] ?? Blip;
  const calm = reduce || still;
  const animate = calm
    ? undefined
    : mood === 'cheer'
      ? { y: [0, -16, 0], rotate: [0, -5, 5, 0] }
      : mood === 'sad'
        ? { y: [0, 2, 0] }
        : { y: [0, -7, 0] };
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0, ...sx }}>
      {glow && <Box sx={{ position: 'absolute', inset: '12%', borderRadius: '50%', bgcolor: glow, opacity: 0.42, filter: `blur(${Math.round(size * 0.16)}px)` }} />}
      <motion.svg viewBox="0 0 120 120" width={size} height={size} style={{ position: 'relative', overflow: 'visible' }} animate={animate} transition={{ duration: mood === 'cheer' ? 0.7 : 2.8, repeat: Infinity, ease: 'easeInOut' }}>
        <ellipse cx="60" cy="113" rx="26" ry="4" fill="#000" opacity="0.18" />
        <Body mood={mood} reduce={calm} />
      </motion.svg>
    </Box>
  );
}
