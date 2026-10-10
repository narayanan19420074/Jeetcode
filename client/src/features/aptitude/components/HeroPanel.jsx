import { Box, alpha } from '@mui/material';
import { motion } from 'framer-motion';

// Theme-aware hero surface used by the Aptitude pages: paper card, hairline
// border, faint dot grid and a soft glow in the accent colour.
export default function HeroPanel({ glow = '#3B82F6', children, sx }) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '14px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: { xs: 2.5, md: 4 },
        backgroundImage: (t) =>
          `radial-gradient(${alpha(t.palette.text.secondary, t.palette.mode === 'dark' ? 0.18 : 0.24)} 1px, transparent 1px), radial-gradient(520px 300px at 88% 40%, ${alpha(glow, t.palette.mode === 'dark' ? 0.22 : 0.12)}, transparent 70%)`,
        backgroundSize: '22px 22px, 100% 100%',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
