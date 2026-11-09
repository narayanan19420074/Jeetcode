import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { Box, Stack, Typography, alpha } from '@mui/material';
import { COLOR_PALETTE, FONTS, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SCROLL_REVEAL_MARGIN, withAlpha } from '../../../app/design/designTokens';
import { motion } from 'framer-motion';
import { SPRING } from './learnConstants';

/* ================================================================
 *  Motion section wrapper — fades in on scroll
 * ================================================================ */
export function RevealSection({ children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: SCROLL_REVEAL_MARGIN.far }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

export function SectionHeading({ children, overline }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      {overline && (
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            fontWeight: FONT_WEIGHTS.bold,
            color: 'primary.main',
            letterSpacing: '0.1em',
            fontSize: FONT_SIZES.micro,
            mb: 0.5,
          }}
        >
          {overline}
        </Typography>
      )}
      <Typography variant="h5" sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: '-0.02em', fontSize: FONT_SIZES.display }}>
        {children}
      </Typography>
    </Box>
  );
}

/* ================================================================
 *  Formula display
 * ================================================================ */
export function FormulaDisplay({ text }) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: RADII_PX.card,
        bgcolor: (t) => (t.palette.mode === 'dark' ? withAlpha(COLOR_PALETTE.blue[500], 0.12) : withAlpha(COLOR_PALETTE.blue[500], 0.06)),
        border: '1px solid',
        borderColor: (t) => alpha(t.palette.primary.main, 0.35),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <BoltRoundedIcon sx={{ fontSize: FONT_SIZES.title, color: 'primary.main' }} />
        <Typography
          variant="caption"
          sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'primary.main', letterSpacing: '0.1em', fontSize: FONT_SIZES.micro }}
        >
          FORMULA
        </Typography>
      </Stack>
      <Stack spacing={1.25}>
        {text.split('\n').map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, ...SPRING }}
          >
            <Typography
              sx={{
                fontFamily: FONTS.mono,
                fontSize: FONT_SIZES.bodyLg,
                fontWeight: FONT_WEIGHTS.semibold,
                color: 'text.primary',
                lineHeight: 1.7,
              }}
            >
              {line}
            </Typography>
          </motion.div>
        ))}
      </Stack>
    </Box>
  );
}
