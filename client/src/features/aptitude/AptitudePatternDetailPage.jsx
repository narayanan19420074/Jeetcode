import { Alert, Badge, Box, Breadcrumbs, Button, Chip, Collapse, Container, IconButton, Link, Paper, Skeleton, Stack, Tooltip, Typography, alpha, useMediaQuery } from '@mui/material';
import Alien3D from './components/Alien3D';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, withAlpha } from '../../app/design/designTokens';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { CountUp, XpBar, staggerParent } from './components/MotionBits';
import { DIFFICULTY, formatClock, formatDuration } from './components/aptitudeUi';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import MobilePatternDetail, { MobilePatternError, MobilePatternSkeleton } from './components/MobilePatternDetail';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import { aptitudeApi } from '../../api/aptitudeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { getLessonsForPattern, getTopicBySlug } from '../learn/content';
import { moduleXp, rankForXp } from './components/gamification';
import { motion } from 'framer-motion';
import { roomApi } from '../../api/roomApi';
import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, MONO, Stat, SubPatternRow } from './patternDetail/patternDetailParts';

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
  // Phones and small tablets get their own layout (the site navbar is hidden there, see MainLayout).
  const mobile = useMediaQuery((t) => t.breakpoints.down('md'), { noSsr: true });

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
    if (mobile) return <MobilePatternError message={error} />;
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => navigate('/aptitude')}>Back</Button>}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!data) {
    if (mobile) return <MobilePatternSkeleton />;
    return (
      <Container maxWidth="md" sx={{ py: { xs: 1.5, md: 3 } }}>
        <Skeleton width={180} height={20} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" height={230} sx={{ mb: 2, borderRadius: RADII_PX.card }} />
        <Stack spacing={1.25}>
          <Skeleton variant="rounded" height={74} sx={{ borderRadius: RADII_PX.card }} />
          <Skeleton variant="rounded" height={74} sx={{ borderRadius: RADII_PX.card }} />
          <Skeleton variant="rounded" height={74} sx={{ borderRadius: RADII_PX.card }} />
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

  if (mobile) {
    return (
      <MobilePatternDetail
        slug={slug}
        data={data}
        error={error}
        hasLearn={hasLearn}
        learnLine={learnLine}
        learnDone={learnDone}
        learnTotal={learnTotal}
        testLine={testLine}
        practiceLine={practiceLine}
        onLearn={goLearn}
        onPractice={(sub) => goPractice(typeof sub === 'string' ? sub : rec && totals.attempted > 0 ? rec.slug : null)}
        onTest={goTest}
        onOpenAttempt={(id) => navigate(`/aptitude/${slug}/results/${id}`)}
        onOpenBookmarks={() => navigate(`/aptitude/${slug}/practice?status=bookmarked`)}
      />
    );
  }

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
      <Breadcrumbs sx={{ fontSize: FONT_SIZES.body, display: { xs: 'none', sm: 'flex' } }}>
        <Link component={RouterLink} to="/aptitude" underline="hover" color="text.secondary">
          Aptitude
        </Link>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: FONT_WEIGHTS.semibold }}>
          {pattern.title}
        </Typography>
      </Breadcrumbs>

      {/* Header: alien + XP + stats */}
      <Paper
        variant="outlined"
        square
        sx={{
          p: { xs: 1.5, sm: 2 },
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
            <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: '-0.02em', lineHeight: 1.15, fontSize: { xs: FONT_SIZES.subheading, sm: FONT_SIZES.display }, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {pattern.title}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary" noWrap>
                {rank.alien.name} · {rank.alien.title}
              </Typography>
              <LocalFireDepartmentRoundedIcon sx={{ fontSize: FONT_SIZES.body, color: 'warning.main' }} />
              <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, fontFamily: MONO }}>
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
            <XpBar pct={rank.pct} color={rank.alien.color} height={4} track={withAlpha(COLOR_PALETTE.slate[400], .22)} />
          </Box>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ flexShrink: 0, fontSize: FONT_SIZES.micro }}>
            {rank.next ? `${rank.toNext} XP → ${rank.next.name}` : 'Max evolution'}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Stat icon={<CheckCircleRoundedIcon />} color={COLOR_PALETTE.emerald[500]} value={totals.solved} suffix={`/${totals.total}`} label="Solved" />
          <Stat icon={<MenuBookRoundedIcon />} color={COLOR_PALETTE.blue[500]} value={learnDone} suffix={learnTotal ? `/${learnTotal}` : ''} label="Lessons" />
          <Stat icon={<EmojiEventsRoundedIcon />} color={COLOR_PALETTE.amber[500]} value={progress.attemptsCount > 0 ? Math.round(progress.bestScore) : 0} suffix="%" label="Best test" />
        </Stack>

        <Stack direction="row" useFlexGap spacing={1.25} sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {Object.entries(DIFFICULTY).map(([key, meta]) => {
            const d = byDifficulty[key];
            return (
              <Stack key={key} direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, bgcolor: meta.color }} />
                <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, color: meta.color }}>
                  {meta.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: MONO, fontSize: FONT_SIZES.micro }}>
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
              sx={{ height: 22, borderRadius: 0, fontWeight: FONT_WEIGHTS.bold, '& .MuiChip-icon': { fontSize: FONT_SIZES.body } }}
            />
          )}
        </Stack>

        <Collapse in={showRecent} unmountOnExit>
          <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid', borderColor: 'divider', maxHeight: 180, overflowY: 'auto' }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.5 }}>
              <HistoryRoundedIcon sx={{ fontSize: FONT_SIZES.subheading, color: 'text.secondary' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: FONT_WEIGHTS.bold }}>
                Recent tests
              </Typography>
              {bestPassed && <EmojiEventsRoundedIcon sx={{ color: 'warning.main', fontSize: FONT_SIZES.subheading }} />}
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
                    sx={{ py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, mx: -1, px: 1 }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.bold }}>
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
                        fontWeight: FONT_WEIGHTS.bold,
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
          accent={COLOR_PALETTE.blue[500]}
          name="Learn"
          label={`Learn: ${learnLine}`}
          disabled={!hasLearn}
          highlight={hasLearn && learnDone === 0 && totals.solved === 0}
          onClick={goLearn}
        />
        <ActionIcon
          icon={<CodeRoundedIcon />}
          accent={COLOR_PALETTE.emerald[500]}
          name="Practice"
          label={`Practice: ${practiceLine}`}
          highlight={(learnDone > 0 || !hasLearn) && !activeTest && totals.solved < totals.total}
          onClick={() => goPractice(rec && totals.attempted > 0 ? rec.slug : null)}
        />
        <ActionIcon
          icon={<TimerRoundedIcon />}
          accent={COLOR_PALETTE.amber[500]}
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
          <InsightsRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: 'primary.main' }} />
          <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg, flex: 1 }}>Topic mastery</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: MONO, fontWeight: FONT_WEIGHTS.bold }}>
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
