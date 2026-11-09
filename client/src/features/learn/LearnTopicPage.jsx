import { AVERAGES_VISUAL_REGISTRY } from './animations/AveragesVisuals';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, Button, Chip, Divider, Stack, Typography, alpha } from '@mui/material';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../app/design/designTokens';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { aptitudeApi } from '../../api/aptitudeApi';
import { getTopicBySlug } from './content';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { CONTENT_MAX, PILOT_VISUALS } from './topic/learnConstants';
import { ExampleCard, TrapCallout } from './topic/ExampleCard';
import { CompletionBanner } from './topic/CompletionBanner';
import { FormulaDisplay, RevealSection, SectionHeading } from './topic/LessonPrimitives';
import { CheckCard } from './topic/CheckCard';
import { LearnSidebar, LearnTopBar } from './topic/LearnNavigation';

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
