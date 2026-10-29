import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { Box, Button, Collapse, Container, Drawer, IconButton, Stack, Typography, alpha, useMediaQuery, useTheme } from '@mui/material';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { problemsApi } from '../../api/problemsApi';
import { usersApi } from '../../api/usersApi';
import { submissionsApi } from '../../api/submissionsApi';
import { extractErrorMessage } from '../../api/apiClient';
import DashboardSidebar from './components/DashboardSidebar';
import PromoCarousel from './components/PromoCarousel';
import MobileHome from './components/MobileHome';
import ProblemLibrary from './components/ProblemLibrary';
import RightRail from './components/RightRail';
import { ExploreView, ListView, QuestsView } from './components/DashboardViews';
import ContestCard from '../contest/ContestCard';
import ContestPage from '../contest/ContestPage';
import StudyPlannerView from '../studyplan/StudyPlannerView';
import LeaderboardView from '../leaderboard/LeaderboardView';
import FriendsView from '../friends/FriendsView';
import { fetchFriends } from '../friends/friendsSlice';
import useProblemLists from './useProblemLists';
import useViewportFill from './useViewportFill';
import { STATUS_COLOR, featuredPageForToday, surface, utcKey } from './dashboardUtils';

// Same accent the other phone pages use.
const PHONE_ACCENT = '#6366F1';

// Phone-only dismissals, remembered on this device.
const NQT_DISMISS_KEY = 'jeetcode.dismissed.nqtCard';
const RESUME_DISMISS_KEY = 'jeetcode.dismissed.resume';
const readFlag = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeFlag = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode): the card simply stays hidden until reload.
  }
};

const VIEWS = ['library', 'contest', 'quests', 'explore', 'plans', 'leaderboard', 'friends', 'list'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const friends = useSelector((s) => s.friends);

  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const rootRef = useRef(null);
  const [params, setParams] = useSearchParams();
  const listsApi = useProblemLists(user?.id);

  // A study-plan invite link carries ?join=CODE, but the login redirect only keeps the path.
  // Remember the code across login, then reopen the Study Plan view with the join card.
  useEffect(() => {
    const code = params.get('join');
    if (code && !isAuthenticated) sessionStorage.setItem('jeetcode.pendingJoin', code);
    if (isAuthenticated) {
      const pending = sessionStorage.getItem('jeetcode.pendingJoin');
      if (pending) {
        sessionStorage.removeItem('jeetcode.pendingJoin');
        setParams({ view: 'plans', join: pending }, { replace: true });
      }
    }
  }, [isAuthenticated, params, setParams]);

  // Friend invite links (?view=friends&invite=handle): same trick as the study-plan join code —
  // remember the handle across login/sign-up, then reopen the Friends tab with the accept card.
  useEffect(() => {
    const handle = params.get('invite');
    if (handle && !isAuthenticated) sessionStorage.setItem('jeetcode.pendingInvite', handle);
    if (isAuthenticated) {
      const pending = sessionStorage.getItem('jeetcode.pendingInvite');
      if (pending) {
        sessionStorage.removeItem('jeetcode.pendingInvite');
        setParams({ view: 'friends', invite: pending }, { replace: true });
      }
    }
  }, [isAuthenticated, params, setParams]);

  // One shared friends list for the sidebar badge, Friends tab and leaderboard.
  useEffect(() => {
    if (isAuthenticated) dispatch(fetchFriends());
  }, [isAuthenticated, user?.id, dispatch]);

  const [progress, setProgress] = useState(null);
  const [featured, setFeatured] = useState(null);
  const [activity, setActivity] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [preset, setPreset] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [nqtDismissed, setNqtDismissed] = useState(() => readFlag(NQT_DISMISS_KEY) === '1');
  const [dismissedResumeId, setDismissedResumeId] = useState(() => readFlag(RESUME_DISMISS_KEY));

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

  // On wide screens the page is exactly one window tall: sidebar and streak rail stay put and
  // only the middle column scrolls (the leaderboard scrolls its own list instead).
  const fillH = useViewportFill(rootRef, isLg);
  const showRail = !['plans', 'leaderboard', 'friends', 'explore', 'contest', 'quests'].includes(currentView);
  const ownScroll = currentView === 'leaderboard' || currentView === 'quests';

  const goView = useCallback((v) => setParams(v === 'library' ? {} : { view: v }), [setParams]);
  const selectList = useCallback((id) => setParams({ view: 'list', list: id }), [setParams]);

  const browse = useCallback(
    (p = {}) => {
      // Phones have no library on the dashboard, so open the Problems page with the same filters.
      if (!isMdUp) {
        const sp = new URLSearchParams();
        (p.tags || []).forEach((t) => sp.append('tag', t));
        (p.companies || []).forEach((c) => sp.append('company', c));
        const qs = sp.toString();
        navigate(qs ? `/problems?${qs}` : '/problems');
        return;
      }
      if (p.tags || p.companies) setPreset({ tags: p.tags || [], companies: p.companies || [] });
      goView('library');
    },
    [goView, isMdUp, navigate]
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

  const showResumeBar = Boolean(resume) && dismissedResumeId !== String(resume?._id);

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
        gradient: 'linear-gradient(135deg,#334155,#0F172A)',
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
        gradient: 'linear-gradient(135deg,#B45309,#78350F)',
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
        gradient: 'linear-gradient(135deg,#0E7490,#164E63)',
      }
    );
    return list;
  }, [featured, user?.isPro]);

  const fade = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.18 } };

  // Phone: the contest page is a full screen of its own (no dashboard header around it).
  if (!isMdUp && currentView === 'contest') return <ContestPage embedded />;

  // Phone: the leaderboard is also a full screen of its own, with its own header.
  if (!isMdUp && currentView === 'leaderboard') return <LeaderboardView isAuthenticated={isAuthenticated} />;

  return (
    <Box
      ref={rootRef}
      sx={{
        ...(fillH ? { height: fillH, overflow: 'hidden' } : { minHeight: 'calc(100vh - 64px)' }),
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: 1480, py: { xs: 2, md: 3 }, px: { xs: 1.75, sm: 3 }, height: fillH ? '100%' : 'auto' }}>
        <Box
          sx={{
            display: 'grid',
            rowGap: { xs: 2, md: 3 },
            columnGap: { xs: 0, md: 3, lg: 0 },
            alignItems: 'start',
            height: fillH ? '100%' : 'auto',
            gridTemplateRows: fillH ? 'minmax(0, 1fr)' : undefined,
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: '200px minmax(0, 1fr)',
              lg: `232px minmax(0, 1fr) ${showRail ? '340px' : '0px'}`,
            },
            transition: 'grid-template-columns .4s cubic-bezier(.4,0,.2,1)',
          }}
        >
          <Box className="autohide-scroll" sx={{ display: { xs: 'none', md: 'block' }, position: { md: 'sticky' }, top: { md: 84, lg: 0 }, pr: { lg: 3 }, height: { lg: '100%' }, overflowY: { lg: 'auto' }, minHeight: 0 }}>
            <DashboardSidebar
              view={currentView}
              activeListId={activeList?.id}
              lists={listsApi.lists}
              maxLists={listsApi.maxLists}
              onView={goView}
              onSelectList={selectList}
              onCreateList={listsApi.createList}
              friendCounts={isAuthenticated ? { friends: friends.friends.length, incoming: friends.incoming.length } : null}
            />
          </Box>

          <Box
            component="section"
            className="autohide-scroll"
            aria-label="Dashboard content"
            sx={{
              minWidth: 0,
              minHeight: 0,
              ...(fillH && {
                height: '100%',
                overflowY: ownScroll ? 'hidden' : 'auto',
                overflowX: 'hidden',
                pr: ownScroll ? 0 : 1,
                scrollbarGutter: ownScroll ? 'auto' : 'stable',
              }),
            }}
          >
            {/* The library stays mounted while other views are open, so
                filters, page and search survive a trip to Quests or Explore. */}
            <Box sx={{ display: currentView === 'library' ? 'block' : 'none' }}>
              <Stack spacing={2.5} sx={{ position: 'relative', zIndex: 1 }}>
                {/* Phone header: streak on the left, plan calendar on the right. */}
                {!isMdUp && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
                    {isAuthenticated ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <LocalFireDepartmentRoundedIcon sx={{ fontSize: 24, color: 'warning.main' }} />
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>
                          {user?.streakDays ?? 0}-day streak
                        </Typography>
                      </Box>
                    ) : (
                      <span />
                    )}
                    <IconButton
                      onClick={() => setCalendarOpen(true)}
                      aria-label="Open calendar"
                      sx={(t) => ({ width: 44, height: 44, color: PHONE_ACCENT, bgcolor: alpha(PHONE_ACCENT, t.palette.mode === 'dark' ? 0.16 : 0.09) })}
                    >
                      <CalendarMonthRoundedIcon />
                    </IconButton>
                  </Box>
                )}

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

                {/* Wide screens keep the promo carousel; phones get the swipeable home sections. */}
                {isMdUp ? (
                  <PromoCarousel cards={cards} />
                ) : (
                  <MobileHome
                    cards={cards}
                    progress={progress}
                    isAuthenticated={isAuthenticated}
                    nqtDismissed={nqtDismissed}
                    onDismissNqt={() => {
                      writeFlag(NQT_DISMISS_KEY, '1');
                      setNqtDismissed(true);
                    }}
                  />
                )}

                {isMdUp && resume && (
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
                        color: 'primary.contrastText',
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

                {/* Phones browse problems from the home sections and the Problems tab, so the library is wide-screen only. */}
                {isMdUp && (
                  <ProblemLibrary
                    isAuthenticated={isAuthenticated}
                    progress={progress}
                    dailyId={featured?._id}
                    preset={preset}
                    listsApi={listsApi}
                  />
                )}

                {isMdUp && <ContestCard />}
                {!isMdUp && showResumeBar && <Box aria-hidden sx={{ height: 76 }} />}
              </Stack>
            </Box>

            {currentView !== 'library' && (
              <AnimatePresence mode="wait">
                <motion.div key={`${currentView}:${activeList?.id ?? ''}`} {...fade}>
                  {currentView === 'contest' && <ContestPage embedded />}
                  {currentView === 'quests' && (
                    <QuestsView user={user} isAuthenticated={isAuthenticated} checkedIn={checkedIn} onPick={pickRandom} />
                  )}
                  {currentView === 'explore' && <ExploreView onBrowse={browse} />}
                  {currentView === 'plans' && <StudyPlannerView isAuthenticated={isAuthenticated} />}
                  {currentView === 'leaderboard' && <LeaderboardView isAuthenticated={isAuthenticated} />}
                  {currentView === 'friends' && (
                    <FriendsView
                      isAuthenticated={isAuthenticated}
                      user={user}
                      inviteHandle={params.get('invite')}
                      onClearInvite={() => setParams({ view: 'friends' }, { replace: true })}
                      onOpenLeaderboard={() => setParams({ view: 'leaderboard', scope: 'friends' })}
                    />
                  )}
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

          {/* Streak + calendar rail. Slides away on Study Plan and Leaderboard. */}
          {isLg ? (
            <Box
              className="autohide-scroll"
              aria-hidden={!showRail}
              sx={{
                minWidth: 0,
                minHeight: 0,
                height: '100%',
                overflowX: 'hidden',
                overflowY: showRail ? 'auto' : 'hidden',
                pl: 3,
                opacity: showRail ? 1 : 0,
                transform: showRail ? 'none' : 'translateX(28px)',
                pointerEvents: showRail ? 'auto' : 'none',
                transition: 'opacity .3s ease, transform .4s cubic-bezier(.4,0,.2,1)',
              }}
            >
              <Box sx={{ width: 316 }}>
                <RightRail user={user} isAuthenticated={isAuthenticated} progress={progress} activity={activity} />
              </Box>
            </Box>
          ) : isMdUp ? (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Collapse in={showRail} timeout={350} unmountOnExit>
                <RightRail user={user} isAuthenticated={isAuthenticated} progress={progress} activity={activity} />
              </Collapse>
            </Box>
          ) : null}
        </Box>
      </Container>

      {/* Phone: continue bar above the bottom navigation. */}
      {!isMdUp && currentView === 'library' && showResumeBar && (
        <Box
          sx={(t) => ({
            position: 'fixed',
            left: 12,
            right: 12,
            bottom: 'calc(84px + env(safe-area-inset-bottom))',
            zIndex: t.zIndex.appBar - 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            pl: 1.25,
            pr: 0.5,
            py: 0.75,
            borderRadius: '20px',
            bgcolor: t.palette.mode === 'dark' ? alpha(PHONE_ACCENT, 0.22) : alpha(PHONE_ACCENT, 0.14),
            backdropFilter: 'blur(12px)',
            border: `1px solid ${alpha(PHONE_ACCENT, 0.25)}`,
          })}
        >
          <Box sx={{ width: 40, height: 40, borderRadius: '12px', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: alpha(PHONE_ACCENT, 0.2), color: PHONE_ACCENT }}>
            <PlayArrowRoundedIcon />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.25 }}>
              {resume.problem.title}
            </Typography>
            <Typography noWrap variant="caption" color="text.secondary">
              Pick up where you left off ·{' '}
              <Box component="span" sx={{ color: STATUS_COLOR[resume.status] || 'text.secondary', fontWeight: 600 }}>
                {resume.status}
              </Box>
            </Typography>
          </Box>
          <IconButton component={RouterLink} to={`/workspace/${resume.problem.slug}`} aria-label={`Resume ${resume.problem.title}`} sx={{ color: PHONE_ACCENT }}>
            <PlayArrowRoundedIcon />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Dismiss resume bar"
            onClick={() => {
              writeFlag(RESUME_DISMISS_KEY, String(resume._id));
              setDismissedResumeId(String(resume._id));
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Phone calendar sheet: streak calendar with study-plan deadlines. */}
      <Drawer
        anchor="bottom"
        open={calendarOpen && !isMdUp}
        onClose={() => setCalendarOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: '24px 24px 0 0', maxHeight: '90dvh', pb: 'env(safe-area-inset-bottom)' } } }}
      >
        <Box sx={{ px: 1.75, pt: 1.25, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
              Calendar
            </Typography>
            <IconButton onClick={() => setCalendarOpen(false)} aria-label="Close calendar" sx={{ width: 44, height: 44 }}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>
          <RightRail phone user={user} isAuthenticated={isAuthenticated} progress={progress} activity={activity} />
          {isAuthenticated && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SchoolRoundedIcon />}
              onClick={() => {
                setCalendarOpen(false);
                goView('plans');
              }}
              sx={{ mt: 2, fontWeight: 700, height: 48, borderRadius: 99, color: PHONE_ACCENT, borderColor: alpha(PHONE_ACCENT, 0.5) }}
            >
              Open Study Plans
            </Button>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
