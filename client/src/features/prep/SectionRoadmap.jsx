import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Box, Button, ButtonBase, IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import { QuestCoin } from './PrepQuestBits';
import { CLEARED_AT, sectionPct } from './questLogic';

const ROW = 112;
const PROBLEMS_SHOWN = 12;
const GOLD = '#F5B301';

// Every kind of section becomes the same thing: a list of nodes, each with actions.
// aptitude patterns -> Learn / Practice, coding problems -> Solve, external -> Open + reviewed.
function buildNodes(section, navigate, onSelfReport, showAll) {
  const hard = section.aptitudeDifficulty === 'hard';
  const nodes = [];

  (section.patterns || []).forEach((p) => {
    const pct = p.total ? Math.round((p.solved / p.total) * 100) : 0;
    nodes.push({
      key: `p-${p.slug}`,
      title: p.title,
      sub: `${p.solved}/${p.total} solved`,
      pct,
      state: !p.unlocked ? 'locked' : pct >= CLEARED_AT ? 'cleared' : pct > 0 ? 'progress' : 'fresh',
      note: p.unlocked ? null : "Pass the previous pattern's test to unlock this one.",
      actions: p.unlocked
        ? [
            { label: 'Learn', variant: 'contained', run: () => navigate(`/aptitude/${p.slug}/learn`) },
            { label: 'Practice', variant: 'outlined', run: () => navigate(`/aptitude/${p.slug}/practice${hard ? '?difficulty=hard' : ''}`) },
          ]
        : [],
    });
  });

  const problems = section.problems || [];
  (showAll ? problems : problems.slice(0, PROBLEMS_SHOWN)).forEach((p) => {
    nodes.push({
      key: `q-${p.slug}`,
      title: p.title,
      sub: p.difficulty,
      pct: p.solved ? 100 : 0,
      state: p.solved ? 'cleared' : 'fresh',
      actions: [{ label: p.solved ? 'Solve again' : 'Solve', variant: 'contained', run: () => navigate(`/workspace/${p.slug}`) }],
    });
  });

  if (section.contentType === 'external-only') {
    (section.externalResources || []).forEach((r) =>
      nodes.push({ key: `r-${r.url}`, title: r.label, sub: 'Study material', pct: 0, state: 'fresh', icon: OpenInNewRoundedIcon, actions: [{ label: 'Open', variant: 'contained', run: () => window.open(r.url, '_blank', 'noopener') }] }),
    );
    nodes.push({
      key: 'reviewed',
      title: "I've reviewed this",
      sub: section.selfReported ? 'Marked done' : 'Tap when you are done',
      pct: section.selfReported ? 100 : 0,
      state: section.selfReported ? 'cleared' : 'fresh',
      note: "Self-reported: we can't measure activity on external sites, so this is an honesty check, not a verified score.",
      actions: [{ label: section.selfReported ? 'Undo' : 'Mark as reviewed', variant: section.selfReported ? 'outlined' : 'contained', run: () => onSelfReport(section, !section.selfReported) }],
    });
  } else if (!section.patterns && !section.problems) {
    // legacy whole-feature sections: plain Learn / Practice nodes
    const learn = () => {
      if (section.contentType === 'learn-topic' && section.learnTopicSlug) navigate(`/learn/${section.learnTopicSlug}`);
      else navigate(section.aptitudePatternSlug ? `/aptitude/${section.aptitudePatternSlug}` : '/aptitude');
    };
    const practice = () => {
      if (section.contentType === 'aptitude-pattern') {
        navigate(section.aptitudePatternSlug ? `/aptitude/${section.aptitudePatternSlug}/practice` : '/aptitude');
        return;
      }
      const params = new URLSearchParams();
      (section.problemFilter?.companies || []).forEach((c) => params.append('company', c));
      if (section.problemFilter?.difficulty) params.set('difficulty', section.problemFilter.difficulty);
      navigate(params.toString() ? `/problems?${params.toString()}` : '/problems');
    };
    if (section.contentType === 'learn-topic' || section.contentType === 'aptitude-pattern') nodes.push({ key: 'learn', title: 'Learn', sub: 'Start here', pct: 0, state: 'fresh', icon: MenuBookRoundedIcon, actions: [{ label: 'Learn', variant: 'contained', run: learn }] });
    if (section.contentType === 'problem-filter' || section.contentType === 'aptitude-pattern') nodes.push({ key: 'practice', title: 'Practice', sub: 'Solve questions', pct: 0, state: 'fresh', actions: [{ label: 'Practice', variant: 'contained', run: practice }] });
  } else if (section.contentType !== 'external-only') {
    (section.externalResources || []).forEach((r) =>
      nodes.push({ key: `r-${r.url}`, title: r.label, sub: 'Extra practice', pct: 0, state: 'fresh', icon: OpenInNewRoundedIcon, actions: [{ label: 'Open', variant: 'contained', run: () => window.open(r.url, '_blank', 'noopener') }] }),
    );
  }
  return nodes;
}

export default function SectionRoadmap({ section, navigate, onSelfReport, onBack }) {
  const reduce = useReducedMotion();
  const [showAll, setShowAll] = useState(false);
  const [picked, setPicked] = useState(null);

  const nodes = useMemo(() => buildNodes(section, navigate, onSelfReport, showAll), [section, navigate, onSelfReport, showAll]);
  const current = nodes.findIndex((n) => n.state !== 'cleared' && n.state !== 'locked');
  const cleared = nodes.filter((n) => n.state === 'cleared').length;
  const pct = sectionPct(section);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [section.id]);

  const H = Math.max(1, nodes.length) * ROW;
  const X = (i) => (i % 2 === 0 ? 30 : 70);
  const Y = (i) => ROW / 2 + i * ROW;
  const pathTo = (last) => {
    let d = `M ${X(0)} ${Y(0)}`;
    for (let i = 0; i < last; i += 1) d += ` C ${X(i)} ${Y(i) + ROW / 2}, ${X(i + 1)} ${Y(i + 1) - ROW / 2}, ${X(i + 1)} ${Y(i + 1)}`;
    return d;
  };
  const totalProblems = section.problems?.length || 0;
  const picks = picked !== null ? nodes[picked] : null;

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
        <IconButton onClick={onBack} aria-label="Back to roadmap" sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', lineHeight: 1.2 }}>{section.name}</Typography>
          <Typography variant="caption" color="text.secondary">{cleared} of {nodes.length} cleared</Typography>
        </Box>
        <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums' }}>{pct}%</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: '8px', mb: 1.5 }} />
      {section.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{section.description}</Typography>}

      {nodes.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>Nothing tagged for this section yet.</Typography>
      ) : (
        <Box sx={{ position: 'relative', height: H, mt: 1 }}>
          <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" width="100%" height={H} style={{ position: 'absolute', inset: 0 }} aria-hidden>
            <path d={pathTo(nodes.length - 1)} fill="none" stroke="rgba(128,128,128,.45)" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 9" vectorEffect="non-scaling-stroke" />
            {current > 0 && (
              <motion.path d={pathTo(current)} fill="none" stroke={GOLD} strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: 'easeOut', delay: 0.25 }} />
            )}
          </svg>

          {nodes.map((n, i) => {
            const left = X(i) < 50;
            const isCurrent = i === current;
            const Icon = n.state === 'cleared' ? CheckRoundedIcon : n.state === 'locked' ? LockRoundedIcon : n.icon;
            return (
              <Box key={n.key}>
                <motion.div
                  initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: reduce ? 0 : 0.12 + Math.min(i, 12) * 0.06 }}
                  style={{ position: 'absolute', left: `${X(i)}%`, top: Y(i), x: '-50%', y: '-50%' }}
                >
                  {isCurrent && (
                    <motion.div
                      aria-hidden
                      animate={reduce ? undefined : { y: [0, -4, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ position: 'absolute', top: -30, left: '50%', translateX: '-50%', whiteSpace: 'nowrap' }}
                    >
                      <Box sx={{ px: 1.25, py: 0.25, borderRadius: '99px', bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: 12, fontWeight: 800 }}>You are here</Box>
                    </motion.div>
                  )}
                  <ButtonBase onClick={() => setPicked(i)} aria-label={n.title} sx={{ borderRadius: '50%', opacity: n.state === 'locked' ? 0.55 : 1 }}>
                    <QuestCoin pct={n.pct} state={n.state === 'cleared' ? 'cleared' : 'progress'} Icon={Icon} label={Icon ? undefined : i + 1} active={isCurrent} size={62} />
                  </ButtonBase>
                </motion.div>
                <ButtonBase
                  onClick={() => setPicked(i)}
                  sx={{
                    position: 'absolute', top: Y(i), transform: 'translateY(-50%)', display: 'block', textAlign: left ? 'left' : 'right',
                    ...(left ? { left: `calc(${X(i)}% + 44px)`, right: 8 } : { right: `calc(${100 - X(i)}% + 44px)`, left: 8 }),
                    opacity: n.state === 'locked' ? 0.6 : 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{n.sub}</Typography>
                </ButtonBase>
              </Box>
            );
          })}
        </Box>
      )}

      {!showAll && totalProblems > PROBLEMS_SHOWN && (
        <Button fullWidth onClick={() => setShowAll(true)} sx={{ mt: 1, fontWeight: 700 }}>Show all {section.problemTotal ?? totalProblems} problems</Button>
      )}

      {/* tap a node: a sheet slides up with its buttons */}
      <AnimatePresence>
        {picks && (
          <>
            <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPicked(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1290 }} />
            <motion.div key="sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1300, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: '100%', maxWidth: 600, bgcolor: 'background.paper', borderRadius: '24px 24px 0 0', p: 2.5, pb: 'calc(20px + env(safe-area-inset-bottom))', boxShadow: '0 -12px 40px rgba(0,0,0,.3)' }}>
                <Box sx={{ width: 40, height: 4, borderRadius: '4px', bgcolor: 'divider', mx: 'auto', mb: 2 }} />
                <Typography sx={{ fontWeight: 900, fontSize: '1.2rem' }}>{picks.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{picks.sub}</Typography>
                {picks.note && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>{picks.note}</Typography>}
                <Stack spacing={1.25}>
                  {picks.actions.map((a) => (
                    <Button key={a.label} fullWidth size="large" variant={a.variant} disableElevation onClick={() => { setPicked(null); a.run(); }} sx={{ fontWeight: 800, borderRadius: '14px', py: 1.25 }}>
                      {a.label}
                    </Button>
                  ))}
                  {picks.actions.length === 0 && <Button fullWidth size="large" variant="outlined" disabled sx={{ fontWeight: 800, borderRadius: '14px', py: 1.25 }}>Locked</Button>}
                </Stack>
              </Box>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Box>
  );
}
