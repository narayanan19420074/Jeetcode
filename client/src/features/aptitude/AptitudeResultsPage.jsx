import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  LinearProgress,
  Link,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import { aptitudeApi } from '../../api/aptitudeApi';
import { extractErrorMessage } from '../../api/apiClient';
import Ring from './components/Ring';
import QuestionStimulus from './components/QuestionStimulus';
import { OPTION_LABELS, difficultyMeta, formatDuration } from './components/aptitudeUi';

const mono = { fontFamily: '"JetBrains Mono", "Fira Code", monospace' };
const TARGET = { easy: 45, medium: 90, hard: 150 };

function Stat({ label, value, color, hint }) {
  return (
    <Box sx={{ minWidth: 92 }}>
      <Typography sx={{ ...mono, fontWeight: 800, fontSize: 24, color, lineHeight: 1.1 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}

function BreakdownRow({ row, color, action }) {
  const pct = row.total ? Math.round((row.correct / row.total) * 100) : 0;
  const tone = pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color }}>
          {row.label}
        </Typography>
        <Typography variant="caption" sx={{ ...mono, color: 'text.secondary' }}>
          {row.correct}/{row.total} · {pct}%
        </Typography>
      </Stack>
      <LinearProgress variant="determinate" value={pct} sx={{ my: 0.6, height: 6, borderRadius: 3, bgcolor: alpha(tone, 0.15), '& .MuiLinearProgress-bar': { bgcolor: tone } }} />
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.disabled">
          {row.attempted < row.total ? `${row.total - row.attempted} skipped · ` : ''}avg {row.total ? formatDuration(row.timeSec / row.total) : '—'} / question
        </Typography>
        {action}
      </Stack>
    </Box>
  );
}

function ReviewItem({ index, answer, sets, slug, open, onToggle, forwardedRef }) {
  const q = answer.question;
  const skipped = answer.selectedOption === null;
  const state = answer.isCorrect ? 'correct' : skipped ? 'skipped' : 'wrong';
  const color = { correct: 'success.main', wrong: 'error.main', skipped: 'text.disabled' }[state];
  const Icon = { correct: CheckCircleRoundedIcon, wrong: CancelRoundedIcon, skipped: RemoveCircleOutlineRoundedIcon }[state];
  const dm = difficultyMeta(q?.difficulty);
  const target = TARGET[q?.difficulty] ?? 90;
  const slow = answer.timeSpentSec > target * 1.5;
  const set = q?.setId ? sets.find((s) => s.setId === q.setId) : null;

  if (!q) {
    return (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, mb: 1.25 }}>
        <Typography variant="body2" color="text.secondary">Question {index + 1} is no longer available.</Typography>
      </Paper>
    );
  }

  return (
    <Paper ref={forwardedRef} variant="outlined" sx={{ borderRadius: 2.5, mb: 1.25, overflow: 'hidden', borderColor: open ? color : 'divider' }}>
      <Stack direction="row" spacing={1.5} onClick={onToggle} sx={{ alignItems: 'center', p: 1.75, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
        <Icon sx={{ color, flexShrink: 0 }} />
        <Typography sx={{ ...mono, fontWeight: 800, width: 28, color: 'text.secondary' }}>{index + 1}</Typography>
        <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 600, display: '-webkit-box', WebkitLineClamp: open ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {q.questionText}
        </Typography>
        {answer.markedForReview && <FlagRoundedIcon sx={{ fontSize: 16, color: '#6A3FB5' }} titleAccess="Marked for review" />}
        <Typography variant="caption" sx={{ ...mono, color: slow ? 'warning.main' : 'text.secondary', flexShrink: 0 }}>
          {formatDuration(answer.timeSpentSec)}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 800, color: dm.color, width: 54, textAlign: 'right', flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
          {dm.label}
        </Typography>
        <ExpandMoreRoundedIcon sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: 'text.secondary' }} />
      </Stack>

      <Collapse in={open} unmountOnExit>
        <Box sx={{ px: 2, pb: 2.25 }}>
          <QuestionStimulus set={set} />
          <Stack spacing={0.9} sx={{ my: 1.5 }}>
            {q.options.map((o, i) => {
              const isCorrect = i === q.correctOptionIndex;
              const isPick = i === answer.selectedOption;
              const tone = isCorrect ? 'success.main' : isPick ? 'error.main' : 'divider';
              return (
                <Stack
                  key={i}
                  direction="row"
                  spacing={1.25}
                 
                  sx={{ alignItems: 'center', px: 1.5, py: 1, borderRadius: 2, border: '1.5px solid', borderColor: tone, bgcolor: (t) => (isCorrect ? alpha(t.palette.success.main, 0.1) : isPick ? alpha(t.palette.error.main, 0.1) : 'transparent') }}
                >
                  <Typography sx={{ fontWeight: 800, width: 20, color: 'text.secondary' }}>{OPTION_LABELS[i]}</Typography>
                  <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: isCorrect || isPick ? 700 : 400 }}>
                    {o.text}
                  </Typography>
                  {isPick && <Typography variant="caption" sx={{ fontWeight: 800, color: isCorrect ? 'success.main' : 'error.main' }}>Your answer</Typography>}
                  {!isPick && isCorrect && <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main' }}>Correct answer</Typography>}
                </Stack>
              );
            })}
            {skipped && <Typography variant="caption" color="text.secondary">You skipped this question.</Typography>}
          </Stack>

          {q.explanation && (
            <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: 'action.hover', mb: 1.25 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '0.08em' }}>
                SOLUTION
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {q.explanation}
              </Typography>
            </Box>
          )}
          {q.shortcut && (
            <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: (t) => alpha(t.palette.warning.main, 0.08), border: '1px solid', borderColor: (t) => alpha(t.palette.warning.main, 0.4), mb: 1.25 }}>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <BoltRoundedIcon sx={{ fontSize: 15, color: 'warning.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'warning.main', letterSpacing: '0.08em' }}>
                  EXAM SHORTCUT
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.7 }}>
                {q.shortcut}
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              You took {formatDuration(answer.timeSpentSec)} · exam pace for {dm.label.toLowerCase()} is about {formatDuration(target)}
              {slow ? ' — this one was slow' : ''}
            </Typography>
            <Button size="small" component={RouterLink} to={`/aptitude/${slug}/practice/${q._id}`}>
              Practise this question
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}

export default function AptitudeResultsPage() {
  const { slug, attemptId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [openIdx, setOpenIdx] = useState(null);
  const itemRefs = useRef({});

  useEffect(() => {
    let cancelled = false;
    setData(null);
    aptitudeApi
      .getAttempt(attemptId)
      .then(({ data: res }) => !cancelled && setData(res.data))
      .catch((err) => {
        if (cancelled) return;
        // Still in progress? Send the learner back into their paper.
        if (err.response?.status === 409) navigate(`/aptitude/${slug}/test/${attemptId}`, { replace: true });
        else setError(extractErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [attemptId, slug, navigate]);

  const result = data?.result;
  const answers = useMemo(() => (result?.answers ?? []).map((a, i) => ({ ...a, _i: i })), [result]);
  const visible = useMemo(
    () =>
      answers.filter((a) => {
        if (filter === 'correct') return a.isCorrect;
        if (filter === 'wrong') return !a.isCorrect && a.selectedOption !== null;
        if (filter === 'skipped') return a.selectedOption === null;
        if (filter === 'marked') return a.markedForReview;
        return true;
      }),
    [answers, filter]
  );

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => navigate(`/aptitude/${slug}`)}>Back</Button>}>
          {error}
        </Alert>
      </Container>
    );
  }
  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const { pattern, nextPattern } = data;
  const passed = result.passed;
  const weakest = result.bySubPattern.find((s) => s.correct / s.total < 0.75 && s.key !== 'other');
  const slowest = [...answers].filter((a) => a.question).sort((a, b) => b.timeSpentSec - a.timeSpentSec)[0];
  const avgTime = result.attemptedCount ? result.timeTakenSec / result.totalCount : null;
  const timedOut = result.status === 'expired';

  const jumpTo = (i) => {
    setFilter('all');
    setOpenIdx(i);
    setTimeout(() => itemRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  };

  const insights = [];
  if (timedOut) insights.push('Time ran out and the test was submitted automatically. Practise speed on easy and medium questions first.');
  if (result.skippedCount > 0) insights.push(`You left ${result.skippedCount} question${result.skippedCount === 1 ? '' : 's'} unanswered. With no negative marking, always make an educated guess.`);
  if (weakest) insights.push(`Weakest topic: ${weakest.label} (${weakest.correct}/${weakest.total}). Revisit its lesson, then drill the practice set.`);
  if (slowest && slowest.timeSpentSec > 0) insights.push(`Slowest question: #${slowest._i + 1}, which took ${formatDuration(slowest.timeSpentSec)}. Mark and move on when a question runs past two minutes.`);
  if (insights.length === 0) insights.push('Strong, balanced attempt. Take the test again later for a fresh set of questions.');

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Breadcrumbs sx={{ mb: 1.5, fontSize: 13 }}>
        <Link component={RouterLink} to="/aptitude" underline="hover" color="text.secondary">Aptitude</Link>
        <Link component={RouterLink} to={`/aptitude/${slug}`} underline="hover" color="text.secondary">{pattern.title}</Link>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>Test result</Typography>
      </Breadcrumbs>

      {/* Scorecard */}
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 5 }} sx={{ alignItems: { xs: 'center', md: 'center' } }}>
          <Ring value={result.score} size={156} thickness={4} color={passed ? 'success.main' : 'error.main'} label={`${Math.round(result.score)}%`} sublabel="score" />
          <Box sx={{ flexGrow: 1, width: '100%' }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {passed ? 'You passed' : 'Not passed yet'}
              </Typography>
              <Chip size="small" color={passed ? 'success' : 'error'} label={`Pass mark ${pattern.passPercentage}%`} />
              {result.percentile != null && <Chip size="small" variant="outlined" label={`Better than ${result.percentile}% of test takers`} />}
              {timedOut && <Chip size="small" color="warning" label="Auto-submitted" />}
            </Stack>
            <Typography color="text.secondary" sx={{ mb: 2.5 }}>
              {result.correctCount} of {result.totalCount} correct in {formatDuration(result.timeTakenSec)}
              {result.durationSec ? ` of ${formatDuration(result.durationSec)}` : ''}.
              {passed && nextPattern ? ` ${nextPattern.title} is now unlocked.` : ''}
            </Typography>
            <Stack direction="row" spacing={{ xs: 2.5, sm: 4 }} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Stat label="Correct" value={result.correctCount} color="success.main" />
              <Stat label="Incorrect" value={result.incorrectCount} color="error.main" />
              <Stat label="Skipped" value={result.skippedCount} color="text.secondary" />
              <Stat label="Accuracy" value={`${result.accuracy}%`} hint="of attempted" />
              <Stat label="Avg / question" value={avgTime != null ? formatDuration(avgTime) : '—'} />
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.25} useFlexGap sx={{ flexWrap: 'wrap', mt: 3 }}>
          <Button variant="contained" disableElevation onClick={() => navigate(`/aptitude/${slug}/test`)}>
            Retake test
          </Button>
          <Button variant="outlined" onClick={() => navigate(`/aptitude/${slug}/practice${weakest ? `?subPattern=${weakest.key}` : ''}`)}>
            {weakest ? 'Practise weakest topic' : 'Practise'}
          </Button>
          <Button onClick={() => navigate(`/aptitude/${slug}`)}>Back to hub</Button>
          {passed && nextPattern && (
            <Button color="success" variant="contained" disableElevation onClick={() => navigate(`/aptitude/${nextPattern.slug}`)}>
              Start {nextPattern.title}
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Breakdown */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'stretch', mb: 3 }}>
        <Paper variant="outlined" sx={{ flex: 1.4, p: 2.5, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
            By topic <Typography component="span" variant="caption" color="text.secondary">(weakest first)</Typography>
          </Typography>
          <Stack spacing={2}>
            {result.bySubPattern.map((r) => (
              <BreakdownRow
                key={r.key}
                row={r}
                action={
                  r.key !== 'other' && r.correct < r.total ? (
                    <Link component={RouterLink} to={`/aptitude/${slug}/practice?subPattern=${r.key}`} underline="hover" variant="caption" sx={{ fontWeight: 700 }}>
                      Practise
                    </Link>
                  ) : null
                }
              />
            ))}
          </Stack>
        </Paper>

        <Stack spacing={3} sx={{ flex: 1 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              By difficulty
            </Typography>
            <Stack spacing={2}>
              {result.byDifficulty.map((r) => (
                <BreakdownRow key={r.key} row={r} color={difficultyMeta(r.key).color} />
              ))}
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: (t) => alpha(t.palette.primary.main, 0.04) }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              What to do next
            </Typography>
            <Stack spacing={1}>
              {insights.map((t) => (
                <Typography key={t} variant="body2" sx={{ lineHeight: 1.65 }}>
                  • {t}
                </Typography>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Stack>

      {/* Question map */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', mb: 1.5 }} useFlexGap>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Question map
          </Typography>
          <Stack direction="row" spacing={2}>
            {[['Correct', '#10B981'], ['Incorrect', '#EF4444'], ['Skipped', '#94A3B8']].map(([l, c]) => (
              <Stack key={l} direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: c }} />
                <Typography variant="caption" color="text.secondary">{l}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.9 }}>
          {answers.map((a) => {
            const c = a.isCorrect ? '#10B981' : a.selectedOption === null ? '#94A3B8' : '#EF4444';
            return (
              <Box
                key={a._i}
                onClick={() => jumpTo(a._i)}
                role="button"
                title={`Q${a._i + 1} · ${formatDuration(a.timeSpentSec)}`}
                sx={{ width: 34, height: 34, borderRadius: 1.5, display: 'grid', placeItems: 'center', bgcolor: c, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', '&:hover': { filter: 'brightness(0.9)' } }}
              >
                {a._i + 1}
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Review */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Review answers
        </Typography>
        <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, v) => v && setFilter(v)}>
          {[['all', 'All'], ['wrong', 'Incorrect'], ['skipped', 'Skipped'], ['correct', 'Correct'], ['marked', 'Marked']].map(([v, l]) => (
            <ToggleButton key={v} value={v} sx={{ textTransform: 'none', px: 1.5, fontWeight: 700 }}>
              {l}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {visible.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          Nothing in this filter.
        </Typography>
      )}
      {visible.map((a) => (
        <ReviewItem
          key={a._i}
          index={a._i}
          answer={a}
          sets={result.sets}
          slug={slug}
          open={openIdx === a._i}
          onToggle={() => setOpenIdx(openIdx === a._i ? null : a._i)}
          forwardedRef={(el) => {
            itemRefs.current[a._i] = el;
          }}
        />
      ))}
      <Box sx={{ height: 48 }} />
    </Container>
  );
}
