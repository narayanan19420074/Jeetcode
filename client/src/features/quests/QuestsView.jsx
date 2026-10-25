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
import { Bar, Coin, Diamond, Eyebrow, FFButton, MissionsDialog, Panel, RewardDialog, Stat, Tag, TopUpDialog } from './QuestParts';
import { FF, RARITY_COLOR, cut, goalMilestone, levelInfo } from './questUtils';

// three.js is heavy, so the 3D parts only download when this page opens.
const QuestRoadScene = lazy(() => import('./QuestRoadScene'));
const ButterflyShowcase = lazy(() => import('./ButterflyShowcase'));

const Loading = ({ height }) => (
  <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 320px' }, height }}>
    <Skeleton variant="rectangular" sx={{ height: { xs: 420, lg: '100%' }, bgcolor: FF.panel }} />
    <Skeleton variant="rectangular" sx={{ height: { xs: 360, lg: '100%' }, bgcolor: FF.panel }} />
  </Box>
);

// One screen: the road map (check-in progress, rewards) on the left, your butterfly and its upgrade on the right.
// The server decides everything (progress, claims, diamonds, upgrades); this page only shows what it returns.
export default function QuestsView({ isAuthenticated, onPick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduce = Boolean(useReducedMotion());
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
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
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
  if (!state) return <Box ref={setWrapEl} sx={{ height: wrapH }}><Loading height="100%" /></Box>;

  const goal = goalMilestone(state.milestones);
  const info = levelInfo(state.xp);
  const coins = isAuthenticated ? wallet?.coins ?? state.coins ?? 0 : 0;
  const diamonds = isAuthenticated ? wallet?.diamonds ?? state.diamonds ?? 0 : 0;
  const { butterfly } = state;
  const ready = [...state.quests].filter((q) => q.claimable).length;
  const rarity = RARITY_COLOR[butterfly.current.rarity] || FF.muted;
  const short = butterfly.next ? Math.max(0, butterfly.next.cost - diamonds) : 0;
  const count = (
    <Box sx={{ textAlign: 'center' }}>
      <Typography sx={{ fontWeight: 900, fontSize: 22, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: FF.text }}>
        {state.activeDays}<Box component="span" sx={{ color: FF.muted }}> / {goal.target}</Box>
      </Typography>
      <Typography sx={{ mt: 0.5, fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', color: FF.muted }}>CHECK-INS</Typography>
    </Box>
  );

  return (
    <Box ref={setWrapEl} sx={{ height: wrapH, display: 'grid', gap: 3, gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 320px' }, gridTemplateRows: { lg: 'minmax(0, 1fr)' } }}>
      {/* ------------------------------------------------ road map */}
      <Panel n={18} sx={{ overflow: 'hidden', minHeight: { xs: 520, lg: 0 } }}>
        <Box sx={{ position: 'absolute', inset: '1px', clipPath: cut(17), bgcolor: FF.bg }}>
          {failed.road ? (
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', p: 3 }}>
              <Typography sx={{ fontWeight: 800, color: FF.text }}>The 3D map needs WebGL, which this browser has turned off.</Typography>
            </Box>
          ) : (
            <Suspense fallback={<Skeleton variant="rectangular" sx={{ position: 'absolute', inset: 0, bgcolor: FF.panel }} />}>
              <Box sx={{ position: 'absolute', inset: 0 }}>
                <QuestRoadScene milestones={state.milestones} goalTarget={goal.target} days={state.activeDays} reduce={reduce} dark={dark} onClaim={claim} onFail={roadFail} />
              </Box>
            </Suspense>
          )}
        </Box>

        {/* top bar: level + streak on the left, wallet on the right */}
        <Box sx={{ position: 'absolute', zIndex: 2, top: { xs: 16, sm: 20 }, left: { xs: 16, sm: 20 }, right: { xs: 16, sm: 20 }, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, pointerEvents: 'none', '& > *': { pointerEvents: 'auto' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: 0.5, pr: 2, height: 52, bgcolor: FF.hud, border: `1px solid ${FF.line}`, clipPath: cut(9), backdropFilter: 'blur(6px)' }}>
              <Box sx={{ width: 44, height: 44, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 21, color: '#10131A', background: `linear-gradient(180deg, ${FF.orangeHi}, ${FF.orange})`, clipPath: cut(7) }}>{info.level}</Box>
              <Box sx={{ width: { xs: 88, sm: 120 } }}>
                <Typography noWrap sx={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.3, color: FF.text }}>{info.rank}</Typography>
                <Bar pct={info.pct} height={6} />
              </Box>
            </Box>
            <Stat icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: 22, color: FF.orange }} />} value={state.streakDays} label="Day streak" />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isAuthenticated && <Stat icon={<Coin />} value={coins.toLocaleString('en-IN')} label="Coins · open the store" onClick={() => navigate('/store')} />}
            {isAuthenticated && <Stat icon={<Diamond />} value={diamonds.toLocaleString('en-IN')} label="Diamonds" />}
            <FFButton tone="blue" onClick={() => (isAuthenticated ? setTopUp({ open: true, want: 1 }) : login())} sx={{ minHeight: 44, px: 2 }}>Top up</FFButton>
          </Box>
        </Box>

        {/* bottom bar: missions, today's check-in, progress */}
        <Box sx={{ position: 'absolute', zIndex: 2, bottom: { xs: 16, sm: 20 }, left: { xs: 16, sm: 20 }, right: { xs: 16, sm: 20 }, display: 'grid', gap: 1.5, pointerEvents: 'none', '& > *': { pointerEvents: 'auto' } }}>
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>{count}</Box>
          <Box sx={{ display: 'grid', alignItems: 'end', gap: 1.5, gridTemplateColumns: { xs: 'auto minmax(0, 1fr)', sm: '1fr auto 1fr' } }}>
            <Box sx={{ justifySelf: 'start' }}>
              <FFButton tone="dark" aria-label="Missions" onClick={() => setMissions(true)} sx={{ position: 'relative', border: `1px solid ${FF.line}`, bgcolor: FF.hud, minHeight: 48, px: { xs: 1.5, sm: 2.5 } }}>
                <AssignmentRoundedIcon sx={{ fontSize: 22 }} /> <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Missions</Box>
                {ready > 0 && <Box component="span" sx={{ position: 'absolute', top: 2, right: 2, minWidth: 20, height: 20, px: 0.5, display: 'grid', placeItems: 'center', fontSize: 12, color: '#fff', bgcolor: FF.red, borderRadius: 10 }}>{ready}</Box>}
              </FFButton>
            </Box>
            <Box sx={{ justifySelf: { xs: 'stretch', sm: 'center' }, '& > *': { width: { xs: '100%', sm: 'auto' } } }}>
              {!isAuthenticated ? (
                <FFButton onClick={login} sx={{ minHeight: 48 }}>Log in to start</FFButton>
              ) : state.checkedInToday ? (
                <Box sx={{ ...buttonLike, justifyContent: 'center', color: FF.greenInk, border: `1px solid ${FF.green}` }}><CheckRoundedIcon sx={{ fontSize: 20 }} /> Checked in today</Box>
              ) : (
                <FFButton onClick={() => onPick(null)} sx={{ minHeight: 48 }}><PlayArrowRoundedIcon /> Solve today&apos;s problem</FFButton>
              )}
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, justifySelf: 'end' }}>{count}</Box>
          </Box>
        </Box>
      </Panel>

      {/* ------------------------------------------------ butterfly */}
      <Panel n={18} component="aside" aria-label="Your butterfly" sx={{ display: 'flex', flexDirection: 'column', minHeight: { xs: 500, lg: 0 } }}>
        <Box sx={{ px: 3, pt: 3 }}>
          <Eyebrow>My butterfly</Eyebrow>
          <Typography noWrap sx={{ mt: 0.5, fontWeight: 900, fontSize: 24, textTransform: 'uppercase', letterSpacing: '0.02em', color: FF.text }}>{butterfly.current.name}</Typography>
          <Box sx={{ mt: 1 }}><Tag bg={rarity} color="#10131A">{butterfly.current.rarity}</Tag></Box>
        </Box>

        <Box sx={{ position: 'relative', flex: 1, minHeight: 220, background: `radial-gradient(ellipse at 50% 55%, ${RARITY_COLOR[butterfly.current.rarity] || '#8E99AD'}${dark ? '33' : '40'}, transparent 68%)` }}>
          {failed.fly ? null : (
            <Suspense fallback={null}>
              <ButterflyShowcase styleId={butterfly.current.id} dark={dark} reduce={reduce} onFail={flyFail} apiRef={flyApi} />
            </Suspense>
          )}
        </Box>

        <Box sx={{ px: 3, pb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ fontWeight: 900, fontSize: 13, letterSpacing: '0.08em', color: FF.text }}>LEVEL {butterfly.level} / {butterfly.max}</Typography>
            {butterfly.next && <Typography sx={{ fontSize: 12.5, color: FF.muted }}>Next: {butterfly.next.name}</Typography>}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.75, mb: 2.5 }} aria-hidden>
            {butterfly.tiers.map((id, i) => (
              <Box key={id} sx={{ flex: 1, height: 7, bgcolor: i < butterfly.level ? FF.orange : FF.well, border: `1px solid ${i < butterfly.level ? FF.orange : FF.line}` }} />
            ))}
          </Box>
          {butterfly.next ? (
            <>
              <FFButton tone={short > 0 ? 'blue' : 'orange'} disabled={busy === 'upgrade'} onClick={upgrade} sx={{ width: '100%', minHeight: 54, fontSize: 16 }}>
                <ArrowUpwardRoundedIcon /> {busy === 'upgrade' ? 'Upgrading…' : 'Upgrade'}
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, ml: 0.5, px: 1, py: 0.25, bgcolor: 'rgba(11,14,20,0.85)', color: '#FFFFFF', clipPath: cut(5) }}>
                  <Diamond size={16} /> {butterfly.next.cost}
                </Box>
              </FFButton>
              <Typography sx={{ mt: 1.25, textAlign: 'center', fontSize: 13, color: short > 0 ? FF.orangeInk : FF.muted }}>
                {isAuthenticated ? (short > 0 ? `Need ${short} more diamond${short > 1 ? 's' : ''}. Tap to top up.` : `You have ${diamonds} diamonds`) : 'Log in to upgrade'}
              </Typography>
            </>
          ) : (
            <Box sx={{ ...buttonLike, justifyContent: 'center', width: '100%', color: FF.coinInk, border: `1px solid ${FF.yellow}` }}>Max level</Box>
          )}
        </Box>
      </Panel>

      <TopUpDialog open={topUp.open} want={topUp.want} onClose={() => setTopUp({ open: false, want: 1 })} coins={coins} diamonds={diamonds} rate={state.coinsPerDiamond} busy={converting} onConvert={convert} />
      <MissionsDialog open={missions} onClose={() => setMissions(false)} quests={state.quests} busy={busy} onClaim={claim} onSolve={(d) => { setMissions(false); onPick(d); }} />
      <RewardDialog reward={reward} onClose={() => setReward(null)} />
    </Box>
  );
}

const buttonLike = { display: 'inline-flex', alignItems: 'center', gap: 0.75, minHeight: 48, px: 2.5, fontWeight: 900, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', bgcolor: FF.hud, clipPath: cut(9) };
