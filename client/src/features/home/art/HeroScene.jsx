import { useEffect, useState } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useReducedMotion } from 'framer-motion';
import OfferLetter from './OfferLetter';
import { drift, floatY, fadeUp, MONO_FONT, pick, popIn, ring, typeLine } from '../anim';

// Each code token: [text, kind]. Kinds map to theme colours below.
const CODE = [
  [['def ', 'kw'], ['two_sum', 'fn'], ['(nums, target):', 'tx']],
  [['    seen = {}', 'tx']],
  [['    for ', 'kw'], ['i, n ', 'tx'], ['in ', 'kw'], ['enumerate', 'fn'], ['(nums):', 'tx']],
  [['        if ', 'kw'], ['target - n ', 'tx'], ['in ', 'kw'], ['seen:', 'tx']],
  [['            return ', 'kw'], ['[seen[target - n], i]', 'tx']],
  [['        seen[n] = i', 'tx']],
];

const CASES = ['[2, 7, 11, 15], 9', '[3, 2, 4], 6', '[3, 3], 6'];
const OPTIONS = ['54 km/h', '60 km/h', '72 km/h', '80 km/h'];
const CORRECT = 2;
const CYCLE_MS = 11000;

function TimerRing({ color }) {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
      <circle cx="15" cy="15" r="12" fill="none" stroke={alpha(color, 0.2)} strokeWidth="3" />
      <Box
        component="circle"
        cx="15"
        cy="15"
        r="12"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="75.4"
        transform="rotate(-90 15 15)"
        sx={{ animation: `${ring} 9s linear both` }}
      />
    </svg>
  );
}

export default function HeroScene() {
  const t = useTheme();
  const reduce = useReducedMotion();
  const [cycle, setCycle] = useState(0);

  // Replay the whole "solve, answer, get selected" story on a slow loop so
  // it still reads as a story for anyone who lands mid-sequence.
  useEffect(() => {
    if (reduce) return undefined;
    const id = setInterval(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, [reduce]);

  const colors = {
    kw: t.palette.primary.main,
    fn: t.palette.warning.main,
    tx: t.palette.text.primary,
  };

  const card = {
    borderRadius: '16px',
    bgcolor: 'background.paper',
    boxShadow: `0 24px 48px -20px ${alpha(t.palette.primary.dark, 0.45)}`,
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 500, mx: 'auto' }}>
      {/* Drifting colour blobs behind the scene */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: { xs: '-10px -10px auto auto', md: '-30px -30px auto auto' },
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(t.palette.primary.main, 0.3)}, transparent 70%)`,
          animation: `${drift} 9s ease-in-out infinite`,
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          left: -40,
          bottom: 20,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(t.palette.success.main, 0.22)}, transparent 70%)`,
          animation: `${drift} 11s ease-in-out infinite reverse`,
        }}
      />

      <Box key={cycle} sx={{ position: 'relative', height: { md: 540 }, pt: { xs: 4, md: 0 }, pb: { xs: 2, md: 0 } }}>
        {/* Code window */}
        <Paper
          variant="outlined"
          sx={{
            ...card,
            position: { md: 'absolute' },
            top: { md: 34 },
            left: 0,
            width: { xs: '100%', md: 390 },
            overflow: 'hidden',
          }}
        >
          <Stack
            direction="row"
            sx={{ px: 1.75, py: 1, bgcolor: 'action.hover', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={0.75}>
              {['error', 'warning', 'success'].map((c) => (
                <Box key={c} sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: `${c}.main` }} />
              ))}
            </Stack>
            <Stack direction="row" spacing={0.5}>
              {['JavaScript', 'Python', 'C++'].map((l) => (
                <Box
                  key={l}
                  sx={{
                    px: 0.9,
                    py: 0.15,
                    borderRadius: '999px',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: l === 'Python' ? 'primary.contrastText' : 'text.secondary',
                    bgcolor: l === 'Python' ? 'primary.main' : 'transparent',
                  }}
                >
                  {l}
                </Box>
              ))}
            </Stack>
          </Stack>

          <Box sx={{ px: 2, py: 1.5, fontFamily: MONO_FONT, fontSize: '0.74rem', lineHeight: 1.75 }}>
            {CODE.map((line, i) => (
              <Box
                key={i}
                sx={{ whiteSpace: 'pre', animation: `${typeLine} 0.5s steps(22) ${0.2 + i * 0.32}s both` }}
              >
                {line.map(([text, kind], j) => (
                  <Box key={j} component="span" sx={{ color: colors[kind] }}>
                    {text}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>

          <Box sx={{ px: 2, pb: 1.75, pt: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={0.6} sx={{ mt: 1.25 }}>
              {CASES.map((c, i) => (
                <Stack
                  key={c}
                  direction="row"
                  spacing={0.9}
                  sx={{ alignItems: 'center', animation: `${fadeUp} 0.4s ease ${2.4 + i * 0.45}s both` }}
                >
                  <CheckCircleRoundedIcon sx={{ fontSize: 15, color: 'success.main' }} />
                  <Typography sx={{ fontFamily: MONO_FONT, fontSize: '0.68rem', color: 'text.secondary' }}>
                    Case {i + 1}: {c}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Box
              sx={{
                mt: 1.25,
                display: 'inline-block',
                px: 1.25,
                py: 0.3,
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'success.main',
                bgcolor: alpha(t.palette.success.main, 0.14),
                animation: `${popIn} 0.45s ease 3.9s both`,
              }}
            >
              Accepted
            </Box>
          </Box>
        </Paper>

        {/* Aptitude question card */}
        <Paper
          variant="outlined"
          sx={{
            ...card,
            '--ok': t.palette.success.main,
            '--ok-soft': alpha(t.palette.success.main, 0.14),
            '--line': t.palette.divider,
            position: { md: 'absolute' },
            right: { md: -14 },
            top: { md: 214 },
            width: { xs: '100%', md: 232 },
            mt: { xs: 2, md: 0 },
            p: 1.75,
            zIndex: 2,
            animation: `${floatY} 7s ease-in-out infinite`,
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary' }}>
                Time, Speed &amp; Distance
              </Typography>
              <Typography sx={{ fontSize: '0.62rem', color: 'text.secondary' }}>Timed test</Typography>
            </Box>
            <TimerRing color={t.palette.primary.main} />
          </Stack>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1.1, lineHeight: 1.4 }}>
            A 120 m train crosses a pole in 6 s. What is its speed?
          </Typography>
          <Stack spacing={0.6}>
            {OPTIONS.map((o, i) => (
              <Stack
                key={o}
                direction="row"
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1,
                  py: 0.45,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'divider',
                  fontSize: '0.74rem',
                  animation: i === CORRECT ? `${pick} 0.4s ease 3.2s both` : 'none',
                }}
              >
                <span>
                  <b>{'ABCD'[i]}</b>&nbsp;&nbsp;{o}
                </span>
                {i === CORRECT && (
                  <CheckCircleRoundedIcon
                    sx={{ fontSize: 15, color: 'success.main', animation: `${popIn} 0.35s ease 3.4s both` }}
                  />
                )}
              </Stack>
            ))}
          </Stack>
        </Paper>

        {/* Streak chip */}
        <Stack
          direction="row"
          spacing={0.6}
          sx={{
            position: 'absolute',
            top: { xs: 0, md: 0 },
            left: { xs: 8, md: 250 },
            px: 1.4,
            py: 0.7,
            borderRadius: '999px',
            alignItems: 'center',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: `0 10px 24px -10px ${alpha(t.palette.warning.main, 0.6)}`,
            zIndex: 3,
            animation: `${floatY} 5s ease-in-out infinite 0.8s`,
          }}
        >
          <LocalFireDepartmentRoundedIcon sx={{ fontSize: 18, color: 'warning.main' }} />
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 800 }}>7-day streak</Typography>
        </Stack>

        {/* Offer letter peeking in at the bottom: the outcome */}
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            left: 70,
            bottom: 0,
            transform: 'rotate(-5deg)',
            zIndex: 1,
            filter: `drop-shadow(0 18px 20px ${alpha(t.palette.primary.dark, 0.25)})`,
            animation: `${fadeUp} 0.6s ease 3.6s both`,
          }}
        >
          <OfferLetter width={138} stampDelay={4.6} replayKey={cycle} />
        </Box>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', textAlign: 'center', mt: { xs: 0.5, md: 1 } }}
      >
        Sample problem and question, shown for illustration.
      </Typography>
    </Box>
  );
}
