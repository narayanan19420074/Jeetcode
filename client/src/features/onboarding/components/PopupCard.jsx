import { motion, useReducedMotion } from 'framer-motion';
import { Box } from '@mui/material';

// Wrapper that makes every generated card pop onto the screen. Motion is skipped for people
// who have asked their device to reduce animation.
export default function PopupCard({ children }) {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? false : { opacity: 0, scale: 0.92, y: 24 };
  return (
    <Box
      component={motion.div}
      initial={initial}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      sx={{ p: 2.5, borderRadius: 4, bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)', boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
    >
      {children}
    </Box>
  );
}
