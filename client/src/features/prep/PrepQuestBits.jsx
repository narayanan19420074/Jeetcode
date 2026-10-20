import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

const BADGE_ICONS = { bolt: BoltRoundedIcon, shield: ShieldRoundedIcon, flag: FlagRoundedIcon, medal: MilitaryTechRoundedIcon, trophy: EmojiEventsRoundedIcon };

const GOLD = '#F5B301';
const BOSS = '#F97316';
const BLUE = '#3B82F6';

// A 3D-feeling coin: progress ring around the edge, presses in with a half flip when tapped.
export function QuestCoin({ pct, state, boss, Icon, active, size = 56 }) {
  const reduce = useReducedMotion();
  const color = boss ? BOSS : state === 'cleared' ? GOLD : BLUE;
  return (
    <Box sx={{ perspective: 420, width: size, height: size, flexShrink: 0, position: 'relative' }}>
      {active && !reduce && (
        <motion.span
          aria-hidden
          style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: `2px solid ${color}` }}
          animate={{ scale: [1, 1.28], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <motion.div
        whileTap={reduce ? undefined : { rotateY: 180, scale: 0.92 }}
        animate={active && !reduce ? { y: [0, -3, 0] } : undefined}
        transition={active ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : { type: 'spring', stiffness: 300, damping: 18 }}
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
      >
        <Box
          sx={{
            position: 'absolute', inset: 0, borderRadius: '50%', display: 'grid', placeItems: 'center',
            background: `conic-gradient(${color} ${Math.max(pct, state === 'cleared' ? 100 : 0) * 3.6}deg, rgba(128,128,128,.25) 0)`,
            boxShadow: active ? `0 0 0 5px ${color}22, 0 10px 22px ${color}55` : '0 4px 10px rgba(0,0,0,.18)',
          }}
        >
          <Box
            sx={{
              width: size - 10, height: size - 10, borderRadius: '50%', display: 'grid', placeItems: 'center',
              color: state === 'cleared' ? '#4A3300' : color,
              background: state === 'cleared'
                ? `radial-gradient(circle at 30% 25%, #FFE58A, ${GOLD})`
                : (t) => `radial-gradient(circle at 30% 25%, ${t.palette.background.paper}, ${t.palette.action.hover})`,
              boxShadow: 'inset 0 2px 3px rgba(255,255,255,.55), inset 0 -3px 5px rgba(0,0,0,.14)',
            }}
          >
            <Icon sx={{ fontSize: size * 0.46 }} />
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}

export function BadgeTile({ badge, index }) {
  const reduce = useReducedMotion();
  const Icon = BADGE_ICONS[badge.icon] || BoltRoundedIcon;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.7, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 + index * 0.07 }}
      style={{ flex: '0 0 auto' }}
    >
      <Box
        sx={{
          width: 112, p: 1.25, borderRadius: 3, textAlign: 'center',
          border: '1px solid', borderColor: badge.got ? 'transparent' : 'divider', borderStyle: badge.got ? 'solid' : 'dashed',
          background: badge.got ? `linear-gradient(160deg, #FFE58A, ${GOLD})` : 'transparent',
          color: badge.got ? '#4A3300' : 'text.secondary',
          boxShadow: badge.got ? '0 8px 18px rgba(245,179,1,.35)' : 'none',
        }}
      >
        <Box sx={{ display: 'grid', placeItems: 'center', mb: 0.5 }}>
          {badge.got ? <Icon sx={{ fontSize: 30 }} /> : <LockRoundedIcon sx={{ fontSize: 26, opacity: 0.55 }} />}
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', lineHeight: 1.2 }}>{badge.got ? badge.title : '???'}</Typography>
        <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.25, mt: 0.25, opacity: 0.85, fontSize: '0.68rem' }}>{badge.hint}</Typography>
      </Box>
    </motion.div>
  );
}

export function Collapse({ open, children }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
