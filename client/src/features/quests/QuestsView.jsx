import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { Alert, Box, Button, IconButton, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { questApi } from '../../api/questApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from '../auth/authSlice';
import { Confetti } from '../aptitude/components/MotionBits';
import { cardSx, GrandReward, QuestHeader, QuestRow, RewardDialog } from './QuestParts';
import ButterflyPanel from './ButterflyPanel';
import { PALETTES, RARITY, rarityGradient } from './butterflyCatalog';
import { goalMilestone, useQuestTheme } from './questUtils';

// three.js is heavy, so the stage only downloads when this page opens.
const ButterflyStage = lazy(() => import('./ButterflyScene'));

const PHASES = [
  ['larva', 'Larva'],
  ['feeding', 'Feeding'],
  ['cocoon', 'Cocoon'],
  ['butterfly', 'Butterfly'],
];
const THUMB_IDS = Object.keys(PALETTES);

const LoadingSkeleton = () => (
  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 340px' }, height: { lg: '100%' } }}>
    <Skeleton variant="rounded" sx={{ borderRadius: '28px', height: { xs: 420, lg: '100%' } }} />
    <Skeleton variant="rounded" sx={{ borderRadius: '28px', height: { xs: 360, lg: '100%' } }} />
  </Box>
);

// Quests are computed on the server from real activity (Accepted submissions, streaks, solved counts); claiming and
// butterfly unlocks are verified there too, so this page only renders what the API says.
export default function QuestsView({ isAuthenticated, onPick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const dark = useTheme().palette.mode === 'dark';
  const T = useQuestTheme();
  const { enqueueSnackbar } = useSnackbar();
  const walletCoins = useSelector((s) => s.auth.user?.coins);
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [busyB, setBusyB] = useState(null);
  const [reward, setReward] = useState(null);
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('larva');
  const [thumbs, setThumbs] = useState(null);
  const [stageFailed, setStageFailed] = useState(false);
  const [party, setParty] = useState(0);
  const stageApi = useRef(null);
  const onFail = useCallback(() => setStageFailed(true), []);

  const load = useCallback(() => {
    setError(null);
    return questApi
      .get()
      .then(({ data }) => setState(data.data))
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  useEffect(() => {
    setState(null);
    setSelected(null);
    load();
  }, [load, isAuthenticated]);

  // Real 3D wings for the list, drawn once per colour mode.
  useEffect(() => {
    let live = true;
    import('./butterflyThumbs')
      .then((m) => {
        if (live) setThumbs(m.renderButterflyThumbs(THUMB_IDS, { dark }));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [dark]);

  const claim = useCallback(
    async (quest) => {
      if (!isAuthenticated) return navigate('/login');
      setBusy(quest.id);
      try {
        const { data } = await questApi.claim(quest.id);
        const res = data.data;
        setState(res.state);
        dispatch(userUpdated(res.user));
        setReward(res);
      } catch (err) {
        enqueueSnackbar(extractErrorMessage(err), { variant: 'warning' });
        load();
      } finally {
        setBusy(null);
      }
    },
    [isAuthenticated, navigate, dispatch, enqueueSnackbar, load]
  );

  const unlock = useCallback(
    async (b) => {
      if (!isAuthenticated) return navigate('/login');
      setBusyB(b.id);
      try {
        const { data } = await questApi.unlockButterfly(b.id);
        const res = data.data;
        setState(res.state);
        dispatch(userUpdated(res.user));
        setSelected(b.id);
        setParty((n) => n + 1);
        setTimeout(() => stageApi.current?.celebrate(), 900);
        enqueueSnackbar(`${b.name} unlocked`, { variant: 'success' });
      } catch (err) {
        enqueueSnackbar(extractErrorMessage(err), { variant: 'warning' });
        load();
      } finally {
        setBusyB(null);
      }
    },
    [isAuthenticated, navigate, dispatch, enqueueSnackbar, load]
  );

  const equip = useCallback(
    async (b) => {
      setBusyB(b.id);
      try {
        const { data } = await questApi.equipButterfly(b.id);
        setState(data.data.state);
        setSelected(b.id);
        stageApi.current?.celebrate();
      } catch (err) {
        enqueueSnackbar(extractErrorMessage(err), { variant: 'warning' });
        load();
      } finally {
        setBusyB(null);
      }
    },
    [enqueueSnackbar, load]
  );

  if (error && !state) {
    return (
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Retry</Button>} sx={{ borderRadius: '16px' }}>
        {error}
      </Alert>
    );
  }
  if (!state) return <LoadingSkeleton />;

  const goal = goalMilestone(state.milestones);
  // Only what matters next: rewards ready to claim first, then the quests closest to done.
  const nextUp = [...state.milestones, ...state.quests]
    .filter((q) => q.id !== goal.id && !q.claimed)
    .sort((a, b) => Number(b.claimable) - Number(a.claimable) || b.value / b.target - a.value / a.target)
    .slice(0, 3);

  const shownId = selected || state.butterflies.active;
  const shown = state.butterflies.items.find((b) => b.id === shownId) || state.butterflies.items[0];
  const coins = isAuthenticated ? walletCoins ?? state.coins ?? 0 : 0;
  const solidFallback = { '@media (prefers-reduced-transparency: reduce)': { backdropFilter: 'none', bgcolor: T.soft } };

  return (
    <Box sx={{ height: { lg: '100%' }, minHeight: { lg: 600 }, display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 340px' }, gridTemplateRows: { lg: 'minmax(0, 1fr)' } }}>
      {party > 0 && <Confetti key={party} pieces={80} />}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, minHeight: 0 }}>
        <QuestHeader state={state} T={T} />

        {/* 3D stage */}
        <Box sx={{ position: 'relative', flex: { lg: 1 }, minHeight: { xs: 380, lg: 0 }, overflow: 'hidden', borderRadius: '28px', background: T.panel, border: T.border, boxShadow: T.panelShadow }}>
          {stageFailed ? (
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', p: 3 }}>
              <Typography sx={{ fontWeight: 800, color: T.ink }}>The 3D stage needs WebGL, which this browser has turned off.</Typography>
            </Box>
          ) : (
            <Suspense fallback={<Skeleton variant="rectangular" sx={{ position: 'absolute', inset: 0 }} />}>
              <Box sx={{ position: 'absolute', inset: 0 }}>
                <ButterflyStage styleId={shownId} dark={dark} reduce={Boolean(reduce)} onPhase={setPhase} onFail={onFail} apiRef={stageApi} />
              </Box>
            </Suspense>
          )}

          {/* what is on stage */}
          <Box sx={[{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 1, pl: 1.5, pr: 1, py: 0.75, borderRadius: 99, bgcolor: T.pill, border: T.border, backdropFilter: 'blur(14px)' }, solidFallback]}>
            <Typography noWrap sx={{ fontWeight: 800, fontSize: 13.5, color: T.ink }}>{shown.name}</Typography>
            <Box component="span" sx={{ px: 0.9, py: 0.15, borderRadius: 99, color: '#fff', fontSize: 10, fontWeight: 900, letterSpacing: '0.07em', textTransform: 'uppercase', background: rarityGradient(shown.rarity), boxShadow: `0 6px 12px -6px ${(RARITY[shown.rarity] || RARITY.Starter).glow}` }}>{shown.rarity}</Box>
            {!shown.owned && <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: T.muted, pr: 0.5 }}>Preview</Typography>}
          </Box>

          {!reduce && !stageFailed && (
            <Tooltip title="Watch it grow again">
              <IconButton aria-label="Replay the larva to butterfly story" onClick={() => stageApi.current?.replay()} size="small" sx={{ position: 'absolute', top: 14, right: 14, bgcolor: T.soft, boxShadow: T.raised, color: T.icon, '&:hover': { bgcolor: T.soft, boxShadow: T.pressed } }}>
                <ReplayRoundedIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* where the story is */}
          {!stageFailed && (
            <Box role="status" aria-label="Life cycle stage" sx={[{ position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)', display: 'flex', gap: 0.6, p: 0.6, borderRadius: 99, bgcolor: T.pill, border: T.border, backdropFilter: 'blur(14px)', maxWidth: 'calc(100% - 24px)' }, solidFallback]}>
              {PHASES.map(([id, label], i) => {
                const on = phase === id;
                const done = PHASES.findIndex(([p]) => p === phase) > i;
                return (
                  <Box key={id} sx={{ px: 1.4, py: 0.5, borderRadius: 99, fontSize: 12.5, fontWeight: 800, whiteSpace: 'nowrap', transition: 'all .3s ease', ...(on ? { color: '#fff', background: 'linear-gradient(120deg,#7C4DFF,#E040FB)', boxShadow: '0 8px 16px -8px #A855F7' } : { color: done ? T.icon : T.muted, bgcolor: 'transparent' }) }}>
                    {label}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* grand reward + next quests */}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) minmax(0, 1fr)' }, flexShrink: 0 }}>
          <GrandReward state={state} goal={goal} busy={busy} onClaim={claim} isAuthenticated={isAuthenticated} onCheckIn={() => onPick(null)} onLogin={() => navigate('/login')} T={T} />
          <Box sx={[cardSx(T), { px: 2, py: 1.25 }]}>
            <Typography sx={{ fontSize: '0.64rem', fontWeight: 900, letterSpacing: '0.16em', color: T.muted }}>NEXT UP</Typography>
            {nextUp.length > 0 ? (
              nextUp.map((q) => <QuestRow key={q.id} quest={q} busy={busy} onClaim={claim} onPick={onPick} T={T} />)
            ) : (
              <Typography variant="body2" sx={{ py: 3, textAlign: 'center', color: T.muted }}>Every quest is claimed. New ones will show up here.</Typography>
            )}
          </Box>
        </Box>
      </Box>

      <ButterflyPanel
        butterflies={state.butterflies}
        selected={shownId}
        coins={coins}
        isAuthenticated={isAuthenticated}
        busyId={busyB}
        thumbs={thumbs}
        onSelect={setSelected}
        onUnlock={unlock}
        onEquip={equip}
        onLogin={() => navigate('/login')}
        T={T}
      />

      <RewardDialog reward={reward} onClose={() => setReward(null)} T={T} />
    </Box>
  );
}
