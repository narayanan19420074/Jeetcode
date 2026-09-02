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
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
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

const CONFIRM_WORD = 'DELETE';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [signups, setSignups] = useState([]);
  const [problems, setProblems] = useState([]);
  const [view, setView] = useState('active'); // 'active' | 'trash'
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const loadAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      adminApi.stats(),
      adminApi.signups(),
      adminApi.listProblems({ limit: 20, trash: view === 'trash' }),
    ])
      .then(([statsRes, signupsRes, problemsRes]) => {
        setStats(statsRes.data.data);
        setSignups(signupsRes.data.data);
        setProblems(problemsRes.data.data.items);
        setSelectedIds([]);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [view]);

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
    if (
      !window.confirm(
        'Move this problem to trash? It disappears from every user\u2019s Problems page, Dashboard, and Prep tracks immediately. You can restore it later from the Trash tab.'
      )
    )
      return;
    setActionError(null);
    try {
      await adminApi.deleteProblem(id);
      loadAll();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  const handleRestore = async (id) => {
    setActionError(null);
    try {
      await adminApi.restoreProblem(id);
      loadAll();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === problems.length ? [] : problems.map((p) => p._id)));
  };

  const handleBulkDeleteConfirm = async () => {
    setBulkBusy(true);
    setActionError(null);
    try {
      await adminApi.bulkDeleteProblems(selectedIds);
      setBulkDialogOpen(false);
      setConfirmText('');
      loadAll();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setBulkBusy(false);
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

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

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
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Problems
              </Typography>
              {view === 'active' && selectedIds.length > 0 && (
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteRoundedIcon fontSize="small" />}
                  onClick={() => setBulkDialogOpen(true)}
                >
                  Delete {selectedIds.length} selected
                </Button>
              )}
            </Stack>

            <Tabs value={view} onChange={(e, v) => setView(v)} sx={{ mb: 2, minHeight: 36 }}>
              <Tab value="active" label="Active" sx={{ minHeight: 36, py: 0.5, fontWeight: 600 }} />
              <Tab value="trash" label="Trash" sx={{ minHeight: 36, py: 0.5, fontWeight: 600 }} />
            </Tabs>

            {problems.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {view === 'trash' ? 'Trash is empty.' : 'No problems yet — create one via POST /api/admin/problems.'}
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {view === 'active' && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={selectedIds.length === problems.length}
                          indeterminate={selectedIds.length > 0 && selectedIds.length < problems.length}
                          onChange={toggleSelectAll}
                        />
                      </TableCell>
                    )}
                    <TableCell>Title</TableCell>
                    <TableCell>Difficulty</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {problems.map((p) => (
                    <TableRow key={p._id} hover selected={selectedIds.includes(p._id)}>
                      {view === 'active' && (
                        <TableCell padding="checkbox">
                          <Checkbox size="small" checked={selectedIds.includes(p._id)} onChange={() => toggleSelected(p._id)} />
                        </TableCell>
                      )}
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
                        {view === 'trash' ? (
                          <Tooltip title="Restore">
                            <IconButton size="small" color="primary" onClick={() => handleRestore(p._id)}>
                              <RestoreRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <>
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
                            <Tooltip title="Move to trash">
                              <IconButton size="small" color="error" onClick={() => handleDelete(p._id)}>
                                <DeleteRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
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
        </Grid>
      </Grid>

      {/* Bulk delete — requires typing DELETE to confirm. This can affect
          many problems at once, and every one of them disappears from
          every user's Problems page, Dashboard, and Prep tracks the
          moment the request succeeds. A single click is too easy to fire
          by accident with several rows selected. */}
      <Dialog open={bulkDialogOpen} onClose={() => !bulkBusy && setBulkDialogOpen(false)}>
        <DialogTitle>Move {selectedIds.length} problem(s) to trash?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            These problems will disappear from every user's Problems page, Dashboard, and Prep tracks immediately,
            worldwide. You can restore them later from the Trash tab. Type <strong>{CONFIRM_WORD}</strong> to confirm.
          </DialogContentText>
          <TextField
            fullWidth
            size="small"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_WORD}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)} disabled={bulkBusy}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disableElevation
            disabled={confirmText !== CONFIRM_WORD || bulkBusy}
            onClick={handleBulkDeleteConfirm}
          >
            {bulkBusy ? 'Deleting…' : 'Delete selected'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
