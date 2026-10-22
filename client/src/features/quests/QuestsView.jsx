import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Alert, Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import { questApi } from '../../api/questApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from '../auth/authSlice';
import { PrizeCard, QuestHeader, QuestRow, RewardDialog } from './QuestParts';
import { goalMilestone } from './questUtils';
import { surface } from '../dashboard/dashboardUtils';

const LoadingSkeleton = () => (
  <Stack spacing={2.5}>
    <Skeleton variant="rounded" height={420} sx={{ borderRadius: '14px' }} />
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

  if (error && !state) {
    return (
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Retry</Button>} sx={{ borderRadius: '12px' }}>
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

  return (
    <Box sx={[surface, { overflow: 'hidden' }]}>
      <QuestHeader state={state} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.2fr) minmax(0, 1fr)' } }}>
        <PrizeCard state={state} goal={goal} busy={busy} onClaim={claim} isAuthenticated={isAuthenticated} onCheckIn={() => onPick(null)} onLogin={() => navigate('/login')} />
        <Box sx={(t) => ({ px: { xs: 2, sm: 2.5 }, py: { xs: 1.25, md: 2 }, borderTop: { xs: `1px solid ${t.palette.divider}`, md: 'none' }, borderLeft: { md: `1px solid ${t.palette.divider}` } })}>
          <Typography sx={{ fontSize: '0.64rem', fontWeight: 900, letterSpacing: '0.16em', color: 'text.secondary', mb: 0.5 }}>NEXT UP</Typography>
          {nextUp.length > 0 ? (
            nextUp.map((q, i) => (
              // Phones show two rows so the whole card stays inside one screen.
              <Box key={q.id} sx={{ display: i > 1 ? { xs: 'none', md: 'block' } : 'block' }}>
                <QuestRow quest={q} busy={busy} onClaim={claim} onPick={onPick} />
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              Every quest is claimed. New ones will show up here.
            </Typography>
          )}
        </Box>
      </Box>
      <RewardDialog reward={reward} onClose={() => setReward(null)} />
    </Box>
  );
}
