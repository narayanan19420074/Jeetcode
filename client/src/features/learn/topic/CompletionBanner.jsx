import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Button, Paper, Stack, Typography, alpha } from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { motion } from 'framer-motion';
import { SPRING } from './learnConstants';

/* ================================================================
 *  Completion banner
 * ================================================================ */
export function CompletionBanner({ topic, total, onFinish }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING}
    >
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 4,
          borderRadius: RADII_PX.card,
          textAlign: 'center',
          bgcolor: (t) => alpha(t.palette.success.main, 0.05),
          borderColor: (t) => alpha(t.palette.success.main, 0.35),
        }}
      >
        <Stack spacing={2} alignItems="center">
          <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.jumbo, color: 'success.main' }} />
          <Typography variant="h4" sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: '-0.02em' }}>
            You are placement-ready in {topic.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, lineHeight: 1.7 }}>
            You have covered all {total} lessons — every question archetype, formula, and trap. Time to test
            yourself under timed conditions.
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'success.main' }}>
            <EmojiEventsRoundedIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: '0.05em' }}>
              READY FOR PRACTICE & TEST
            </Typography>
          </Stack>
          <Button
            variant="contained"
            size="large"
            disableElevation
            onClick={onFinish}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              mt: 1,
              fontWeight: FONT_WEIGHTS.bold,
              py: 1.5,
              px: 4,
              borderRadius: RADII_PX.card,
              bgcolor: 'success.main',
              '&:hover': { bgcolor: 'success.dark' },
            }}
          >
            Go to Practice &amp; Test
          </Button>
        </Stack>
      </Paper>
    </motion.div>
  );
}
