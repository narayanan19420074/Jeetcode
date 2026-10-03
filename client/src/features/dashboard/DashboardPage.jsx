import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ActivityHeatmap from '../../components/ActivityHeatmap';
import UpcomingFeatures from './UpcomingFeatures';
import { difficultyColor } from '../../theme/theme';
import { problemsApi } from '../../api/problemsApi';
import { usersApi } from '../../api/usersApi';
import { submissionsApi } from '../../api/submissionsApi';
import { prepApi } from '../../api/prepApi';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const STATUS_COLOR = {
  Accepted: 'success',
  'Wrong Answer': 'error',
  'Time Limit Exceeded': 'warning',
  'Runtime Error': 'error',
  'Compilation Error': 'error',
};

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const sumValues = (obj) => DIFFICULTIES.reduce((s, d) => s + (obj?.[d] || 0), 0);

// Same featured problem all day, no backend field needed.
const dailyPageFor = (total) => (Math.floor(Date.now() / 86400000) % total) + 1;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}

// Easier picks for beginners, harder as they progress.
function recommendedTier(totalSolved) {
  if (totalSolved < 15) return { difficulty: 'Easy', caption: 'Easy problems you haven’t solved yet. Build momentum first.' };
  if (totalSolved < 60) return { difficulty: 'Medium', caption: 'Medium problems you haven’t solved yet. Time to level up.' };
  return { difficulty: undefined, caption: 'Unsolved problems, easiest-to-win first.' };
}

function SectionCard({ title, action, children, sx }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', ...sx }}>
      {(title || action) && (
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2.5, pt: 2, pb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {action}
        </Stack>
      )}
      {children}
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* Progress: ring + difficulty + streak + heatmap                      */
/* ------------------------------------------------------------------ */

function SolvedRing({ solved, totals, size = 120, strokeWidth = 8 }) {
  const theme = useTheme();
  const r = (size - strokeWidth) / 2;
  const C = 2 * Math.PI * r;
  const gap = 10;
  const seg = C / 3 - gap - strokeWidth;
  const startShift = ((gap / 2 + strokeWidth / 2) / C) * 360;
  const totalSolved = sumValues(solved);

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {DIFFICULTIES.map((d, i) => {
          const color = difficultyColor(d);
          const frac = totals[d] > 0 ? Math.min((solved[d] || 0) / totals[d], 1) : 0;
          return (
            <g key={d} transform={`rotate(${-90 + i * 120 + startShift} ${size / 2} ${size / 2})`}>
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.palette.divider} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={`${seg} ${C - seg}`} />
              {(solved[d] || 0) > 0 && (
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={`${Math.max(seg * frac, 0.01)} ${C}`} />
              )}
            </g>
          );
        })}
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: '1.7rem', fontWeight: 800, lineHeight: 1.1 }}>{totalSolved}</Typography>
        <Typography variant="caption" color="text.secondary">
          Solved
        </Typography>
      </Box>
    </Box>
  );
}

function ProgressCard({ user, isAuthenticated, solved, totals, activity }) {
  const days = activity.length ? activity : Array.from({ length: 49 }, (_, i) => ({ day: i, submissions: 0 }));
  const totalSubmissions = days.reduce((s, d) => s + d.submissions, 0);
  const activeDays = days.filter((d) => d.submissions > 0).length;

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, height: '100%', minWidth: 0 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        Your progress
      </Typography>

      <Stack direction="row" spacing={{ xs: 2, sm: 3 }} sx={{ alignItems: 'center' }}>
        <SolvedRing solved={solved} totals={totals} />
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          {DIFFICULTIES.map((d) => (
            <Stack
              key={d}
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 0.75, borderRadius: 2, bgcolor: 'action.hover' }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: difficultyColor(d) }}>
                {d}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {solved[d] || 0}
                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                  /{totals[d] || 0}
                </Box>
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>

      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 2.5, pt: 2 }}>
        {isAuthenticated ? (
          <>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <LocalFireDepartmentRoundedIcon fontSize="small" sx={{ color: 'warning.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {user?.streakDays ?? 0}-day streak
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto !important' }}>
                Longest {user?.longestStreak ?? 0}
              </Typography>
            </Stack>
            <Box sx={{ overflowX: 'auto' }}>
              <ActivityHeatmap data={days} />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Last 7 weeks: {totalSubmissions} submission{totalSubmissions === 1 ? '' : 's'} on {activeDays} active day{activeDays === 1 ? '' : 's'}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Sign in to save your progress, build a daily streak and see your activity heatmap here.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* Daily challenge                                                     */
/* ------------------------------------------------------------------ */

function DailyChallengeCard({ problem, loading, onRandom, randomLoading }) {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: (t) =>
          `linear-gradient(160deg, ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.16 : 0.09)}, transparent 70%)`,
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'primary.main' }}>
          <BoltRoundedIcon fontSize="small" />
          <Typography variant="overline" sx={{ fontWeight: 800, lineHeight: 1.4 }}>
            Daily challenge
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {today}
        </Typography>
      </Stack>

      {loading ? (
        <Box sx={{ flex: 1 }}>
          <Skeleton width="80%" height={32} />
          <Skeleton width={70} height={24} />
        </Box>
      ) : problem ? (
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25, mb: 1 }}>
            {problem.title}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: difficultyColor(problem.difficulty) }}>
              {problem.difficulty}
            </Typography>
            {problem.solvedByMe && (
              <Chip size="small" color="success" variant="outlined" icon={<CheckCircleRoundedIcon />} label="Solved" />
            )}
            {problem.locked && <Chip size="small" variant="outlined" label="Premium" />}
          </Stack>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          No problems published yet.
        </Typography>
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button
          component={RouterLink}
          to={problem ? `/workspace/${problem.slug}` : '/problems'}
          variant="contained"
          disableElevation
          startIcon={<PlayArrowRoundedIcon />}
          disabled={loading}
          sx={{ flex: 1, fontWeight: 700 }}
        >
          {problem?.solvedByMe ? 'Solve again' : 'Solve now'}
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onRandom}
          disabled={randomLoading}
          aria-label="Pick a random problem"
          sx={{ minWidth: 44, px: 1.25, borderColor: 'divider' }}
        >
          {randomLoading ? <CircularProgress size={18} /> : <ShuffleRoundedIcon fontSize="small" />}
        </Button>
      </Stack>
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* Up next: recommended + recent submissions                           */
/* ------------------------------------------------------------------ */

function ProblemLinkRow({ to, primary, secondary, right, divider }) {
  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        px: 2.5,
        py: 1.4,
        minHeight: 56,
        color: 'inherit',
        textDecoration: 'none',
        borderTop: divider ? '1px solid' : 'none',
        borderColor: 'divider',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
          {primary}
        </Typography>
        {secondary && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {secondary}
          </Typography>
        )}
      </Box>
      <Box sx={{ flexShrink: 0 }}>{right}</Box>
    </Box>
  );
}

function UpNextCard({ isAuthenticated, recommended, recommendedCaption, recommendedLoading, submissions }) {
  const [tab, setTab] = useState('recommended');
  const effectiveTab = tab === 'recent' && !isAuthenticated ? 'recommended' : tab;

  const resume = isAuthenticated && submissions[0] && submissions[0].status !== 'Accepted' && submissions[0].problem ? submissions[0] : null;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', pr: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tabs value={effectiveTab} onChange={(_e, v) => setTab(v)} sx={{ minHeight: 48, px: 1 }}>
          <Tab value="recommended" label="Recommended" sx={{ textTransform: 'none', fontWeight: 700, minHeight: 48 }} />
          {isAuthenticated && <Tab value="recent" label="Recent submissions" sx={{ textTransform: 'none', fontWeight: 700, minHeight: 48 }} />}
        </Tabs>
        <Button component={RouterLink} to="/problems" size="small" endIcon={<ArrowForwardRoundedIcon />} sx={{ fontWeight: 700, textTransform: 'none', flexShrink: 0 }}>
          All problems
        </Button>
      </Stack>

      {resume && (
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 2.5, py: 1.5, bgcolor: (t) => alpha(t.palette.warning.main, 0.08), borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.main' }}>
              CONTINUE WHERE YOU LEFT OFF
            </Typography>
            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
              {resume.problem.title}
            </Typography>
          </Box>
          <Button component={RouterLink} to={`/workspace/${resume.problem.slug}`} size="small" variant="contained" disableElevation sx={{ flexShrink: 0, fontWeight: 700 }}>
            Resume
          </Button>
        </Stack>
      )}

      {effectiveTab === 'recommended' && (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2.5, pt: 1.5, pb: 0.5 }}>
            {recommendedCaption}
          </Typography>
          {recommendedLoading ? (
            <Box sx={{ px: 2.5, py: 1 }}>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} height={44} />
              ))}
            </Box>
          ) : recommended.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
              Nothing to recommend right now. Browse all problems to find your next one.
            </Typography>
          ) : (
            recommended.map((p, i) => (
              <ProblemLinkRow
                key={p._id}
                to={`/workspace/${p.slug}`}
                divider={i > 0}
                primary={p.title}
                secondary={`${Number(p.acceptanceRate ?? 0).toFixed(1)}% acceptance`}
                right={
                  <Typography variant="body2" sx={{ fontWeight: 700, color: difficultyColor(p.difficulty) }}>
                    {p.difficulty}
                  </Typography>
                }
              />
            ))
          )}
        </>
      )}

      {effectiveTab === 'recent' &&
        (submissions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
            No submissions yet. Solve a problem and your history will show up here.
          </Typography>
        ) : (
          submissions.map((s, i) => (
            <ProblemLinkRow
              key={s._id}
              to={s.problem ? `/workspace/${s.problem.slug}` : '/problems'}
              divider={i > 0}
              primary={s.problem?.title ?? 'Unknown problem'}
              secondary={`${s.language ? s.language[0].toUpperCase() + s.language.slice(1) : '-'} · ${s.runtimeMs != null ? `${s.runtimeMs}ms` : '-'} · ${timeAgo(s.createdAt)}`}
              right={<Chip size="small" variant="outlined" color={STATUS_COLOR[s.status] || 'default'} label={s.status} />}
            />
          ))
        ))}
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* Right column: prep + pro                                            */
/* ------------------------------------------------------------------ */

function PrepCard({ isAuthenticated }) {
  const [companies, setCompanies] = useState(null); // null = loading, [] = none/failed

  useEffect(() => {
    let cancelled = false;
    prepApi
      .listCompanies()
      .then(({ data }) => {
        if (!cancelled) setCompanies(data?.data?.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setCompanies([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const top = useMemo(
    () => (companies ? [...companies].sort((a, b) => (b.readiness ?? -1) - (a.readiness ?? -1)).slice(0, 3) : []),
    [companies]
  );

  return (
    <SectionCard
      title="Prep by company"
      action={
        <Button component={RouterLink} to="/prep" size="small" endIcon={<ArrowForwardRoundedIcon />} sx={{ fontWeight: 700, textTransform: 'none' }}>
          All tracks
        </Button>
      }
    >
      <Box sx={{ px: 2.5, pb: 2 }}>
        {companies === null ? (
          <>
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
          </>
        ) : top.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            Get exam-ready company by company. See the exact exam pattern and track your readiness.
          </Typography>
        ) : (
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            {top.map((c) => (
              <Box key={c.slug} component={RouterLink} to={`/prep/${c.slug}`} sx={{ color: 'inherit', textDecoration: 'none', display: 'block', '&:hover .prep-name': { color: 'primary.main' } }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <BusinessRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography className="prep-name" variant="body2" noWrap sx={{ fontWeight: 600 }}>
                      {c.name}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 1 }}>
                    {c.readiness != null ? `${c.readiness}% ready` : c.examDurationMinutes ? `${c.examDurationMinutes} min exam` : `${c.sectionCount} sections`}
                  </Typography>
                </Stack>
                {c.readiness != null && <LinearProgress variant="determinate" value={Math.min(c.readiness, 100)} sx={{ height: 5, borderRadius: 3 }} />}
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </SectionCard>
  );
}

function ProCard({ user }) {
  const isPro = Boolean(user?.isPro);
  const expiry = user?.proExpiresAt ? new Date(user.proExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
        <WorkspacePremiumRoundedIcon sx={{ color: 'warning.main' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {isPro ? 'Pro is active' : 'Go Pro'}
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {isPro
          ? expiry
            ? `You have full access until ${expiry}.`
            : 'You have full access to every premium problem and prep track.'
          : 'Unlock company-tagged problems and every premium prep track.'}
      </Typography>
      {!isPro && (
        <Button component={RouterLink} to="/pricing" variant="outlined" size="small" sx={{ fontWeight: 700 }}>
          See plans
        </Button>
      )}
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [progress, setProgress] = useState(undefined); // undefined = loading, null = failed
  const [daily, setDaily] = useState(undefined);
  const [recommended, setRecommended] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [activity, setActivity] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [randomLoading, setRandomLoading] = useState(false);

  const userSolved = user ? (user.easySolved || 0) + (user.mediumSolved || 0) + (user.hardSolved || 0) : 0;
  const tier = recommendedTier(isAuthenticated ? userSolved : 0);

  // Progress totals + today's challenge (progress works for guests too).
  useEffect(() => {
    let cancelled = false;
    problemsApi
      .getProgress()
      .then(({ data }) => {
        if (cancelled) return null;
        setProgress(data.data);
        const total = sumValues(data.data.total);
        if (total === 0) {
          setDaily(null);
          return null;
        }
        return problemsApi.list({ page: dailyPageFor(total), limit: 1 }).then((res) => {
          if (!cancelled) setDaily(res.data.data.items[0] ?? null);
        });
      })
      .catch(() => {
        if (cancelled) return;
        setProgress((p) => (p === undefined ? null : p));
        setDaily((d) => (d === undefined ? null : d));
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Recommended problems
  useEffect(() => {
    let cancelled = false;
    setRecommendedLoading(true);
    const base = { page: 1, limit: 5, sort: 'acceptance-desc', status: isAuthenticated ? 'unsolved' : undefined };
    problemsApi
      .list({ ...base, difficulty: tier.difficulty })
      .then(({ data }) => {
        const items = data.data.items;
        if (items.length === 0 && tier.difficulty) return problemsApi.list(base).then((r) => r.data.data.items);
        return items;
      })
      .then((items) => {
        if (!cancelled) setRecommended(items);
      })
      .catch(() => {
        if (!cancelled) setRecommended([]);
      })
      .finally(() => {
        if (!cancelled) setRecommendedLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, tier.difficulty]);

  // Personal data
  useEffect(() => {
    if (!isAuthenticated) {
      setActivity([]);
      setSubmissions([]);
      return;
    }
    usersApi.activity().then(({ data }) => setActivity(data.data)).catch(() => {});
    submissionsApi.history({ limit: 5 }).then(({ data }) => setSubmissions(data.data.items)).catch(() => {});
  }, [isAuthenticated]);

  const handleRandom = () => {
    setRandomLoading(true);
    problemsApi
      .getRandom({ status: isAuthenticated ? 'unsolved' : undefined })
      .then(({ data }) => navigate(`/workspace/${data.data.slug}`))
      .catch(() => navigate('/problems'))
      .finally(() => setRandomLoading(false));
  };

  const totals = progress?.total ?? { Easy: 0, Medium: 0, Hard: 0 };
  const solved = progress?.solved ?? {
    Easy: user?.easySolved || 0,
    Medium: user?.mediumSolved || 0,
    Hard: user?.hardSolved || 0,
  };
  const firstName = user?.name ? user.name.split(' ')[0] : null;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, pb: { xs: 5, sm: 8 } }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {isAuthenticated ? `${greeting()}${firstName ? `, ${firstName}` : ''}` : 'Welcome to Jeet Code'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isAuthenticated
              ? userSolved > 0
                ? `You’ve solved ${userSolved} problem${userSolved === 1 ? '' : 's'}. Pick up where you left off.`
                : 'Solve your first problem today and start your streak.'
              : 'Practice coding problems, prepare for company exams and track your progress.'}
          </Typography>
        </Box>
        {!isAuthenticated && (
          <Button variant="contained" disableElevation onClick={() => navigate('/login')} sx={{ fontWeight: 700, flexShrink: 0 }}>
            Sign in
          </Button>
        )}
      </Stack>

      {/* Row 1: progress + daily challenge */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ProgressCard user={user} isAuthenticated={isAuthenticated} solved={solved} totals={totals} activity={activity} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <DailyChallengeCard problem={daily} loading={daily === undefined} onRandom={handleRandom} randomLoading={randomLoading} />
        </Grid>
      </Grid>

      {/* Row 2: what to do next + prep/pro */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 4, md: 6 } }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <UpNextCard
            isAuthenticated={isAuthenticated}
            recommended={recommended}
            recommendedCaption={tier.caption}
            recommendedLoading={recommendedLoading}
            submissions={submissions}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={{ xs: 2, md: 3 }}>
            <PrepCard isAuthenticated={isAuthenticated} />
            {isAuthenticated && <ProCard user={user} />}
          </Stack>
        </Grid>
      </Grid>

      {/* Roadmap */}
      <UpcomingFeatures />
    </Container>
  );
}
