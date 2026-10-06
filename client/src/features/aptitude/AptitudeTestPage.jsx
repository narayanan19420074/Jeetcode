import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
  Chip,
  CircularProgress,
} from '@mui/material';
import { selectOption, submitAttempt, resetAttempt } from './aptitudeSlice';
import ScratchPad from './ScratchPad';

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function AptitudeTestPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { attemptId, expiresAt, questions, selectedOptions, status, result } = useSelector((s) => s.aptitude);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    expiresAt ? Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000)) : 0
  );

  // Countdown is purely a UI clock — the real deadline is enforced by the
  // server via AptitudeAttempt.expiresAt, so a paused tab or clock drift
  // can't extend the test.
  useEffect(() => {
    if (status !== 'in-progress') return undefined;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (status === 'submitted' && result) {
      navigate(`/aptitude/${slug}/results`, { state: { result }, replace: true });
    }
  }, [status, result, navigate, slug]);

  const answeredCount = useMemo(
    () => Object.keys(selectedOptions).length,
    [selectedOptions]
  );

  const handleSubmit = () => {
    const answers = Object.entries(selectedOptions).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption,
    }));
    dispatch(submitAttempt({ attemptId, answers }));
  };

  if (!attemptId || questions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const question = questions[currentIdx];
  const isLow = secondsLeft <= 60;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Plain flexbox instead of MUI <Grid> — Grid's item/xs/md API differs
          between MUI v5 and v6+/Grid2 (breakpoint props vs a `size` prop),
          and getting that mismatched silently made every item stack
          full-width regardless of viewport. Flexbox with sx breakpoints
          works the same across MUI versions. */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start' }}>
        {/* Main question column */}
        <Box sx={{ flex: { md: '0 0 58%' }, width: { xs: '100%', md: 'auto' } }}>
          <Box sx={{ maxWidth: 600, mx: { xs: 0, md: 'auto' } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Question {currentIdx + 1} / {questions.length}
              </Typography>
              <Chip
                label={formatTime(secondsLeft)}
                color={isLow ? 'error' : 'default'}
                size="small"
                sx={{ fontFamily: 'monospace', fontWeight: 700 }}
              />
            </Stack>

            <LinearProgress
              variant="determinate"
              value={((currentIdx + 1) / questions.length) * 100}
              sx={{ height: 6, borderRadius: 3, mb: 3 }}
            />

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 1, mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                {question.questionText}
              </Typography>

              <RadioGroup
                value={selectedOptions[question._id] ?? ''}
                onChange={(e) =>
                  dispatch(selectOption({ questionId: question._id, optionIndex: Number(e.target.value) }))
                }
              >
                {question.options.map((opt, idx) => (
                  <FormControlLabel key={idx} value={idx} control={<Radio />} label={opt.text} sx={{ py: 0.5 }} />
                ))}
              </RadioGroup>
            </Paper>

            <Stack direction="row" spacing={1.5} justifyContent="space-between">
              <Button disabled={currentIdx === 0} onClick={() => setCurrentIdx((i) => i - 1)}>
                Previous
              </Button>

              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                {answeredCount} / {questions.length} answered
              </Typography>

              {currentIdx < questions.length - 1 ? (
                <Button variant="contained" onClick={() => setCurrentIdx((i) => i + 1)}>
                  Next
                </Button>
              ) : (
                <Button variant="contained" color="success" onClick={handleSubmit} disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Submitting…' : 'Submit Test'}
                </Button>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Calculator — right column on desktop (md+), sticky so it stays
            in view while scrolling. On xs/sm it drops below the question
            (flexDirection: column) since there's no room side-by-side. */}
        <Box sx={{ flex: { md: '0 0 38%' }, width: { xs: '100%', md: 'auto' } }}>
          <Box sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
            <ScratchPad />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
