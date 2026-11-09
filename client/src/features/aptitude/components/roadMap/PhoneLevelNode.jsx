import { motion, useReducedMotion } from 'framer-motion';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { starsFor } from '../gamification';
import { tint } from '../../../dashboard/dashboardUtils';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from '../../../dashboard/components/libraryStyle';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, Z_INDEX, MOTION } from '../../../../app/design/designTokens';
import { MOBILE, PHONE_STAR, PHONE_STATE } from './roadGeometry';

// Phone level node: flat solid colours, same as the dashboard level cards.
export default function PhoneLevelNode({ pattern, index, status, x, y, onClick }) {
  const pal = useLibraryPalette();
  const reduce = useReducedMotion();
  const dark = useTheme().palette.mode === 'dark';
  const c = PHONE_STATE[status];
  const locked = status === 'locked';
  const best = Math.round(pattern.progress.bestScore || 0);
  const stars = starsFor(pattern.progress.bestScore, pattern.passPercentage);
  const size = MOBILE.NODE;
  const box = size + 20;
  const ringR = size / 2 + 6;
  const circ = 2 * Math.PI * ringR;
  // Opaque fills, so the road never shows through a node.
  const fill = dark ? `color-mix(in srgb, ${c.fg} ${locked ? 10 : 16}%, ${pal.bg})` : locked ? `color-mix(in srgb, ${c.bg} 55%, ${pal.bg})` : c.bg;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.06, type: 'spring', stiffness: 240, damping: 20 }}
      sx={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, zIndex: Z_INDEX.raised }}
    >
      <Box component="svg" width={box} height={box} viewBox={`0 0 ${box} ${box}`} sx={{ position: 'absolute', left: -10, top: -10, transform: 'rotate(-90deg)', overflow: 'visible', pointerEvents: 'none' }}>
        {!locked && <circle cx={box / 2} cy={box / 2} r={ringR} fill="none" stroke={tint(c.fg, 22)} strokeWidth="4" />}
        {!locked && best > 0 && (
          <motion.circle
            cx={box / 2}
            cy={box / 2}
            r={ringR}
            fill="none"
            stroke={c.fg}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: reduce ? circ * (1 - Math.min(100, best) / 100) : circ }}
            animate={{ strokeDashoffset: circ * (1 - Math.min(100, best) / 100) }}
            transition={{ duration: 0.9, delay: 0.4 + index * 0.08, ease: 'easeOut' }}
          />
        )}
      </Box>

      {status === 'current' && (
        <Box
          component={motion.div}
          animate={reduce ? undefined : { scale: [1, 1.45], opacity: [0.45, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          sx={{ position: 'absolute', inset: -6, borderRadius: '50%', border: `2px solid ${c.fg}`, pointerEvents: 'none' }}
        />
      )}

      <Box
        onClick={onClick}
        role="button"
        tabIndex={locked ? -1 : 0}
        onKeyDown={(e) => {
          if (!locked && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label={`Level ${index + 1}: ${pattern.title}${locked ? ' (locked)' : status === 'completed' ? ' (cleared)' : ''}`}
        aria-disabled={locked}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          bgcolor: fill,
          border: `1.5px solid ${pal.border}`,
          display: 'grid',
          placeItems: 'center',
          color: c.fg,
          cursor: locked ? 'not-allowed' : 'pointer',
          transition: `transform ${MOTION.standard}ms ease`,
          '&:active': locked ? undefined : { transform: 'scale(0.96)' },
          '&:focus-visible': { outline: `2px solid ${LIB_ACCENT}`, outlineOffset: 4 },
        }}
      >
        {locked && <LockRoundedIcon aria-hidden sx={{ fontSize: FONT_SIZES.displayLg, opacity: 0.8 }} />}
        {status === 'completed' && <CheckRoundedIcon aria-hidden sx={{ fontSize: FONT_SIZES.hero }} />}
        {status === 'current' && <Typography component="span" sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{index + 1}</Typography>}
      </Box>

      {status === 'completed' && (
        <Box aria-hidden sx={{ position: 'absolute', left: '50%', bottom: -12, transform: 'translateX(-50%)', display: 'flex', zIndex: Z_INDEX.overlap, pointerEvents: 'none' }}>
          {[0, 1, 2].map((n) => (
            <StarRoundedIcon key={n} sx={{ fontSize: FONT_SIZES.title, mx: -0.125, color: n < stars ? PHONE_STAR : pal.divider, filter: `drop-shadow(0 0 2px ${pal.bg})` }} />
          ))}
        </Box>
      )}

      <Typography
        component="span"
        sx={{
          position: 'absolute',
          top: size + 16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 116,
          textAlign: 'center',
          fontSize: FONT_SIZES.body,
          lineHeight: '17px',
          fontWeight: FONT_WEIGHTS.medium,
          letterSpacing: LIB_TRACKING,
          px: 0.5,
          py: 0,
          borderRadius: RADII_PX.control,
          bgcolor: alpha(pal.bg, 0.88),
          color: locked ? pal.muted : pal.text,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {index + 1}. {pattern.title}
      </Typography>
    </Box>
  );
}
