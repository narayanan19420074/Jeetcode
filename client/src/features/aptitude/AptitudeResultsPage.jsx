import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Button,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { fetchPatterns } from './aptitudeSlice';

// ---------------------------------------------------------------------------
// KNOWN GAP (flagged to lead): this route (`/aptitude/:slug/results`) does
// not carry an attemptId, and redux state resets on a hard refresh — so
// there is currently no way to re-fetch a result after a page reload even
// though `getAttempt` exists server-side for exactly that purpose. Until the
// route carries an attemptId (e.g. `/aptitude/:slug/results/:attemptId`),
// this page can only render the result handed off via navigate() state
// (the normal post-submit flow) or a redux-cached result from the same SPA
// session. On a genuine hard refresh it falls back to an empty state.
// ---------------------------------------------------------------------------

function ScoreRing({ score, passed }) {
  const color = passed ? 'success.main' : 'error.main';
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={140}
        thickness={4}
        sx={{ color: 'action.hover' }}
      />
      <CircularProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, score))}
        size={140}
        thickness={4}
        sx={{ color, position: 'absolute', left: 0 }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>
          {Math.round(score)}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Score
        </Typography>
      </Box>
    </Box>
  );
}

function StatBlock({ label, value, color }) {
  return (
    <Box sx={{ textAlign: 'center', minWidth: 88 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'monospace', color }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

function QuestionReview({ index, answer }) {
  const question = answer.question;
  const hasQuestionDetail = question && typeof question === 'object' && question.questionText;

  if (!hasQuestionDetail) {
    // Defensive fallback — question wasn't populated on this response.
    // See "Gap 3" note in the handoff: verify aptitude.service.js
    // populates `answers.question` on submitAttempt, same as getAttempt does.
    return (
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1, mb: 1.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Question {index + 1}
          </Typography>
          {answer.isCorrect ? (
            <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Correct" />
          ) : (
            <Chip size="small" color="error" icon={<CancelIcon />} label="Incorrect" />
          )}
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1, mb: 1.5 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, flex: 1 }}>
          {index + 1}. {question.questionText}
        </Typography>
        {answer.isCorrect ? (
          <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Correct" sx={{ flexShrink: 0 }} />
        ) : (
          <Chip size="small" color="error" icon={<CancelIcon />} label="Incorrect" sx={{ flexShrink: 0 }} />
        )}
      </Stack>

      <Stack spacing={0.75} sx={{ mb: question.explanation ? 1.5 : 0 }}>
        {question.options?.map((opt, idx) => {
          const isSelected = answer.selectedOption === idx;
          const isCorrectOption = question.correctOptionIndex === idx;

          let borderColor = 'divider';
          let bg = 'transparent';
          if (isCorrectOption) {
            borderColor = 'success.main';
            bg = 'success.50';
          } else if (isSelected && !isCorrectOption) {
            borderColor = 'error.main';
            bg = 'error.50';
          }

          return (
            <Box
              key={idx}
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor,
                bgcolor: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="body2">{opt.text}</Typography>
              {isSelected && (
                <Typography variant="caption" sx={{ fontWeight: 600, color: isCorrectOption ? 'success.main' : 'error.main' }}>
                  Your answer
                </Typography>
              )}
              {!isSelected && isCorrectOption && (
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                  Correct answer
                </Typography>
              )}
            </Box>
          );
        })}
      </Stack>

      {question.explanation && (
        <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
            Explanation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {question.explanation}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default function AptitudeResultsPage() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { result: reduxResult, patterns, patternsStatus } = useSelector((s) => s.aptitude);

  // Primary source: state handed off by navigate() right after submit.
  // Fallback: whatever is still cached in redux from this SPA session.
  const result = location.state?.result ?? reduxResult;

  useEffect(() => {
    if (patternsStatus === 'idle') {
      dispatch(fetchPatterns());
    }
  }, [patternsStatus, dispatch]);

  const pattern = useMemo(
    () => patterns.find((p) => p.slug === slug),
    [patterns, slug]
  );

  const nextPattern = useMemo(() => {
    if (!pattern) return null;
    return patterns.find((p) => p.order === pattern.order + 1) ?? null;
  }, [patterns, pattern]);

  const passPercentage = pattern?.passPercentage;
  const passed = typeof passPercentage === 'number' && result ? result.score >= passPercentage : null;
  const incorrectCount = result ? result.totalCount - result.correctCount : 0;

  if (!result) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          No results to show
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This can happen after a page refresh — attempt results aren't
          reloadable from this URL yet. Head back to the pattern to try again
          or start a new attempt.
        </Typography>
        <Button variant="contained" onClick={() => navigate(`/aptitude/${slug}`)}>
          Back to Pattern
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 1, mb: 3 }}>
        <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {pattern?.title ?? 'Test'} — Results
          </Typography>

          <ScoreRing score={result.score} passed={passed ?? result.score >= 70} />

          {passed !== null && (
            <Chip
              label={passed ? 'Passed' : 'Not passed'}
              color={passed ? 'success' : 'error'}
              sx={{ fontWeight: 600 }}
            />
          )}

          <Stack direction="row" spacing={4} divider={<Divider orientation="vertical" flexItem />}>
            <StatBlock label="Correct" value={result.correctCount} color="success.main" />
            <StatBlock label="Incorrect" value={incorrectCount} color="error.main" />
            <StatBlock label="Total" value={result.totalCount} />
          </Stack>

          {passed && nextPattern && (
            <Box sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.main', borderRadius: 1, px: 2.5, py: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                🎉 {nextPattern.title} is now unlocked
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="outlined" onClick={() => navigate(`/aptitude/${slug}`)}>
              Back to Pattern
            </Button>
            <Button variant="contained" onClick={() => navigate(`/aptitude`)}>
              All Patterns
            </Button>
            {nextPattern && passed && (
              <Button variant="contained" color="success" onClick={() => navigate(`/aptitude/${nextPattern.slug}`)}>
                Start {nextPattern.title}
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        Question Review
      </Typography>

      {result.answers.map((answer, idx) => (
        <QuestionReview key={answer.question?._id ?? answer.question ?? idx} index={idx} answer={answer} />
      ))}
    </Container>
  );
}
