import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { adminApi } from '../../../api/adminApi';
import { extractErrorMessage } from '../../../api/apiClient';

const STATUSES = ['open', 'in-progress', 'resolved'];
const TYPES = ['bug', 'feature', 'question', 'payment', 'account', 'other'];
const TYPE_COLOR = { bug: 'error', payment: 'warning', feature: 'primary', account: 'secondary' };

export default function AdminFeedbackPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(30);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteFor, setNoteFor] = useState(null);
  const [noteText, setNoteText] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .listFeedback({ page: page + 1, limit, ...(status && { status }), ...(type && { type }) })
      .then(({ data }) => {
        setItems(data.data.items);
        setTotal(data.data.pagination.total);
        setOpenCount(data.data.openCount);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [page, limit, status, type]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id, payload) => {
    try {
      await adminApi.updateFeedback(id, payload);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Support Inbox
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Messages from the Help &amp; Support form. {openCount} open. Reply by email to the address shown.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField select size="small" label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Type" value={type} onChange={(e) => { setType(e.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          {TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No messages.</Typography>
        ) : (
          <>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>From</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>When</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((f) => (
                    <TableRow key={f._id} hover sx={{ verticalAlign: 'top' }}>
                      <TableCell sx={{ minWidth: 160 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {f.user ? `${f.user.name} (@${f.user.handle})` : f.name || 'Guest'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>{f.email}</Typography>
                      </TableCell>
                      <TableCell><Chip size="small" variant="outlined" label={f.type} color={TYPE_COLOR[f.type] || 'default'} /></TableCell>
                      <TableCell sx={{ minWidth: 280, maxWidth: 480 }}>
                        {f.subject && <Typography variant="body2" sx={{ fontWeight: 700 }}>{f.subject}</Typography>}
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{f.message}</Typography>
                        {f.pageUrl && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-all' }}>Page: {f.pageUrl}</Typography>}
                        {f.adminNote && <Typography variant="caption" color="warning.main" sx={{ display: 'block' }}>Note: {f.adminNote}</Typography>}
                        <Button size="small" sx={{ px: 0, minWidth: 0 }} onClick={() => { setNoteFor(f); setNoteText(f.adminNote || ''); }}>
                          {f.adminNote ? 'Edit note' : 'Add note'}
                        </Button>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{new Date(f.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Select size="small" value={f.status} onChange={(e) => patch(f._id, { status: e.target.value })}>
                          {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(e, p) => setPage(p)}
              rowsPerPage={limit}
              onRowsPerPageChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[15, 30, 50]}
            />
          </>
        )}
      </Paper>

      <Dialog open={!!noteFor} onClose={() => setNoteFor(null)} fullWidth maxWidth="sm">
        <DialogTitle>Internal note</DialogTitle>
        <DialogContent>
          <TextField autoFocus multiline minRows={3} fullWidth value={noteText} onChange={(e) => setNoteText(e.target.value)} slotProps={{ htmlInput: { maxLength: 1000 } }} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteFor(null)}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={async () => { await patch(noteFor._id, { adminNote: noteText }); setNoteFor(null); }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
