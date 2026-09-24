import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  LinearProgress,
  IconButton,
  alpha,
  Divider,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CircleIcon from '@mui/icons-material/Circle';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { motion, AnimatePresence } from 'framer-motion';

import { getTopicBySlug } from './content/topics';
import { AVERAGES_VISUAL_REGISTRY } from './animations/AveragesVisuals';
import MissingValueVisual from './visuals/MissingValueVisual';
import { aptitudeApi } from '../../api/aptitudeApi';

const MAIN_NAV_HEIGHT_PX = 72;
const CONTENT_MAX = 720;

// Which lessons use the new interactive pilot visual instead of the
// legacy static SVG registry. Migrate one at a time as they get rebuilt.
const PILOT_VISUALS = {
  'missing-value': MissingValueVisual,
};

const SPRING = { type: 'spring', stiffness: 200, damping: 24 };

/* ================================================================
 *  Top bar
 * ================================================================ */
function LearnTopBar({ topic, active, completedCount, total, progressPct, onBack }) {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 1.25,
        px: 2,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ maxWidth: 1400, mx: 'auto' }}>
        <IconButton size="small" onClick={onBack}>
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>
        <Stack spacing={0} sx={{ minWidth: 0, flexShrink: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: 14 }}>
            {topic.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {active?.sectionTitle} · {active?.title}
          </Typography>
        </Stack>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: { xs: 140, sm: 220 } }}>
          <LinearProgress
            variant="determinate"
            value={progressPct}
            sx={{
              flexGrow: 1,
              height: 6,
              borderRadius: 3,
              '& .MuiLinearProgress-bar': { transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)' },
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'text.secondary' }}>
            {completedCount} / {total}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

/* ================================================================
 *  Sidebar with sliding active indicator (layoutId)
 * ================================================================ */
function LearnSidebar({ sections, activeId, completedIds, onSelect }) {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        position: 'sticky',
        top: MAIN_NAV_HEIGHT_PX + 24,
        maxHeight: `calc(100vh - ${MAIN_NAV_HEIGHT_PX + 48}px)`,
        overflowY: 'auto',
      }}
    >
      {sections.map((sec, secIdx) => (
        <Box key={sec.id}>
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              fontWeight: 700,
              px: 2,
              pt: secIdx === 0 ? 2 : 2.5,
              pb: 0.5,
              color: 'text.secondary',
              letterSpacing: '0.08em',
              fontSize: 10.5,
            }}
          >
            {sec.title}
          </Typography>
          <Stack spacing={0} sx={{ pb: 1 }}>
            {sec.subsections.map((sub) => {
              const isActive = sub.id === activeId;
              const isDone = completedIds.includes(sub.id);
              return (
                <Box
                  key={sub.id}
                  onClick={() => onSelect(sub.id)}
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    py: 0.9,
                    pl: 1.5,
                    pr: 1.5,
                    bgcolor: isActive ? (t) => alpha(t.palette.primary.main, 0.06) : 'transparent',
                    '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.05) },
                    transition: 'background-color 0.2s',
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeLessonIndicator"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: '#3b82f6',
                        borderRadius: '0 2px 2px 0',
                      }}
                    />
                  )}
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                    {isDone ? (
                      <CheckRoundedIcon sx={{ fontSize: 15, color: 'success.main', flexShrink: 0 }} />
                    ) : (
                      <CircleIcon
                        sx={{
                          fontSize: 8,
                          color: isActive ? 'primary.main' : 'text.disabled',
                          flexShrink: 0,
                          ml: 0.5,
                          mr: 0.5,
                        }}
                      />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'text.primary' : 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {sub.title}
                    </Typography>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Paper>
  );
}

/* ================================================================
 *  Motion section wrapper — fades in on scroll
 * ================================================================ */
function RevealSection({ children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

function SectionHeading({ children, overline }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      {overline && (
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            fontWeight: 800,
            color: 'primary.main',
            letterSpacing: '0.1em',
            fontSize: 10.5,
            mb: 0.5,
          }}
        >
          {overline}
        </Typography>
      )}
      <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: 22 }}>
        {children}
      </Typography>
    </Box>
  );
}

/* ================================================================
 *  Formula display
 * ================================================================ */
function FormulaDisplay({ text }) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.06)'),
        border: '1px solid',
        borderColor: (t) => alpha(t.palette.primary.main, 0.35),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <BoltRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        <Typography
          variant="caption"
          sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '0.1em', fontSize: 10.5 }}
        >
          FORMULA
        </Typography>
      </Stack>
      <Stack spacing={1.25}>
        {text.split('\n').map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, ...SPRING }}
          >
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 15,
                fontWeight: 600,
                color: 'text.primary',
                lineHeight: 1.7,
              }}
            >
              {line}
            </Typography>
          </motion.div>
        ))}
      </Stack>
    </Box>
  );
}

/* ================================================================
 *  Worked example — step reveal on scroll
 * ================================================================ */
function ExampleCard({ example, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, bgcolor: 'background.paper' }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'grid',
              placeItems: 'center',
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {index + 1}
          </Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em', fontSize: 10.5 }}
          >
            WORKED EXAMPLE
          </Typography>
        </Stack>

        <Typography variant="body1" sx={{ fontWeight: 600, mb: 2.5, lineHeight: 1.6, fontSize: 15.5 }}>
          {example.question}
        </Typography>

        <Stack spacing={1.25}>
          {example.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 + i * 0.12, ...SPRING }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: 'text.disabled',
                    mt: 0.35,
                    minWidth: 16,
                    fontSize: 12,
                  }}
                >
                  {i + 1}.
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    fontSize: 13.5,
                    lineHeight: 1.7,
                    color: 'text.secondary',
                  }}
                >
                  {step}
                </Typography>
              </Stack>
            </motion.div>
          ))}
        </Stack>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + example.steps.length * 0.12, ...SPRING }}
        >
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={1.5} alignItems="baseline">
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main', letterSpacing: '0.1em', fontSize: 10.5 }}>
              ANSWER
            </Typography>
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontWeight: 800,
                fontSize: 15,
                color: 'success.main',
              }}
            >
              {example.answer}
            </Typography>
          </Stack>
        </motion.div>
      </Paper>
    </motion.div>
  );
}

/* ================================================================
 *  Trap callout
 * ================================================================ */
function TrapCallout({ text }) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-start',
        bgcolor: (t) => alpha('#ef4444', 0.05),
        border: '1px solid',
        borderColor: (t) => alpha('#ef4444', 0.3),
      }}
    >
      <WarningAmberRoundedIcon sx={{ fontSize: 20, color: '#ef4444', mt: 0.25 }} />
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#ef4444', display: 'block', letterSpacing: '0.1em', fontSize: 10.5 }}>
          TRAP
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.65, fontSize: 14.5 }}>
          {text}
        </Typography>
      </Box>
    </Box>
  );
}

/* ================================================================
 *  Check card — interactive question
 * ================================================================ */
function CheckCard({ check, index, onCorrect }) {
  const [selected, setSelected] = useState(null);
  const [solved, setSolved] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const handlePick = (i) => {
    if (solved) return;
    setSelected(i);
    if (i === check.correctIndex) {
      setSolved(true);
      onCorrect?.();
    } else {
      setWrongAttempts((w) => w + 1);
    }
  };

  const handleReveal = () => {
    setSolved(true);
    setRevealed(true);
  };

  const isChallenge = check.level === 'challenge';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          borderColor: isChallenge ? (t) => alpha(t.palette.warning.main, 0.4) : 'divider',
          bgcolor: isChallenge ? (t) => alpha(t.palette.warning.main, 0.02) : 'background.paper',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip
            label={isChallenge ? 'Challenge' : 'Quick check'}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: isChallenge ? (t) => alpha(t.palette.warning.main, 0.15) : (t) => alpha(t.palette.primary.main, 0.12),
              color: isChallenge ? 'warning.main' : 'primary.main',
            }}
          />
        </Stack>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, lineHeight: 1.45, fontSize: 17 }}>
          {check.question}
        </Typography>

        <Stack spacing={1.25}>
          {check.options.map((opt, i) => {
            const isCorrect = i === check.correctIndex;
            const isSelected = i === selected;
            const showCorrect = solved && isCorrect;
            const showWrong = !solved && isSelected && !isCorrect;

            return (
              <motion.button
                key={i}
                onClick={() => handlePick(i)}
                disabled={solved}
                whileHover={!solved ? { scale: 1.008 } : {}}
                whileTap={!solved ? { scale: 0.995 } : {}}
                animate={{
                  borderColor: showCorrect ? '#10b981' : showWrong ? '#ef4444' : 'rgba(148,163,184,0.35)',
                  backgroundColor: showCorrect ? 'rgba(16,185,129,0.08)' : showWrong ? 'rgba(239,68,68,0.06)' : 'transparent',
                }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  borderRadius: 12,
                  border: '1.5px solid',
                  cursor: solved ? 'default' : 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  color: 'inherit',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: 13,
                    flexShrink: 0,
                    border: '1.5px solid',
                    borderColor: showCorrect ? '#10b981' : showWrong ? '#ef4444' : 'currentColor',
                    bgcolor: showCorrect ? '#10b981' : 'transparent',
                    color: showCorrect ? '#fff' : 'inherit',
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </Box>
                <Typography sx={{ flexGrow: 1, fontWeight: 600, fontSize: 15 }}>
                  {opt}
                </Typography>
                {showCorrect && <CheckCircleRoundedIcon sx={{ color: '#10b981', fontSize: 20 }} />}
                {showWrong && <CancelRoundedIcon sx={{ color: '#ef4444', fontSize: 20 }} />}
              </motion.button>
            );
          })}
        </Stack>

        {!solved && wrongAttempts >= 3 && (
          <Button onClick={handleReveal} size="small" sx={{ mt: 2, fontWeight: 700 }}>
            Stuck? Reveal the answer
          </Button>
        )}

        <AnimatePresence>
          {solved && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  mt: 2.5,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: revealed ? alpha('#f59e0b', 0.08) : 'rgba(16,185,129,0.08)',
                  border: '1px solid',
                  borderColor: revealed ? alpha('#f59e0b', 0.3) : 'rgba(16,185,129,0.3)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: revealed ? 'warning.main' : 'success.main',
                    display: 'block',
                    mb: 0.5,
                    letterSpacing: '0.08em',
                    fontSize: 10.5,
                  }}
                >
                  {revealed ? 'ANSWER REVEALED' : 'CORRECT'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, fontSize: 13.5 }}>
                  {check.explanation}
                </Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
    </motion.div>
  );
}

/* ================================================================
 *  Completion banner
 * ================================================================ */
function CompletionBanner({ topic, total, onFinish }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING}
    >
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 4,
          borderRadius: 4,
          textAlign: 'center',
          bgcolor: (t) => alpha(t.palette.success.main, 0.05),
          borderColor: (t) => alpha(t.palette.success.main, 0.35),
        }}
      >
        <Stack spacing={2} alignItems="center">
          <WorkspacePremiumRoundedIcon sx={{ fontSize: 48, color: 'success.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            You are placement-ready in {topic.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, lineHeight: 1.7 }}>
            You have covered all {total} lessons — every question archetype, formula, and trap. Time to test
            yourself under timed conditions.
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'success.main' }}>
            <EmojiEventsRoundedIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.05em' }}>
              READY FOR PRACTICE & TEST
            </Typography>
          </Stack>
          <Button
            variant="contained"
            size="large"
            disableElevation
            onClick={onFinish}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              mt: 1,
              fontWeight: 700,
              py: 1.5,
              px: 4,
              borderRadius: 2,
              bgcolor: 'success.main',
              '&:hover': { bgcolor: 'success.dark' },
            }}
          >
            Go to Practice &amp; Test
          </Button>
        </Stack>
      </Paper>
    </motion.div>
  );
}

/* ================================================================
 *  Page — main orchestrator
 * ================================================================ */
export default function LearnTopicPage() {
  const { topicSlug } = useParams();
  const navigate = useNavigate();
  const topic = getTopicBySlug(topicSlug);

  const flatSubsections = useMemo(
    () =>
      topic
        ? topic.sections.flatMap((sec) =>
            sec.subsections.map((sub) => ({ ...sub, sectionTitle: sec.title }))
          )
        : [],
    [topic]
  );

  const total = flatSubsections.length;

  const [activeId, setActiveId] = useState(flatSubsections[0]?.id);
  const [completedIds, setCompletedIds] = useState([]);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!topicSlug) return undefined;
    let cancelled = false;
    aptitudeApi
      .getPattern(topicSlug)
      .then(({ data }) => {
        if (cancelled) return;
        setCompletedIds(data.data?.progress?.completedSubsections || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [topicSlug]);

  // Scroll to top when lesson changes
  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeId]);

  if (!topic) return <Navigate to="/aptitude" replace />;

  const activeIndex = flatSubsections.findIndex((s) => s.id === activeId);
  const active = flatSubsections[activeIndex] || flatSubsections[0];
  const isLast = activeIndex === total - 1;
  const isActiveDone = completedIds.includes(active?.id);
  const allDone = completedIds.length === total && total > 0;

  // Visual priority: pilot visuals > legacy registry > none
  const PilotVisual = active ? PILOT_VISUALS[active.id] : null;
  const LegacyVisual = active?.visualKey ? AVERAGES_VISUAL_REGISTRY[active.visualKey] : null;
  const VisualComponent = PilotVisual || LegacyVisual;

  const checks = active?.checks || (active?.checkQuestion ? [active.checkQuestion] : []);
  const progressPct = total ? (completedIds.length / total) * 100 : 0;

  const markDone = async (subsectionId) => {
    if (!subsectionId || completedIds.includes(subsectionId)) return;
    setCompletedIds((prev) => (prev.includes(subsectionId) ? prev : [...prev, subsectionId]));
    setSavingId(subsectionId);
    try {
      await aptitudeApi.markSubsectionComplete(topicSlug, subsectionId, total);
    } catch {
      setCompletedIds((prev) => prev.filter((id) => id !== subsectionId));
    } finally {
      setSavingId(null);
    }
  };

  const goToSubsection = (id) => {
    if (id === activeId) return;
    setActiveId(id);
  };

  const handleAdvance = async () => {
    if (active && !completedIds.includes(active.id)) {
      await markDone(active.id);
    }
    if (!isLast) {
      goToSubsection(flatSubsections[activeIndex + 1].id);
    } else {
      navigate(`/aptitude/${topicSlug}`);
    }
  };

  const handleQuestionCorrect = () => {
    if (active) markDone(active.id);
  };

  const handlePrevLesson = () => {
    if (activeIndex > 0) goToSubsection(flatSubsections[activeIndex - 1].id);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <LearnTopBar
        topic={topic}
        active={active}
        completedCount={completedIds.length}
        total={total}
        progressPct={progressPct}
        onBack={() => navigate(`/aptitude/${topicSlug}`)}
      />

      <Box
        sx={{
          maxWidth: 1400,
          width: '100%',
          mx: 'auto',
          px: { xs: 2, md: 3 },
          pt: 3,
          pb: 8,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 4 },
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>
          <LearnSidebar
            sections={topic.sections}
            activeId={activeId}
            completedIds={completedIds}
            onSelect={goToSubsection}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, maxWidth: CONTENT_MAX, width: '100%' }}>
          {allDone && isLast ? (
            <CompletionBanner topic={topic} total={total} onFinish={handleAdvance} />
          ) : (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Lesson header */}
              <RevealSection>
                <Stack spacing={1.5} sx={{ mb: 4 }}>
                  <Chip
                    label={active.sectionTitle}
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      fontWeight: 700,
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                      color: 'primary.main',
                      letterSpacing: '0.04em',
                    }}
                  />
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      fontSize: { xs: 28, md: 34 },
                      lineHeight: 1.15,
                    }}
                  >
                    {active.title}
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ fontWeight: 600 }}>
                    Lesson {activeIndex + 1} of {total}
                  </Typography>
                </Stack>
              </RevealSection>

              {/* Interactive visual */}
              {VisualComponent && (
                <RevealSection delay={0.1}>
                  <Box sx={{ mb: 6 }}>
                    <VisualComponent />
                  </Box>
                </RevealSection>
              )}

              {/* The Pattern */}
              {active.pattern && (
                <RevealSection delay={0.05}>
                  <Box sx={{ mb: 6 }}>
                    <SectionHeading overline="The pattern">What to look for</SectionHeading>
                    <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: 16.5, color: 'text.secondary' }}>
                      {active.pattern}
                    </Typography>
                  </Box>
                </RevealSection>
              )}

              {/* Formula */}
              {active.formula && (
                <RevealSection delay={0.05}>
                  <Box sx={{ mb: 6 }}>
                    <SectionHeading overline="The formula">What to use</SectionHeading>
                    <FormulaDisplay text={active.formula} />
                  </Box>
                </RevealSection>
              )}

              {/* Examples */}
              {active.examples?.length > 0 && (
                <RevealSection delay={0.05}>
                  <Box sx={{ mb: 6 }}>
                    <SectionHeading overline="Worked examples">See it in action</SectionHeading>
                    <Stack spacing={2}>
                      {active.examples.map((ex, i) => (
                        <ExampleCard key={i} example={ex} index={i} />
                      ))}
                    </Stack>
                  </Box>
                </RevealSection>
              )}

              {/* Trap */}
              {active.trap && (
                <RevealSection delay={0.05}>
                  <Box sx={{ mb: 6 }}>
                    <SectionHeading overline="Watch out">The classic mistake</SectionHeading>
                    <TrapCallout text={active.trap} />
                  </Box>
                </RevealSection>
              )}

              {/* Checks */}
              {checks.length > 0 && (
                <RevealSection delay={0.05}>
                  <Box sx={{ mb: 6 }}>
                    <SectionHeading overline="Check yourself">Try it yourself</SectionHeading>
                    <Stack spacing={2}>
                      {checks.map((c, i) => (
                        <CheckCard key={c.id} check={c} index={i} onCorrect={handleQuestionCorrect} />
                      ))}
                    </Stack>
                  </Box>
                </RevealSection>
              )}

              {/* Footer nav */}
              <RevealSection delay={0.05}>
                <Divider sx={{ mb: 4 }} />
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                  <Button
                    variant="outlined"
                    disabled={activeIndex === 0}
                    onClick={handlePrevLesson}
                    sx={{ fontWeight: 700, py: 1.5, px: 3, borderRadius: 2 }}
                  >
                    Previous lesson
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    disableElevation
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={handleAdvance}
                    disabled={savingId === active.id}
                    sx={{
                      fontWeight: 700,
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      fontSize: 15,
                      bgcolor: isLast ? 'success.main' : 'primary.main',
                      '&:hover': { bgcolor: isLast ? 'success.dark' : 'primary.dark' },
                    }}
                  >
                    {isLast
                      ? isActiveDone
                        ? 'Finish module'
                        : 'Mark as Learned'
                      : 'Next lesson'}
                  </Button>
                </Stack>
              </RevealSection>
            </motion.div>
          )}
        </Box>
      </Box>
    </Box>
  );
}