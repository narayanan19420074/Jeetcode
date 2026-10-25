import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { Alert, Box, Button, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { questApi } from '../../api/questApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from '../auth/authSlice';
import { Bar, Coin, Diamond, FFButton, MissionsDialog, RewardDialog, Stat, TopUpDialog } from './QuestParts';
import { cut, goalMilestone, levelInfo, panelSx, rarityColor, useFF } from './questUtils';

// three.js is heavy, so the 3D parts only download when this page opens.
const QuestRoadScene = lazy(() => import('./QuestRoadScene'));
const ButterflyShowcase = lazy(() => import('./ButterflyShowcase'));

const Loading = ({ height, F }) => (
  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 300px' }, height }}>
    <Skeleton variant="rectangular" sx={{ height: { xs: 420, lg: '100%' }, bgcolor: F.panel }} />
    <Skeleton variant="rectangular" sx={{ height: { xs: 360, lg: '100%' }, bgcolor: F.panel }} />
  </Box>
);

// One screen: the road map (check-in progress, rewards) on the left, your butterfly and its upgrade on the right.
// The server decides everything (progress, claims, diamonds, upgrades); this page only shows what it returns.
export default function QuestsView({ isAuthenticated, onPick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduce = Boolean(useReducedMotion());
  const F = useFF();
  const { enqueueSnackbar } = useSnackbar();
  const wallet = useSelector((s) => s.auth.user);
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [reward, setReward] = useState(null);
  const [missions, setMissions] = useState(false);
  const [topUp, setTopUp] = useState({ open: false, want: 1 });
  const [converting, setConverting] = useState(false);
  const [failed, setFailed] = useState({ road: false, fly: false });
  const flyApi = useRef(null);

  // Same trick as the leaderboard: the dashboard gives this view no height, so on wide screens measure the room left
  // under it and fill exactly that. The page never scrolls; the sidebar and rail stay put.
  const isLg = useMediaQuery(useTheme().breakpoints.up('lg'));
  const [wrapEl, setWrapEl] = useState(null);
  const [fitH, setFitH] = useState(null);
  useLayoutEffect(() => {
    if (!isLg || !wrapEl) {
      setFitH(null);
      return undefined;
    }
    const measure = () => setFitH(Math.max(420, Math.round(window.innerHeight - wrapEl.getBoundingClientRect().top - 24)));
    measure();
    window.addEventListener('resize', measure);
    const t1 = setTimeout(measure, 450); // after the page's fade-in
    const t2 = setTimeout(measure, 1500); // after the offer banner (if any) loads
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isLg, wrapEl]);
  const wrapH = isLg ? (fitH ? `${fitH}px` : 'calc(100dvh - 150px)') : 'auto';
  const roadFail = useCallback(() => setFailed((f) => ({ ...f, road: true })), []);
  const flyFail = useCallback(() => setFailed((f) => ({ ...f, fly: true })), []);

  const load = useCallback(() => {
    setError(null);
    return questApi
      .get()
      .then(({ data }) => setState(data.data))
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  useEffect(() => {
    setState(null);
    load();
  }, [load, isAuthenticated]);

  const login = useCallback(() => navigate('/login'), [navigate]);
  const fail = useCallback(
    (err) => {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'warning' });
      load();
    },
    [enqueueSnackbar, load]
  );

  const claim = useCallback(
    async (quest) => {
      if (!isAuthenticated) return login();
      setBusy(quest.id);
      try {
        const { data } = await questApi.claim(quest.id);
        setState(data.data.state);
        dispatch(userUpdated(data.data.user));
        setReward(data.data);
      } catch (err) {
        fail(err);
      } finally {
        setBusy(null);
      }
    },
    [isAuthenticated, login, dispatch, fail]
  );

  const convert = useCallback(
    async (n) => {
      setConverting(true);
      try {
        const { data } = await questApi.convert(n);
        setState(data.data.state);
        dispatch(userUpdated(data.data.user));
        setTopUp({ open: false, want: 1 });
        enqueueSnackbar(`+${n} diamond${n > 1 ? 's' : ''}`, { variant: 'success' });
      } catch (err) {
        fail(err);
      } finally {
        setConverting(false);
      }
    },
    [dispatch, enqueueSnackbar, fail]
  );

  const upgrade = useCallback(async () => {
    if (!isAuthenticated) return login();
    const next = state.butterfly.next;
    const have = wallet?.diamonds ?? state.diamonds ?? 0;
    if (have < next.cost) {
      setTopUp({ open: true, want: next.cost - have });
      return undefined;
    }
    setBusy('upgrade');
    try {
      const { data } = await questApi.upgradeButterfly();
      setState(data.data.state);
      dispatch(userUpdated(data.data.user));
      setTimeout(() => flyApi.current?.celebrate(), 150);
      enqueueSnackbar(`${next.name} butterfly unlocked`, { variant: 'success' });
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
    return undefined;
  }, [isAuthenticated, login, state, wallet, dispatch, enqueueSnackbar, fail]);

  if (error && !state) {
    return (
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>
        {error}
      </Alert>
    );
  }
  if (!state) return <Box ref={setWrapEl} sx={{ height: wrapH }}><Loading height="100%" F={F} /></Box>;

  const goal = goalMilestone(state.milestones);
  const info = levelInfo(state.xp);
  const coins = isAuthenticated ? wallet?.coins ?? state.coins ?? 0 : 0;
  const diamonds = isAuthenticated ? wallet?.diamonds ?? state.diamonds ?? 0 : 0;
  const { butterfly } = state;
  const ready = [...state.quests].filter((q) => q.claimable).length;
  const rarity = rarityColor(butterfly.current.rarity, F.dark);
  const short = butterfly.next ? Math.max(0, butterfly.next.cost - diamonds) : 0;
  const hud = { position: 'absolute', zIndex: 2 };

  return (
    <Box ref={setWrapEl} sx={{ height: wrapH, display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 300px' }, gridTemplateRows: { lg: 'minmax(0, 1fr)' } }}>
      {/* ------------------------------------------------ road map */}
      <Box sx={{ ...panelSx(F), clipPath: cut(16), position: 'relative', overflow: 'hidden', minHeight: { xs: 460, lg: 0 }, background: F.bg }}>
        {failed.road ? (
          <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', p: 3 }}>
            <Typography sx={{ fontWeight: 800 }}>The 3D map needs WebGL, which this browser has turned off.</Typography>
          </Box>
        ) : (
          <Suspense fallback={<Skeleton variant="rectangular" sx={{ position: 'absolute', inset: 0, bgcolor: F.panel }} />}>
            <Box sx={{ position: 'absolute', inset: 0 }}>
              <QuestRoadScene dark={F.dark} milestones={state.milestones} goalTarget={goal.target} days={state.activeDays} reduce={reduce} onClaim={claim} onFail={roadFail} />
            </Box>
          </Suspense>
        )}

        {/* top left: level + streak */}
        <Box sx={{ ...hud, top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, pl: 0.5, pr: 1.75, height: 48, bgcolor: F.hud, border: `1px solid ${F.line}`, clipPath: cut(9) }}>
            <Box sx={{ width: 40, height: 40, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 20, color: '#10131A', background: `linear-gradient(180deg, ${F.orangeHi}, ${F.orange})`, clipPath: cut(7) }}>{info.level}</Box>
            <Box sx={{ width: 120 }}>
              <Typography noWrap sx={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.2 }}>{info.rank}</Typography>
              <Bar pct={info.pct} height={6} />
            </Box>
          </Box>
          <Stat icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: 20, color: F.orange }} />} value={state.streakDays} label="Day streak" />
        </Box>

        {/* top right: wallet */}
        <Box sx={{ ...hud, top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated && <Stat icon={<Coin />} value={coins.toLocaleString('en-IN')} label="Coins" />}
          {isAuthenticated && <Stat icon={<Diamond />} value={diamonds.toLocaleString('en-IN')} label="Diamonds" />}
          <FFButton tone="blue" onClick={() => (isAuthenticated ? setTopUp({ open: true, want: 1 }) : login())} sx={{ minHeight: 40, px: 2 }}>Top up</FFButton>
        </Box>

        {/* bottom: missions + today's check-in */}
        <Box sx={{ ...hud, left: 14, bottom: 14 }}>
          <FFButton tone="dark" onClick={() => setMissions(true)} sx={{ position: 'relative', border: `1px solid ${F.line}` }}>
            <AssignmentRoundedIcon sx={{ fontSize: 20 }} /> Missions
            {ready > 0 && <Box component="span" sx={{ position: 'absolute', top: -6, right: -6, minWidth: 20, height: 20, px: 0.5, display: 'grid', placeItems: 'center', fontSize: 12, color: '#fff', bgcolor: F.red, borderRadius: 10 }}>{ready}</Box>}
          </FFButton>
        </Box>
        <Box sx={{ ...hud, left: '50%', bottom: 14, transform: 'translateX(-50%)', textAlign: 'center' }}>
          {!isAuthenticated ? (
            <FFButton onClick={login}>Log in to start</FFButton>
          ) : state.checkedInToday ? (
            <Box sx={{ ...buttonLike(F), color: F.green, border: `1px solid ${F.green}` }}><CheckRoundedIcon sx={{ fontSize: 20 }} /> Checked in today</Box>
          ) : (
            <FFButton onClick={() => onPick(null)}><PlayArrowRoundedIcon /> Solve today&apos;s problem</FFButton>
          )}
        </Box>
        <Box sx={{ ...hud, right: 14, bottom: 14, textAlign: 'right' }}>
          <Typography sx={{ fontWeight: 900, fontSize: 22, lineHeight: 1, fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 8px #000' }}>
            {state.activeDays}<Box component="span" sx={{ color: F.muted }}> / {goal.target}</Box>
          </Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: F.muted, textShadow: '0 2px 8px #000' }}>CHECK-INS</Typography>
        </Box>
      </Box>

      {/* ------------------------------------------------ butterfly */}
      <Box component="aside" aria-label="Your butterfly" sx={{ ...panelSx(F), clipPath: cut(16), display: 'flex', flexDirection: 'column', minHeight: { xs: 460, lg: 0 } }}>
        <Box sx={{ px: 2, pt: 1.75 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.16em', color: F.muted }}>MY BUTTERFLY</Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
            <Typography noWrap sx={{ fontWeight: 900, fontSize: 22, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{butterfly.current.name}</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: rarity }}>{butterfly.current.rarity}</Typography>
          </Box>
        </Box>

        <Box sx={{ position: 'relative', flex: 1, minHeight: 200, background: `radial-gradient(ellipse at 50% 55%, ${rarity}33, transparent 68%)` }}>
          {failed.fly ? null : (
            <Suspense fallback={null}>
              <ButterflyShowcase dark={F.dark} styleId={butterfly.current.id} reduce={reduce} onFail={flyFail} apiRef={flyApi} />
            </Suspense>
          )}
        </Box>

        <Box sx={{ px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography sx={{ fontWeight: 900, fontSize: 13, letterSpacing: '0.08em' }}>LEVEL {butterfly.level} / {butterfly.max}</Typography>
            {butterfly.next && <Typography sx={{ fontSize: 12, color: F.muted }}>Next: {butterfly.next.name}</Typography>}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }} aria-hidden>
            {butterfly.tiers.map((id, i) => (
              <Box key={id} sx={{ flex: 1, height: 6, bgcolor: i < butterfly.level ? F.orange : F.inset, border: `1px solid ${i < butterfly.level ? F.orange : F.line}` }} />
            ))}
          </Box>
          {butterfly.next ? (
            <>
              <FFButton tone={short > 0 ? 'blue' : 'orange'} disabled={busy === 'upgrade'} onClick={upgrade} sx={{ width: '100%', minHeight: 52, fontSize: 16 }}>
                <ArrowUpwardRoundedIcon /> {busy === 'upgrade' ? 'Upgrading…' : 'Upgrade'}
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, ml: 0.5, px: 1, py: 0.2, bgcolor: F.hud, color: F.text, clipPath: cut(5) }}>
                  <Diamond size={16} /> {butterfly.next.cost}
                </Box>
              </FFButton>
              <Typography sx={{ mt: 0.75, textAlign: 'center', fontSize: 12.5, color: short > 0 ? F.orangeHi : F.muted }}>
                {isAuthenticated ? (short > 0 ? `Need ${short} more diamond${short > 1 ? 's' : ''}. Tap to top up.` : `You have ${diamonds} diamonds`) : 'Log in to upgrade'}
              </Typography>
            </>
          ) : (
            <Box sx={{ ...buttonLike(F), justifyContent: 'center', width: '100%', color: F.yellow, border: `1px solid ${F.yellow}` }}>Max level</Box>
          )}
        </Box>
      </Box>

      <TopUpDialog open={topUp.open} want={topUp.want} onClose={() => setTopUp({ open: false, want: 1 })} coins={coins} diamonds={diamonds} rate={state.coinsPerDiamond} busy={converting} onConvert={convert} />
      <MissionsDialog open={missions} onClose={() => setMissions(false)} quests={state.quests} busy={busy} onClaim={claim} onSolve={(d) => { setMissions(false); onPick(d); }} />
      <RewardDialog reward={reward} onClose={() => setReward(null)} />
    </Box>
  );
}

const buttonLike = (F) => ({ display: 'inline-flex', alignItems: 'center', gap: 0.75, minHeight: 44, px: 2.5, fontWeight: 900, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', bgcolor: F.hud, clipPath: cut(9) });
