import { motion, useReducedMotion } from 'framer-motion';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { starsFor } from '../gamification';
import LevelLabelCard from './LevelLabelCard';
import { MOBILE, NODE } from './roadGeometry';
import { COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS, FONTS, RADII_PX, Z_INDEX, MOTION } from '../../../../app/design/designTokens';

// Desktop / tablet level node: disc + progress ring; the label card sits beside it.
export default function LevelNode({ pattern, index, status, x, y, isLast, labelOnRight, narrow, below, onClick }) {
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
          ? `linear-gradient(145deg, ${COLOR_PALETTE.slate[700]}, ${COLOR_PALETTE.custom.slate263349})`
          : `linear-gradient(145deg, ${COLOR_PALETTE.slate[200]}, ${COLOR_PALETTE.slate[300]})`;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.08, type: 'spring', stiffness: 240, damping: 20 }}
      sx={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, zIndex: Z_INDEX.raised }}
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
        tabIndex={status === 'locked' ? -1 : 0}
        onKeyDown={(e) => {
          if (status !== 'locked' && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
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
          boxShadow: status === 'locked' ? `inset 0 1px 0 ${alpha(COLOR_PALETTE.white, dark ? 0.08 : 0.6)}` : `inset 0 2px 0 ${alpha(COLOR_PALETTE.white, 0.35)}, inset 0 -6px 12px ${alpha(COLOR_PALETTE.black, 0.22)}, 0 10px 26px ${alpha(accent, 0.4)}`,
          transition: `transform ${MOTION.standard}ms ease`,
          '&:hover': status === 'locked' ? undefined : { transform: 'scale(1.06)' },
          '&:active': status === 'locked' ? undefined : { transform: 'scale(0.97)' },
        }}
      >
        {status === 'locked' && <LockRoundedIcon sx={{ color: text.secondary, fontSize: FONT_SIZES.display }} />}
        {passed && narrow && <Typography sx={{ color: COLOR_PALETTE.white, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.heading, fontFamily: FONTS.mono }}>{index + 1}</Typography>}
        {passed && !narrow && (isLast ? <EmojiEventsRoundedIcon sx={{ color: COLOR_PALETTE.white, fontSize: FONT_SIZES.hero }} /> : <StarRoundedIcon sx={{ color: COLOR_PALETTE.white, fontSize: FONT_SIZES.hero }} />)}
        {status === 'current' && <Typography sx={{ color: COLOR_PALETTE.white, fontWeight: FONT_WEIGHTS.bold, fontSize: narrow ? FONT_SIZES.heading : FONT_SIZES.display, fontFamily: FONTS.mono }}>{index + 1}</Typography>}
      </Box>

      {/* compact phone label: stars on the disc, short title underneath */}
      {narrow && passed && (
        <Box sx={{ position: 'absolute', left: '50%', bottom: -9, transform: 'translateX(-50%)', display: 'flex', zIndex: Z_INDEX.overlap, pointerEvents: 'none' }}>
          {[0, 1, 2].map((n) => (
            <StarRoundedIcon key={n} sx={{ fontSize: FONT_SIZES.body, mx: -0.125, color: n < stars ? warning.main : 'action.disabled', filter: `drop-shadow(0 1px 1px ${withAlpha(COLOR_PALETTE.black, .35)})` }} />
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
            width: 124,
            textAlign: 'center',
            fontWeight: FONT_WEIGHTS.bold,
            fontSize: FONT_SIZES.body,
            lineHeight: 1.2,
            px: 0.5,
            py: 0.5,
            borderRadius: RADII_PX.control,
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

      {!narrow && <LevelLabelCard pattern={pattern} index={index} status={status} size={size} below={below} labelOnRight={labelOnRight} best={best} stars={stars} />}
    </Box>
  );
}
