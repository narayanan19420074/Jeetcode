import { motion, useReducedMotion } from 'framer-motion';
import { Box } from '@mui/material';

// Fades and lifts each screen in. Skipped for people who have asked their device to reduce motion.
export default function ScreenTransition({ children, maxWidth }) {
  const reduceMotion = useReducedMotion();
  return (
    <Box
      component={motion.div}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      sx={{ width: '100%', maxWidth }}
    >
      {children}
    </Box>
  );
}
