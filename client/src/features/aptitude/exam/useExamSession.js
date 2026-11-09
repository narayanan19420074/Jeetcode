import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { aptitudeApi } from '../../../api/aptitudeApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { emptyState, statusOf } from './examState';

// Exam session logic. Everything the learner does is autosaved to the server
// (answers, review flags, per-question time), the countdown is derived from the
// SERVER clock + expiresAt, and a refresh resumes the paper.
export default function useExamSession() {
  const { slug, attemptId } = useParams();
  const navigate = useNavigate();

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

  return {
    slug, attemptId, navigate, paper, questions, setsById, states, idx, error, setError, remaining, saveState,
    calcOpen, setCalcOpen, paletteOpen, setPaletteOpen, confirmOpen, setConfirmOpen, submitting, isFull,
    current, cur, counts, goTo, select, clearResponse, saveNext, markNext, unmark, submit, toggleFull,
  };
}
