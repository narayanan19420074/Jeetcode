import { motion, useReducedMotion } from 'framer-motion';
import { alpha, useTheme } from '@mui/material/styles';

// Offer-letter illustration: the outcome the whole product points at.
// "JC" is our own monogram, no real company mark. The SELECTED stamp
// slams down after `stampDelay` seconds.
export default function OfferLetter({ stampDelay = 1, width = 160, replayKey = 0, onDark = false }) {
  const t = useTheme();
  const reduce = useReducedMotion();
  // onDark: always draw a white sheet so the letter pops on the blue CTA panel.
  const ink = onDark ? '#0F172A' : t.palette.text.primary;
  const soft = onDark ? 'rgba(15,23,42,0.22)' : alpha(t.palette.text.secondary, 0.35);
  const sheet = onDark ? '#FFFFFF' : t.palette.background.paper;
  const ok = t.palette.success.main;

  return (
    <svg
      viewBox="0 0 220 280"
      width={width}
      role="img"
      aria-label="Illustration of an offer letter stamped Selected"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <rect x="6" y="8" width="208" height="266" rx="14" fill={alpha(t.palette.primary.main, 0.12)} />
      <rect
        x="0"
        y="0"
        width="208"
        height="266"
        rx="14"
        fill={sheet}
        stroke={alpha(t.palette.text.secondary, 0.35)}
        strokeWidth="1.5"
      />
      <rect x="18" y="18" width="30" height="30" rx="8" fill={t.palette.primary.main} />
      <text x="33" y="38" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily="Inter, sans-serif">
        JC
      </text>
      <rect x="58" y="22" width="86" height="8" rx="4" fill={ink} opacity="0.85" />
      <rect x="58" y="37" width="52" height="6" rx="3" fill={soft} />

      <rect x="18" y="68" width="60" height="7" rx="3.5" fill={ink} opacity="0.7" />
      {[92, 108, 124, 140, 156].map((y, i) => (
        <rect key={y} x="18" y={y} width={i === 4 ? 96 : 172} height="6" rx="3" fill={soft} />
      ))}

      <rect x="18" y="196" width="70" height="6" rx="3" fill={soft} />
      <path
        d="M18 232 C 30 214, 40 246, 52 228 S 70 216, 82 234"
        fill="none"
        stroke={ink}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />

      <motion.g
        key={replayKey}
        initial={reduce ? false : { scale: 2.2, opacity: 0, rotate: -30 }}
        animate={{ scale: 1, opacity: 1, rotate: -14 }}
        transition={{ delay: stampDelay, type: 'spring', stiffness: 260, damping: 16 }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <circle cx="148" cy="206" r="40" fill="none" stroke={ok} strokeWidth="3.5" />
        <circle cx="148" cy="206" r="34" fill="none" stroke={ok} strokeWidth="1.2" />
        <text
          x="148"
          y="212"
          textAnchor="middle"
          fontSize="11.5"
          fontWeight="800"
          letterSpacing="0.6"
          fill={ok}
          fontFamily="Inter, sans-serif"
        >
          SELECTED
        </text>
      </motion.g>
    </svg>
  );
}
