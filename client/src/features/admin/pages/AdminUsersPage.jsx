import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  TablePagination,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { adminApi } from '../../../api/adminApi';
import { extractErrorMessage } from '../../../api/apiClient';

const ROLES = ['learner', 'contributor', 'moderator', 'admin'];

export default function AdminUsersPage() {
  const [filter, setFilter] = useState('all'); // 'all' | 'pro' | 'normal'
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowBusyId, setRowBusyId] = useState(null);

  const loadUsers = useCallback(() => {
    setLoading(true);
    adminApi
      .listUsers({ page: page + 1, limit, filter: filter === 'all' ? undefined : filter, search: search || undefined })
      .then(({ data }) => {
        setUsers(data.data.items);
        setTotal(data.data.pagination.total);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [page, limit, filter, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (id, role) => {
    setRowBusyId(id);
    try {
      await adminApi.updateUserRole(id, role);
      loadUsers();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setRowBusyId(null);
    }
  };

  const handleProToggle = async (id, isPro) => {
    setRowBusyId(id);
    try {
      // Manual grants from this table default to lifetime (no expiry).
      // Admins who need a dated grant can extend this with a date picker
      // later — kept simple for now per the single-key-generator scope.
      await adminApi.setUserPro(id, { isPro, proExpiresAt: null });
      loadUsers();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setRowBusyId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Users
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage roles and Pro access across every account.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Tabs
            value={filter}
            onChange={(e, v) => {
              setFilter(v);
              setPage(0);
            }}
            sx={{ minHeight: 36 }}
          >
            <Tab value="all" label="All" sx={{ minHeight: 36, py: 0.5, fontWeight: 600 }} />
            <Tab value="pro" label="Pro" sx={{ minHeight: 36, py: 0.5, fontWeight: 600 }} />
            <Tab value="normal" label="Normal" sx={{ minHeight: 36, py: 0.5, fontWeight: 600 }} />
          </Tabs>
          <TextField
            size="small"
            placeholder="Search name, handle, email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
            sx={{ width: { xs: '100%', sm: 280 } }}
          />
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No users match this filter.
          </Typography>
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Pro</TableCell>
                  <TableCell align="right">Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {u.name}{' '}
                      <Typography component="span" variant="caption" color="text.secondary">
                        @{u.handle}
                      </Typography>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={u.role}
                        disabled={rowBusyId === u._id}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        sx={{ minWidth: 130 }}
                      >
                        {ROLES.map((r) => (
                          <MenuItem key={r} value={r}>
                            {r}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={u.isPro}
                            disabled={rowBusyId === u._id}
                            onChange={(e) => handleProToggle(u._id, e.target.checked)}
                          />
                        }
                        label={
                          <Chip
                            label={u.isPro ? (u.proExpiresAt ? 'Pro (dated)' : 'Pro (lifetime)') : 'Free'}
                            size="small"
                            color={u.isPro ? 'success' : 'default'}
                            variant="outlined"
                          />
                        }
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
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
              rowsPerPageOptions={[10, 20, 50]}
            />
          </>
        )}
      </Paper>
    </Container>
  );
}
