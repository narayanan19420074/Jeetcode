import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
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
  LinearProgress,
  Alert,
  Pagination,
  Button,
  Select,
  MenuItem,
  alpha,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded';
import DifficultyChip from './DifficultyChip';
import { problemsApi } from '../api/problemsApi';
import { extractErrorMessage } from '../api/apiClient';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'difficulty-asc', label: 'Difficulty: Easy → Hard' },
  { value: 'difficulty-desc', label: 'Difficulty: Hard → Easy' },
  { value: 'acceptance-desc', label: 'Acceptance: High → Low' },
  { value: 'acceptance-asc', label: 'Acceptance: Low → High' },
];

const DIFFICULTY_COLOR = { Easy: 'success', Medium: 'warning', Hard: 'error' };
const COLLAPSED_ROW_HEIGHT = 36;

// Plain text + count-pill filter row item, matching LeetCode's topics row —
// used for both the pattern row and the company row.
function FilterRowItem({ label, count, selected, onClick }) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        flexShrink: 0,
        border: 'none',
        background: 'none',
        p: 0.5,
        borderRadius: 1,
        cursor: 'pointer',
        fontFamily: 'inherit',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Typography
        variant="body2"
        sx={{ fontWeight: selected ? 700 : 500, color: selected ? 'primary.main' : 'text.primary', whiteSpace: 'nowrap' }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          px: 0.75,
          py: 0.1,
          borderRadius: 5,
          fontSize: '0.7rem',
          fontWeight: 600,
          lineHeight: 1.6,
          bgcolor: selected ? (theme) => alpha(theme.palette.primary.main, 0.12) : 'action.hover',
          color: selected ? 'primary.main' : 'text.secondary',
        }}
      >
        {count}
      </Box>
    </Box>
  );
}

// Collapsible single-line filter row (pattern tags / companies) with a
// fade + Expand/Collapse toggle on the right when collapsed.
function CollapsibleFilterRow({ items, itemKey, selected, onToggle, extraTrailing }) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: expanded ? 'wrap' : 'nowrap',
          alignItems: 'center',
          columnGap: 2,
          rowGap: 0.5,
          overflow: 'hidden',
          maxHeight: expanded ? 'none' : COLLAPSED_ROW_HEIGHT,
          pr: expanded ? 0 : 11,
        }}
      >
        {items.map((item) => (
          <FilterRowItem
            key={item[itemKey]}
            label={item[itemKey]}
            count={item.count}
            selected={selected.includes(item[itemKey])}
            onClick={() => onToggle(item[itemKey])}
          />
        ))}
        {expanded && extraTrailing}
      </Box>

      <Box
        onClick={() => setExpanded((v) => !v)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
          cursor: 'pointer',
          height: COLLAPSED_ROW_HEIGHT,
          ...(expanded
            ? { justifyContent: 'flex-end', mt: 0.5 }
            : {
                position: 'absolute',
                top: 0,
                right: 0,
                pl: 4,
                background: (theme) =>
                  `linear-gradient(to right, ${alpha(theme.palette.background.paper, 0)}, ${theme.palette.background.paper} 45%)`,
              }),
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {expanded ? 'Collapse' : 'Expand'}
        </Typography>
        {expanded ? (
          <KeyboardDoubleArrowUpRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        ) : (
          <KeyboardDoubleArrowDownRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        )}
      </Box>
    </Box>
  );
}

// Solved/total-per-difficulty progress bar. Guests see totals with a flat
// (unsolved) bar — no login-wall messaging, since browsing is guest-open.
function ProgressSummary({ progress }) {
  if (!progress) return null;
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const totalAll = difficulties.reduce((sum, d) => sum + progress.total[d], 0);
  const solvedAll = difficulties.reduce((sum, d) => sum + progress.solved[d], 0);

  return (
    <Box sx={{ mb: 2.5 }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {solvedAll} / {totalAll} solved
        </Typography>
      </Stack>
      <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
        {difficulties.map((d) => {
          const pct = progress.total[d] ? (progress.solved[d] / progress.total[d]) * 100 : 0;
          return (
            <Box key={d} sx={{ flex: progress.total[d] || 1, minWidth: 0 }}>
              <LinearProgress variant="determinate" value={pct} color={DIFFICULTY_COLOR[d]} sx={{ height: 6, borderRadius: 3 }} />
            </Box>
          );
        })}
      </Stack>
      <Stack direction="row" spacing={2}>
        {difficulties.map((d) => (
          <Typography key={d} variant="caption" color="text.secondary">
            {d}: {progress.solved[d]}/{progress.total[d]}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}

function ProblemStatusIcon({ solved }) {
  return solved ? (
    <CheckCircleRoundedIcon fontSize="small" sx={{ color: 'success.main' }} />
  ) : (
    <RadioButtonUncheckedRoundedIcon fontSize="small" sx={{ color: 'action.disabled' }} />
  );
}

// Mobile/tablet card — the table's 6 columns don't fit a phone screen, so
// below `md` this renders instead of <Table>.
function ProblemCard({ p, onClick }) {
  return (
    <Paper variant="outlined" onClick={onClick} sx={{ p: 2, borderRadius: 2, cursor: 'pointer', '&:active': { bgcolor: 'action.hover' } }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', mb: 1 }}>
        <Box sx={{ mt: 0.25 }}>
          <ProblemStatusIcon solved={p.solvedByMe} />
        </Box>
        <Typography variant="body1" sx={{ fontWeight: 600, flex: 1 }}>
          {p.title}
        </Typography>
        {p.locked && <LockRoundedIcon fontSize="small" color="disabled" />}
      </Stack>

      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', alignItems: 'center', mb: p.tags?.length ? 1 : 0 }}>
        <DifficultyChip difficulty={p.difficulty} />
        <Typography variant="caption" color="text.secondary">
          {p.acceptanceRate ?? 0}% acceptance
        </Typography>
      </Stack>

      {(p.tags || []).length > 0 && (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
          {p.tags.slice(0, 3).map((t) => (
            <Chip key={t} label={t} size="small" variant="outlined" />
          ))}
        </Stack>
      )}
    </Paper>
  );
}

// --- The shared, self-contained explorer -------------------------------
// Renders its own Paper — callers just put a heading above it and drop
// this in. Used identically by ProblemsPage (pageSize 20) and
// DashboardPage's "Problem Explorer" panel (pageSize 10) so the two never
// drift out of sync with each other again.
export default function ProblemExplorer({ pageSize = 20 }) {
  const navigate = useNavigate();
  // Read once on mount to seed initial filter state — e.g. PrepRoadmapPage
  // links here as `/problems?company=TCS&difficulty=Hard` for its
  // "Practice" buttons. NOT kept in sync afterward (filter changes don't
  // rewrite the URL) — that would be a nice follow-up, but the one-way
  // "deep link sets initial state" direction is what actually mattered:
  // without it, that Practice button silently landed on an unfiltered
  // page no matter what it linked to.
  const [searchParams] = useSearchParams();

  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState(() => {
    const fromUrl = searchParams.get('difficulty');
    return ['Easy', 'Medium', 'Hard'].includes(fromUrl) ? fromUrl : 'All';
  });
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(() => searchParams.getAll('tag'));
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState(() => searchParams.getAll('company'));

  const [progress, setProgress] = useState(null);
  const [pickingRandom, setPickingRandom] = useState(false);
  const [randomError, setRandomError] = useState(null);

  useEffect(() => {
    problemsApi.getTags().then(({ data }) => setAvailableTags(data.data.items)).catch(() => setAvailableTags([]));
    problemsApi.getCompanies().then(({ data }) => setAvailableCompanies(data.data.items)).catch(() => setAvailableCompanies([]));
    problemsApi.getProgress().then(({ data }) => setProgress(data.data)).catch(() => setProgress(null));
  }, []);

  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    if (!hasLoadedOnce.current) setLoading(true);
    else setRefetching(true);

    problemsApi
      .list({
        page,
        limit: pageSize,
        difficulty: difficultyFilter === 'All' ? undefined : difficultyFilter,
        status: statusFilter === 'All' ? undefined : statusFilter,
        sort: search ? undefined : sortBy,
        search: search || undefined,
        tag: selectedTags.length > 0 ? selectedTags : undefined,
        company: selectedCompanies.length > 0 ? selectedCompanies : undefined,
      })
      .then(({ data }) => {
        setProblems(data.data.items);
        setPagination(data.data.pagination);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => {
        hasLoadedOnce.current = true;
        setLoading(false);
        setRefetching(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, difficultyFilter, statusFilter, sortBy, search, selectedTags, selectedCompanies, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [difficultyFilter, statusFilter, sortBy, search, selectedTags, selectedCompanies]);

  const toggleTag = (tag) => setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  const toggleCompany = (company) =>
    setSelectedCompanies((prev) => (prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]));

  const clearAllFilters = () => {
    setSearch('');
    setDifficultyFilter('All');
    setStatusFilter('All');
    setSelectedTags([]);
    setSelectedCompanies([]);
  };

  const hasActiveFilters =
    search !== '' || difficultyFilter !== 'All' || statusFilter !== 'All' || selectedTags.length > 0 || selectedCompanies.length > 0;

  const handlePickOne = () => {
    setPickingRandom(true);
    setRandomError(null);
    problemsApi
      .getRandom({
        difficulty: difficultyFilter === 'All' ? undefined : difficultyFilter,
        status: statusFilter === 'All' ? undefined : statusFilter,
        tag: selectedTags.length > 0 ? selectedTags : undefined,
        company: selectedCompanies.length > 0 ? selectedCompanies : undefined,
      })
      .then(({ data }) => navigate(`/workspace/${data.data.slug}`))
      .catch((err) => setRandomError(extractErrorMessage(err)))
      .finally(() => setPickingRandom(false));
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <ProgressSummary progress={progress} />

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
          <TextField
            size="small"
            placeholder="Search problems"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: { sm: 220 }, flex: { sm: 1 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={pickingRandom ? <CircularProgress size={14} /> : <ShuffleRoundedIcon fontSize="small" />}
            onClick={handlePickOne}
            disabled={pickingRandom}
            sx={{ flexShrink: 0 }}
          >
            Pick One
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            <ToggleButtonGroup size="small" exclusive value={difficultyFilter} onChange={(e, v) => v && setDifficultyFilter(v)}>
              <ToggleButton value="All">All</ToggleButton>
              <ToggleButton value="Easy">Easy</ToggleButton>
              <ToggleButton value="Medium">Medium</ToggleButton>
              <ToggleButton value="Hard">Hard</ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup size="small" exclusive value={statusFilter} onChange={(e, v) => v && setStatusFilter(v)}>
              <ToggleButton value="All">All</ToggleButton>
              <ToggleButton value="solved">Solved</ToggleButton>
              <ToggleButton value="unsolved">Unsolved</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {!search && (
            <Select size="small" value={sortBy} onChange={(e) => setSortBy(e.target.value)} sx={{ minWidth: 190 }}>
              {SORT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          )}
        </Stack>
      </Stack>

      {randomError && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setRandomError(null)}>
          {randomError}
        </Alert>
      )}

      {availableTags.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
            Filter by pattern
          </Typography>
          <CollapsibleFilterRow items={availableTags} itemKey="tag" selected={selectedTags} onToggle={toggleTag} />
        </Box>
      )}

      {availableCompanies.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
            Filter by company
          </Typography>
          <CollapsibleFilterRow
            items={availableCompanies}
            itemKey="company"
            selected={selectedCompanies}
            onToggle={toggleCompany}
            extraTrailing={
              hasActiveFilters && (
                <Button size="small" startIcon={<ClearRoundedIcon fontSize="small" />} onClick={clearAllFilters} sx={{ minWidth: 0 }}>
                  Clear filters
                </Button>
              )
            }
          />
        </Box>
      )}

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
          <Box sx={{ height: 3, mb: 1.5 }}>{refetching && <LinearProgress sx={{ height: 3, borderRadius: 2 }} />}</Box>

          <Box sx={{ opacity: refetching ? 0.5 : 1, transition: 'opacity 0.15s ease' }}>
            <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
              {problems.map((p) => (
                <ProblemCard key={p._id} p={p} onClick={() => navigate(`/workspace/${p.slug}`)} />
              ))}
            </Stack>

            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
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
                        <ProblemStatusIcon solved={p.solvedByMe} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{p.title}</TableCell>
                      <TableCell>
                        <DifficultyChip difficulty={p.difficulty} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {(p.tags || []).slice(0, 2).map((t) => (
                            <Chip key={t} label={t} size="small" variant="outlined" color={selectedTags.includes(t) ? 'primary' : 'default'} />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }} flexWrap="wrap">
                          {p.locked && <LockRoundedIcon fontSize="small" color="disabled" />}
                          {(p.companies || []).slice(0, 2).map((c) => (
                            <Chip
                              key={c}
                              label={c}
                              size="small"
                              variant="outlined"
                              color={selectedCompanies.includes(c) ? 'primary' : 'default'}
                            />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{p.acceptanceRate ?? 0}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>

          {pagination.totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 3 }}>
              <Pagination count={pagination.totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" shape="rounded" />
            </Stack>
          )}
        </>
      )}
    </Paper>
  );
}
