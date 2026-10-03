import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Stack,
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
  Collapse,
  IconButton,
  Tooltip,
  useMediaQuery,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded';
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
    <Box sx={{ mb: 1.5 }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 0.75 }}>
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

// LeetCode-style compact row: status icon, "N. Title", acceptance (sm+),
// difficulty as coloured text. Tags/companies live in the filters, not here.
const DIFF_TEXT = { Easy: 'success.main', Medium: 'warning.main', Hard: 'error.main' };

function ProblemRow({ p, index, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: { xs: 1.5, sm: 2.5 },
        py: 1.25,
        cursor: 'pointer',
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover': { bgcolor: 'action.hover' },
        '&:active': { bgcolor: 'action.selected' },
      }}
    >
      <Box sx={{ display: 'flex', flexShrink: 0 }}>
        <ProblemStatusIcon solved={p.solvedByMe} />
      </Box>
      <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 500 }}>
        {index}. {p.title}
      </Typography>
      {p.locked && <LockRoundedIcon sx={{ fontSize: 16, flexShrink: 0 }} color="disabled" />}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: 'none', sm: 'block' }, width: 48, textAlign: 'right', flexShrink: 0 }}
      >
        {p.acceptanceRate ?? 0}%
      </Typography>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: DIFF_TEXT[p.difficulty] || 'text.secondary', width: 52, textAlign: 'right', flexShrink: 0 }}
      >
        {p.difficulty}
      </Typography>
    </Box>
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

  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const activeFilterCount =
    (difficultyFilter !== 'All' ? 1 : 0) + (statusFilter !== 'All' ? 1 : 0) + selectedTags.length + selectedCompanies.length;
  const offset = (page - 1) * pageSize;

  return (
    // Fills whatever height the parent gives it: the top block (progress,
    // search, filters) and the pagination stay fixed, only the list scrolls.
    <Paper
      variant="outlined"
      sx={{ borderRadius: 3, height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2.5 }, pb: { xs: 1.25, sm: 2 }, flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
        <ProgressSummary progress={progress} />

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search problems"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 0 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
          />

          <Button
            variant={activeFilterCount > 0 ? 'contained' : 'outlined'}
            disableElevation
            size="small"
            startIcon={<TuneRoundedIcon fontSize="small" />}
            onClick={() => setFiltersOpen((v) => !v)}
            sx={{ display: { xs: 'inline-flex', sm: 'none' }, flexShrink: 0, minWidth: 0 }}
          >
            {activeFilterCount > 0 ? activeFilterCount : 'Filter'}
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={pickingRandom ? <CircularProgress size={14} /> : <ShuffleRoundedIcon fontSize="small" />}
            onClick={handlePickOne}
            disabled={pickingRandom}
            sx={{ display: { xs: 'none', sm: 'inline-flex' }, flexShrink: 0 }}
          >
            Pick One
          </Button>
          <Tooltip title="Pick a random problem">
            <span>
              <IconButton
                size="small"
                onClick={handlePickOne}
                disabled={pickingRandom}
                aria-label="Pick a random problem"
                sx={{ display: { xs: 'inline-flex', sm: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              >
                {pickingRandom ? <CircularProgress size={16} /> : <ShuffleRoundedIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* Filters: collapsed behind the Filter button on phones, always
            visible from sm up. The panel scrolls on its own if it gets tall. */}
        <Collapse in={isSmUp || filtersOpen}>
          <Box sx={{ maxHeight: { xs: '45vh', sm: 'none' }, overflowY: 'auto', pt: 1.5 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 1.5 }}>
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

            {availableTags.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Filter by pattern
                </Typography>
                <CollapsibleFilterRow items={availableTags} itemKey="tag" selected={selectedTags} onToggle={toggleTag} />
              </Box>
            )}

            {availableCompanies.length > 0 && (
              <Box sx={{ mb: 0.5 }}>
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

            {hasActiveFilters && availableCompanies.length === 0 && (
              <Button size="small" startIcon={<ClearRoundedIcon fontSize="small" />} onClick={clearAllFilters} sx={{ minWidth: 0 }}>
                Clear filters
              </Button>
            )}
          </Box>
        </Collapse>
      </Box>

      {(randomError || error) && (
        <Box sx={{ px: { xs: 1.5, sm: 2.5 }, pt: 1.5, flexShrink: 0 }}>
          {randomError && (
            <Alert severity="warning" sx={{ mb: 1 }} onClose={() => setRandomError(null)}>
              {randomError}
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      )}

      {/* The only scrolling part of the page */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : problems.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
            No problems match your filters.
          </Typography>
        ) : (
          <>
            {refetching && <LinearProgress sx={{ position: 'sticky', top: 0, height: 2, zIndex: 1 }} />}
            <Box sx={{ opacity: refetching ? 0.5 : 1, transition: 'opacity 0.15s ease' }}>
              {problems.map((p, i) => (
                <ProblemRow key={p._id} p={p} index={offset + i + 1} onClick={() => navigate(`/workspace/${p.slug}`)} />
              ))}
            </Box>
          </>
        )}
      </Box>

      {pagination.totalPages > 1 && (
        <Box sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', py: 1, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={pagination.totalPages}
            page={page}
            onChange={(e, v) => setPage(v)}
            color="primary"
            shape="rounded"
            size="small"
            siblingCount={isSmUp ? 1 : 0}
          />
        </Box>
      )}
    </Paper>
  );
}
