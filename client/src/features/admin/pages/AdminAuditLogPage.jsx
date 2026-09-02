import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
  Alert,
  TablePagination,
} from '@mui/material';
import { adminApi } from '../../../api/adminApi';
import { extractErrorMessage } from '../../../api/apiClient';

const ACTION_COLOR = {
  problem_delete: 'error',
  problem_bulk_delete: 'error',
  problem_restore: 'success',
  problem_create: 'success',
  problem_update: 'default',
  bulk_import: 'default',
  user_role_update: 'warning',
  user_pro_toggle: 'secondary',
  license_generate: 'primary',
};

function describeAction(entry) {
  const { action, metadata } = entry;
  switch (action) {
    case 'problem_create':
      return `Created problem "${metadata.title}"`;
    case 'problem_update':
      return `Updated problem "${metadata.slug}" (${(metadata.fields || []).join(', ')})`;
    case 'problem_delete':
      return `Moved "${metadata.title}" to trash`;
    case 'problem_bulk_delete':
      return `Bulk-deleted ${metadata.count} problem(s)`;
    case 'problem_restore':
      return `Restored "${metadata.slug}" from trash`;
    case 'user_role_update':
      return `Changed @${metadata.handle}'s role: ${metadata.from} → ${metadata.to}`;
    case 'user_pro_toggle':
      return `${metadata.isPro ? 'Granted' : 'Revoked'} Pro for @${metadata.handle}`;
    case 'license_generate':
      return `Generated ${metadata.count} license key(s)${metadata.note ? ` — ${metadata.note}` : ''}`;
    default:
      return action;
  }
}

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLog = useCallback(() => {
    setLoading(true);
    adminApi
      .auditLog({ page: page + 1, limit })
      .then(({ data }) => {
        setEntries(data.data.items);
        setTotal(data.data.pagination.total);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [page, limit]);

  useEffect(() => {
    loadLog();
  }, [loadLog]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Audit Log
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Every destructive or notable admin action, most recent first.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No admin actions logged yet.
          </Typography>
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Admin</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell align="right">When</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{e.admin ? `${e.admin.name} (@${e.admin.handle})` : 'Unknown'}</TableCell>
                    <TableCell>
                      <Chip label={e.action.replaceAll('_', ' ')} size="small" color={ACTION_COLOR[e.action] || 'default'} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{describeAction(e)}</TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary' }}>
                      {new Date(e.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={limit}
              onRowsPerPageChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[15, 30, 50]}
            />
          </>
        )}
      </Paper>
    </Container>
  );
}
