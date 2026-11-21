import { useState } from 'react';
import { Box, Button, Paper, Stack, Typography, alpha } from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { motion } from 'framer-motion';
import { FONTS, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const STEP_LABEL_WIDTH_UNITS = 6;

function ExampleHeading({ index }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 1.5 }}>
      <Box sx={{ width: SIZES.iconSize.medium, height: SIZES.iconSize.medium, borderRadius: RADII_PX.circle, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center', fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold }}>
        {index + 1}
      </Box>
      <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'text.secondary', letterSpacing: '0.08em' }}>WORKED EXAMPLE</Typography>
    </Stack>
  );
}

function RevealedStep({ text, number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Stack direction="row" spacing={1.25}>
        <Typography variant="caption" sx={{ fontFamily: FONTS.mono, fontWeight: FONT_WEIGHTS.bold, color: 'primary.main', mt: 0.5, minWidth: (theme) => theme.spacing(STEP_LABEL_WIDTH_UNITS) }}>Step {number}</Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{text}</Typography>
      </Stack>
    </motion.div>
  );
}

function AnswerBox({ answer }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
      <Box sx={{ mt: 2, p: 1.5, borderRadius: RADII_PX.card, bgcolor: (theme) => alpha(theme.palette.success.main, 0.1), border: '1px solid', borderColor: 'success.main' }}>
        <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'success.main' }}>Answer: {answer}</Typography>
      </Box>
    </motion.div>
  );
}

// One worked example, revealed a step at a time so the learner tries each step before seeing it.
export default function WorkedExample({ example, index }) {
  const [shown, setShown] = useState(0);
  const isFinished = shown >= example.steps.length;
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: RADII_PX.card }}>
      <ExampleHeading index={index} />
      <Typography sx={{ fontWeight: FONT_WEIGHTS.semibold, lineHeight: 1.6, mb: 2 }}>{example.question}</Typography>
      <Stack spacing={1}>{example.steps.slice(0, shown).map((step, position) => <RevealedStep key={step} text={step} number={position + 1} />)}</Stack>
      {isFinished ? <AnswerBox answer={example.answer} /> : (
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Button size="small" variant="outlined" startIcon={<VisibilityRoundedIcon />} onClick={() => setShown((count) => count + 1)}>{shown === 0 ? 'Show first step' : 'Next step'}</Button>
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>Try it yourself first</Typography>
        </Stack>
      )}
    </Paper>
  );
}
