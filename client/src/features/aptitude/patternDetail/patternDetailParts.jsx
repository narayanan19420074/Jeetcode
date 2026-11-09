import { Badge, Box, ButtonBase, CircularProgress, Typography, alpha } from '@mui/material';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, MOTION, RADII_PX } from '../../../app/design/designTokens';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import { motion } from 'framer-motion';
import { popChild } from '../components/MotionBits';

export const MONO = '"JetBrains Mono", monospace';

/* ---------------------------------------------------------------- */
/* Action icon (Learn / Practice / Test) — icon on top, name below   */
/* ---------------------------------------------------------------- */
export function ActionIcon({ icon, accent, name, onClick, disabled, highlight, dot, label }) {
  return (
    <Box component={motion.div} variants={popChild} sx={{ minWidth: 0 }}>
      <ButtonBase
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
        title={label}
        sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 0.5, opacity: disabled ? 0.45 : 1 }}
      >
        <Badge color="warning" variant="dot" invisible={!dot} overlap="rectangular">
          <Box
            sx={{
              width: 56,
              height: 56,
              display: 'grid',
              placeItems: 'center',
              bgcolor: accent,
              color: COLOR_PALETTE.white,
              boxShadow: highlight ? `0 0 0 3px ${alpha(accent, 0.28)}` : 'none',
              transition: `box-shadow ${MOTION.standard}ms ease, transform ${MOTION.fast}ms ease`,
              '& svg': { fontSize: FONT_SIZES.hero },
              'button:active > span > &': { transform: 'scale(0.96)' },
            }}
          >
            {icon}
          </Box>
        </Badge>
        <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, lineHeight: 1 }}>{name}</Typography>
      </ButtonBase>
    </Box>
  );
}

/* ---------------------------------------------------------------- */
/* Topic row — ring + title + score, one line                        */
/* ---------------------------------------------------------------- */
export function SubPatternRow({ sub, onClick }) {
  const empty = sub.total === 0;
  const pct = sub.total ? (sub.solved / sub.total) * 100 : 0;
  const mastered = sub.total > 0 && sub.solved === sub.total;
  const accColor = sub.accuracy == null ? 'text.disabled' : sub.accuracy >= 75 ? 'success.main' : sub.accuracy >= 50 ? 'warning.main' : 'error.main';

  return (
    <ButtonBase
      component={motion.div}
      variants={popChild}
      disabled={empty}
      onClick={onClick}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1,
        minHeight: 54,
        textAlign: 'left',
        justifyContent: 'flex-start',
        opacity: empty ? 0.55 : 1,
        '&:hover': empty ? undefined : { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ position: 'relative', width: 34, height: 34, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
        <CircularProgress variant="determinate" value={100} size={34} thickness={4} sx={{ position: 'absolute', color: 'action.hover' }} />
        <CircularProgress variant="determinate" value={pct} size={34} thickness={4} sx={{ position: 'absolute', color: mastered ? 'success.main' : 'primary.main' }} />
        {mastered ? (
          <CheckCircleRoundedIcon sx={{ fontSize: FONT_SIZES.subheading, color: 'success.main' }} />
        ) : empty ? (
          <HourglassEmptyRoundedIcon sx={{ fontSize: FONT_SIZES.bodyLg, color: 'text.disabled' }} />
        ) : (
          <Typography sx={{ fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, fontFamily: MONO }}>{Math.round(pct)}</Typography>
        )}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.25 }}>
          {sub.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: MONO, fontSize: FONT_SIZES.micro }}>
          {empty ? 'Coming soon' : `${sub.solved}/${sub.total} solved`}
        </Typography>
      </Box>
      {!empty && (
        <Typography sx={{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: accColor, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {sub.accuracy == null ? '—' : `${sub.accuracy}%`}
        </Typography>
      )}
      {!empty && <ChevronRightRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: 'text.disabled', flexShrink: 0 }} />}
    </ButtonBase>
  );
}

export function Stat({ icon, color, value, label, suffix }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 30, height: 30, flexShrink: 0, borderRadius: RADII_PX.pill, display: 'grid', placeItems: 'center', color, bgcolor: alpha(color, 0.14), '& svg': { fontSize: FONT_SIZES.subheading } }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg, lineHeight: 1.1, fontFamily: MONO }} noWrap>
          {value}
          <Box component="span" sx={{ fontSize: FONT_SIZES.micro, color: 'text.secondary', fontWeight: FONT_WEIGHTS.bold }}>
            {suffix}
          </Box>
        </Typography>
        <Typography color="text.secondary" sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.micro, lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.05em' }} noWrap>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}
