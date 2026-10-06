import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  alpha,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CircleIcon from '@mui/icons-material/Circle';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { motion } from 'framer-motion';

import { aptitudeApi } from '../../api/aptitudeApi';
import { extractErrorMessage } from '../../api/apiClient';
import MicroCheck from '../learn/components/MicroCheck';
import { getLessonsForPattern } from './lessons';
import { LESSON_WIDGETS } from './components/LessonWidgets';

const mono = { fontFamily: '"JetBrains Mono", "Fira Code", monospace' };
const CONTENT_MAX = 760;

function Eyebrow({ children, color = 'primary.main', icon }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 1 }}>
      {icon}
      <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.1em', color, fontSize: 11 }}>
        {children}
      </Typography>
    </Stack>
  );
}

/* One worked example, revealed a step at a time */
function WorkedExample({ example, index }) {
  const [shown, setShown] = useState(0);
  const total = example.steps.length;
  const done = shown >= total;

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800 }}>
          {index + 1}
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '0.08em' }}>
          WORKED EXAMPLE
        </Typography>
      </Stack>
      <Typography sx={{ fontWeight: 600, lineHeight: 1.6, mb: 2 }}>{example.question}</Typography>

      <Stack spacing={1}>
        {example.steps.slice(0, shown).map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack direction="row" spacing={1.25}>
              <Typography variant="caption" sx={{ ...mono, fontWeight: 800, color: 'primary.main', mt: 0.35, minWidth: 44 }}>
                Step {i + 1}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                {s}
              </Typography>
            </Stack>
          </motion.div>
        ))}
      </Stack>

      {done ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: (t) => alpha(t.palette.success.main, 0.1), border: '1px solid', borderColor: 'success.main' }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
              Answer: {example.answer}
            </Typography>
          </Box>
        </motion.div>
      ) : (
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Button size="small" variant="outlined" startIcon={<VisibilityRoundedIcon />} onClick={() => setShown((n) => n + 1)}>
            {shown === 0 ? 'Show first step' : 'Next step'}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
            Try it yourself first
          </Typography>
        </Stack>
      )}
    </Paper>
  );
}

function LessonSidebar({ lessons, activeId, completed, onSelect }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', position: 'sticky', top: 88 }}>
      <Typography variant="overline" sx={{ display: 'block', px: 2, pt: 2, pb: 0.5, fontWeight: 800, color: 'text.secondary', letterSpacing: '0.08em', fontSize: 10.5 }}>
        Lessons
      </Typography>
      <Stack sx={{ pb: 1 }}>
        {lessons.map((l, i) => {
          const active = l.id === activeId;
          const done = completed.has(l.id);
          return (
            <Box
              key={l.id}
              onClick={() => onSelect(l.id)}
              sx={{
                position: 'relative',
                cursor: 'pointer',
                px: 2,
                py: 1,
                bgcolor: active ? (t) => alpha(t.palette.primary.main, 0.07) : 'transparent',
                '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.05) },
              }}
            >
              {active && <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, bgcolor: 'primary.main' }} />}
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                {done ? (
                  <CheckRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <CircleIcon sx={{ fontSize: 8, mx: '4px', color: active ? 'primary.main' : 'text.disabled' }} />
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontSize: 13, fontWeight: active ? 800 : 500, lineHeight: 1.3, color: active ? 'text.primary' : 'text.secondary' }}>
                    {i + 1}. {l.title}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {l.minutes} min
                  </Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}

export default function AptitudeLearnPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const lessons = getLessonsForPattern(slug);

  const [completed, setCompleted] = useState(() => new Set());
  const [subCounts, setSubCounts] = useState({});
  const [patternTitle, setPatternTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    aptitudeApi
      .getPattern(slug)
      .then(({ data }) => {
        if (cancelled) return;
        const d = data.data;
        setCompleted(new Set(d.progress.completedSubsections));
        setPatternTitle(d.pattern.title);
        setSubCounts(Object.fromEntries(d.practice.bySubPattern.map((s) => [s.slug, s.total])));
      })
      .catch((err) => !cancelled && setError(extractErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const requested = searchParams.get('lesson');
  const firstOpen = lessons?.find((l) => !completed.has(l.id))?.id ?? lessons?.[0]?.id;
  const activeId = lessons?.some((l) => l.id === requested) ? requested : firstOpen;
  const activeIndex = lessons ? lessons.findIndex((l) => l.id === activeId) : -1;
  const lesson = lessons?.[activeIndex];

  const selectLesson = useCallback(
    (id) => setSearchParams({ lesson: id }, { replace: true }),
    [setSearchParams]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeId]);

  const markDone = useCallback(
    async (id) => {
      if (completed.has(id)) return;
      setCompleted((prev) => new Set(prev).add(id));
      try {
        await aptitudeApi.markSubsectionComplete(slug, id, lessons.length);
      } catch {
        setCompleted((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [completed, lessons, slug]
  );

  const progressPct = useMemo(() => (lessons ? (completed.size / lessons.length) * 100 : 0), [completed, lessons]);

  // Patterns with only the legacy Learn content keep using it.
  if (!lessons) return <Navigate to={`/learn/${slug}`} replace />;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const isLast = activeIndex === lessons.length - 1;
  const questionsHere = subCounts[lesson.id] ?? 0;
  const Widget = lesson.widget ? LESSON_WIDGETS[lesson.widget] : null;

  const next = async () => {
    if (isLast) {
      navigate(`/aptitude/${slug}/practice`);
    } else {
      selectLesson(lessons[activeIndex + 1].id);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top bar */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: (t) => t.zIndex.appBar - 1, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', maxWidth: 1280, mx: 'auto', px: 2, py: 1.25 }}>
          <IconButton size="small" onClick={() => navigate(`/aptitude/${slug}`)} aria-label="Back to pattern">
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
              {patternTitle || 'Learn'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Lesson {activeIndex + 1} of {lessons.length} · {lesson.title}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: { xs: 110, sm: 220 } }}>
            <LinearProgress variant="determinate" value={progressPct} sx={{ flexGrow: 1, height: 6, borderRadius: 3 }} />
            <Typography variant="caption" sx={{ ...mono, fontWeight: 700, color: 'text.secondary' }}>
              {completed.size}/{lessons.length}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ maxWidth: 1280, mx: 'auto', px: 2, py: { xs: 2.5, md: 4 }, display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        <Box sx={{ width: 270, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
          <LessonSidebar lessons={lessons} activeId={activeId} completed={completed} onSelect={selectLesson} />
        </Box>

        <Box key={lesson.id} sx={{ flex: 1, minWidth: 0, maxWidth: CONTENT_MAX }}>
          {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Mobile lesson pager */}
          <Stack direction="row" spacing={0.75} sx={{ display: { xs: 'flex', md: 'none' }, mb: 2 }}>
            {lessons.map((l, i) => (
              <Box
                key={l.id}
                onClick={() => selectLesson(l.id)}
                sx={{ flex: 1, height: 6, borderRadius: 3, cursor: 'pointer', bgcolor: i === activeIndex ? 'primary.main' : completed.has(l.id) ? 'success.main' : 'action.disabledBackground' }}
              />
            ))}
          </Stack>

          <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '0.1em' }}>
            Lesson {activeIndex + 1} · {lesson.minutes} min read
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
            {lesson.title}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {lesson.summary}
          </Typography>

          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
              <Eyebrow icon={<LightbulbRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />}>THE KEY IDEA</Eyebrow>
              <Stack spacing={1.25}>
                {lesson.keyIdea.map((p) => (
                  <Typography key={p} sx={{ lineHeight: 1.75 }}>
                    {p}
                  </Typography>
                ))}
              </Stack>
            </Paper>

            <Box>
              <Eyebrow icon={<BoltRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />}>FORMULAS TO REMEMBER</Eyebrow>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
                {lesson.formulas.map((f) => (
                  <Paper key={f.label} variant="outlined" sx={{ p: 1.75, borderRadius: 2.5, bgcolor: (t) => alpha(t.palette.primary.main, 0.04) }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {f.label}
                    </Typography>
                    <Typography sx={{ ...mono, fontWeight: 700, fontSize: 14, mt: 0.5, lineHeight: 1.6 }}>{f.expr}</Typography>
                  </Paper>
                ))}
              </Box>
            </Box>

            {lesson.table && (
              <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {lesson.table.columns.map((c, i) => (
                        <TableCell key={i} sx={{ fontWeight: 800 }}>
                          {c}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lesson.table.rows.map((r, ri) => (
                      <TableRow key={ri}>
                        {r.map((cell, ci) => (
                          <TableCell key={ci} sx={{ ...(ci % 2 === 1 ? { ...mono, fontWeight: 700 } : {}) }}>
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}

            {Widget && <Widget />}

            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, bgcolor: (t) => alpha(t.palette.warning.main, 0.07), borderColor: (t) => alpha(t.palette.warning.main, 0.5) }}>
              <Eyebrow color="warning.main" icon={<BoltRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />}>
                EXAM SHORTCUTS
              </Eyebrow>
              <Stack spacing={1}>
                {lesson.shortcut.map((s) => (
                  <Typography key={s} variant="body2" sx={{ lineHeight: 1.7 }}>
                    • {s}
                  </Typography>
                ))}
              </Stack>
            </Paper>

            <Stack spacing={2}>
              {lesson.examples.map((ex, i) => (
                <WorkedExample key={ex.question} example={ex} index={i} />
              ))}
            </Stack>

            <Box>
              <Eyebrow color="error.main" icon={<WarningAmberRoundedIcon sx={{ fontSize: 16, color: 'error.main' }} />}>
                COMMON TRAPS
              </Eyebrow>
              <Stack spacing={1.25}>
                {lesson.traps.map((t) => (
                  <Paper key={t.trap} variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderColor: (th) => alpha(th.palette.error.main, 0.4) }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>
                      ✗ {t.trap}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.65 }}>
                      ✓ {t.fix}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>

            <MicroCheck
              key={lesson.id}
              checkQuestion={{ question: lesson.check.question, options: lesson.check.options, correctIndex: lesson.check.correctIndex, explanation: lesson.check.explanation }}
              onCorrect={() => markDone(lesson.id)}
            />

            {/* Footer */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', pt: 1, pb: 6 }}>
              <Button disabled={activeIndex === 0} startIcon={<ArrowBackRoundedIcon />} onClick={() => selectLesson(lessons[activeIndex - 1].id)}>
                Previous lesson
              </Button>
              <Stack direction="row" spacing={1.5}>
                {questionsHere > 0 && (
                  <Button variant="outlined" onClick={() => navigate(`/aptitude/${slug}/practice?subPattern=${lesson.id}`)}>
                    Practise this topic ({questionsHere})
                  </Button>
                )}
                <Button variant="contained" disableElevation endIcon={<ArrowForwardRoundedIcon />} onClick={next}>
                  {isLast ? 'Start practising' : 'Next lesson'}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
