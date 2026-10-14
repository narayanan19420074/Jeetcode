import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  ButtonBase,
  Chip,
  Collapse,
  Container,
  IconButton,
  LinearProgress,
  Link,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
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
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { aptitudeApi } from '../../api/aptitudeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { getLessonsForPattern } from './lessons';
import { getTopicBySlug } from '../learn/content/topics';
import { motion } from 'framer-motion';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import Alien3D from './components/Alien3D';
import { CountUp, XpBar, popChild, staggerParent } from './components/MotionBits';
import { buildBadges, moduleXp, rankForXp } from './components/gamification';
import { DIFFICULTY, formatClock, formatDuration } from './components/aptitudeUi';

const MONO = '"JetBrains Mono", monospace';

/* ---------------------------------------------------------------- */
/* Mode row (Learn / Practice / Test) — one compact tappable row     */
/* ---------------------------------------------------------------- */
function ModeCard({ icon, accent, title, line, progress, cta, onClick, disabled, highlight }) {
  return (
    <Box component={motion.div} variants={popChild} sx={{ flex: 1, minWidth: 0 }}>
      <Paper
        component={ButtonBase}
        variant="outlined"
        disabled={disabled}
        onClick={onClick}
        sx={{
          width: '100%',
          p: 1.5,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          textAlign: 'left',
          borderColor: highlight ? accent : 'divider',
          background: (t) => `linear-gradient(160deg, ${alpha(accent, t.palette.mode === 'dark' ? 0.16 : 0.08)} 0%, transparent 60%)`,
          boxShadow: highlight ? `0 0 0 3px ${alpha(accent, 0.16)}` : 'none',
          opacity: disabled ? 0.6 : 1,
          transition: 'box-shadow .2s ease, border-color .2s ease',
          '&:hover': disabled ? undefined : { borderColor: accent },
        }}
      >
        <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: accent, color: '#fff' }}>{icon}</Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>{title}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {line}
          </Typography>
          {progress != null && (
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mt: 0.75, height: 4, borderRadius: 2, bgcolor: alpha(accent, 0.14), '& .MuiLinearProgress-bar': { bgcolor: accent } }}
            />
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            flexShrink: 0,
            px: 1.5,
            py: 0.6,
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 700,
            color: highlight ? '#fff' : accent,
            bgcolor: highlight ? accent : alpha(accent, 0.14),
          }}
        >
          {cta}
          <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
        </Box>
      </Paper>
    </Box>
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

function BadgeDot({ badge }) {
  const Icon = BADGE_ICONS[badge.icon] ?? StarRoundedIcon;
  return (
    <Tooltip
      arrow
      enterTouchDelay={0}
      leaveTouchDelay={2500}
      title={
        <>
          <b>{badge.name}</b>
          <br />
          {badge.earned ? badge.desc : `${badge.have}/${badge.need} · ${badge.desc}`}
        </>
      }
    >
      <Box
        tabIndex={0}
        aria-label={`${badge.name}${badge.earned ? ' (earned)' : ' (locked)'}`}
        sx={{
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: badge.earned ? '#fff' : 'text.disabled',
          background: badge.earned ? `linear-gradient(145deg, ${badge.color}, ${alpha(badge.color, 0.65)})` : 'transparent',
          border: badge.earned ? 'none' : '1.5px dashed',
          borderColor: 'divider',
        }}
      >
        {badge.earned ? <Icon sx={{ fontSize: 19 }} /> : <LockRoundedIcon sx={{ fontSize: 15 }} />}
      </Box>
    </Tooltip>
  );
}

function Stat({ value, label, suffix }) {
  return (
    <Box sx={{ flex: 1, textAlign: 'center' }}>
      <Typography sx={{ fontWeight: 800, fontSize: 19, lineHeight: 1.1, fontFamily: MONO }}>
        {value}
        <Box component="span" sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 700 }}>
          {suffix}
        </Box>
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, fontSize: 10.5 }}>
        {label}
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
  const [showRecent, setShowRecent] = useState(false);

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
      <Container maxWidth="md" sx={{ py: { xs: 1.5, md: 3 } }}>
        <Skeleton width={180} height={20} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" height={230} sx={{ mb: 2, borderRadius: 3 }} />
        <Stack spacing={1.25}>
          <Skeleton variant="rounded" height={74} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={74} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={74} sx={{ borderRadius: 3 }} />
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

  const learnLine = lessons ? `${learnDone}/${learnTotal} lessons` : hasLegacyLearn ? 'Concepts and worked examples' : 'Coming soon';
  const learnCta = !hasLearn ? 'Soon' : lessons ? (learnDone === 0 ? 'Start' : learnDone >= learnTotal ? 'Review' : 'Continue') : 'Open';
  const testLine = activeTest
    ? `In progress · ${activeTest.answeredCount}/${activeTest.totalCount} · ${formatClock(remainingSec)} left`
    : progress.attemptsCount > 0
      ? `Best ${progress.bestScore}%${bestPassed ? ' · passed' : ''} · ${testPlan.questionCount} Qs · ${pattern.timeLimitMinutes} min`
      : `${testPlan.questionCount} Qs · ${pattern.timeLimitMinutes} min · pass ${pattern.passPercentage}%`;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 1.5, md: 3 } }}>
      <Breadcrumbs sx={{ mb: 1, fontSize: 13 }}>
        <Link component={RouterLink} to="/aptitude" underline="hover" color="text.secondary">
          Aptitude
        </Link>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          {pattern.title}
        </Typography>
      </Breadcrumbs>

      {/* One small card: alien + XP + progress + badges + recent tests */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.75, sm: 2.5 },
          borderRadius: 3,
          mb: 2,
          background: (t) => `linear-gradient(150deg, ${alpha(rank.alien.color, t.palette.mode === 'dark' ? 0.18 : 0.1)} 0%, transparent 60%)`,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ flexShrink: 0, width: 68, height: 68 }}>
            <Alien3D kind={rank.alien.key} size={68} wave />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              {pattern.title}
            </Typography>
            <Stack direction="row" useFlexGap spacing={0.75} sx={{ alignItems: 'center', mt: 0.25, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                {rank.alien.name} · {rank.alien.title}
              </Typography>
              <LocalFireDepartmentRoundedIcon sx={{ fontSize: 15, color: 'warning.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: MONO }}>
                <CountUp value={xp} /> XP
              </Typography>
            </Stack>
          </Box>
          <Tooltip title="Recent tests">
            <IconButton aria-label="Recent tests" aria-expanded={showRecent} onClick={() => setShowRecent((v) => !v)} sx={{ alignSelf: 'flex-start', bgcolor: showRecent ? 'action.selected' : 'transparent' }}>
              <Badge color="primary" badgeContent={recentAttempts.length} invisible={recentAttempts.length === 0}>
                <HistoryRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Stack>

        <Box sx={{ mt: 1.5 }}>
          <XpBar pct={rank.pct} color={rank.alien.color} height={6} track="rgba(148,163,184,.22)" />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {rank.next ? `${rank.toNext} XP to evolve into ${rank.next.name}` : 'Max evolution reached'}
          </Typography>
        </Box>

        <Stack direction="row" divider={<Box sx={{ width: '1px', bgcolor: 'divider' }} />} sx={{ mt: 1.5 }}>
          <Stat value={totals.solved} suffix={`/${totals.total}`} label="Solved" />
          <Stat value={learnDone} suffix={learnTotal ? `/${learnTotal}` : ''} label="Lessons" />
          <Stat value={progress.attemptsCount > 0 ? Math.round(progress.bestScore) : 0} suffix="%" label="Best test" />
        </Stack>

        <Stack direction="row" useFlexGap spacing={1.5} sx={{ mt: 1.25, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
          {Object.entries(DIFFICULTY).map(([key, meta]) => {
            const d = byDifficulty[key];
            return (
              <Typography key={key} variant="caption" sx={{ fontWeight: 700, color: meta.color }}>
                {meta.label}{' '}
                <Box component="span" sx={{ color: 'text.secondary', fontFamily: MONO }}>
                  {d.solved}/{d.total}
                </Box>
              </Typography>
            );
          })}
          {bookmarkedCount > 0 && (
            <Button size="small" sx={{ minWidth: 0, py: 0, fontSize: 12 }} onClick={() => navigate(`/aptitude/${slug}/practice?status=bookmarked`)}>
              {bookmarkedCount} bookmarked
            </Button>
          )}
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, mb: 0.75, fontWeight: 700 }}>
          Badges {earnedCount}/{badges.length}
        </Typography>
        <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 0.5 }}>
          {badges.map((b) => (
            <BadgeDot key={b.id} badge={b} />
          ))}
        </Stack>

        <Collapse in={showRecent} unmountOnExit>
          <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Recent tests
              </Typography>
              {bestPassed && <EmojiEventsRoundedIcon sx={{ color: 'warning.main', fontSize: 18 }} />}
            </Stack>
            {recentAttempts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No tests yet. Take the timed test below.
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
                        fontFamily: MONO,
                        bgcolor: (t) => alpha(a.score >= pattern.passPercentage ? t.palette.success.main : t.palette.error.main, 0.14),
                        color: a.score >= pattern.passPercentage ? 'success.main' : 'error.main',
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Collapse>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Learn → Practice → Test: visible straight away, no scrolling */}
      <Stack component={motion.div} variants={staggerParent} initial="hidden" animate="show" direction={{ xs: 'column', md: 'row' }} spacing={1.25} sx={{ mb: 2 }}>
        <ModeCard
          icon={<MenuBookRoundedIcon />}
          accent="#3B82F6"
          title="Learn"
          line={learnLine}
          progress={lessons ? (learnDone / learnTotal) * 100 : null}
          cta={learnCta}
          disabled={!hasLearn}
          highlight={hasLearn && learnDone === 0 && totals.solved === 0}
          onClick={goLearn}
        />
        <ModeCard
          icon={<CodeRoundedIcon />}
          accent="#10B981"
          title="Practice"
          line={`${totals.solved}/${totals.total} solved`}
          progress={solvedPct}
          cta={totals.solved === 0 ? 'Start' : 'Continue'}
          highlight={(learnDone > 0 || !hasLearn) && !activeTest && totals.solved < totals.total}
          onClick={() => goPractice(rec && totals.attempted > 0 ? rec.slug : null)}
        />
        <ModeCard
          icon={<TimerRoundedIcon />}
          accent="#F59E0B"
          title="Test"
          line={testLine}
          cta={activeTest ? 'Resume' : progress.attemptsCount > 0 ? 'Retake' : 'Take test'}
          highlight={!!activeTest}
          onClick={goTest}
        />
      </Stack>

      {rec && (
        <Paper
          variant="outlined"
          sx={{ p: 1.5, mb: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', bgcolor: (t) => alpha(t.palette.primary.main, 0.04) }}
        >
          <BoltRoundedIcon color="primary" />
          <Box sx={{ flexGrow: 1, minWidth: 200 }}>
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

      {/* Topic map */}
      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
        Topic mastery
      </Typography>
      <Box component={motion.div} variants={staggerParent} initial="hidden" animate="show" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
        {bySubPattern.map((s) => (
          <SubPatternTile key={s.slug} sub={s} onClick={() => goPractice(s.slug)} />
        ))}
      </Box>
    </Container>
  );
}
