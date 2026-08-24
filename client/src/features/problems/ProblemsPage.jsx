import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Chip,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DifficultyChip from '../../components/DifficultyChip';
import { problemsApi } from '../../api/problemsApi';
import { extractErrorMessage } from '../../api/apiClient';

const PAGE_SIZE = 20;

export default function ProblemsPage() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    problemsApi
      .list({
        page,
        limit: PAGE_SIZE,
        difficulty: difficultyFilter === 'All' ? undefined : difficultyFilter,
        search: search || undefined,
      })
      .then(({ data }) => {
        setProblems(data.data.items);
        setPagination(data.data.pagination);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [page, difficultyFilter, search]);

  // Reset to page 1 whenever a filter changes — otherwise you can get stuck
  // on page 5 of "All" after switching to "Easy", which has fewer pages.
  useEffect(() => {
    setPage(1);
  }, [difficultyFilter, search]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Problems
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {pagination.total} problems available — browse, filter, and jump straight into any of them.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search problems"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 240 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
          />
          <ToggleButtonGroup size="small" exclusive value={difficultyFilter} onChange={(e, v) => v && setDifficultyFilter(v)}>
            <ToggleButton value="All">All</ToggleButton>
            <ToggleButton value="Easy">Easy</ToggleButton>
            <ToggleButton value="Medium">Medium</ToggleButton>
            <ToggleButton value="Hard">Hard</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : problems.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
            No problems match your filters.
          </Typography>
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Title</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Companies</TableCell>
                  <TableCell align="right">Acceptance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {problems.map((p) => (
                  <TableRow key={p._id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/workspace/${p.slug}`)}>
                    <TableCell padding="checkbox">
                      {p.solvedByMe && <CheckCircleRoundedIcon fontSize="small" sx={{ color: 'success.main' }} />}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{p.title}</TableCell>
                    <TableCell>
                      <DifficultyChip difficulty={p.difficulty} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {(p.tags || []).slice(0, 2).map((t) => (
                          <Chip key={t} label={t} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {(p.companies || []).slice(0, 2).map((c) => (
                          <Chip key={c} label={c} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">{p.acceptanceRate ?? 0}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

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
          </>
        )}
      </Paper>
    </Container>
  );
}
