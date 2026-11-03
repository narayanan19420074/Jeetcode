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

import { getTopicBySlug } from './content';
import { AVERAGES_VISUAL_REGISTRY } from './animations/AveragesVisuals';
import MissingValueVisual from './visuals/MissingValueVisual';
import { aptitudeApi } from '../../api/aptitudeApi';
import { COLOR_PALETTE, withAlpha, FONT_WEIGHTS, FONT_SIZES, FONTS, RADII_PX } from '../../app/design/designTokens';

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
        py: 1.5,
        px: 2,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ maxWidth: 1400, mx: 'auto' }}>
        <IconButton size="small" onClick={onBack}>
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>
        <Stack spacing={0} sx={{ minWidth: 0, flexShrink: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body }}>
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
              borderRadius: RADII_PX.pill,
              '& .MuiLinearProgress-bar': { transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)' },
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.mono, color: 'text.secondary' }}>
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
        borderRadius: RADII_PX.card,
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
              fontWeight: FONT_WEIGHTS.bold,
              px: 2,
              pt: secIdx === 0 ? 2 : 2.5,
              pb: 0.5,
              color: 'text.secondary',
              letterSpacing: '0.08em',
              fontSize: FONT_SIZES.micro,
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
                    py: 1,
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
                        background: COLOR_PALETTE.blue[500],
                        borderRadius: '0 2px 2px 0',
                      }}
                    />
                  )}
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                    {isDone ? (
                      <CheckRoundedIcon sx={{ fontSize: FONT_SIZES.bodyLg, color: 'success.main', flexShrink: 0 }} />
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
                        fontSize: FONT_SIZES.body,
                        fontWeight: isActive ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium,
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
            fontWeight: FONT_WEIGHTS.bold,
            color: 'primary.main',
            letterSpacing: '0.1em',
            fontSize: FONT_SIZES.micro,
            mb: 0.5,
          }}
        >
          {overline}
        </Typography>
      )}
      <Typography variant="h5" sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: '-0.02em', fontSize: FONT_SIZES.display }}>
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
        borderRadius: RADII_PX.card,
        bgcolor: (t) => (t.palette.mode === 'dark' ? withAlpha(COLOR_PALETTE.blue[500], 0.12) : withAlpha(COLOR_PALETTE.blue[500], 0.06)),
        border: '1px solid',
        borderColor: (t) => alpha(t.palette.primary.main, 0.35),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <BoltRoundedIcon sx={{ fontSize: FONT_SIZES.title, color: 'primary.main' }} />
        <Typography
          variant="caption"
          sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'primary.main', letterSpacing: '0.1em', fontSize: FONT_SIZES.micro }}
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
                fontFamily: FONTS.mono,
                fontSize: FONT_SIZES.bodyLg,
                fontWeight: FONT_WEIGHTS.semibold,
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
        sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: RADII_PX.card, bgcolor: 'background.paper' }}
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
              fontSize: FONT_SIZES.caption,
              fontWeight: FONT_WEIGHTS.bold,
            }}
          >
            {index + 1}
          </Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'text.secondary', letterSpacing: '0.08em', fontSize: FONT_SIZES.micro }}
          >
            WORKED EXAMPLE
          </Typography>
        </Stack>

        <Typography variant="body1" sx={{ fontWeight: FONT_WEIGHTS.semibold, mb: 2.5, lineHeight: 1.6, fontSize: FONT_SIZES.title }}>
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
                    fontFamily: FONTS.mono,
                    fontWeight: FONT_WEIGHTS.bold,
                    color: 'text.disabled',
                    mt: 0.5,
                    minWidth: 16,
                    fontSize: FONT_SIZES.caption,
                  }}
                >
                  {i + 1}.
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONTS.mono,
                    fontSize: FONT_SIZES.body,
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
            <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'success.main', letterSpacing: '0.1em', fontSize: FONT_SIZES.micro }}>
              ANSWER
            </Typography>
            <Typography
              sx={{
                fontFamily: FONTS.mono,
                fontWeight: FONT_WEIGHTS.bold,
                fontSize: FONT_SIZES.bodyLg,
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
        borderRadius: RADII_PX.card,
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-start',
        bgcolor: (t) => alpha(COLOR_PALETTE.red[500], 0.05),
        border: '1px solid',
        borderColor: (t) => alpha(COLOR_PALETTE.red[500], 0.3),
      }}
    >
      <WarningAmberRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: COLOR_PALETTE.red[500], mt: 0.5 }} />
      <Box>
        <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, color: COLOR_PALETTE.red[500], display: 'block', letterSpacing: '0.1em', fontSize: FONT_SIZES.micro }}>
          TRAP
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.65, fontSize: FONT_SIZES.bodyLg }}>
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
          borderRadius: RADII_PX.card,
          borderColor: isChallenge ? (t) => alpha(t.palette.warning.main, 0.4) : 'divider',
          bgcolor: isChallenge ? (t) => alpha(t.palette.warning.main, 0.02) : 'background.paper',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip
            label={isChallenge ? 'Challenge' : 'Quick check'}
            size="small"
            sx={{
              fontWeight: FONT_WEIGHTS.bold,
              bgcolor: isChallenge ? (t) => alpha(t.palette.warning.main, 0.15) : (t) => alpha(t.palette.primary.main, 0.12),
              color: isChallenge ? 'warning.main' : 'primary.main',
            }}
          />
        </Stack>

        <Typography variant="h6" sx={{ fontWeight: FONT_WEIGHTS.bold, mb: 3, lineHeight: 1.45, fontSize: FONT_SIZES.subheading }}>
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
                  borderColor: showCorrect ? COLOR_PALETTE.emerald[500] : showWrong ? COLOR_PALETTE.red[500] : withAlpha(COLOR_PALETTE.slate[400], 0.35),
                  backgroundColor: showCorrect ? withAlpha(COLOR_PALETTE.emerald[500], 0.08) : showWrong ? withAlpha(COLOR_PALETTE.red[500], 0.06) : 'transparent',
                }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  borderRadius: RADII_PX.card,
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
                    fontWeight: FONT_WEIGHTS.bold,
                    fontSize: FONT_SIZES.body,
                    flexShrink: 0,
                    border: '1.5px solid',
                    borderColor: showCorrect ? COLOR_PALETTE.emerald[500] : showWrong ? COLOR_PALETTE.red[500] : 'currentColor',
                    bgcolor: showCorrect ? COLOR_PALETTE.emerald[500] : 'transparent',
                    color: showCorrect ? COLOR_PALETTE.white : 'inherit',
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </Box>
                <Typography sx={{ flexGrow: 1, fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.bodyLg }}>
                  {opt}
                </Typography>
                {showCorrect && <CheckCircleRoundedIcon sx={{ color: COLOR_PALETTE.emerald[500], fontSize: FONT_SIZES.heading }} />}
                {showWrong && <CancelRoundedIcon sx={{ color: COLOR_PALETTE.red[500], fontSize: FONT_SIZES.heading }} />}
              </motion.button>
            );
          })}
        </Stack>

        {!solved && wrongAttempts >= 3 && (
          <Button onClick={handleReveal} size="small" sx={{ mt: 2, fontWeight: FONT_WEIGHTS.bold }}>
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
                  borderRadius: RADII_PX.card,
                  bgcolor: revealed ? alpha(COLOR_PALETTE.amber[500], 0.08) : withAlpha(COLOR_PALETTE.emerald[500], 0.08),
                  border: '1px solid',
                  borderColor: revealed ? alpha(COLOR_PALETTE.amber[500], 0.3) : withAlpha(COLOR_PALETTE.emerald[500], 0.3),
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: FONT_WEIGHTS.bold,
                    color: revealed ? 'warning.main' : 'success.main',
                    display: 'block',
                    mb: 0.5,
                    letterSpacing: '0.08em',
                    fontSize: FONT_SIZES.micro,
                  }}
                >
                  {revealed ? 'ANSWER REVEALED' : 'CORRECT'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, fontSize: FONT_SIZES.body }}>
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
          borderRadius: RADII_PX.card,
          textAlign: 'center',
          bgcolor: (t) => alpha(t.palette.success.main, 0.05),
          borderColor: (t) => alpha(t.palette.success.main, 0.35),
        }}
      >
        <Stack spacing={2} alignItems="center">
          <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.jumbo, color: 'success.main' }} />
          <Typography variant="h4" sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: '-0.02em' }}>
            You are placement-ready in {topic.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, lineHeight: 1.7 }}>
            You have covered all {total} lessons — every question archetype, formula, and trap. Time to test
            yourself under timed conditions.
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'success.main' }}>
            <EmojiEventsRoundedIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: '0.05em' }}>
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
              fontWeight: FONT_WEIGHTS.bold,
              py: 1.5,
              px: 4,
              borderRadius: RADII_PX.card,
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
                      fontWeight: FONT_WEIGHTS.bold,
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                      color: 'primary.main',
                      letterSpacing: '0.04em',
                    }}
                  />
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: FONT_WEIGHTS.bold,
                      letterSpacing: '-0.03em',
                      fontSize: { xs: FONT_SIZES.displayLg, md: FONT_SIZES.hero },
                      lineHeight: 1.15,
                    }}
                  >
                    {active.title}
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ fontWeight: FONT_WEIGHTS.semibold }}>
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
                    <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: FONT_SIZES.title, color: 'text.secondary' }}>
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
                    sx={{ fontWeight: FONT_WEIGHTS.bold, py: 1.5, px: 3, borderRadius: RADII_PX.card }}
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
                      fontWeight: FONT_WEIGHTS.bold,
                      py: 1.5,
                      px: 4,
                      borderRadius: RADII_PX.card,
                      fontSize: FONT_SIZES.bodyLg,
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