import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { aptitudeApi } from '../../api/aptitudeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { PALETTE, formatClock } from './components/aptitudeUi';

// "General instructions" screen shown before the timed paper, modelled on the
// TCS iON candidate instructions page: the learner reads the rules, sees the
// question-palette legend, ticks the declaration and only then starts the clock.

export function PaletteSymbol({ kind, size = 30, children }) {
  const p = PALETTE[kind];
  const shape = {
    notVisited: { borderRadius: '6px' },
    notAnswered: { clipPath: 'polygon(14% 0, 86% 0, 100% 28%, 100% 100%, 0 100%, 0 28%)' },
    answered: { clipPath: 'polygon(0 0, 100% 0, 100% 72%, 86% 100%, 14% 100%, 0 72%)' },
    marked: { borderRadius: '50%' },
    answeredMarked: { borderRadius: '50%' },
  }[kind];
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        bgcolor: p.bg,
        color: p.fg,
        fontWeight: 800,
        fontSize: size * 0.42,
        ...shape,
      }}
    >
      {children}
      {kind === 'answeredMarked' && (
        <Box sx={{ position: 'absolute', right: -1, bottom: -1, width: size * 0.38, height: size * 0.38, borderRadius: '50%', bgcolor: PALETTE.answered.bg, border: '2px solid #fff' }} />
      )}
    </Box>
  );
}

export default function AptitudeTestInstructionsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [hub, setHub] = useState(null);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    aptitudeApi
      .getPattern(slug)
      .then(({ data }) => !cancelled && setHub(data.data))
      .catch((err) => !cancelled && setError(extractErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const begin = async () => {
    setStarting(true);
    setError(null);
    try {
      const { data } = await aptitudeApi.startAttempt(slug, 'test');
      navigate(`/aptitude/${slug}/test/${data.data.attemptId}`, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
      setStarting(false);
    }
  };

  if (error && !hub) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  if (!hub) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const { pattern, testPlan, activeTest } = hub;
  const rules = [
    `The test has ${testPlan.questionCount} multiple-choice questions and must be finished in ${pattern.timeLimitMinutes} minutes. The countdown timer is shown at the top right and cannot be paused.`,
    'When the timer reaches zero the test is submitted automatically with the answers you have saved.',
    `Each question carries 1 mark. There is no negative marking. You pass with ${pattern.passPercentage}% or more.`,
    'Click an option to select your answer. To change it, choose another option; to remove it, press Clear Response.',
    'Save & Next saves your answer and moves on. Mark for Review & Next flags the question so you can return to it later. Answers on questions marked for review are still evaluated.',
    'Use the Question Palette on the right to jump to any question. You can reopen any question until you submit.',
    'The calculator button opens an on-screen calculator. Your answers are saved automatically, so a page refresh will not lose your progress.',
  ];

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
      <Box sx={{ bgcolor: '#1F3A5F', color: '#fff' }}>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Stack direction="row" useFlexGap spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.75, letterSpacing: '0.12em', fontWeight: 700 }}>
                Aptitude Test · {pattern.category || 'Quantitative Aptitude'}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {pattern.title}
              </Typography>
            </Box>
            <Stack direction="row" spacing={3}>
              {[
                ['Questions', testPlan.questionCount],
                ['Duration', formatClock(pattern.timeLimitMinutes * 60)],
                ['Pass mark', `${pattern.passPercentage}%`],
              ].map(([k, v]) => (
                <Box key={k} sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', fontSize: 20 }}>{v}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>
                    {k}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {activeTest && (
          <Alert severity="info" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={begin}>Resume</Button>}>
            You already have a test in progress ({activeTest.answeredCount}/{activeTest.totalCount} answered). Starting again resumes it.
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
          <Paper variant="outlined" sx={{ flex: 1, p: { xs: 2.5, sm: 3.5 }, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              General instructions
            </Typography>
            <Stack component="ol" spacing={1.4} sx={{ pl: 2.5, m: 0 }}>
              {rules.map((r) => (
                <Typography key={r} component="li" variant="body2" sx={{ lineHeight: 1.7 }}>
                  {r}
                </Typography>
              ))}
            </Stack>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 3.5, mb: 1.5 }}>
              Question palette — what the colours mean
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              {[
                ['notVisited', 'You have not visited the question yet.'],
                ['notAnswered', 'You have visited the question but not answered it.'],
                ['answered', 'You have answered the question.'],
                ['marked', 'You have not answered it, but marked it for review.'],
                ['answeredMarked', 'You have answered it and marked it for review (it will be evaluated).'],
              ].map(([k, text]) => (
                <Stack key={k} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <PaletteSymbol kind={k}>{k === 'answered' ? '3' : k === 'notAnswered' ? '1' : k === 'notVisited' ? '5' : '2'}</PaletteSymbol>
                  <Typography variant="body2">{text}</Typography>
                </Stack>
              ))}
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ width: { xs: '100%', md: 340 }, p: 3, borderRadius: 2, flexShrink: 0 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
              Candidate
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{user?.name || 'Candidate'}</Typography>
            {user?.handle && (
              <Typography variant="body2" color="text.secondary">
                @{user.handle}
              </Typography>
            )}

            <FormControlLabel
              sx={{ mt: 3, alignItems: 'flex-start', '& .MuiFormControlLabel-label': { fontSize: 14, lineHeight: 1.6, mt: 0.6 } }}
              control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />}
              label="I have read and understood the instructions, and I am ready to begin the test."
            />

            <Button fullWidth variant="contained" size="large" disableElevation disabled={!agreed || starting} onClick={begin} sx={{ mt: 2, py: 1.3, bgcolor: '#1F3A5F', '&:hover': { bgcolor: '#17304f' } }}>
              {starting ? <CircularProgress size={22} color="inherit" /> : activeTest ? 'Resume test' : 'I am ready to begin'}
            </Button>
            <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate(`/aptitude/${slug}`)}>
              Not yet — go back
            </Button>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
