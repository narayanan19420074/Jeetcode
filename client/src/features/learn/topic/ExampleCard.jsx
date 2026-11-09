import { Box, Divider, Paper, Stack, Typography, alpha } from '@mui/material';
import { COLOR_PALETTE, FONTS, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SCROLL_REVEAL_MARGIN } from '../../../app/design/designTokens';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { motion } from 'framer-motion';
import { SPRING } from './learnConstants';

/* ================================================================
 *  Worked example — step reveal on scroll
 * ================================================================ */
export function ExampleCard({ example, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: SCROLL_REVEAL_MARGIN.near }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: RADII_PX.card, bgcolor: 'background.paper' }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'grid',
              placeItems: 'center',
              fontSize: FONT_SIZES.caption,
              fontWeight: FONT_WEIGHTS.bold,
            }}
          >
            {index + 1}
          </Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'text.secondary', letterSpacing: '0.08em', fontSize: FONT_SIZES.micro }}
          >
            WORKED EXAMPLE
          </Typography>
        </Stack>

        <Typography variant="body1" sx={{ fontWeight: FONT_WEIGHTS.semibold, mb: 2.5, lineHeight: 1.6, fontSize: FONT_SIZES.title }}>
          {example.question}
        </Typography>

        <Stack spacing={1.25}>
          {example.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 + i * 0.12, ...SPRING }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: FONTS.mono,
                    fontWeight: FONT_WEIGHTS.bold,
                    color: 'text.disabled',
                    mt: 0.5,
                    minWidth: 16,
                    fontSize: FONT_SIZES.caption,
                  }}
                >
                  {i + 1}.
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONTS.mono,
                    fontSize: FONT_SIZES.body,
                    lineHeight: 1.7,
                    color: 'text.secondary',
                  }}
                >
                  {step}
                </Typography>
              </Stack>
            </motion.div>
          ))}
        </Stack>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + example.steps.length * 0.12, ...SPRING }}
        >
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={1.5} alignItems="baseline">
            <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'success.main', letterSpacing: '0.1em', fontSize: FONT_SIZES.micro }}>
              ANSWER
            </Typography>
            <Typography
              sx={{
                fontFamily: FONTS.mono,
                fontWeight: FONT_WEIGHTS.bold,
                fontSize: FONT_SIZES.bodyLg,
                color: 'success.main',
              }}
            >
              {example.answer}
            </Typography>
          </Stack>
        </motion.div>
      </Paper>
    </motion.div>
  );
}

/* ================================================================
 *  Trap callout
 * ================================================================ */
export function TrapCallout({ text }) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: RADII_PX.card,
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-start',
        bgcolor: (t) => alpha(COLOR_PALETTE.red[500], 0.05),
        border: '1px solid',
        borderColor: (t) => alpha(COLOR_PALETTE.red[500], 0.3),
      }}
    >
      <WarningAmberRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: COLOR_PALETTE.red[500], mt: 0.5 }} />
      <Box>
        <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, color: COLOR_PALETTE.red[500], display: 'block', letterSpacing: '0.1em', fontSize: FONT_SIZES.micro }}>
          TRAP
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.65, fontSize: FONT_SIZES.bodyLg }}>
          {text}
        </Typography>
      </Box>
    </Box>
  );
}
