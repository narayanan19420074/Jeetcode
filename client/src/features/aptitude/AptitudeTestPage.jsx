import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  Paper,
  Radio,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  ThemeProvider,
} from '@mui/material';
import { getTheme } from '../../theme/theme';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded';
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { aptitudeApi } from '../../api/aptitudeApi';
import { extractErrorMessage } from '../../api/apiClient';
import ScratchPad from './ScratchPad';
import QuestionStimulus from './components/QuestionStimulus';
import { PaletteSymbol } from './AptitudeTestInstructionsPage';
import { OPTION_LABELS, PALETTE, formatClock } from './components/aptitudeUi';

// TCS iON-style exam interface. Everything the learner does is autosaved to
// the server (answers, review flags, per-question time), the countdown is
// derived from the SERVER clock + expiresAt, and a refresh resumes the paper.

const NAVY = '#1F3A5F';
const mono = { fontFamily: '"JetBrains Mono", "Fira Code", monospace' };

const emptyState = () => ({ selected: null, marked: false, visited: false, time: 0 });

function statusOf(st) {
  const answered = st.selected !== null;
  if (!st.visited) return 'notVisited';
  if (answered && st.marked) return 'answeredMarked';
  if (answered) return 'answered';
  if (st.marked) return 'marked';
  return 'notAnswered';
}

/* ---------------------------------------------------------------- */
/* Palette panel                                                     */
/* ---------------------------------------------------------------- */
function PalettePanel({ user, questions, states, idx, counts, onJump, onSubmit, submitting }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ width: 44, height: 44, borderRadius: 1, bgcolor: 'action.hover', display: 'grid', placeItems: 'center', fontWeight: 800, color: NAVY, fontSize: 18 }}>
          {(user?.name || 'C').charAt(0).toUpperCase()}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }} noWrap>
            {user?.name || 'Candidate'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Candidate
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        {['answered', 'notAnswered', 'notVisited', 'marked', 'answeredMarked'].map((k) => (
          <Stack key={k} direction="row" spacing={1} sx={{ alignItems: 'center', gridColumn: k === 'answeredMarked' ? '1 / -1' : undefined }}>
            <PaletteSymbol kind={k} size={26}>
              {counts[k]}
            </PaletteSymbol>
            <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
              {PALETTE[k].label}
            </Typography>
          </Stack>
        ))}
      </Box>

      <Box sx={{ px: 1.5, py: 1, bgcolor: NAVY, color: '#fff' }}>
        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.06em' }}>
          QUESTION PALETTE
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1.1 }}>
          {questions.map((q, i) => {
            const kind = statusOf(states[q._id] ?? emptyState());
            const current = i === idx;
            return (
              <Box
                key={q._id}
                onClick={() => onJump(i)}
                role="button"
                aria-label={`Question ${i + 1}: ${PALETTE[kind].label}`}
                sx={{
                  cursor: 'pointer',
                  justifySelf: 'center',
                  borderRadius: 1,
                  outline: current ? '2.5px solid #2563EB' : '2.5px solid transparent',
                  outlineOffset: 2,
                  '&:hover': { filter: 'brightness(0.93)' },
                }}
              >
                <PaletteSymbol kind={kind} size={36}>
                  {i + 1}
                </PaletteSymbol>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button fullWidth variant="contained" disableElevation onClick={onSubmit} disabled={submitting} sx={{ py: 1.1, bgcolor: '#2E9E4F', '&:hover': { bgcolor: '#26853f' } }}>
          {submitting ? <CircularProgress size={20} color="inherit" /> : 'Submit Test'}
        </Button>
      </Box>
    </Box>
  );
}

/* ---------------------------------------------------------------- */
/* Page                                                              */
/* ---------------------------------------------------------------- */
function ExamInterface() {
  const { slug, attemptId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const compact = useMediaQuery('(max-width:1000px)');

  const [paper, setPaper] = useState(null); // { questions, sets }
  const [states, setStates] = useState({});
  const [idx, setIdx] = useState(0);
  const [error, setError] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [saveState, setSaveState] = useState('saved'); // saved | saving | error
  const [calcOpen, setCalcOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFull, setIsFull] = useState(false);

  const statesRef = useRef({});
  const dirtyRef = useRef(new Set());
  const enterRef = useRef(Date.now());
  const idxRef = useRef(0);
  const deadlineRef = useRef(null); // ms epoch on the *client* clock, corrected by server offset
  const submittedRef = useRef(false);
  const saveTimer = useRef(null);
  const savingRef = useRef(false);

  const questions = paper?.questions;
  const setsById = useMemo(() => Object.fromEntries((paper?.sets ?? []).map((s) => [s.setId, s])), [paper]);

  const goResults = useCallback(() => navigate(`/aptitude/${slug}/results/${attemptId}`, { replace: true }), [navigate, slug, attemptId]);

  /* ---------- load / resume ---------- */
  useEffect(() => {
    let cancelled = false;
    aptitudeApi
      .getAttemptQuestions(attemptId)
      .then(({ data }) => {
        if (cancelled) return;
        const d = data.data;
        if (d.status !== 'in-progress' || !d.questions?.length) {
          goResults();
          return;
        }
        const init = {};
        d.questions.forEach((q) => {
          const s = d.state?.[q._id];
          init[q._id] = s
            ? { selected: s.selectedOption, marked: !!s.markedForReview, visited: !!s.visited, time: s.timeSpentSec || 0 }
            : emptyState();
        });
        // Resume on the first question not yet answered.
        const firstOpen = Math.max(0, d.questions.findIndex((q) => init[q._id].selected === null));
        init[d.questions[firstOpen]._id].visited = true;
        dirtyRef.current.add(d.questions[firstOpen]._id);

        const offset = new Date(d.serverNow).getTime() - Date.now();
        deadlineRef.current = new Date(d.expiresAt).getTime() - offset;
        statesRef.current = init;
        idxRef.current = firstOpen;
        enterRef.current = Date.now();
        setStates(init);
        setIdx(firstOpen);
        setPaper({ questions: d.questions, sets: d.sets });
        setRemaining(Math.max(0, (deadlineRef.current - Date.now()) / 1000));
      })
      .catch((err) => !cancelled && setError(extractErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [attemptId, goResults]);

  /* ---------- state mutation helpers ---------- */
  const currentTime = useCallback((qid) => {
    const base = statesRef.current[qid]?.time ?? 0;
    const q = questions?.[idxRef.current];
    return q && q._id === qid ? base + (Date.now() - enterRef.current) / 1000 : base;
  }, [questions]);

  const mutate = useCallback((qid, patch) => {
    const next = { ...statesRef.current, [qid]: { ...statesRef.current[qid], ...patch } };
    statesRef.current = next;
    dirtyRef.current.add(qid);
    setStates(next);
  }, []);

  const buildUpdates = useCallback(
    (all = false) => {
      if (!questions) return [];
      const ids = all ? questions.map((q) => q._id) : [...dirtyRef.current];
      const cur = questions[idxRef.current]?._id;
      if (cur && !ids.includes(cur)) ids.push(cur);
      return ids.map((id) => {
        const s = statesRef.current[id] ?? emptyState();
        return { questionId: id, selectedOption: s.selected, markedForReview: s.marked, visited: s.visited, timeSpentSec: Math.round(currentTime(id)) };
      });
    },
    [questions, currentTime]
  );

  /* ---------- autosave ---------- */
  const flush = useCallback(async () => {
    if (submittedRef.current || savingRef.current || !questions) return;
    const updates = buildUpdates(false);
    if (updates.length === 0) return;
    savingRef.current = true;
    setSaveState('saving');
    try {
      const { data } = await aptitudeApi.saveAttempt(attemptId, updates);
      if (data.data.expired) {
        submittedRef.current = true;
        goResults();
        return;
      }
      updates.forEach((u) => dirtyRef.current.delete(u.questionId));
      setSaveState('saved');
    } catch (err) {
      if (err.response?.status === 409) {
        submittedRef.current = true;
        goResults();
        return;
      }
      setSaveState('error');
    } finally {
      savingRef.current = false;
    }
  }, [attemptId, buildUpdates, goResults, questions]);

  const scheduleSave = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, 700);
  }, [flush]);

  useEffect(() => {
    if (!questions) return undefined;
    const iv = setInterval(flush, 15000);
    const onHide = () => document.visibilityState === 'hidden' && flush();
    document.addEventListener('visibilitychange', onHide);
    return () => {
      clearInterval(iv);
      clearTimeout(saveTimer.current);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [questions, flush]);

  // Warn before closing the tab mid-test.
  useEffect(() => {
    if (!questions) return undefined;
    const warn = (e) => {
      if (submittedRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [questions]);

  /* ---------- submit ---------- */
  const submit = useCallback(async () => {
    if (submittedRef.current || !questions) return;
    submittedRef.current = true;
    setSubmitting(true);
    setConfirmOpen(false);
    clearTimeout(saveTimer.current);
    try {
      await aptitudeApi.submitAttempt(attemptId, buildUpdates(true));
      goResults();
    } catch (err) {
      if (err.response?.status === 409) {
        goResults();
        return;
      }
      submittedRef.current = false;
      setSubmitting(false);
      setError(extractErrorMessage(err));
    }
  }, [attemptId, buildUpdates, goResults, questions]);

  /* ---------- countdown from server-corrected deadline ---------- */
  useEffect(() => {
    if (!questions) return undefined;
    const t = setInterval(() => {
      const left = Math.max(0, (deadlineRef.current - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0 && !submittedRef.current) submit();
    }, 250);
    return () => clearInterval(t);
  }, [questions, submit]);

  /* ---------- navigation ---------- */
  const goTo = useCallback(
    (nextIdx) => {
      if (!questions || nextIdx < 0 || nextIdx >= questions.length) return;
      const leaving = questions[idxRef.current]._id;
      const spent = (Date.now() - enterRef.current) / 1000;
      const arriving = questions[nextIdx]._id;

      const next = {
        ...statesRef.current,
        [leaving]: { ...statesRef.current[leaving], time: (statesRef.current[leaving]?.time ?? 0) + spent },
        [arriving]: { ...statesRef.current[arriving], visited: true },
      };
      statesRef.current = next;
      dirtyRef.current.add(leaving);
      dirtyRef.current.add(arriving);
      enterRef.current = Date.now();
      idxRef.current = nextIdx;
      setStates(next);
      setIdx(nextIdx);
      setPaletteOpen(false);
      scheduleSave();
    },
    [questions, scheduleSave]
  );

  const current = questions?.[idx];
  const cur = current ? states[current._id] ?? emptyState() : emptyState();

  const select = useCallback(
    (i) => {
      if (!current) return;
      mutate(current._id, { selected: i, visited: true });
      scheduleSave();
    },
    [current, mutate, scheduleSave]
  );

  const clearResponse = () => {
    mutate(current._id, { selected: null });
    scheduleSave();
  };
  const saveNext = () => {
    mutate(current._id, { visited: true });
    goTo(idx + 1);
  };
  const markNext = () => {
    mutate(current._id, { marked: true, visited: true });
    if (idx < questions.length - 1) goTo(idx + 1);
    else scheduleSave();
  };
  const unmark = () => {
    mutate(current._id, { marked: false });
    scheduleSave();
  };

  // 1–4 / A–D choose an option (disabled while the calculator is open so the
  // calculator's own number keys don't change answers).
  useEffect(() => {
    const onKey = (e) => {
      if (calcOpen || confirmOpen || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[1-4]$/.test(e.key)) select(Number(e.key) - 1);
      else if (/^[a-dA-D]$/.test(e.key)) select(e.key.toLowerCase().charCodeAt(0) - 97);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [calcOpen, confirmOpen, select]);

  useEffect(() => {
    const onFs = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);
  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const counts = useMemo(() => {
    const c = { notVisited: 0, notAnswered: 0, answered: 0, marked: 0, answeredMarked: 0 };
    (questions ?? []).forEach((q) => {
      c[statusOf(states[q._id] ?? emptyState())] += 1;
    });
    return c;
  }, [questions, states]);

  /* ---------- render ---------- */
  if (error && !paper) {
    return (
      <Box sx={{ p: 4, maxWidth: 520, mx: 'auto' }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => navigate(`/aptitude/${slug}`)}>Back</Button>}>
          {error}
        </Alert>
      </Box>
    );
  }
  if (!paper || !current) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const low = remaining != null && remaining <= 300;
  const palette = (
    <PalettePanel
      user={user}
      questions={questions}
      states={states}
      idx={idx}
      counts={counts}
      onJump={goTo}
      onSubmit={() => setConfirmOpen(true)}
      submitting={submitting}
    />
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#EEF1F5', color: 'text.primary' }}>
      {/* Header */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', bgcolor: NAVY, color: '#fff', px: { xs: 1.5, sm: 2.5 }, height: 56, flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 900, letterSpacing: '-0.01em', fontSize: 18 }}>JeetCode</Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, display: { xs: 'none', sm: 'block' } }}>
          Aptitude Test
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', opacity: 0.85, display: { xs: 'none', md: 'flex' }, mr: 1 }}>
          {saveState === 'error' ? <CloudOffRoundedIcon sx={{ fontSize: 18, color: '#FCA5A5' }} /> : <CloudDoneRoundedIcon sx={{ fontSize: 18 }} />}
          <Typography variant="caption">{saveState === 'saving' ? 'Saving…' : saveState === 'error' ? 'Offline — retrying' : 'All changes saved'}</Typography>
        </Stack>
        <Tooltip title="Calculator">
          <IconButton onClick={() => setCalcOpen((v) => !v)} sx={{ color: '#fff', bgcolor: calcOpen ? 'rgba(255,255,255,0.18)' : 'transparent' }}>
            <CalculateRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={isFull ? 'Exit full screen' : 'Full screen'}>
          <IconButton onClick={toggleFull} sx={{ color: '#fff', display: { xs: 'none', sm: 'inline-flex' } }}>
            {isFull ? <FullscreenExitRoundedIcon /> : <FullscreenRoundedIcon />}
          </IconButton>
        </Tooltip>
        {compact && (
          <IconButton onClick={() => setPaletteOpen(true)} sx={{ color: '#fff' }} aria-label="Question palette">
            <GridViewRoundedIcon />
          </IconButton>
        )}
        <Box sx={{ px: 1.5, py: 0.6, borderRadius: 1, bgcolor: low ? '#B91C1C' : 'rgba(255,255,255,0.14)', transition: 'background-color .3s' }}>
          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', lineHeight: 1, fontSize: 10 }}>
            TIME LEFT
          </Typography>
          <Typography sx={{ ...mono, fontWeight: 800, fontSize: 19, lineHeight: 1.15 }} aria-live="off">
            {formatClock(remaining ?? 0)}
          </Typography>
        </Box>
      </Stack>

      {/* Section strip */}
      <Stack direction="row" sx={{ alignItems: 'center', bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider', px: { xs: 1.5, sm: 2.5 }, height: 40, flexShrink: 0 }}>
        <Box sx={{ px: 1.5, py: 0.4, bgcolor: '#2563EB', color: '#fff', borderRadius: 0.75, fontWeight: 700, fontSize: 13 }}>Quantitative Aptitude</Box>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
          {questions.length} questions · +1 for correct · no negative marking
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      {/* Body */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Question column */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff', px: { xs: 1.5, sm: 2.5 }, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontWeight: 800, fontSize: 17 }}>Question No. {idx + 1}</Typography>
            <Typography variant="caption" color="text.secondary">
              Marks: <b style={{ color: '#2E9E4F' }}>+1</b> / <b style={{ color: '#E53935' }}>−0</b>
            </Typography>
          </Stack>

          <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#fff', px: { xs: 1.5, sm: 2.5 }, py: 2.5 }}>
            <Box sx={{ maxWidth: 820 }}>
              <QuestionStimulus set={current.setId ? setsById[current.setId] : null} />
              <Typography sx={{ fontSize: 18, lineHeight: 1.7, fontWeight: 500, mb: 3, whiteSpace: 'pre-line' }}>{current.questionText}</Typography>

              <Stack spacing={1}>
                {current.options.map((o, i) => {
                  const on = cur.selected === i;
                  return (
                    <Box
                      key={i}
                      onClick={() => select(i)}
                      role="radio"
                      aria-checked={on}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1,
                        py: 0.9,
                        border: '1px solid',
                        borderColor: on ? '#2563EB' : 'divider',
                        bgcolor: on ? 'rgba(37,99,235,0.07)' : 'transparent',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: on ? 'rgba(37,99,235,0.07)' : 'action.hover' },
                      }}
                    >
                      <Radio checked={on} tabIndex={-1} size="small" sx={{ p: 0.75 }} />
                      <Typography sx={{ fontWeight: 700, color: 'text.secondary', width: 22 }}>{OPTION_LABELS[i]}.</Typography>
                      <Typography sx={{ fontSize: 16.5 }}>{o.text}</Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Box>

          {/* Action bar */}
          <Stack
            direction="row"
           
            spacing={1}
           
            useFlexGap
            sx={{ alignItems: 'center', flexWrap: 'wrap', bgcolor: '#F8FAFC', borderTop: '1px solid', borderColor: 'divider', px: { xs: 1.5, sm: 2.5 }, py: 1.25 }}
          >
            {cur.marked ? (
              <Button variant="outlined" size="small" onClick={unmark} sx={{ borderColor: PALETTE.marked.bg, color: PALETTE.marked.bg }}>
                Unmark review
              </Button>
            ) : (
              <Button variant="outlined" size="small" onClick={markNext} sx={{ borderColor: PALETTE.marked.bg, color: PALETTE.marked.bg, '&:hover': { borderColor: PALETTE.marked.bg, bgcolor: 'rgba(106,63,181,0.08)' } }}>
                Mark for Review &amp; Next
              </Button>
            )}
            <Button variant="outlined" size="small" color="inherit" onClick={clearResponse} disabled={cur.selected === null}>
              Clear Response
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button size="small" color="inherit" disabled={idx === 0} onClick={() => goTo(idx - 1)}>
              ‹ Back
            </Button>
            <Button size="small" color="inherit" disabled={idx === questions.length - 1} onClick={() => goTo(idx + 1)}>
              Next ›
            </Button>
            <Button variant="contained" disableElevation onClick={saveNext} sx={{ bgcolor: '#2563EB', px: 3, fontWeight: 800 }}>
              {idx === questions.length - 1 ? 'Save' : 'Save & Next'}
            </Button>
          </Stack>
        </Box>

        {/* Palette column (desktop) */}
        {!compact && <Box sx={{ width: 320, flexShrink: 0, borderLeft: '1px solid', borderColor: 'divider' }}>{palette}</Box>}
      </Box>

      {/* Palette drawer (small screens) */}
      <Drawer anchor="right" open={compact && paletteOpen} onClose={() => setPaletteOpen(false)} PaperProps={{ sx: { width: 'min(340px, 92vw)' } }}>
        {palette}
      </Drawer>

      {/* Calculator */}
      {calcOpen && (
        <Paper elevation={8} sx={{ position: 'fixed', top: 104, right: compact ? 12 : 336, width: 300, zIndex: (t) => t.zIndex.modal - 1, borderRadius: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', bgcolor: NAVY, color: '#fff', px: 1.5, py: 0.5, borderRadius: '4px 4px 0 0' }}>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              Calculator
            </Typography>
            <IconButton size="small" onClick={() => setCalcOpen(false)} sx={{ color: '#fff' }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
          <ScratchPad />
        </Paper>
      )}

      {/* Submit summary */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Test summary</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableBody>
              {[
                ['Total questions', questions.length, null],
                ['Answered', counts.answered + counts.answeredMarked, 'answered'],
                ['Not answered', counts.notAnswered, 'notAnswered'],
                ['Marked for review', counts.marked + counts.answeredMarked, 'marked'],
                ['Not visited', counts.notVisited, 'notVisited'],
              ].map(([label, value, kind]) => (
                <TableRow key={label}>
                  <TableCell sx={{ border: 0, py: 0.75 }}>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                      {kind ? <PaletteSymbol kind={kind} size={18} /> : <Box sx={{ width: 18 }} />}
                      <span>{label}</span>
                    </Stack>
                  </TableCell>
                  <TableCell align="right" sx={{ border: 0, py: 0.75, ...mono, fontWeight: 800 }}>
                    {value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            You still have {formatClock(remaining ?? 0)} left. Once you submit, you cannot change your answers.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>Go back</Button>
          <Button variant="contained" disableElevation onClick={submit} sx={{ bgcolor: '#2E9E4F', '&:hover': { bgcolor: '#26853f' } }}>
            Submit test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// The exam always renders in the light "exam hall" theme, whatever mode the
// rest of the app is in — fixed colours (white paper, navy header) must stay
// legible, exactly like the real iON screen.
const examTheme = getTheme('light');

export default function AptitudeTestPage() {
  return (
    <ThemeProvider theme={examTheme}>
      <ExamInterface />
    </ThemeProvider>
  );
}
