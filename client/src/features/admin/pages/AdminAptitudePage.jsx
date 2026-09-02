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
  IconButton,
  Tooltip,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { adminApi } from '../../../api/adminApi';
import { extractErrorMessage } from '../../../api/apiClient';

export default function AdminAptitudePage() {
  const [patterns, setPatterns] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOrder, setNewOrder] = useState(1);
  const [creating, setCreating] = useState(false);

  const loadPatterns = useCallback(() => {
    setLoading(true);
    adminApi
      .listPatterns()
      .then(({ data }) => {
        setPatterns(data.data.items);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadPatterns();
  }, [loadPatterns]);

  const loadQuestions = useCallback((patternId) => {
    adminApi
      .listQuestions(patternId)
      .then(({ data }) => setQuestions(data.data.items))
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  const handleSelectPattern = (pattern) => {
    setSelectedPattern(pattern);
    loadQuestions(pattern._id);
  };

  const handlePublishPattern = async (id, isPublished) => {
    try {
      await adminApi.publishPattern(id, isPublished);
      loadPatterns();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleDeletePattern = async (id) => {
    if (!window.confirm('Delete this pattern and all its questions? This cannot be undone.')) return;
    try {
      await adminApi.deletePattern(id);
      if (selectedPattern?._id === id) setSelectedPattern(null);
      loadPatterns();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleCreatePattern = async () => {
    setCreating(true);
    try {
      await adminApi.createPattern({ title: newTitle, order: Number(newOrder) });
      setCreateOpen(false);
      setNewTitle('');
      setNewOrder(1);
      loadPatterns();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await adminApi.deleteQuestion(id);
      loadQuestions(selectedPattern._id);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Aptitude
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage patterns and their questions.
          </Typography>
        </Box>
        <Button variant="contained" disableElevation startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)} sx={{ fontWeight: 700 }}>
          New pattern
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Patterns
              </Typography>
              {patterns.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No patterns yet.
                </Typography>
              ) : (
                <Table size="small">
                  <TableBody>
                    {patterns.map((p) => (
                      <TableRow
                        key={p._id}
                        hover
                        selected={selectedPattern?._id === p._id}
                        onClick={() => handleSelectPattern(p)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>
                          {p.order}. {p.title}
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {p.totalQuestions} questions
                          </Typography>
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
                              <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handlePublishPattern(p._id, true); }}>
                                <CheckRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Unpublish">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handlePublishPattern(p._id, false); }}>
                                <VisibilityOffRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeletePattern(p._id); }}>
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

          <Grid item xs={12} md={7}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {selectedPattern ? `Questions — ${selectedPattern.title}` : 'Select a pattern'}
              </Typography>
              {!selectedPattern ? (
                <Typography variant="body2" color="text.secondary">
                  Click a pattern on the left to view and manage its questions. Question creation/editing (with
                  options and correct-answer index) uses the same POST/PATCH /api/admin/aptitude/questions endpoints —
                  add a form here once the question authoring UX is designed.
                </Typography>
              ) : questions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No questions yet for this pattern.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Prompt</TableCell>
                      <TableCell>Order</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questions.map((q) => (
                      <TableRow key={q._id} hover>
                        <TableCell sx={{ maxWidth: 320 }}>{q.prompt}</TableCell>
                        <TableCell>{q.order}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDeleteQuestion(q._id)}>
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
        </Grid>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New pattern</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus fullWidth />
            <TextField
              label="Order"
              type="number"
              value={newOrder}
              onChange={(e) => setNewOrder(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button variant="contained" disableElevation onClick={handleCreatePattern} disabled={creating || !newTitle}>
            {creating ? <CircularProgress size={20} color="inherit" /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
