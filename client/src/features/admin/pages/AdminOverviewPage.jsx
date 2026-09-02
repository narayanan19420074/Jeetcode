import { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, Stack, Chip, CircularProgress, Alert } from '@mui/material';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import StatCard from '../components/StatCard';
import { adminApi } from '../../../api/adminApi';
import { extractErrorMessage } from '../../../api/apiClient';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([adminApi.stats(), adminApi.signups()])
      .then(([statsRes, signupsRes]) => {
        setStats(statsRes.data.data);
        setSignups(signupsRes.data.data);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Platform health at a glance.
          </Typography>
        </Box>
        <Chip
          label={stats.queueMode === 'redis' ? 'Queue: Redis' : 'Queue: Inline (dev)'}
          color={stats.queueMode === 'redis' ? 'success' : 'warning'}
          variant="outlined"
          sx={{ fontWeight: 700 }}
        />
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<GroupRoundedIcon />}
            label="Total users"
            value={stats.totalUsers.toLocaleString()}
            hint={`${stats.dailyActiveUsers.toLocaleString()} active today`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<WorkspacePremiumRoundedIcon />}
            label="Pro users"
            value={stats.proUsers.toLocaleString()}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<DescriptionRoundedIcon />}
            label="Problems live"
            value={stats.totalProblems.toLocaleString()}
            hint={`${stats.pendingReviews} unpublished`}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<BoltRoundedIcon />}
            label="Submissions today"
            value={stats.submissionsToday.toLocaleString()}
            hint={`Queue depth: ${stats.queueDepth}`}
            color="warning.main"
          />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Recent signups
        </Typography>
        {signups.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No signups yet.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {signups.map((u) => (
              <Stack key={u._id} direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {u.name}{' '}
                  <Typography component="span" variant="caption" color="text.secondary">
                    @{u.handle}
                  </Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(u.createdAt).toLocaleDateString()}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>
    </Container>
  );
}
