import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Box } from '@mui/material';

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
