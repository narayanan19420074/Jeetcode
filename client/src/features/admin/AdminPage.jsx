import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Stack,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  LinearProgress,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import DifficultyChip from '../../components/DifficultyChip';
import { adminApi } from '../../api/adminApi';
import { extractErrorMessage } from '../../api/apiClient';

const StatCard = ({ icon, label, value, hint, color = 'primary.main' }) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
    <Typography variant="h4" sx={{ fontWeight: 800 }}>
      {value}
    </Typography>
    {hint && (
      <Typography variant="caption" color="text.secondary">
        {hint}
      </Typography>
    )}
  </Paper>
);

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [signups, setSignups] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const loadAll = useCallback(() => {
    setLoading(true);
    Promise.all([adminApi.stats(), adminApi.signups(), adminApi.listProblems({ limit: 20 })])
      .then(([statsRes, signupsRes, problemsRes]) => {
        setStats(statsRes.data.data);
        setSignups(signupsRes.data.data);
        setProblems(problemsRes.data.data.items);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handlePublish = async (id, isPublished) => {
    setActionError(null);
    try {
      await adminApi.publishProblem(id, isPublished);
      loadAll();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this problem permanently? This cannot be undone.')) return;
    setActionError(null);
    try {
      await adminApi.deleteProblem(id);
      loadAll();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

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
            Admin Console
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Platform health and content review — add new problems via the API, publish them here.
          </Typography>
        </Box>
        <Chip
          label={stats.queueMode === 'redis' ? 'Queue: Redis' : 'Queue: Inline (dev)'}
          color={stats.queueMode === 'redis' ? 'success' : 'warning'}
          variant="outlined"
          sx={{ fontWeight: 700 }}
        />
      </Stack>

      {actionError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>{actionError}</Alert>}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<GroupRoundedIcon />} label="Total users" value={stats.totalUsers.toLocaleString()} hint={`${stats.dailyActiveUsers.toLocaleString()} active today`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<DescriptionRoundedIcon />} label="Problems live" value={stats.totalProblems.toLocaleString()} hint={`${stats.pendingReviews} unpublished`} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<BoltRoundedIcon />} label="Submissions today" value={stats.submissionsToday.toLocaleString()} hint={`Queue depth: ${stats.queueDepth}`} color="warning.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <BoltRoundedIcon sx={{ color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">
                Execution mode
              </Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Judge0 Cloud
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Swap to self-hosted anytime — no code change
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Problems
            </Typography>
            {problems.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No problems yet — create one via POST /api/admin/problems.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Difficulty</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {problems.map((p) => (
                    <TableRow key={p._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{p.title}</TableCell>
                      <TableCell>
                        <DifficultyChip difficulty={p.difficulty} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={p.isPublished ? 'Published' : 'Draft'}
                          size="small"
                          color={p.isPublished ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {!p.isPublished ? (
                          <Tooltip title="Publish">
                            <IconButton size="small" color="success" onClick={() => handlePublish(p._id, true)}>
                              <CheckRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Unpublish">
                            <IconButton size="small" onClick={() => handlePublish(p._id, false)}>
                              <VisibilityOffRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDelete(p._id)}>
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
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
                      {u.name} <Typography component="span" variant="caption" color="text.secondary">@{u.handle}</Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
