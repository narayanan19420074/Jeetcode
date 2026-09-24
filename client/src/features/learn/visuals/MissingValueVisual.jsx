import { useState } from 'react';
import { Box, Button, Stack, Typography, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const NUMBERS = [10, 15, 20, 25];
const AVERAGE = 18;
const COUNT = 5;

// Interactive "tap to sum" visual for the Working Backwards lesson.
// User taps each known number → it flies into a running-sum area →
// reveal button appears → missing value is computed on-screen.
export default function MissingValueVisual() {
  const [added, setAdded] = useState([]);
  const [revealed, setRevealed] = useState(false);

  const sum = added.reduce((s, i) => s + NUMBERS[i], 0);
  const allAdded = added.length === NUMBERS.length;
  const requiredSum = AVERAGE * COUNT;
  const missing = requiredSum - sum;

  const handleAdd = (i) => {
    if (added.includes(i) || revealed) return;
    setAdded([...added, i]);
  };

  const reset = () => {
    setAdded([]);
    setRevealed(false);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        p: { xs: 2.5, md: 4 },
        borderRadius: 4,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: (t) => `radial-gradient(circle at 30% 0%, ${alpha(t.palette.primary.main, 0.06)}, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />
      <Box sx={{ position: 'relative' }}>
        <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '0.1em', fontSize: 10.5 }}>
          Interactive
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, mb: 0.5, letterSpacing: '-0.01em' }}>
          {revealed
            ? 'Solved!'
            : allAdded
            ? 'Now reveal the missing value'
            : 'Tap numbers to add them up'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Average of 5 numbers is {AVERAGE}. Four are known — find the fifth.
        </Typography>

        <Stack
          direction="row"
          spacing={{ xs: 1, sm: 1.5 }}
          sx={{ mb: 4, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          {NUMBERS.map((n, i) => {
            const isAdded = added.includes(i);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
              >
                <motion.button
                  onClick={() => handleAdd(i)}
                  disabled={isAdded || revealed}
                  whileHover={!isAdded && !revealed ? { y: -4 } : {}}
                  whileTap={!isAdded && !revealed ? { scale: 0.92 } : {}}
                  animate={{
                    opacity: isAdded ? 0.3 : 1,
                    scale: isAdded ? 0.92 : 1,
                  }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    border: '2px solid',
                    borderColor: isAdded ? 'rgba(59,130,246,0.2)' : '#3b82f6',
                    background: 'transparent',
                    color: isAdded ? 'rgba(59,130,246,0.5)' : '#3b82f6',
                    fontSize: 18,
                    fontWeight: 800,
                    cursor: isAdded || revealed ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {n}
                </motion.button>
              </motion.div>
            );
          })}

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
          >
            <motion.div
              animate={
                revealed
                  ? {
                      backgroundColor: 'rgba(16,185,129,0.12)',
                      borderColor: '#10b981',
                      color: '#10b981',
                      scale: [1, 1.15, 1],
                    }
                  : {
                      borderColor: '#f59e0b',
                      color: '#f59e0b',
                    }
              }
              transition={{ duration: 0.5 }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                border: '2px dashed',
                display: 'grid',
                placeItems: 'center',
                fontSize: revealed ? 18 : 24,
                fontWeight: 800,
                fontFamily: 'inherit',
              }}
            >
              {revealed ? missing : '?'}
            </motion.div>
          </motion.div>
        </Stack>

        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
            border: '1px solid',
            borderColor: (t) => alpha(t.palette.primary.main, 0.15),
            mb: 2,
            textAlign: 'center',
            minHeight: 90,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em', fontSize: 10 }}>
            SUM OF KNOWN NUMBERS
          </Typography>
          {added.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              Tap the numbers above
            </Typography>
          ) : (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              {added.map((i, idx) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ fontFamily: 'monospace', fontWeight: 700, color: '#3b82f6', fontSize: 18 }}
                >
                  {idx > 0 && <span style={{ color: '#94a3b8', margin: '0 4px' }}>+</span>}
                  {NUMBERS[i]}
                </motion.span>
              ))}
              <AnimatePresence>
                {allAdded && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ fontFamily: 'monospace', fontWeight: 800, color: '#10b981', fontSize: 18, marginLeft: 4 }}
                  >
                    = {sum}
                  </motion.span>
                )}
              </AnimatePresence>
            </Box>
          )}
        </Box>

        <AnimatePresence>
          {allAdded && (
            <motion.div
              initial={{ opacity: 0, y: 12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                  border: '1px solid',
                  borderColor: (t) => alpha(t.palette.primary.main, 0.2),
                  mb: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="baseline" sx={{ justifyContent: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Required sum =
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: 'text.primary' }}>
                    {AVERAGE} × {COUNT} = <strong style={{ color: '#3b82f6', fontSize: 17 }}>{requiredSum}</strong>
                  </Typography>
                </Stack>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {allAdded && !revealed && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="contained"
                disableElevation
                fullWidth
                onClick={() => setRevealed(true)}
                sx={{ fontWeight: 700, py: 1.5, borderRadius: 2, fontSize: 15 }}
              >
                Reveal the missing value
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            >
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: (t) => alpha(t.palette.success.main, 0.1),
                  border: '1.5px solid',
                  borderColor: 'success.main',
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', letterSpacing: '0.08em', fontSize: 10 }}>
                  ANSWER
                </Typography>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 20, color: 'success.main', mt: 1 }}>
                  {requiredSum} − {sum} = {missing}
                </Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {added.length > 0 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button onClick={reset} size="small" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Start over
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}