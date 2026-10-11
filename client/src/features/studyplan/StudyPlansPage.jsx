import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Paper, Button, Stack, LinearProgress, CircularProgress, Chip, Alert } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import { studyPlanApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import CreatePlanDialog from './CreatePlanDialog';
import TaskRow from './TaskRow';
import { StatusChip } from './planUtils';

export default function StudyPlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(null);
  const [today, setToday] = useState(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, t] = await Promise.all([studyPlanApi.list(), studyPlanApi.today()]);
      setPlans(p.data.data);
      setToday(t.data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Custom tasks can be ticked right from the Today card.
  const toggle = async (plan, item, done) => {
    try {
      await studyPlanApi.toggleItem(plan.id, item.id, done);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  if (!plans || !today) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>{error ? <Alert severity="error">{error}</Alert> : <CircularProgress />}</Box>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Study Plans</Typography>
          <Typography color="text.secondary">Plan your days, track what's done, and study together.</Typography>
        </Box>
        <Button component={RouterLink} to="/leaderboard" startIcon={<EmojiEventsRoundedIcon />}>Leaderboard</Button>
        <Button variant="contained" disableElevation startIcon={<AddRoundedIcon />} onClick={() => setCreating(true)} sx={{ fontWeight: 700 }}>
          New plan
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Today */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1 }}>Today</Typography>
          {today.todayTotal > 0 && <Chip label={`${today.todayDone}/${today.todayTotal} done`} color={today.todayDone === today.todayTotal ? 'success' : 'default'} sx={{ fontWeight: 700 }} />}
        </Box>
        {today.plans.length === 0 ? (
          <Typography color="text.secondary">Nothing scheduled for today. Create a plan or join a friend's plan to get started.</Typography>
        ) : (
          <Stack spacing={2}>
            {today.plans.map((plan) => (
              <Box key={plan.id}>
                <Typography component={RouterLink} to={`/plans/${plan.id}`} variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  {plan.title} · Day {plan.summary.todayDay}/{plan.durationDays}
                </Typography>
                {plan.items.map((item) => (
                  <TaskRow key={item.id} item={item} showDay={item.overdue} onToggle={(it, done) => toggle(plan, it, done)} />
                ))}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      {/* My plans */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>My plans</Typography>
      {plans.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No plans yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Pick a template and you'll have a day-by-day schedule in under a minute.</Typography>
          <Button variant="contained" disableElevation onClick={() => setCreating(true)}>Create your first plan</Button>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {plans.map((plan) => (
            <Paper
              key={plan.id} variant="outlined" onClick={() => navigate(`/plans/${plan.id}`)}
              sx={{ p: 2.5, borderRadius: 3, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, flexGrow: 1 }}>{plan.title}</Typography>
                {plan.memberCount > 1 && <Chip size="small" icon={<GroupsRoundedIcon />} label={plan.memberCount} variant="outlined" />}
                <StatusChip status={plan.summary.status} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress variant="determinate" value={plan.summary.percent} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 90, textAlign: 'right' }}>
                  {plan.summary.done}/{plan.summary.total} · {plan.summary.percent}%
                </Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      <CreatePlanDialog open={creating} onClose={() => setCreating(false)} onCreated={(id) => navigate(`/plans/${id}`)} />
    </Container>
  );
}
