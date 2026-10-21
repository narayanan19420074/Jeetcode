import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Alert, Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import { questApi } from '../../api/questApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from '../auth/authSlice';
import { QuestCard, QuestHero, PrizeCard, RewardDialog, RewardTrack, StampCard } from './QuestParts';
import { AMBER, goalMilestone } from './questUtils';

const SectionTitle = ({ title, hint, count }) => (
  <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 1.25 }}>
    <Box>
      <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>{title}</Typography>
      {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
    </Box>
    {count && <Typography variant="caption" sx={{ fontWeight: 800, color: AMBER, fontVariantNumeric: 'tabular-nums' }}>{count}</Typography>}
  </Box>
);

const LoadingSkeleton = () => (
  <Stack spacing={2.5}>
    <Skeleton variant="rounded" height={330} sx={{ borderRadius: '22px' }} />
    <Skeleton variant="rounded" height={190} sx={{ borderRadius: '22px' }} />
    <Skeleton variant="rounded" height={230} sx={{ borderRadius: '14px' }} />
  </Stack>
);

// Quests are computed on the server from real activity (Accepted submissions,
// streaks, solved counts); claiming is verified there too, so this page only
// renders what the API says.
export default function QuestsView({ isAuthenticated, onPick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [reward, setReward] = useState(null);

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

  const groups = useMemo(() => {
    const map = new Map();
    (state?.quests || []).forEach((q) => map.set(q.group, [...(map.get(q.group) || []), q]));
    return [...map.entries()];
  }, [state]);

  if (error && !state) {
    return (
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Retry</Button>} sx={{ borderRadius: '12px' }}>
        {error}
      </Alert>
    );
  }
  if (!state) return <LoadingSkeleton />;

  const goal = goalMilestone(state.milestones);

  return (
    <Stack spacing={3} sx={{ pb: 3 }}>
      <QuestHero state={state} isAuthenticated={isAuthenticated} onCheckIn={() => onPick(null)} onLogin={() => navigate('/login')} />
      <PrizeCard state={state} goal={goal} busy={busy} onClaim={claim} />
      <StampCard state={state} goal={goal} />

      <Box>
        <SectionTitle title="Reward track" hint="Check in on different days. Missing a day never resets this." count={`${state.milestones.filter((m) => m.claimed).length}/${state.milestones.length} claimed`} />
        <RewardTrack milestones={state.milestones} activeDays={state.activeDays} busy={busy} onClaim={claim} />
      </Box>

      {groups.map(([group, items]) => (
        <Box key={group}>
          <SectionTitle title={group} count={`${items.filter((q) => q.claimed).length}/${items.length} claimed`} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
            {items.map((q) => (
              <QuestCard key={q.id} quest={q} busy={busy} onClaim={claim} onPick={onPick} />
            ))}
          </Box>
        </Box>
      ))}

      <RewardDialog reward={reward} onClose={() => setReward(null)} />
    </Stack>
  );
}
