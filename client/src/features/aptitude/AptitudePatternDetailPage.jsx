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
  CircularProgress,
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
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import { aptitudeApi } from '../../api/aptitudeApi';
import { roomApi } from '../../api/roomApi';
import { extractErrorMessage } from '../../api/apiClient';
import { getLessonsForPattern } from './lessons';
import { getTopicBySlug } from '../learn/content/topics';
import { motion } from 'framer-motion';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import Alien3D from './components/Alien3D';
import { CountUp, XpBar, popChild, staggerParent } from './components/MotionBits';
import { moduleXp, rankForXp } from './components/gamification';
import { DIFFICULTY, formatClock, formatDuration } from './components/aptitudeUi';

const MONO = '"JetBrains Mono", monospace';

/* ---------------------------------------------------------------- */
/* Action icon (Learn / Practice / Test) — icon on top, name below   */
/* ---------------------------------------------------------------- */
function ActionIcon({ icon, accent, name, onClick, disabled, highlight, dot, label }) {
  return (
    <Box component={motion.div} variants={popChild} sx={{ minWidth: 0 }}>
      <ButtonBase
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
        title={label}
        sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, py: 0.5, opacity: disabled ? 0.45 : 1 }}
      >
        <Badge color="warning" variant="dot" invisible={!dot} overlap="rectangular">
          <Box
            sx={{
              width: 56,
              height: 56,
              display: 'grid',
              placeItems: 'center',
              bgcolor: accent,
              color: '#fff',
              boxShadow: highlight ? `0 0 0 3px ${alpha(accent, 0.28)}` : 'none',
              transition: 'box-shadow .2s ease, transform .15s ease',
              '& svg': { fontSize: 30 },
              'button:active > span > &': { transform: 'scale(0.96)' },
            }}
          >
            {icon}
          </Box>
        </Badge>
        <Typography sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1 }}>{name}</Typography>
      </ButtonBase>
    </Box>
  );
}

/* ---------------------------------------------------------------- */
/* Topic row — ring + title + score, one line                        */
/* ---------------------------------------------------------------- */
function SubPatternRow({ sub, onClick }) {
  const empty = sub.total === 0;
  const pct = sub.total ? (sub.solved / sub.total) * 100 : 0;
  const mastered = sub.total > 0 && sub.solved === sub.total;
  const accColor = sub.accuracy == null ? 'text.disabled' : sub.accuracy >= 75 ? 'success.main' : sub.accuracy >= 50 ? 'warning.main' : 'error.main';

  return (
    <ButtonBase
      component={motion.div}
      variants={popChild}
      disabled={empty}
      onClick={onClick}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1.5,
        py: 1,
        minHeight: 54,
        textAlign: 'left',
        justifyContent: 'flex-start',
        opacity: empty ? 0.55 : 1,
        '&:hover': empty ? undefined : { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ position: 'relative', width: 34, height: 34, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
        <CircularProgress variant="determinate" value={100} size={34} thickness={4} sx={{ position: 'absolute', color: 'action.hover' }} />
        <CircularProgress variant="determinate" value={pct} size={34} thickness={4} sx={{ position: 'absolute', color: mastered ? 'success.main' : 'primary.main' }} />
        {mastered ? (
          <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />
        ) : empty ? (
          <HourglassEmptyRoundedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
        ) : (
          <Typography sx={{ fontSize: 10, fontWeight: 800, fontFamily: MONO }}>{Math.round(pct)}</Typography>
        )}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
          {sub.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: MONO, fontSize: 11 }}>
          {empty ? 'Coming soon' : `${sub.solved}/${sub.total} solved`}
        </Typography>
      </Box>
      {!empty && (
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: accColor, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0.25 }}>
          {sub.accuracy == null ? '—' : `${sub.accuracy}%`}
        </Typography>
      )}
      {!empty && <ChevronRightRoundedIcon sx={{ fontSize: 20, color: 'text.disabled', flexShrink: 0 }} />}
    </ButtonBase>
  );
}


function Stat({ icon, color, value, label, suffix }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.9 }}>
      <Box sx={{ width: 30, height: 30, flexShrink: 0, borderRadius: 2, display: 'grid', placeItems: 'center', color, bgcolor: alpha(color, 0.14), '& svg': { fontSize: 18 } }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 15, lineHeight: 1.1, fontFamily: MONO }} noWrap>
          {value}
          <Box component="span" sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 700 }}>
            {suffix}
          </Box>
        </Typography>
        <Typography color="text.secondary" sx={{ fontWeight: 700, fontSize: 10, lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.05em' }} noWrap>
          {label}
        </Typography>
      </Box>
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
  const [inviting, setInviting] = useState(false);

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
  const remainingSec = activeTest ? Math.max(0, (new Date(activeTest.expiresAt).getTime() - now) / 1000) : 0;

  const studyWithFriend = async () => {
    if (inviting) return;
    setInviting(true);
    try {
      const { data: res } = await roomApi.create({ kind: 'aptitude', patternSlug: slug, title: `${pattern.title} study room` });
      navigate(`/room/${res.data.roomId}`);
    } catch (err) {
      setError(extractErrorMessage(err));
      setInviting(false);
    }
  };

  const goLearn = () => (lessons ? navigate(`/aptitude/${slug}/learn`) : navigate(`/learn/${slug}`));
  const goPractice = (sub) => navigate(`/aptitude/${slug}/practice${sub ? `?subPattern=${sub}` : ''}`);
  const goTest = () =>
    activeTest ? navigate(`/aptitude/${slug}/test/${activeTest.attemptId}`) : navigate(`/aptitude/${slug}/test`);

  const learnLine = lessons ? `${learnDone}/${learnTotal} lessons` : hasLegacyLearn ? 'Concepts and worked examples' : 'Coming soon';
  const testLine = activeTest
    ? `In progress · ${activeTest.answeredCount}/${activeTest.totalCount} · ${formatClock(remainingSec)} left`
    : progress.attemptsCount > 0
      ? `Best ${progress.bestScore}%${bestPassed ? ' · passed' : ''} · ${testPlan.questionCount} Qs · ${pattern.timeLimitMinutes} min`
      : `${testPlan.questionCount} Qs · ${pattern.timeLimitMinutes} min · pass ${pattern.passPercentage}%`;
  const practiceLine = `${totals.solved}/${totals.total} solved`;

  return (
    <Container
      maxWidth="md"
      disableGutters
      sx={{
        px: { xs: 1, sm: 3 },
        py: { xs: 1, md: 2 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        overflowY: 'auto',
        // The page itself never scrolls: only the topic list inside it does.
        height: { xs: 'calc(100dvh - 56px - 76px - env(safe-area-inset-bottom))', md: 'calc(100vh - 64px)' },
      }}
    >
      <Breadcrumbs sx={{ fontSize: 13, display: { xs: 'none', sm: 'flex' } }}>
        <Link component={RouterLink} to="/aptitude" underline="hover" color="text.secondary">
          Aptitude
        </Link>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          {pattern.title}
        </Typography>
      </Breadcrumbs>

      {/* Header: alien + XP + stats */}
      <Paper
        variant="outlined"
        square
        sx={{
          p: { xs: 1.25, sm: 2 },
          flexShrink: 0,
          background: (t) => `linear-gradient(150deg, ${alpha(rank.alien.color, t.palette.mode === 'dark' ? 0.18 : 0.1)} 0%, transparent 60%)`,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton size="small" aria-label="Back to Aptitude" onClick={() => navigate('/aptitude')} sx={{ display: { xs: 'inline-flex', sm: 'none' }, ml: -0.5, borderRadius: 0 }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Box sx={{ flexShrink: 0, width: 52, height: 52 }}>
            <Alien3D kind={rank.alien.key} size={52} wave />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, fontSize: { xs: '1.1rem', sm: '1.4rem' }, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {pattern.title}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.25 }}>
              <Typography variant="caption" color="text.secondary" noWrap>
                {rank.alien.name} · {rank.alien.title}
              </Typography>
              <LocalFireDepartmentRoundedIcon sx={{ fontSize: 14, color: 'warning.main' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: MONO }}>
                <CountUp value={xp} /> XP
              </Typography>
            </Stack>
          </Box>
          <Tooltip title="Study with a friend">
            <span>
              <IconButton size="small" aria-label="Study with a friend" onClick={studyWithFriend} disabled={inviting} sx={{ borderRadius: 0 }}>
                <GroupAddRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Recent tests">
            <IconButton size="small" aria-label="Recent tests" aria-expanded={showRecent} onClick={() => setShowRecent((v) => !v)} sx={{ borderRadius: 0, bgcolor: showRecent ? 'action.selected' : 'transparent' }}>
              <Badge color="primary" badgeContent={recentAttempts.length} invisible={recentAttempts.length === 0}>
                <HistoryRoundedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
          <Box sx={{ flex: 1 }}>
            <XpBar pct={rank.pct} color={rank.alien.color} height={4} track="rgba(148,163,184,.22)" />
          </Box>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ flexShrink: 0, fontSize: 11 }}>
            {rank.next ? `${rank.toNext} XP → ${rank.next.name}` : 'Max evolution'}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
          <Stat icon={<CheckCircleRoundedIcon />} color="#10B981" value={totals.solved} suffix={`/${totals.total}`} label="Solved" />
          <Stat icon={<MenuBookRoundedIcon />} color="#3B82F6" value={learnDone} suffix={learnTotal ? `/${learnTotal}` : ''} label="Lessons" />
          <Stat icon={<EmojiEventsRoundedIcon />} color="#F59E0B" value={progress.attemptsCount > 0 ? Math.round(progress.bestScore) : 0} suffix="%" label="Best test" />
        </Stack>

        <Stack direction="row" useFlexGap spacing={1.25} sx={{ mt: 1.1, alignItems: 'center', flexWrap: 'wrap' }}>
          {Object.entries(DIFFICULTY).map(([key, meta]) => {
            const d = byDifficulty[key];
            return (
              <Stack key={key} direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, bgcolor: meta.color }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: meta.color }}>
                  {meta.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: MONO, fontSize: 11 }}>
                  {d.solved}/{d.total}
                </Typography>
              </Stack>
            );
          })}
          {bookmarkedCount > 0 && (
            <Chip
              size="small"
              clickable
              icon={<BookmarkRoundedIcon />}
              label={bookmarkedCount}
              onClick={() => navigate(`/aptitude/${slug}/practice?status=bookmarked`)}
              sx={{ height: 22, borderRadius: 0, fontWeight: 800, '& .MuiChip-icon': { fontSize: 14 } }}
            />
          )}
        </Stack>

        <Collapse in={showRecent} unmountOnExit>
          <Box sx={{ mt: 1.25, pt: 1, borderTop: '1px solid', borderColor: 'divider', maxHeight: 180, overflowY: 'auto' }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.5 }}>
              <HistoryRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Recent tests
              </Typography>
              {bestPassed && <EmojiEventsRoundedIcon sx={{ color: 'warning.main', fontSize: 18 }} />}
            </Stack>
            {recentAttempts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No tests yet. Tap the Test icon to take the timed test.
              </Typography>
            ) : (
              <Stack divider={<Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />}>
                {recentAttempts.map((a) => (
                  <Box
                    key={a._id}
                    onClick={() => navigate(`/aptitude/${slug}/results/${a._id}`)}
                    sx={{ py: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, mx: -1, px: 1 }}
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
                        borderRadius: 0,
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

      {error && <Alert severity="error" square sx={{ flexShrink: 0 }}>{error}</Alert>}

      {/* Learn / Practice / Test — icons only, names underneath */}
      <Box component={motion.div} variants={staggerParent} initial="hidden" animate="show" sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', flexShrink: 0, py: 0.5 }}>
        <ActionIcon
          icon={<MenuBookRoundedIcon />}
          accent="#3B82F6"
          name="Learn"
          label={`Learn: ${learnLine}`}
          disabled={!hasLearn}
          highlight={hasLearn && learnDone === 0 && totals.solved === 0}
          onClick={goLearn}
        />
        <ActionIcon
          icon={<CodeRoundedIcon />}
          accent="#10B981"
          name="Practice"
          label={`Practice: ${practiceLine}`}
          highlight={(learnDone > 0 || !hasLearn) && !activeTest && totals.solved < totals.total}
          onClick={() => goPractice(rec && totals.attempted > 0 ? rec.slug : null)}
        />
        <ActionIcon
          icon={<TimerRoundedIcon />}
          accent="#F59E0B"
          name="Test"
          label={`Test: ${testLine}`}
          highlight={!!activeTest}
          dot={!!activeTest}
          onClick={goTest}
        />
      </Box>

      {/* Topic mastery — a card that scrolls on its own */}
      <Paper variant="outlined" square sx={{ flex: '1 1 0', minHeight: 170, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', px: 1.5, height: 42, flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
          <InsightsRoundedIcon sx={{ fontSize: 19, color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', flex: 1 }}>Topic mastery</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: MONO, fontWeight: 700 }}>
            {bySubPattern.filter((x) => x.total > 0 && x.solved === x.total).length}/{bySubPattern.length}
          </Typography>
        </Stack>
        <Box
          component={motion.div}
          variants={staggerParent}
          initial="hidden"
          animate="show"
          sx={(t) => ({
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            display: 'grid',
            alignContent: 'start',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(t.palette.text.primary, 0.3)} transparent`,
            '& > *': { borderBottom: '1px solid', borderColor: 'divider' },
          })}
        >
          {bySubPattern.map((sp) => (
            <SubPatternRow key={sp.slug} sub={sp} onClick={() => goPractice(sp.slug)} />
          ))}
        </Box>
      </Paper>
    </Container>
  );
}
