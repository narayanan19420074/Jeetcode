import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { Box, Button, Container, Stack, Typography, alpha } from '@mui/material';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { problemsApi } from '../../api/problemsApi';
import { usersApi } from '../../api/usersApi';
import { submissionsApi } from '../../api/submissionsApi';
import { extractErrorMessage } from '../../api/apiClient';
import DashboardSidebar from './components/DashboardSidebar';
import PromoCarousel from './components/PromoCarousel';
import ProblemLibrary from './components/ProblemLibrary';
import RightRail from './components/RightRail';
import { ExploreView, ListView, QuestsView, StudyPlanView } from './components/DashboardViews';
import useProblemLists from './useProblemLists';
import { STATUS_COLOR, featuredPageForToday, surface, utcKey } from './dashboardUtils';

const VIEWS = ['library', 'quests', 'explore', 'plans', 'list'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [params, setParams] = useSearchParams();
  const listsApi = useProblemLists(user?.id);

  const [progress, setProgress] = useState(null);
  const [featured, setFeatured] = useState(null);
  const [activity, setActivity] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [preset, setPreset] = useState(null);

  // Totals + solved counts per difficulty (one call), then today's featured
  // problem. Same deterministic "problem of the day" the old dashboard used.
  useEffect(() => {
    let cancelled = false;
    problemsApi
      .getProgress()
      .then(({ data }) => {
        if (cancelled) return null;
        setProgress(data.data);
        const t = data.data.total;
        const total = t.Easy + t.Medium + t.Hard;
        return total > 0 ? problemsApi.list({ page: featuredPageForToday(total), limit: 1 }) : null;
      })
      .then((res) => {
        if (!cancelled && res) setFeatured(res.data.data.items[0] || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setActivity([]);
      setSubmissions([]);
      return;
    }
    usersApi.activity().then(({ data }) => setActivity(data.data)).catch(() => {});
    submissionsApi.history({ limit: 5 }).then(({ data }) => setSubmissions(data.data.items)).catch(() => {});
  }, [isAuthenticated]);

  // ----- view routing (kept in the URL so Back and refresh behave) -----
  const rawView = params.get('view');
  const view = VIEWS.includes(rawView) ? rawView : 'library';
  const listId = params.get('list') || 'favorite';
  const activeList = listsApi.lists.find((l) => l.id === listId);
  const currentView = view === 'list' && !activeList ? 'library' : view;

  const goView = useCallback((v) => setParams(v === 'library' ? {} : { view: v }), [setParams]);
  const selectList = useCallback((id) => setParams({ view: 'list', list: id }), [setParams]);

  const browse = useCallback(
    (p = {}) => {
      if (p.tags || p.companies) setPreset({ tags: p.tags || [], companies: p.companies || [] });
      goView('library');
    },
    [goView]
  );

  const pickRandom = useCallback(
    (difficulty) =>
      problemsApi
        .getRandom({ difficulty: difficulty || undefined, status: isAuthenticated ? 'unsolved' : undefined })
        .then(({ data }) => navigate(`/workspace/${data.data.slug}`))
        .catch((err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'warning' })),
    [isAuthenticated, navigate, enqueueSnackbar]
  );

  const checkedIn = useMemo(() => {
    const today = utcKey(new Date());
    return activity.some((a) => a.date === today && a.submissions > 0);
  }, [activity]);

  // A failed or unfinished attempt on a problem that was never accepted.
  const resume = useMemo(
    () =>
      submissions.find(
        (s) =>
          s.problem?.slug &&
          s.status !== 'Accepted' &&
          !submissions.some((x) => x.status === 'Accepted' && String(x.problem?._id) === String(s.problem._id))
      ),
    [submissions]
  );

  const cards = useMemo(() => {
    const list = [];
    if (featured) {
      list.push({
        key: 'daily',
        title: 'Today’s challenge',
        text: `${featured.title} (${featured.difficulty})`,
        cta: 'Solve now',
        to: `/workspace/${featured.slug}`,
        icon: EventRoundedIcon,
        gradient: 'linear-gradient(135deg,#1D4ED8,#4F46E5)',
      });
    }
    list.push({
      key: 'prep',
      title: 'Prep by company',
      text: 'See the exam pattern and track how ready you are for each drive.',
      cta: 'Open prep',
      to: '/prep',
      icon: BusinessRoundedIcon,
      gradient: 'linear-gradient(135deg,#047857,#0E7490)',
    });
    if (!user?.isPro) {
      list.push({
        key: 'pro',
        title: 'Go Pro',
        text: 'Unlock every problem tagged with a company.',
        cta: 'See plans',
        to: '/pricing',
        icon: WorkspacePremiumRoundedIcon,
        gradient: 'linear-gradient(135deg,#D97706,#92400E)',
      });
    }
    list.push(
      {
        key: 'aptitude',
        title: 'Aptitude practice',
        text: 'Learn a pattern, practice it, then take a timed test.',
        cta: 'Start practicing',
        to: '/aptitude',
        icon: CalculateRoundedIcon,
        gradient: 'linear-gradient(135deg,#7C3AED,#4C1D95)',
      },
      {
        key: 'visualizer',
        title: 'Algorithm visualizer',
        text: 'Watch sorting, searching and graph algorithms run step by step.',
        cta: 'Explore',
        to: '/visualizer',
        icon: BarChartRoundedIcon,
        gradient: 'linear-gradient(135deg,#0891B2,#155E75)',
      }
    );
    return list;
  }, [featured, user?.isPro]);

  const fade = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.18 } };

  return (
    <Box
      sx={(t) => ({
        minHeight: 'calc(100vh - 64px)',
        backgroundImage:
          t.palette.mode === 'dark'
            ? 'radial-gradient(900px 380px at 78% -60px, rgba(59,130,246,0.13), transparent 70%), radial-gradient(700px 320px at 6% 0, rgba(139,92,246,0.08), transparent 70%)'
            : 'radial-gradient(900px 380px at 78% -60px, rgba(59,130,246,0.09), transparent 70%)',
        backgroundRepeat: 'no-repeat',
      })}
    >
      <Container maxWidth={false} sx={{ maxWidth: 1480, py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 3 } }}>
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2, md: 3 },
            alignItems: 'start',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '200px minmax(0, 1fr)', lg: '208px minmax(0, 1fr) 316px' },
          }}
        >
          <Box sx={{ position: { md: 'sticky' }, top: { md: 84 } }}>
            <DashboardSidebar
              view={currentView}
              activeListId={activeList?.id}
              lists={listsApi.lists}
              maxLists={listsApi.maxLists}
              onView={goView}
              onSelectList={selectList}
              onCreateList={listsApi.createList}
            />
          </Box>

          <Box component="section" aria-label="Dashboard content" sx={{ minWidth: 0 }}>
            {/* The library stays mounted while other views are open, so
                filters, page and search survive a trip to Quests or Explore. */}
            <Box sx={{ display: currentView === 'library' ? 'block' : 'none' }}>
              <Stack spacing={2.5}>
                {!isAuthenticated && (
                  <Box sx={[surface, { p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }]}>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
                      You're browsing as a guest. Sign up to save streaks, track submissions, and unlock AI hints. It's free.
                    </Typography>
                    <Button variant="contained" disableElevation size="small" onClick={() => navigate('/login')} sx={{ fontWeight: 700 }}>
                      Sign up free
                    </Button>
                  </Box>
                )}

                <PromoCarousel cards={cards} />

                {resume && (
                  <Box
                    sx={[
                      surface,
                      (t) => ({
                        px: 2,
                        py: 1.25,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        background: `linear-gradient(90deg, ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.14 : 0.08)}, transparent 55%), ${t.palette.background.paper}`,
                      }),
                    ]}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'primary.main',
                        color: '#fff',
                      }}
                    >
                      <PlayArrowRoundedIcon fontSize="small" />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Pick up where you left off
                      </Typography>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
                        {resume.problem.title}{' '}
                        <Box component="span" sx={{ color: STATUS_COLOR[resume.status] || 'text.secondary', fontWeight: 600 }}>
                          ({resume.status})
                        </Box>
                      </Typography>
                    </Box>
                    <Button component={RouterLink} to={`/workspace/${resume.problem.slug}`} size="small" variant="contained" disableElevation sx={{ fontWeight: 700, flexShrink: 0 }}>
                      Resume
                    </Button>
                  </Box>
                )}

                <ProblemLibrary
                  isAuthenticated={isAuthenticated}
                  progress={progress}
                  dailyId={featured?._id}
                  preset={preset}
                  listsApi={listsApi}
                />
              </Stack>
            </Box>

            {currentView !== 'library' && (
              <AnimatePresence mode="wait">
                <motion.div key={`${currentView}:${activeList?.id ?? ''}`} {...fade}>
                  {currentView === 'quests' && (
                    <QuestsView user={user} isAuthenticated={isAuthenticated} checkedIn={checkedIn} onPick={pickRandom} />
                  )}
                  {currentView === 'explore' && <ExploreView onBrowse={browse} />}
                  {currentView === 'plans' && <StudyPlanView />}
                  {currentView === 'list' && activeList && (
                    <ListView
                      list={activeList}
                      onRemove={(p) => listsApi.toggleItem(activeList.id, p)}
                      onRename={(name) => listsApi.renameList(activeList.id, name)}
                      onDelete={() => {
                        listsApi.deleteList(activeList.id);
                        goView('library');
                      }}
                      onBrowse={browse}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </Box>

          <Box sx={{ gridColumn: { xs: 'auto', md: '1 / -1', lg: 'auto' } }}>
            <RightRail user={user} isAuthenticated={isAuthenticated} progress={progress} activity={activity} submissions={submissions} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
