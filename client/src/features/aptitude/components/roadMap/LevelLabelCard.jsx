import { motion } from 'framer-motion';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import { testXp } from '../gamification';
import { COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../../app/design/designTokens';

// Desktop label card next to a level: title, XP / time chips, mastery bar and stars.
export default function LevelLabelCard({ pattern, index, status, size, below, labelOnRight, best, stars }) {
  const { palette } = useTheme();
  const { primary, success, warning } = palette;
  const dark = palette.mode === 'dark';
  const passed = status === 'completed';
  return (
    <Box
      sx={{
        position: 'absolute',
        width: below ? 176 : 206,
        ...(below
          ? { top: size + 24, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }
          : { top: '50%', transform: 'translateY(-50%)', ...(labelOnRight ? { left: size + 22, textAlign: 'left' } : { right: size + 22, textAlign: 'right' }) }),
        p: 1.5,
        borderRadius: RADII_PX.card,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: status === 'current' ? primary.main : status === 'completed' ? alpha(success.main, 0.5) : 'divider',
        boxShadow: status === 'current' ? `0 12px 30px ${alpha(primary.main, 0.22)}` : dark ? `0 6px 18px ${withAlpha(COLOR_PALETTE.black, .25)}` : `0 6px 16px ${withAlpha(COLOR_PALETTE.slate[900], .06)}`,
        opacity: status === 'locked' ? 0.78 : 1,
      }}
    >
      <Typography variant="overline" sx={{ display: 'block', lineHeight: 1.2, fontWeight: FONT_WEIGHTS.bold, letterSpacing: '0.1em', color: status === 'current' ? primary.main : status === 'completed' ? success.main : 'text.secondary' }}>
        Level {index + 1}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.3, color: 'text.primary' }}>
        {pattern.title}
      </Typography>
    
      {status === 'locked' ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, justifyContent: below ? 'center' : labelOnRight ? 'flex-start' : 'flex-end' }}>
          <LockRoundedIcon sx={{ fontSize: FONT_SIZES.body }} /> Clear Level {index} to unlock
        </Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1, justifyContent: below ? 'center' : labelOnRight ? 'flex-start' : 'flex-end' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: RADII_PX.control, bgcolor: alpha(warning.main, 0.14), color: dark ? warning.light : warning.dark, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold }}>
              <BoltRoundedIcon sx={{ fontSize: FONT_SIZES.body }} /> {passed ? '' : '+'}
              {testXp(100, true)} XP
            </Box>
            {pattern.timeLimitMinutes ? (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: RADII_PX.control, bgcolor: 'action.hover', color: 'text.secondary', fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold }}>
                <TimerRoundedIcon sx={{ fontSize: FONT_SIZES.body }} /> {pattern.timeLimitMinutes} min
              </Box>
            ) : null}
          </Box>
          <Box sx={{ position: 'relative', height: 6, borderRadius: RADII_PX.pill, bgcolor: 'action.hover', mt: 1 }}>
            <Box component={motion.div} initial={{ width: 0 }} animate={{ width: `${Math.min(100, best)}%` }} transition={{ duration: 1, delay: 0.5 + index * 0.1 }} sx={{ height: '100%', borderRadius: RADII_PX.card, bgcolor: passed ? success.main : primary.main }} />
            <Box sx={{ position: 'absolute', top: -3, bottom: -3, left: `${pattern.passPercentage}%`, width: 2, bgcolor: 'text.primary', opacity: 0.55, borderRadius: RADII_PX.pill }} />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {passed ? `Mastery ${best}% · pass mark ${pattern.passPercentage}%` : pattern.progress.attemptsCount > 0 ? `Best ${best}% · need ${pattern.passPercentage}%` : `Score ${pattern.passPercentage}% to clear`}
          </Typography>
          {passed && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, justifyContent: below ? 'center' : labelOnRight ? 'flex-start' : 'flex-end' }}>
              {[0, 1, 2].map((n) => (
                <StarRoundedIcon
                  key={n}
                  component={motion.svg}
                  initial={{ scale: 0, rotate: -40 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 + n * 0.12, type: 'spring', stiffness: 300 }}
                  sx={{ fontSize: FONT_SIZES.subheading, color: n < stars ? warning.main : 'action.disabled' }}
                />
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
