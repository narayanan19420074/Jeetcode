import { AnimatePresence, motion } from 'framer-motion';
import { Box, Button, Chip, Paper, Stack, Typography, alpha } from '@mui/material';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SCROLL_REVEAL_MARGIN, withAlpha } from '../../../app/design/designTokens';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useState } from 'react';

/* ================================================================
 *  Check card — interactive question
 * ================================================================ */
export function CheckCard({ check, index, onCorrect }) {
  const [selected, setSelected] = useState(null);
  const [solved, setSolved] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const handlePick = (i) => {
    if (solved) return;
    setSelected(i);
    if (i === check.correctIndex) {
      setSolved(true);
      onCorrect?.();
    } else {
      setWrongAttempts((w) => w + 1);
    }
  };

  const handleReveal = () => {
    setSolved(true);
    setRevealed(true);
  };

  const isChallenge = check.level === 'challenge';

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
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: RADII_PX.card,
          borderColor: isChallenge ? (t) => alpha(t.palette.warning.main, 0.4) : 'divider',
          bgcolor: isChallenge ? (t) => alpha(t.palette.warning.main, 0.02) : 'background.paper',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip
            label={isChallenge ? 'Challenge' : 'Quick check'}
            size="small"
            sx={{
              fontWeight: FONT_WEIGHTS.bold,
              bgcolor: isChallenge ? (t) => alpha(t.palette.warning.main, 0.15) : (t) => alpha(t.palette.primary.main, 0.12),
              color: isChallenge ? 'warning.main' : 'primary.main',
            }}
          />
        </Stack>

        <Typography variant="h6" sx={{ fontWeight: FONT_WEIGHTS.bold, mb: 3, lineHeight: 1.45, fontSize: FONT_SIZES.subheading }}>
          {check.question}
        </Typography>

        <Stack spacing={1.25}>
          {check.options.map((opt, i) => {
            const isCorrect = i === check.correctIndex;
            const isSelected = i === selected;
            const showCorrect = solved && isCorrect;
            const showWrong = !solved && isSelected && !isCorrect;

            return (
              <motion.button
                key={i}
                onClick={() => handlePick(i)}
                disabled={solved}
                whileHover={!solved ? { scale: 1.008 } : {}}
                whileTap={!solved ? { scale: 0.995 } : {}}
                animate={{
                  borderColor: showCorrect ? COLOR_PALETTE.emerald[500] : showWrong ? COLOR_PALETTE.red[500] : withAlpha(COLOR_PALETTE.slate[400], 0.35),
                  backgroundColor: showCorrect ? withAlpha(COLOR_PALETTE.emerald[500], 0.08) : showWrong ? withAlpha(COLOR_PALETTE.red[500], 0.06) : 'transparent',
                }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  borderRadius: RADII_PX.card,
                  border: '1.5px solid',
                  cursor: solved ? 'default' : 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  color: 'inherit',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: FONT_WEIGHTS.bold,
                    fontSize: FONT_SIZES.body,
                    flexShrink: 0,
                    border: '1.5px solid',
                    borderColor: showCorrect ? COLOR_PALETTE.emerald[500] : showWrong ? COLOR_PALETTE.red[500] : 'currentColor',
                    bgcolor: showCorrect ? COLOR_PALETTE.emerald[500] : 'transparent',
                    color: showCorrect ? COLOR_PALETTE.white : 'inherit',
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </Box>
                <Typography sx={{ flexGrow: 1, fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.bodyLg }}>
                  {opt}
                </Typography>
                {showCorrect && <CheckCircleRoundedIcon sx={{ color: COLOR_PALETTE.emerald[500], fontSize: FONT_SIZES.heading }} />}
                {showWrong && <CancelRoundedIcon sx={{ color: COLOR_PALETTE.red[500], fontSize: FONT_SIZES.heading }} />}
              </motion.button>
            );
          })}
        </Stack>

        {!solved && wrongAttempts >= 3 && (
          <Button onClick={handleReveal} size="small" sx={{ mt: 2, fontWeight: FONT_WEIGHTS.bold }}>
            Stuck? Reveal the answer
          </Button>
        )}

        <AnimatePresence>
          {solved && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  mt: 2.5,
                  p: 2,
                  borderRadius: RADII_PX.card,
                  bgcolor: revealed ? alpha(COLOR_PALETTE.amber[500], 0.08) : withAlpha(COLOR_PALETTE.emerald[500], 0.08),
                  border: '1px solid',
                  borderColor: revealed ? alpha(COLOR_PALETTE.amber[500], 0.3) : withAlpha(COLOR_PALETTE.emerald[500], 0.3),
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: FONT_WEIGHTS.bold,
                    color: revealed ? 'warning.main' : 'success.main',
                    display: 'block',
                    mb: 0.5,
                    letterSpacing: '0.08em',
                    fontSize: FONT_SIZES.micro,
                  }}
                >
                  {revealed ? 'ANSWER REVEALED' : 'CORRECT'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, fontSize: FONT_SIZES.body }}>
                  {check.explanation}
                </Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
    </motion.div>
  );
}
