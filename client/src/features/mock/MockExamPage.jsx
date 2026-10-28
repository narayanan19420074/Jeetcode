import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, IconButton, Radio, Typography, useMediaQuery } from '@mui/material';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import { mockApi } from '../../api/mockApi';
import { extractErrorMessage } from '../../api/apiClient';
import { OPTION_LABELS, PALETTE, formatClock } from '../aptitude/components/aptitudeUi';

// Full mock paper. Sections run on their own SERVER clocks (sectionEndsAt),
// answers autosave, a refresh resumes, and a locked section never reopens.

const NAVY = '#1F3A5F';
const mono = { fontFamily: '"JetBrains Mono", "Fira Code", monospace' };
const blank = () => ({ selected: null, marked: false, visited: false, time: 0 });

function statusOf(st) {
  const answered = st.selected !== null;
  if (!st.visited) return 'notVisited';
  if (answered && st.marked) return 'answeredMarked';
  if (answered) return 'answered';
  if (st.marked) return 'marked';
  return 'notAnswered';
}

function Palette({ questions, state, cur, onJump }) {
  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.75 }}>
        {questions.map((q, i) => {
          const p = PALETTE[statusOf(state[q._id] || blank())];
          return (
            <Box key={q._id} component="button" type="button" onClick={() => onJump(i)} aria-label={`Question ${i + 1}: ${p.label}`}
              sx={{ height: 38, borderRadius: '8px', border: i === cur ? `2px solid ${NAVY}` : '2px solid transparent', bgcolor: p.bg, color: p.fg, fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              {i + 1}
            </Box>
          );
        })}
      </Box>
      <Box sx={{ mt: 1.5, display: 'grid', gap: 0.5 }}>
        {['answered', 'notAnswered', 'notVisited', 'marked'].map((k) => (
          <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 14, height: 14, borderRadius: '4px', bgcolor: PALETTE[k].bg }} />
            <Typography variant="caption">{PALETTE[k].label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function MockExamPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:899px)');

  const [paper, setPaper] = useState(null);
  const [state, setState] = useState({});
  const [cur, setCur] = useState(0);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const skewRef = useRef(0); // serverNow - Date.now()
  const enteredRef = useRef(Date.now());
  const stateRef = useRef({});
  const dirtyRef = useRef(false);
  const autoRef = useRef(false);
  const sectionRef = useRef(-1);

  const questions = paper?.questions ?? [];
  const current = questions[cur];

  const load = useCallback(async () => {
    try {
      const { data } = await mockApi.getPaper(attemptId);
      const d = data.data;
      if (d.finished) return navigate(`/mocks/result/${attemptId}`, { replace: true });
      skewRef.current = new Date(d.serverNow).getTime() - Date.now();
      const next = {};
      d.questions.forEach((q) => { next[q._id] = { ...blank(), ...(d.state[q._id] || {}) }; });
      if (d.questions[0]) next[d.questions[0]._id].visited = true;
      stateRef.current = next;
      setState(next);
      setPaper(d);
      setCur(0);
      enteredRef.current = Date.now();
      autoRef.current = false;
      sectionRef.current = d.currentSection;
    } catch (e) {
      setError(extractErrorMessage(e));
    }
  }, [attemptId, navigate]);

  useEffect(() => { load(); }, [load]);

  // Add the time spent on the question we are leaving.
  const commitTime = useCallback(() => {
    const q = questions[cur];
    if (!q) return;
    const add = (Date.now() - enteredRef.current) / 1000;
    enteredRef.current = Date.now();
    const st = stateRef.current[q._id] || blank();
    stateRef.current = { ...stateRef.current, [q._id]: { ...st, time: st.time + add } };
  }, [questions, cur]);

  const buildUpdates = useCallback(() => questions.map((q) => {
    const st = stateRef.current[q._id] || blank();
    return { questionId: q._id, selectedOption: st.selected, markedForReview: st.marked, visited: st.visited, timeSpentSec: Math.round(st.time) };
  }), [questions]);

  const patch = (qid, fn) => {
    const next = { ...stateRef.current, [qid]: fn(stateRef.current[qid] || blank()) };
    stateRef.current = next;
    dirtyRef.current = true;
    setState(next);
  };

  const flush = useCallback(async () => {
    if (!paper || !dirtyRef.current) return;
    commitTime();
    dirtyRef.current = false;
    try {
      const { data } = await mockApi.save(attemptId, buildUpdates());
      if (data.data.finished) navigate(`/mocks/result/${attemptId}`, { replace: true });
      else if (data.data.moved) load();
    } catch { dirtyRef.current = true; }
  }, [paper, attemptId, buildUpdates, commitTime, navigate, load]);

  // Autosave every 8s.
  useEffect(() => {
    const t = setInterval(flush, 8000);
    return () => clearInterval(t);
  }, [flush]);

  const goTo = (i) => {
    if (!questions[i]) return;
    commitTime();
    setCur(i);
    patch(questions[i]._id, (s) => ({ ...s, visited: true }));
    enteredRef.current = Date.now();
    flush();
    setPaletteOpen(false);
  };

  const finishSection = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    commitTime();
    const isLast = paper && paper.currentSection >= paper.sections.length - 1;
    try {
      if (isLast) {
        await mockApi.submit(attemptId, buildUpdates());
        navigate(`/mocks/result/${attemptId}`, { replace: true });
      } else {
        const { data } = await mockApi.submitSection(attemptId, buildUpdates());
        setConfirm(false);
        if (data.data.finished) navigate(`/mocks/result/${attemptId}`, { replace: true });
        else await load();
      }
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }, [busy, paper, attemptId, buildUpdates, commitTime, navigate, load]);

  // Section countdown from the SERVER deadline; auto-submit at zero.
  useEffect(() => {
    if (!paper) return undefined;
    const end = new Date(paper.sectionEndsAt).getTime();
    const tick = () => {
      const left = Math.max(0, Math.round((end - (Date.now() + skewRef.current)) / 1000));
      setRemaining(left);
      if (left === 0 && !autoRef.current) {
        autoRef.current = true;
        finishSection();
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [paper, finishSection]);

  // Warn before leaving mid-paper.
  useEffect(() => {
    const h = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, []);

  const counts = useMemo(() => {
    const c = { answered: 0, notAnswered: 0, marked: 0, notVisited: 0 };
    questions.forEach((q) => {
      const st = state[q._id] || blank();
      if (st.selected !== null) c.answered += 1; else if (st.visited) c.notAnswered += 1; else c.notVisited += 1;
      if (st.marked) c.marked += 1;
    });
    return c;
  }, [questions, state]);

  if (error && !paper) {
    return (
      <Box sx={{ p: 3, maxWidth: 480, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button onClick={() => navigate('/mocks')}>Back to mock tests</Button>
      </Box>
    );
  }
  if (!paper || !current) return <Box sx={{ display: 'grid', placeItems: 'center', height: '100vh' }}><CircularProgress /></Box>;

  const st = state[current._id] || blank();
  const isLast = paper.currentSection >= paper.sections.length - 1;
  const low = remaining !== null && remaining <= 60;

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* top bar */}
      <Box sx={{ bgcolor: NAVY, color: '#fff', px: { xs: 1.5, md: 3 }, py: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 800, fontSize: { xs: 13, md: 15 } }}>{paper.paperTitle}</Typography>
          <Box sx={{ display: 'flex', gap: 0.75, mt: 0.25, overflowX: 'auto' }}>
            {paper.sections.map((s, i) => (
              <Box key={s.key} sx={{ px: 1, py: 0.1, borderRadius: 99, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', bgcolor: i === paper.currentSection ? '#fff' : 'rgba(255,255,255,0.15)', color: i === paper.currentSection ? NAVY : 'rgba(255,255,255,0.75)' }}>
                {i < paper.currentSection ? '✓ ' : ''}{s.title}
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ ...mono, fontWeight: 800, fontSize: { xs: 18, md: 22 }, lineHeight: 1, color: low ? '#FCA5A5' : '#fff' }}>{formatClock(remaining ?? 0)}</Typography>
          <Typography sx={{ fontSize: 10, opacity: 0.8 }}>section time left</Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setPaletteOpen(true)} aria-label="Question palette" sx={{ color: '#fff' }}><GridViewRoundedIcon /></IconButton>
        )}
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {/* question */}
        <Box sx={{ flex: 1, minWidth: 0, overflowY: 'auto', p: { xs: 2, md: 3 } }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
            Question {cur + 1} of {questions.length}
          </Typography>
          <Typography sx={{ fontSize: { xs: 16, md: 18 }, lineHeight: 1.7, fontWeight: 500, my: 1.5, whiteSpace: 'pre-line' }}>{current.questionText}</Typography>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {current.options.map((o, i) => {
              const on = st.selected === i;
              return (
                <Box key={i} role="radio" aria-checked={on} tabIndex={0}
                  onClick={() => patch(current._id, (s) => ({ ...s, selected: i, visited: true }))}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && patch(current._id, (s) => ({ ...s, selected: i, visited: true }))}
                  sx={(t) => ({ display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: 1, borderRadius: '10px', cursor: 'pointer', border: `1.5px solid ${on ? NAVY : t.palette.divider}`, bgcolor: on ? 'rgba(31,58,95,0.08)' : 'background.paper' })}>
                  <Radio checked={on} size="small" tabIndex={-1} sx={{ p: 0.5 }} />
                  <Typography sx={{ fontWeight: 700, color: 'text.secondary', width: 22 }}>{OPTION_LABELS[i]}.</Typography>
                  <Typography sx={{ flex: 1 }}>{o.text}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* desktop palette */}
        {!isMobile && (
          <Box sx={(t) => ({ width: 260, flexShrink: 0, borderLeft: `1px solid ${t.palette.divider}`, p: 2, overflowY: 'auto' })}>
            <Typography sx={{ fontWeight: 800, mb: 1 }}>Palette</Typography>
            <Palette questions={questions} state={state} cur={cur} onJump={goTo} />
          </Box>
        )}
      </Box>

      {/* actions */}
      <Box sx={(t) => ({ display: 'flex', flexWrap: 'wrap', gap: 1, p: 1.25, borderTop: `1px solid ${t.palette.divider}`, bgcolor: 'background.paper', pb: 'calc(10px + env(safe-area-inset-bottom))' })}>
        <Button size="small" variant="outlined" onClick={() => { patch(current._id, (s) => ({ ...s, marked: !s.marked })); }} sx={{ fontWeight: 700 }}>
          {st.marked ? 'Unmark' : 'Mark for review'}
        </Button>
        <Button size="small" variant="outlined" disabled={st.selected === null} onClick={() => patch(current._id, (s) => ({ ...s, selected: null }))} sx={{ fontWeight: 700 }}>Clear</Button>
        <Box sx={{ flex: 1 }} />
        <Button size="small" variant="outlined" disabled={cur === 0} onClick={() => goTo(cur - 1)} sx={{ fontWeight: 700 }}>Prev</Button>
        <Button size="small" variant="contained" disableElevation disabled={cur >= questions.length - 1} onClick={() => goTo(cur + 1)} sx={{ fontWeight: 800, bgcolor: NAVY }}>Save &amp; next</Button>
        <Button size="small" color={isLast ? 'error' : 'primary'} variant="contained" disableElevation onClick={() => { commitTime(); setConfirm(true); }} sx={{ fontWeight: 800 }}>
          {isLast ? 'Submit paper' : 'Submit section'}
        </Button>
      </Box>

      <Drawer anchor="bottom" open={paletteOpen} onClose={() => setPaletteOpen(false)} slotProps={{ paper: { sx: { borderRadius: '16px 16px 0 0', p: 2, maxHeight: '70dvh' } } }}>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>Palette</Typography>
        <Palette questions={questions} state={state} cur={cur} onJump={goTo} />
      </Drawer>

      <Dialog open={confirm} onClose={() => !busy && setConfirm(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900 }}>{isLast ? 'Submit the whole paper?' : `Submit ${paper.sections[paper.currentSection].title}?`}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Answered: <b>{counts.answered}</b> · Not answered: <b>{counts.notAnswered + counts.notVisited}</b> · Marked: <b>{counts.marked}</b></Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {isLast ? 'You cannot change answers after this.' : 'This section will lock. You cannot come back to it, and unused time does not carry over.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirm(false)} disabled={busy}>Keep working</Button>
          <Button variant="contained" disableElevation color={isLast ? 'error' : 'primary'} onClick={finishSection} disabled={busy} sx={{ fontWeight: 800 }}>
            {busy ? 'Submitting…' : 'Yes, submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
