import { motion, useReducedMotion } from 'framer-motion';
import { Box } from '@mui/material';
import { COLOR_PALETTE, hexAlpha } from '../../app/design/designTokens';

// The TCS mark turned into a character: the letters are the body, the "c" is the face.
// `path` and `color` come from getBrandLogo() so the mark is not duplicated in this file.
// `tier` (0-4) follows the level evolution: it changes the glow colour, and tier 4 adds a crown.
const GLOW = [COLOR_PALETTE.blue[400], COLOR_PALETTE.cyan[400], COLOR_PALETTE.orange[400], COLOR_PALETTE.sky[300], COLOR_PALETTE.yellow[400]];

export default function TcsBuddy({ path, color, tier = 0, size = 120 }) {
  const reduce = useReducedMotion();
  const glow = GLOW[Math.min(tier, GLOW.length - 1)];
  const bob = reduce ? undefined : { y: [0, -1.1, 0] };
  const bobT = { duration: 2.4, repeat: Infinity, ease: 'easeInOut' };
  const blink = reduce ? undefined : { scaleY: [1, 1, 0.1, 1] };
  const blinkT = { duration: 4.5, repeat: Infinity, times: [0, 0.9, 0.95, 1] };
  return (
    <Box sx={{ position: 'relative', width: size, height: size * 0.75, display: 'grid', placeItems: 'center' }}>
      <Box aria-hidden sx={{ position: 'absolute', inset: '-14%', borderRadius: '50%', background: `radial-gradient(circle, ${hexAlpha(glow, 0.4)}, transparent 68%)` }} />
      <svg viewBox="-4 2 32 24" width={size} height={size * 0.75} role="img" aria-label="TCS buddy" style={{ position: 'relative', overflow: 'visible' }}>
        <defs>
          <linearGradient id="tcsBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={COLOR_PALETTE.white} stopOpacity=".35" />
            <stop offset="0.5" stopColor={COLOR_PALETTE.white} stopOpacity="0" />
            <stop offset="1" stopColor={COLOR_PALETTE.black} stopOpacity=".18" />
          </linearGradient>
        </defs>
        <motion.ellipse cx="12" cy="23.4" rx="8" ry="1" fill={COLOR_PALETTE.black} opacity=".35" animate={reduce ? undefined : { scaleX: [1, 0.92, 1] }} transition={bobT} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
        <motion.g animate={bob} transition={bobT}>
          <g stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M9.6 19.3V22" />
            <path d="M18.4 19.3V22" />
            <path d="M0.9 14.2Q-1.6 14.8 -2 17.4" />
          </g>
          <ellipse cx="9.2" cy="22.5" rx="1.9" ry=".9" fill={COLOR_PALETTE.white} />
          <ellipse cx="18.6" cy="22.5" rx="1.9" ry=".9" fill={COLOR_PALETTE.white} />
          <circle cx="-2" cy="17.6" r="1.1" fill={COLOR_PALETTE.white} />
          {/* waving arm */}
          <motion.g animate={reduce ? undefined : { rotate: [0, -22, 6, -22, 0, 0] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.6 }} style={{ transformBox: 'view-box', transformOrigin: '23.3px 12.6px' }}>
            <path d="M23.3 12.6Q26 12 26.6 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <circle cx="26.7" cy="8.7" r="1.1" fill={COLOR_PALETTE.white} />
          </motion.g>
          {/* body: white sticker outline, brand colour, soft shading */}
          <path d={path} fill={COLOR_PALETTE.white} stroke={COLOR_PALETTE.white} strokeWidth="1.2" strokeLinejoin="round" />
          <path d={path} fill={color} />
          <path d={path} fill="url(#tcsBody)" />
          {/* face in the "c" */}
          <motion.g animate={blink} transition={blinkT} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <circle cx="9.4" cy="12" r="1.2" fill={COLOR_PALETTE.white} />
            <circle cx="11.9" cy="12" r="1.2" fill={COLOR_PALETTE.white} />
            <circle cx="9.6" cy="12.2" r=".55" fill={COLOR_PALETTE.custom.slate0B1230} />
            <circle cx="12.1" cy="12.2" r=".55" fill={COLOR_PALETTE.custom.slate0B1230} />
          </motion.g>
          <path d="M9.4 14.6Q10.7 15.9 12 14.6" stroke={COLOR_PALETTE.white} strokeWidth=".5" fill="none" strokeLinecap="round" />
          {tier >= 4 && <path d="M9 7.4L9.6 5.4L10.8 6.6L12 4.8L13.2 6.6L14.4 5.4L15 7.4Z" fill={COLOR_PALETTE.yellow[400]} stroke={COLOR_PALETTE.white} strokeWidth=".35" strokeLinejoin="round" />}
        </motion.g>
      </svg>
    </Box>
  );
}
