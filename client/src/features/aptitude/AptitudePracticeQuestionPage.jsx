import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Link,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { aptitudeApi } from '../../api/aptitudeApi';
import { extractErrorMessage } from '../../api/apiClient';
import QuestionStimulus from './components/QuestionStimulus';
import { OPTION_LABELS, difficultyMeta, formatClock, formatDuration } from './components/aptitudeUi';

const mono = { fontFamily: '"JetBrains Mono", "Fira Code", monospace' };

function OptionRow({ index, text, state, disabled, onClick }) {
  // state: idle | selected | correct | wrong | dim
  const palette = {
    idle: { border: 'divider', bg: 'background.paper', badgeBg: 'transparent', badgeFg: 'text.primary' },
    selected: { border: 'primary.main', bg: (t) => alpha(t.palette.primary.main, 0.07), badgeBg: 'primary.main', badgeFg: 'primary.contrastText' },
    correct: { border: 'success.main', bg: (t) => alpha(t.palette.success.main, 0.1), badgeBg: 'success.main', badgeFg: '#fff' },
    wrong: { border: 'error.main', bg: (t) => alpha(t.palette.error.main, 0.1), badgeBg: 'error.main', badgeFg: '#fff' },
    dim: { border: 'divider', bg: 'background.paper', badgeBg: 'transparent', badgeFg: 'text.disabled' },
  }[state];

  return (
    <ButtonBase
      disabled={disabled}
      onClick={onClick}
      sx={{
        width: '100%',
        justifyContent: 'flex-start',
        textAlign: 'left',
        px: 1.75,
        py: 1.4,
        borderRadius: 2.5,
        border: '1.5px solid',
        borderColor: palette.border,
        bgcolor: palette.bg,
        opacity: state === 'dim' ? 0.6 : 1,
        transition: 'border-color .15s, background-color .15s',
        '&:hover': disabled ? undefined : { borderColor: 'primary.main' },
        '&.Mui-disabled': { pointerEvents: 'none' },
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: '100%' }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontSize: 13,
            fontWeight: 800,
            flexShrink: 0,
            border: '1.5px solid',
            borderColor: palette.border,
            bgcolor: palette.badgeBg,
            color: palette.badgeFg,
          }}
        >
          {OPTION_LABELS[index]}
        </Box>
        <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>{text}</Typography>
        {state === 'correct' && <CheckCircleRoundedIcon color="success" />}
        {state === 'wrong' && <CancelRoundedIcon color="error" />}
      </Stack>
    </ButtonBase>
  );
}

export default function AptitudePracticeQuestionPage() {
  const { slug, questionId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);

  const startRef = useRef(Date.now());
  const stoppedRef = useRef(false);

  // Load the question whenever the route id changes.
  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    setSelected(null);
    setResult(null);
    setElapsed(0);
    aptitudeApi
      .getPracticeQuestion(slug, questionId)
      .then(({ data: res }) => {
        if (cancelled) return;
        setData(res.data);
        setBookmarked(res.data.progress.bookmarked);
        startRef.current = Date.now();
        stoppedRef.current = false;
      })
      .catch((err) => !cancelled && setError(extractErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [slug, questionId]);

  // Count-up solve timer (stops once the answer is checked).
  useEffect(() => {
    if (!data) return undefined;
    const t = setInterval(() => {
      if (!stoppedRef.current) setElapsed((Date.now() - startRef.current) / 1000);
    }, 500);
    return () => clearInterval(t);
  }, [data]);

  const check = useCallback(async () => {
    if (selected === null || result || checking) return;
    const timeSpentSec = (Date.now() - startRef.current) / 1000;
    stoppedRef.current = true;
    setElapsed(timeSpentSec);
    setChecking(true);
    try {
      const { data: res } = await aptitudeApi.checkPracticeAnswer(slug, questionId, selected, timeSpentSec);
      setResult({ ...res.data, timeSpentSec });
      setData((d) => (d ? { ...d, progress: res.data.progress } : d));
    } catch (err) {
      stoppedRef.current = false;
      setError(extractErrorMessage(err));
    } finally {
      setChecking(false);
    }
  }, [selected, result, checking, slug, questionId]);

  const retry = useCallback(() => {
    setSelected(null);
    setResult(null);
    setElapsed(0);
    startRef.current = Date.now();
    stoppedRef.current = false;
  }, []);

  const go = useCallback((id) => id && navigate(`/aptitude/${slug}/practice/${id}`), [navigate, slug]);

  const toggleBookmark = async () => {
    const next = !bookmarked;
    setBookmarked(next);
    try {
      await aptitudeApi.bookmarkQuestion(slug, questionId, next);
    } catch {
      setBookmarked(!next);
    }
  };

  // Keyboard: 1-4 / A-D choose, Enter checks (then moves on).
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (!result && /^[1-4]$/.test(e.key)) setSelected(Number(e.key) - 1);
      else if (!result && /^[a-dA-D]$/.test(e.key)) setSelected(e.key.toLowerCase().charCodeAt(0) - 97);
      else if (e.key === 'Enter') {
        if (!result) check();
        else go(data?.nextUnsolvedId || data?.nextId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [result, check, go, data]);

  if (error && !data) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => navigate(`/aptitude/${slug}/practice`)}>Back to list</Button>}>
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

  const { question, set, position, totalInPattern, prevId, nextId, nextUnsolvedId, targetTimeSec, progress } = data;
  const dm = difficultyMeta(question.difficulty);
  const target = result?.targetTimeSec ?? targetTimeSec;
  const slow = elapsed > target;
  const onPace = result?.isCorrect && result.timeSpentSec <= target;
  const forward = nextUnsolvedId || nextId;

  const optionState = (i) => {
    if (!result) return selected === i ? 'selected' : 'idle';
    if (i === result.correctOptionIndex) return 'correct';
    if (i === selected) return 'wrong';
    return 'dim';
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2.5, md: 4 } }}>
      <Breadcrumbs sx={{ mb: 1.5, fontSize: 13 }}>
        <Link component={RouterLink} to={`/aptitude/${slug}`} underline="hover" color="text.secondary">
          Hub
        </Link>
        <Link component={RouterLink} to={`/aptitude/${slug}/practice`} underline="hover" color="text.secondary">
          Practice
        </Link>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Question {position}
        </Typography>
      </Breadcrumbs>

      {/* Header strip */}
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 2 }} useFlexGap>
        <Chip size="small" label={dm.label} sx={{ fontWeight: 800, color: dm.color, bgcolor: alpha(dm.color, 0.12) }} />
        {progress.status === 'solved' && <Chip size="small" color="success" variant="outlined" icon={<CheckCircleRoundedIcon />} label="Solved" />}
        <Typography variant="caption" color="text.secondary" sx={mono}>
          {position} / {totalInPattern}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title={`Target ${formatDuration(target)} for ${dm.label.toLowerCase()} questions`}>
          <Chip
            size="small"
            icon={<TimerOutlinedIcon />}
            label={formatClock(elapsed)}
            sx={{ ...mono, fontWeight: 800, bgcolor: slow && !result ? (t) => alpha(t.palette.warning.main, 0.16) : undefined, color: slow && !result ? 'warning.main' : undefined }}
          />
        </Tooltip>
        <Tooltip title={bookmarked ? 'Remove bookmark' : 'Bookmark'}>
          <IconButton size="small" onClick={toggleBookmark} aria-label="Bookmark">
            {bookmarked ? <StarRoundedIcon sx={{ color: 'warning.main' }} /> : <StarBorderRoundedIcon />}
          </IconButton>
        </Tooltip>
      </Stack>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <QuestionStimulus set={set} />
        <Typography sx={{ fontWeight: 600, fontSize: 18, lineHeight: 1.65, mb: 2.5, whiteSpace: 'pre-line' }}>{question.questionText}</Typography>

        <Stack spacing={1.25}>
          {question.options.map((o, i) => (
            <OptionRow key={i} index={i} text={o.text} state={optionState(i)} disabled={!!result || checking} onClick={() => setSelected(i)} />
          ))}
        </Stack>

        {!result && (
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Press 1–4 to choose, Enter to check
            </Typography>
            <Button variant="contained" disableElevation disabled={selected === null || checking} onClick={check} sx={{ minWidth: 150 }}>
              {checking ? <CircularProgress size={20} color="inherit" /> : 'Check answer'}
            </Button>
          </Stack>
        )}
      </Paper>

      {/* Result */}
      {result && (
        <Stack spacing={2} sx={{ mt: 2.5 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.25,
              borderRadius: 3,
              borderColor: result.isCorrect ? 'success.main' : 'error.main',
              bgcolor: (t) => alpha(result.isCorrect ? t.palette.success.main : t.palette.error.main, 0.07),
            }}
          >
            <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              {result.isCorrect ? <CheckCircleRoundedIcon color="success" /> : <CancelRoundedIcon color="error" />}
              <Typography sx={{ fontWeight: 800, fontSize: 17, color: result.isCorrect ? 'success.main' : 'error.main' }}>
                {result.isCorrect ? 'Correct' : 'Not quite'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDuration(result.timeSpentSec)} · target {formatDuration(result.targetTimeSec)}
                {result.isCorrect && (onPace ? ' · on pace' : ' · correct, but slower than exam pace')}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Attempt {result.progress.attempts}
                {result.progress.bestTimeSec != null && ` · best ${formatDuration(result.progress.bestTimeSec)}`}
              </Typography>
            </Stack>
          </Paper>

          {result.explanation && (
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '0.1em' }}>
                SOLUTION
              </Typography>
              <Typography sx={{ mt: 0.75, lineHeight: 1.75, whiteSpace: 'pre-line' }}>{result.explanation}</Typography>
            </Paper>
          )}

          {result.shortcut && (
            <Paper
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 3, bgcolor: (t) => alpha(t.palette.warning.main, 0.07), borderColor: (t) => alpha(t.palette.warning.main, 0.5) }}
            >
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <BoltRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'warning.main', letterSpacing: '0.1em' }}>
                  EXAM SHORTCUT
                </Typography>
              </Stack>
              <Typography sx={{ mt: 0.75, lineHeight: 1.7 }}>{result.shortcut}</Typography>
            </Paper>
          )}
        </Stack>
      )}

      {/* Navigation */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 3, pb: 6 }}>
        <Button startIcon={<ArrowBackRoundedIcon />} disabled={!prevId} onClick={() => go(prevId)}>
          Previous
        </Button>
        <Stack direction="row" spacing={1.5}>
          {result && !result.isCorrect && (
            <Button variant="outlined" startIcon={<ReplayRoundedIcon />} onClick={retry}>
              Try again
            </Button>
          )}
          {nextId && (!result || nextUnsolvedId !== nextId) && (
            <Button variant={result ? 'outlined' : 'text'} onClick={() => go(nextId)}>
              {result ? 'Next question' : 'Skip'}
            </Button>
          )}
          {forward && result && (
            <Button variant="contained" disableElevation endIcon={<ArrowForwardRoundedIcon />} onClick={() => go(forward)}>
              {nextUnsolvedId ? 'Next unsolved' : 'Next'}
            </Button>
          )}
          {!forward && result && (
            <Button variant="contained" disableElevation onClick={() => navigate(`/aptitude/${slug}`)}>
              Back to hub
            </Button>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
