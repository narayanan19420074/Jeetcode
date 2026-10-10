import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  LinearProgress,
  Link,
  Paper,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { aptitudeApi } from '../../api/aptitudeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { getLessonsForPattern } from './lessons';
import { getTopicBySlug } from '../learn/content/topics';
import { motion } from 'framer-motion';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import Ring from './components/Ring';
import Alien3D from './components/Alien3D';
import HeroPanel from './components/HeroPanel';
import { CountUp, TiltCard, XpBar, popChild, staggerParent } from './components/MotionBits';
import { ALIENS, buildBadges, moduleXp, rankForXp } from './components/gamification';
import { DIFFICULTY, formatClock, formatDuration } from './components/aptitudeUi';

/* ---------------------------------------------------------------- */
/* Mode card (Learn / Practice / Test)                              */
/* ---------------------------------------------------------------- */
function ModeCard({ icon, accent, eyebrow, title, lines, progress, cta, onClick, disabled, highlight, step }) {
  return (
    <TiltCard variants={popChild}>
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        flex: 1,
        minWidth: 0,
        position: 'relative',
        overflow: 'hidden',
        borderColor: highlight ? accent : 'divider',
        background: (t) => `linear-gradient(160deg, ${alpha(accent, t.palette.mode === 'dark' ? 0.16 : 0.09)} 0%, transparent 55%)`,
        boxShadow: highlight ? `0 0 0 3px ${alpha(accent, 0.18)}, 0 12px 34px ${alpha(accent, 0.22)}` : 'none',
        transition: 'box-shadow .2s ease, border-color .2s ease',
        '&:hover': disabled ? undefined : { boxShadow: `0 14px 36px ${alpha(accent, 0.28)}`, borderColor: accent },
      }}
    >
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${accent}, ${alpha(accent, 0.2)})` }} />
      <Typography aria-hidden sx={{ position: 'absolute', right: 12, top: -6, fontSize: 92, fontWeight: 900, lineHeight: 1, color: alpha(accent, 0.09), fontFamily: '"JetBrains Mono", monospace', userSelect: 'none' }}>
        {step}
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
          component={motion.div}
          whileHover={{ rotate: [0, -12, 12, 0], scale: 1.12 }}
          transition={{ duration: 0.5 }}
          sx={{ width: 46, height: 46, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: accent, color: '#fff', boxShadow: `0 6px 16px ${alpha(accent, 0.45)}`, position: 'relative' }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" sx={{ lineHeight: 1.2, color: 'text.secondary', letterSpacing: '0.08em', fontWeight: 700 }}>
            {eyebrow}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {title}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={0.4} sx={{ flexGrow: 1 }}>
        {lines.map((l) => (
          <Typography key={l} variant="body2" color="text.secondary">
            {l}
          </Typography>
        ))}
      </Stack>

      {progress != null && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: accent }, bgcolor: alpha(accent, 0.12) }}
        />
      )}

      <Button
        variant={highlight ? 'contained' : 'outlined'}
        disableElevation
        disabled={disabled}
        onClick={onClick}
        endIcon={<ArrowForwardRoundedIcon />}
        sx={{ alignSelf: 'stretch', ...(highlight && { bgcolor: accent, '&:hover': { bgcolor: accent, filter: 'brightness(0.92)' } }), ...(!highlight && { color: accent, borderColor: alpha(accent, 0.5) }) }}
      >
        {cta}
      </Button>
    </Paper>
    </TiltCard>
  );
}

/* ---------------------------------------------------------------- */
/* Sub-pattern tile                                                 */
/* ---------------------------------------------------------------- */
function SubPatternTile({ sub, onClick }) {
  const empty = sub.total === 0;
  const pct = sub.total ? (sub.solved / sub.total) * 100 : 0;
  const mastered = sub.total > 0 && sub.solved === sub.total;
  const accColor = sub.accuracy == null ? 'text.disabled' : sub.accuracy >= 75 ? 'success.main' : sub.accuracy >= 50 ? 'warning.main' : 'error.main';

  return (
    <Paper
      component={motion.div}
      variants={popChild}
      whileHover={empty ? undefined : { y: -3 }}
      variant="outlined"
      onClick={empty ? undefined : onClick}
      sx={{
        p: 1.75,
        borderRadius: 2.5,
        cursor: empty ? 'default' : 'pointer',
        opacity: empty ? 0.55 : 1,
        borderColor: mastered ? 'success.main' : 'divider',
        transition: 'border-color .15s, transform .15s',
        '&:hover': empty ? undefined : { borderColor: 'primary.main', transform: 'translateY(-1px)' },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {sub.title}
        </Typography>
        {mastered && <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main', flexShrink: 0 }} />}
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ my: 1.25, height: 5, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: mastered ? 'success.main' : 'primary.main' } }}
      />
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
          {empty ? 'Coming soon' : `${sub.solved} / ${sub.total} solved`}
        </Typography>
        {!empty && (
          <Typography variant="caption" sx={{ fontWeight: 700, color: accColor }}>
            {sub.accuracy == null ? 'No attempts' : `${sub.accuracy}% accuracy`}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}


const BADGE_ICONS = {
  bolt: BoltRoundedIcon,
  book: MenuBookRoundedIcon,
  fire: LocalFireDepartmentRoundedIcon,
  star: StarRoundedIcon,
  shield: ShieldRoundedIcon,
  crown: WorkspacePremiumRoundedIcon,
  trophy: EmojiEventsRoundedIcon,
  rocket: RocketLaunchRoundedIcon,
};

function BadgeTile({ badge }) {
  const Icon = BADGE_ICONS[badge.icon] ?? StarRoundedIcon;
  return (
    <Box
      component={motion.div}
      variants={popChild}
      whileHover={{ y: -4, scale: 1.04 }}
      title={badge.desc}
      sx={{ textAlign: 'center', p: 1.5, borderRadius: 3, border: '1px solid', borderColor: badge.earned ? alpha(badge.color, 0.55) : 'divider', bgcolor: badge.earned ? alpha(badge.color, 0.09) : 'transparent', position: 'relative', overflow: 'hidden' }}
    >
      <Box
        component={motion.div}
        animate={badge.earned ? { rotate: [0, -8, 8, 0] } : undefined}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        sx={{ width: 52, height: 52, mx: 'auto', mb: 1, borderRadius: '50%', display: 'grid', placeItems: 'center', color: badge.earned ? '#fff' : 'text.disabled', background: badge.earned ? `linear-gradient(145deg, ${badge.color}, ${alpha(badge.color, 0.6)})` : 'transparent', border: badge.earned ? 'none' : '2px dashed', borderColor: 'divider', boxShadow: badge.earned ? `0 8px 20px ${alpha(badge.color, 0.45)}` : 'none' }}
      >
        {badge.earned ? <Icon /> : <LockRoundedIcon sx={{ fontSize: 20 }} />}
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2, color: badge.earned ? 'text.primary' : 'text.secondary' }}>
        {badge.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3, mt: 0.25 }}>
        {badge.earned ? badge.desc : `${badge.have}/${badge.need} · ${badge.desc}`}
      </Typography>
    </Box>
  );
}

/* ---------------------------------------------------------------- */
/* Page                                                             */
/* ---------------------------------------------------------------- */
export default function AptitudePatternDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    aptitudeApi
      .getPattern(slug)
      .then(({ data: res }) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Resume countdown for an in-progress test.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!data?.activeTest) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [data?.activeTest]);

  const lessons = getLessonsForPattern(slug);
  const hasLegacyLearn = !!getTopicBySlug(slug);
  const hasLearn = !!lessons || hasLegacyLearn;
  const learnTotal = lessons?.length ?? 0;

  const learnDone = useMemo(() => {
    if (!data || !lessons) return 0;
    const ids = new Set(data.progress.completedSubsections);
    return lessons.filter((l) => ids.has(l.id)).length;
  }, [data, lessons]);

  if (error && !data) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => navigate('/aptitude')}>Back</Button>}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton width={220} height={24} />
        <Skeleton width={360} height={44} sx={{ mb: 3 }} />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Skeleton variant="rounded" height={190} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={190} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={190} sx={{ flex: 1 }} />
        </Stack>
      </Container>
    );
  }

  const { pattern, progress, practice, recentAttempts, activeTest, testPlan } = data;
  const { totals, byDifficulty, bySubPattern, recommendedSubPattern, bookmarkedCount } = practice;
  const solvedPct = totals.total ? Math.round((totals.solved / totals.total) * 100) : 0;
  const rec = bySubPattern.find((s) => s.slug === recommendedSubPattern);
  const bestPassed = progress.bestScore >= pattern.passPercentage;
  const xp = moduleXp({ practice, progress, learnDone, pattern });
  const rank = rankForXp(xp);
  const badges = buildBadges({ practice, progress, learnDone, learnTotal, pattern });
  const earnedCount = badges.filter((b) => b.earned).length;
  const remainingSec = activeTest ? Math.max(0, (new Date(activeTest.expiresAt).getTime() - now) / 1000) : 0;

  const goLearn = () => (lessons ? navigate(`/aptitude/${slug}/learn`) : navigate(`/learn/${slug}`));
  const goPractice = (sub) => navigate(`/aptitude/${slug}/practice${sub ? `?subPattern=${sub}` : ''}`);
  const goTest = () =>
    activeTest ? navigate(`/aptitude/${slug}/test/${activeTest.attemptId}`) : navigate(`/aptitude/${slug}/test`);

  const learnLines = lessons
    ? [`${learnTotal} short lessons, one per question type`, 'Formulas, exam shortcuts, worked examples']
    : hasLegacyLearn
      ? ['Concepts and worked examples']
      : ['Lessons for this topic are coming soon'];
  const learnCta = !hasLearn ? 'Coming soon' : lessons ? (learnDone === 0 ? 'Start learning' : learnDone >= learnTotal ? 'Review lessons' : 'Continue learning') : 'Open Learn';

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Breadcrumbs sx={{ mb: 1, fontSize: 13 }}>
        <Link component={RouterLink} to="/aptitude" underline="hover" color="text.secondary">
          Aptitude
        </Link>
        {pattern.category && <Typography variant="body2" color="text.secondary">{pattern.category}</Typography>}
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          {pattern.title}
        </Typography>
      </Breadcrumbs>

      <HeroPanel glow={rank.alien.glow} sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} sx={{ position: 'relative', alignItems: { md: 'center' } }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Chip size="small" variant="outlined" color="primary" icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} />} label={`The One for All Aptitude · ${pattern.category || 'Quantitative'}`} sx={{ fontWeight: 700, mb: 1.5 }} />
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: { xs: 32, md: 44 }, lineHeight: 1.08 }}>
              {pattern.title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 560 }}>
              {pattern.description}
            </Typography>

            <Stack direction="row" spacing={0} divider={<Box sx={{ width: '1px', bgcolor: 'divider', mx: { xs: 1.5, sm: 3 } }} />} sx={{ mt: 3, flexWrap: 'wrap', rowGap: 2 }}>
              {[
                [totals.solved, 'Solved', `/${totals.total}`],
                [learnDone, 'Lessons', learnTotal ? `/${learnTotal}` : ''],
                [progress.attemptsCount > 0 ? Math.round(progress.bestScore) : 0, 'Best test', '%'],
                [earnedCount, 'Badges', `/${badges.length}`],
              ].map(([v, k, suf]) => (
                <Box key={k}>
                  <Typography sx={{ fontWeight: 800, fontSize: 26, lineHeight: 1, fontFamily: '"JetBrains Mono", monospace' }}>
                    <CountUp value={v} />
                    <Box component="span" sx={{ fontSize: 14, color: 'text.secondary', fontWeight: 700 }}>
                      {suf}
                    </Box>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    {k}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap', mt: 2.5 }}>
              {[`${testPlan.questionCount}-question test`, `${pattern.timeLimitMinutes} min`, `Pass ${pattern.passPercentage}%`, 'No negative marking'].map((c) => (
                <Chip key={c} size="small" label={c} variant="outlined" />
              ))}
            </Stack>
          </Box>

          <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0, p: 2, borderRadius: '12px', bgcolor: (t) => alpha(t.palette.background.default, t.palette.mode === 'dark' ? 0.55 : 0.7), border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Alien3D kind={rank.alien.key} size={104} wave spin />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Your alien
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 22, lineHeight: 1.15 }}>{rank.alien.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {rank.alien.title}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5 }}>
                  <LocalFireDepartmentRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                    <CountUp value={xp} /> XP
                  </Typography>
                </Stack>
              </Box>
            </Stack>
            <Box sx={{ mt: 1.5 }}>
              <XpBar pct={rank.pct} color={rank.alien.color} height={8} track="rgba(148,163,184,.22)" />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                {rank.next ? `${rank.toNext} XP to evolve into ${rank.next.name}` : 'Max evolution reached'}
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
                {ALIENS.map((a, i) => (
                  <Box key={a.key} sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: i <= rank.index ? a.color : 'action.disabledBackground' }} />
                ))}
              </Stack>
            </Box>
          </Box>
        </Stack>
      </HeroPanel>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Learn → Practice → Test */}
      <Stack component={motion.div} variants={staggerParent} initial="hidden" animate="show" direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <ModeCard
          step="1"
          icon={<MenuBookRoundedIcon />}
          accent="#3B82F6"
          eyebrow="Step 1 · Understand"
          title="Learn"
          lines={learnLines}
          progress={lessons ? (learnDone / learnTotal) * 100 : null}
          cta={lessons && learnDone > 0 && learnDone < learnTotal ? `${learnCta} (${learnDone}/${learnTotal})` : learnCta}
          disabled={!hasLearn}
          highlight={hasLearn && learnDone === 0 && totals.solved === 0}
          onClick={goLearn}
        />
        <ModeCard
          step="2"
          icon={<CodeRoundedIcon />}
          accent="#10B981"
          eyebrow="Step 2 · Build speed"
          title="Practice"
          lines={[`${totals.solved} of ${totals.total} solved`, 'Filter by topic, difficulty or status; instant answers + shortcuts']}
          progress={solvedPct}
          cta={totals.solved === 0 ? 'Start practising' : 'Continue practising'}
          highlight={(learnDone > 0 || !hasLearn) && !activeTest && totals.solved < totals.total}
          onClick={() => goPractice(rec && totals.attempted > 0 ? rec.slug : null)}
        />
        <ModeCard
          step="3"
          icon={<TimerRoundedIcon />}
          accent="#F59E0B"
          eyebrow="Step 3 · Exam simulation"
          title="Test"
          lines={
            activeTest
              ? [`Test in progress · ${activeTest.answeredCount}/${activeTest.totalCount} answered`, `Time left ${formatClock(remainingSec)}`]
              : [
                  `${testPlan.questionCount} questions · ${pattern.timeLimitMinutes} min · exam-style interface`,
                  progress.attemptsCount > 0 ? `Best score ${progress.bestScore}%${bestPassed ? ' · passed' : ''}` : 'Mixed difficulty, no negative marking',
                ]
          }
          cta={activeTest ? 'Resume test' : progress.attemptsCount > 0 ? 'Retake test' : 'Take the test'}
          highlight={!!activeTest}
          onClick={goTest}
        />
      </Stack>

      {rec && (
        <Paper
          variant="outlined"
          sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', bgcolor: (t) => alpha(t.palette.primary.main, 0.04) }}
        >
          <BoltRoundedIcon color="primary" />
          <Box sx={{ flexGrow: 1, minWidth: 220 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {totals.attempted === 0 ? 'Where to start' : 'Recommended next'}: {rec.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {rec.accuracy != null && rec.accuracy < 75
                ? `Your accuracy here is ${rec.accuracy}% — the quickest place to gain marks.`
                : `${rec.total - rec.solved} unsolved questions in this topic.`}
            </Typography>
          </Box>
          <Button size="small" variant="contained" disableElevation onClick={() => goPractice(rec.slug)}>
            Practise this topic
          </Button>
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Badges
          </Typography>
          <Chip size="small" label={`${earnedCount} / ${badges.length} unlocked`} sx={{ fontWeight: 700 }} />
        </Stack>
        <Box component={motion.div} variants={staggerParent} initial="hidden" animate="show" sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)', lg: 'repeat(8, 1fr)' }, gap: 1.25 }}>
          {badges.map((b) => (
            <BadgeTile key={b.id} badge={b} />
          ))}
        </Box>
      </Paper>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
        {/* Topic map */}
        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
            Topic mastery
          </Typography>
          <Box component={motion.div} variants={staggerParent} initial="hidden" animate="show" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 1.5 }}>
            {bySubPattern.map((s) => (
              <SubPatternTile key={s.slug} sub={s} onClick={() => goPractice(s.slug)} />
            ))}
          </Box>
        </Box>

        {/* Right rail */}
        <Stack spacing={2} sx={{ width: { xs: '100%', lg: 330 }, flexShrink: 0 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
              Your progress
            </Typography>
            <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
              <Ring value={solvedPct} size={104} label={`${totals.solved}`} sublabel={`/ ${totals.total} solved`} />
              <Stack spacing={1.1} sx={{ flexGrow: 1 }}>
                {Object.entries(DIFFICULTY).map(([key, meta]) => {
                  const d = byDifficulty[key];
                  return (
                    <Box key={key}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: meta.color }}>
                          {meta.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                          {d.solved}/{d.total}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={d.total ? (d.solved / d.total) * 100 : 0}
                        sx={{ height: 4, borderRadius: 2, bgcolor: alpha(meta.color, 0.15), '& .MuiLinearProgress-bar': { bgcolor: meta.color } }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Stack>
            {bookmarkedCount > 0 && (
              <Button size="small" sx={{ mt: 1.5 }} onClick={() => navigate(`/aptitude/${slug}/practice?status=bookmarked`)}>
                {bookmarkedCount} bookmarked
              </Button>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Recent tests
              </Typography>
              {bestPassed && <EmojiEventsRoundedIcon sx={{ color: 'warning.main', fontSize: 20 }} />}
            </Stack>
            {recentAttempts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No tests yet. Warm up with practice, then take the timed test.
              </Typography>
            ) : (
              <Stack divider={<Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />}>
                {recentAttempts.map((a) => (
                  <Box
                    key={a._id}
                    onClick={() => navigate(`/aptitude/${slug}/results/${a._id}`)}
                    sx={{ py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, mx: -1, px: 1, borderRadius: 1 }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {a.correctCount}/{a.totalCount} correct
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(a.createdAt).toLocaleDateString()} · {formatDuration(a.timeTakenSec)}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={`${a.score}%`}
                      sx={{
                        fontWeight: 800,
                        fontFamily: '"JetBrains Mono", monospace',
                        bgcolor: (t) => alpha(a.score >= pattern.passPercentage ? t.palette.success.main : t.palette.error.main, 0.14),
                        color: a.score >= pattern.passPercentage ? 'success.main' : 'error.main',
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Stack>
    </Container>
  );
}
