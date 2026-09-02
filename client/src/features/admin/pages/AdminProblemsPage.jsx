import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
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
  Pagination,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import DifficultyChip from '../../../components/DifficultyChip';
import { adminApi } from '../../../api/adminApi';
import { extractErrorMessage } from '../../../api/apiClient';
import AddProblemDialog from '../components/AddProblemDialog';

const CONFIRM_WORD = 'DELETE';
const PAGE_SIZE = 20;

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [view, setView] = useState('active'); // 'active' | 'trash'
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Was completely missing before — adminApi.listProblems always fetched
  // page 1 with no way to move forward, so anything past the first 20
  // problems was invisible in this panel even though it existed in the DB
  // and showed fine on the public /problems page (ProblemExplorer already
  // paginates correctly there).
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const loadProblems = useCallback(() => {
    setLoading(true);
    adminApi
      .listProblems({ page, limit: PAGE_SIZE, trash: view === 'trash' })
      .then((res) => {
        setProblems(res.data.data.items);
        setPagination(res.data.data.pagination);
        setSelectedIds([]);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [view, page]);

  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  // Switching tabs (Active/Trash) should always land back on page 1 —
  // otherwise "page 3" from Active could silently 404/empty out on Trash.
  useEffect(() => {
    setPage(1);
  }, [view]);

  const handlePublish = async (id, isPublished) => {
    setActionError(null);
    try {
      await adminApi.publishProblem(id, isPublished);
      loadProblems();
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
      loadProblems();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  const handleRestore = async (id) => {
    setActionError(null);
    try {
      await adminApi.restoreProblem(id);
      loadProblems();
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
      loadProblems();
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
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            Problems
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pagination.total} total &mdash; add, publish, and manage them here.
          </Typography>
        </Box>
        <Button
          variant="contained"
          disableElevation
          startIcon={<AddRoundedIcon />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Question
        </Button>
      </Stack>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Tabs value={view} onChange={(e, v) => setView(v)} sx={{ minHeight: 36 }}>
            <Tab value="active" label="Active" sx={{ minHeight: 36, py: 0.5, fontWeight: 600 }} />
            <Tab value="trash" label="Trash" sx={{ minHeight: 36, py: 0.5, fontWeight: 600 }} />
          </Tabs>
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

        {problems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {view === 'trash' ? 'Trash is empty.' : 'No problems yet — click "Add Question" to create one.'}
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

        {pagination.totalPages > 1 && (
          <Stack alignItems="center" sx={{ mt: 3 }}>
            <Pagination
              count={pagination.totalPages}
              page={page}
              onChange={(e, v) => setPage(v)}
              color="primary"
              shape="rounded"
            />
          </Stack>
        )}
      </Paper>

      <AddProblemDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} onCreated={loadProblems} />

      {/* Bulk delete — requires typing DELETE to confirm. Can affect many
          problems at once, and every one of them disappears from every
          user's Problems page, Dashboard, and Prep tracks the moment the
          request succeeds. A single click is too easy to fire by accident
          with several rows selected. */}
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
