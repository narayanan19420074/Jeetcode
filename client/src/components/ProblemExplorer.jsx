import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  LinearProgress,
  Menu,
  MenuItem,
  MenuList,
  Pagination,
  Paper,
  Popover,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { problemsApi } from '../api/problemsApi';
import { extractErrorMessage } from '../api/apiClient';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DIFF_COLOR = { Easy: 'success.main', Medium: 'warning.main', Hard: 'error.main' };

const DIFFICULTY_OPTIONS = [{ value: 'All', label: 'All' }, ...DIFFICULTIES.map((d) => ({ value: d, label: d }))];
const STATUS_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'solved', label: 'Solved' },
  { value: 'unsolved', label: 'Unsolved' },
];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', short: 'Newest' },
  { value: 'oldest', label: 'Oldest', short: 'Oldest' },
  { value: 'difficulty-asc', label: 'Difficulty: Easy → Hard', short: 'Easy → Hard' },
  { value: 'difficulty-desc', label: 'Difficulty: Hard → Easy', short: 'Hard → Easy' },
  { value: 'acceptance-desc', label: 'Acceptance: High → Low', short: 'Acceptance ↓' },
  { value: 'acceptance-asc', label: 'Acceptance: Low → High', short: 'Acceptance ↑' },
];

// Columns: status | title | acceptance (sm+) | difficulty
const GRID_COLUMNS = { xs: '24px minmax(0,1fr) 64px', sm: '32px minmax(0,1fr) 96px 96px' };
const PAD_X = { xs: 1.5, sm: 2.5 };

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function FilterButton({ label, active, onClick, disabled }) {
  return (
    <Button
      size="small"
      variant="outlined"
      color="inherit"
      disabled={disabled}
      onClick={onClick}
      endIcon={<KeyboardArrowDownRoundedIcon fontSize="small" />}
      sx={{
        height: 36,
        px: 1.5,
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        color: active ? 'primary.main' : 'text.primary',
        borderColor: active ? 'primary.main' : 'divider',
        bgcolor: active ? (t) => alpha(t.palette.primary.main, 0.08) : 'transparent',
        '&:hover': { borderColor: active ? 'primary.main' : 'text.secondary', bgcolor: 'action.hover' },
      }}
    >
      {label}
    </Button>
  );
}

// Dropdown with exactly one selectable value (difficulty / status / sort).
function SingleSelectFilter({ label, value, defaultValue, options, onChange, disabled, showValue }) {
  const [anchor, setAnchor] = useState(null);
  const current = options.find((o) => o.value === value);
  const active = value !== defaultValue;
  const buttonLabel = showValue || active ? `${label}: ${current?.short ?? current?.label ?? value}` : label;

  return (
    <>
      <FilterButton label={buttonLabel} active={active && !showValue} disabled={disabled} onClick={(e) => setAnchor(e.currentTarget)} />
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} slotProps={{ paper: { sx: { mt: 0.5, minWidth: 190, borderRadius: 2 } } }}>
        {options.map((o) => (
          <MenuItem
            key={o.value}
            selected={o.value === value}
            onClick={() => {
              onChange(o.value);
              setAnchor(null);
            }}
            sx={{ justifyContent: 'space-between', gap: 2 }}
          >
            <Typography variant="body2" sx={{ color: DIFF_COLOR[o.value] }}>
              {o.label}
            </Typography>
            {o.value === value && <CheckRoundedIcon fontSize="small" color="primary" />}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

// Dropdown with a searchable checkbox list (topics / companies).
function MultiSelectFilter({ label, items, nameKey, selected, onToggle, onClear }) {
  const [anchor, setAnchor] = useState(null);
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => String(i[nameKey]).toLowerCase().includes(q)) : items;
  }, [items, nameKey, query]);

  const close = () => {
    setAnchor(null);
    setQuery('');
  };

  return (
    <>
      <FilterButton
        label={selected.length > 0 ? `${label} · ${selected.length}` : label}
        active={selected.length > 0}
        onClick={(e) => setAnchor(e.currentTarget)}
      />
      <Popover
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 0.5, width: 300, borderRadius: 2 } } }}
      >
        <Box sx={{ p: 1.25 }}>
          <TextField
            size="small"
            fullWidth
            autoFocus
            placeholder={`Search ${label.toLowerCase()}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        <Divider />
        <MenuList dense sx={{ maxHeight: 280, overflowY: 'auto', py: 0.5 }}>
          {shown.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
              No match
            </Typography>
          )}
          {shown.map((item) => {
            const name = item[nameKey];
            return (
              <MenuItem key={name} onClick={() => onToggle(name)} sx={{ gap: 0.5, pl: 0.5 }}>
                <Checkbox size="small" checked={selected.includes(name)} disableRipple tabIndex={-1} />
                <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
                  {name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.count}
                </Typography>
              </MenuItem>
            );
          })}
        </MenuList>
        <Divider />
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 0.75 }}>
          <Typography variant="caption" color="text.secondary">
            {selected.length} selected
          </Typography>
          <Button size="small" onClick={onClear} disabled={selected.length === 0} sx={{ textTransform: 'none' }}>
            Clear
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

// Wrapped chips picker used inside the mobile filter drawer.
function ChipPicker({ title, items, nameKey, selected, onToggle }) {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 12;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) return items.filter((i) => String(i[nameKey]).toLowerCase().includes(q));
    if (showAll || items.length <= LIMIT) return items;
    const head = items.slice(0, LIMIT);
    const extraSelected = items.slice(LIMIT).filter((i) => selected.includes(i[nameKey]));
    return [...head, ...extraSelected];
  }, [items, nameKey, query, selected, showAll]);

  if (items.length === 0) return null;

  return (
    <Box sx={{ mb: 2.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {items.length > LIMIT && !query && (
          <Button size="small" onClick={() => setShowAll((v) => !v)} sx={{ textTransform: 'none', minWidth: 0 }}>
            {showAll ? 'Show less' : `Show all (${items.length})`}
          </Button>
        )}
      </Stack>
      {items.length > LIMIT && (
        <TextField size="small" fullWidth placeholder={`Search ${title.toLowerCase()}`} value={query} onChange={(e) => setQuery(e.target.value)} sx={{ mb: 1 }} />
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {visible.map((item) => {
          const name = item[nameKey];
          const isSel = selected.includes(name);
          return (
            <Chip
              key={name}
              size="small"
              clickable
              color={isSel ? 'primary' : 'default'}
              variant={isSel ? 'filled' : 'outlined'}
              onClick={() => onToggle(name)}
              label={`${name} ${item.count}`}
            />
          );
        })}
        {visible.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No match
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* Progress                                                            */
/* ------------------------------------------------------------------ */

function ProgressSummary({ progress }) {
  const sx = { width: { xs: '100%', md: 400 }, flexShrink: 0 };
  if (progress === undefined) return <Skeleton variant="rounded" height={84} sx={{ ...sx, borderRadius: 3 }} />;
  if (!progress) return null;

  const totalAll = DIFFICULTIES.reduce((s, d) => s + (progress.total?.[d] || 0), 0);
  const solvedAll = DIFFICULTIES.reduce((s, d) => s + (progress.solved?.[d] || 0), 0);

  return (
    <Paper variant="outlined" sx={{ ...sx, borderRadius: 3, px: 2, py: 1.5 }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', gap: 0.75, mb: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1 }}>{solvedAll}</Typography>
        <Typography variant="body2" color="text.secondary">
          / {totalAll} solved
        </Typography>
      </Stack>

      <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
        {DIFFICULTIES.map((d) => {
          const total = progress.total?.[d] || 0;
          const solved = progress.solved?.[d] || 0;
          const pct = total ? (solved / total) * 100 : 0;
          return (
            <Box
              key={d}
              sx={{
                flex: total || 1,
                minWidth: 6,
                height: 6,
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: (t) => alpha(t.palette[{ Easy: 'success', Medium: 'warning', Hard: 'error' }[d]].main, 0.22),
              }}
            >
              <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: DIFF_COLOR[d] }} />
            </Box>
          );
        })}
      </Stack>

      <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap' }}>
        {DIFFICULTIES.map((d) => (
          <Stack key={d} direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: DIFF_COLOR[d] }} />
            <Typography variant="caption" color="text.secondary">
              {d} {progress.solved?.[d] || 0}/{progress.total?.[d] || 0}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* List                                                                */
/* ------------------------------------------------------------------ */

function TableHeader() {
  const cell = { fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.4 };
  return (
    <Box
      sx={{
        display: { xs: 'none', sm: 'grid' },
        gridTemplateColumns: GRID_COLUMNS,
        columnGap: 1.5,
        px: PAD_X,
        py: 1,
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: (t) => alpha(t.palette.text.primary, 0.025),
      }}
    >
      <Typography sx={cell}> </Typography>
      <Typography sx={cell}>Title</Typography>
      <Typography sx={cell}>Acceptance</Typography>
      <Typography sx={cell}>Difficulty</Typography>
    </Box>
  );
}

function ProblemRow({ p, index }) {
  const accept = `${Number(p.acceptanceRate ?? 0).toFixed(1)}%`;
  return (
    <Box
      component={RouterLink}
      to={`/workspace/${p.slug}`}
      sx={{
        display: 'grid',
        gridTemplateColumns: GRID_COLUMNS,
        alignItems: 'center',
        columnGap: { xs: 1, sm: 1.5 },
        px: PAD_X,
        py: { xs: 1.25, sm: 1 },
        minHeight: { xs: 56, sm: 48 },
        color: 'inherit',
        textDecoration: 'none',
        bgcolor: index % 2 === 0 ? (t) => alpha(t.palette.text.primary, 0.025) : 'transparent',
        '&:hover': { bgcolor: 'action.hover' },
        '&:active': { bgcolor: 'action.selected' },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 },
      }}
    >
      <Box sx={{ display: 'flex' }}>
        {p.solvedByMe ? (
          <CheckCircleRoundedIcon sx={{ fontSize: 20, color: 'success.main' }} />
        ) : (
          <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 20, color: 'action.disabled' }} />
        )}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              minWidth: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
            }}
          >
            {index}. {p.title}
          </Typography>
          {p.locked && (
            <Tooltip title="Premium problem">
              <LockRoundedIcon sx={{ fontSize: 15, color: 'text.disabled', flexShrink: 0 }} />
            </Tooltip>
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', sm: 'none' }, mt: 0.25 }}>
          {accept} acceptance
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
        {accept}
      </Typography>

      <Typography variant="body2" sx={{ fontWeight: 600, color: DIFF_COLOR[p.difficulty] || 'text.secondary', textAlign: { xs: 'right', sm: 'left' } }}>
        {p.difficulty}
      </Typography>
    </Box>
  );
}

function SkeletonRows({ count }) {
  return (
    <Box>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ display: 'grid', gridTemplateColumns: GRID_COLUMNS, alignItems: 'center', columnGap: { xs: 1, sm: 1.5 }, px: PAD_X, minHeight: { xs: 56, sm: 48 } }}>
          <Skeleton variant="circular" width={18} height={18} />
          <Skeleton variant="text" width={`${45 + ((i * 17) % 40)}%`} />
          <Skeleton variant="text" width="60%" sx={{ display: { xs: 'none', sm: 'block' } }} />
          <Skeleton variant="text" width="70%" />
        </Box>
      ))}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

// Self-contained LeetCode-style problem explorer. The PAGE scrolls
// normally (no fixed-height trap) so the list can never be squeezed out
// by the filters. Filters: dropdowns on tablet/desktop, bottom drawer on
// phones. Search is debounced; stale responses are ignored.
export default function ProblemExplorer({ pageSize = 20, title = 'Problems' }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  // Deep links like /problems?company=TCS&difficulty=Hard seed the initial state.
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState(() => {
    const fromUrl = searchParams.get('difficulty');
    return {
      search: '',
      difficulty: DIFFICULTIES.includes(fromUrl) ? fromUrl : 'All',
      status: 'All',
      sort: 'newest',
      tags: searchParams.getAll('tag'),
      companies: searchParams.getAll('company'),
      page: 1,
    };
  });
  const [searchInput, setSearchInput] = useState('');

  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [availableTags, setAvailableTags] = useState([]);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [progress, setProgress] = useState(undefined); // undefined = loading, null = unavailable

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pickingRandom, setPickingRandom] = useState(false);
  const [randomError, setRandomError] = useState(null);

  const hasLoadedOnce = useRef(false);
  const listTopRef = useRef(null);

  // Any filter change goes through here so page always resets to 1 in the
  // SAME state update (no double fetch).
  const patch = useCallback((changes) => setFilters((f) => ({ ...f, ...changes, page: 1 })), []);
  const toggleIn = (key) => (value) =>
    setFilters((f) => ({ ...f, page: 1, [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value] }));
  const toggleTag = toggleIn('tags');
  const toggleCompany = toggleIn('companies');

  // Static data (once)
  useEffect(() => {
    problemsApi.getTags().then(({ data }) => setAvailableTags(data.data.items)).catch(() => setAvailableTags([]));
    problemsApi.getCompanies().then(({ data }) => setAvailableCompanies(data.data.items)).catch(() => setAvailableCompanies([]));
    problemsApi.getProgress().then(({ data }) => setProgress(data.data)).catch(() => setProgress(null));
  }, []);

  // Debounce search (300ms)
  useEffect(() => {
    const t = setTimeout(() => {
      const v = searchInput.trim();
      setFilters((f) => (f.search === v ? f : { ...f, search: v, page: 1 }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch list
  useEffect(() => {
    let cancelled = false;
    if (!hasLoadedOnce.current) setLoading(true);
    else setRefetching(true);

    problemsApi
      .list({
        page: filters.page,
        limit: pageSize,
        difficulty: filters.difficulty === 'All' ? undefined : filters.difficulty,
        status: filters.status === 'All' ? undefined : filters.status,
        sort: filters.search ? undefined : filters.sort,
        search: filters.search || undefined,
        tag: filters.tags.length > 0 ? filters.tags : undefined,
        company: filters.companies.length > 0 ? filters.companies : undefined,
      })
      .then(({ data }) => {
        if (cancelled) return;
        setProblems(data.data.items);
        setPagination(data.data.pagination);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (cancelled) return;
        hasLoadedOnce.current = true;
        setLoading(false);
        setRefetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, pageSize, reloadKey]);

  const activeCount =
    (filters.difficulty !== 'All' ? 1 : 0) + (filters.status !== 'All' ? 1 : 0) + filters.tags.length + filters.companies.length;
  const hasAnyFilter = activeCount > 0 || searchInput !== '';

  const clearAll = () => {
    setSearchInput('');
    setFilters((f) => ({ ...f, search: '', difficulty: 'All', status: 'All', tags: [], companies: [], page: 1 }));
  };

  const handlePickOne = () => {
    setPickingRandom(true);
    setRandomError(null);
    problemsApi
      .getRandom({
        difficulty: filters.difficulty === 'All' ? undefined : filters.difficulty,
        status: filters.status === 'All' ? undefined : filters.status,
        tag: filters.tags.length > 0 ? filters.tags : undefined,
        company: filters.companies.length > 0 ? filters.companies : undefined,
      })
      .then(({ data }) => navigate(`/workspace/${data.data.slug}`))
      .catch((err) => setRandomError(extractErrorMessage(err)))
      .finally(() => setPickingRandom(false));
  };

  const changePage = (_e, value) => {
    setFilters((f) => ({ ...f, page: value }));
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const offset = (pagination.page - 1) * pageSize;
  const rangeStart = pagination.total === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + problems.length, pagination.total);

  return (
    <Box>
      {/* Header: title + progress */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{ alignItems: { xs: 'stretch', md: 'flex-end' }, justifyContent: 'space-between', gap: 2, mb: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        <ProgressSummary progress={progress} />
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {/* Toolbar */}
        <Box sx={{ p: PAD_X, pb: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search problems"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              sx={{ flex: 1, minWidth: 0 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchInput ? (
                    <InputAdornment position="end">
                      <IconButton size="small" aria-label="Clear search" onClick={() => setSearchInput('')} edge="end">
                        <ClearRoundedIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />

            {/* Phones: filter drawer button */}
            <Button
              variant={activeCount > 0 ? 'contained' : 'outlined'}
              color={activeCount > 0 ? 'primary' : 'inherit'}
              disableElevation
              onClick={() => setDrawerOpen(true)}
              startIcon={<TuneRoundedIcon fontSize="small" />}
              sx={{ display: { xs: 'inline-flex', sm: 'none' }, flexShrink: 0, height: 40, minWidth: 0, textTransform: 'none', borderColor: 'divider' }}
            >
              {activeCount > 0 ? activeCount : 'Filters'}
            </Button>

            {/* Random */}
            <Button
              variant="outlined"
              color="inherit"
              onClick={handlePickOne}
              disabled={pickingRandom}
              startIcon={pickingRandom ? <CircularProgress size={14} /> : <ShuffleRoundedIcon fontSize="small" />}
              sx={{ display: { xs: 'none', sm: 'inline-flex' }, flexShrink: 0, height: 40, textTransform: 'none', fontWeight: 600, borderColor: 'divider' }}
            >
              Pick One
            </Button>
            <Tooltip title="Pick a random problem">
              <span>
                <IconButton
                  onClick={handlePickOne}
                  disabled={pickingRandom}
                  aria-label="Pick a random problem"
                  sx={{ display: { xs: 'inline-flex', sm: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: 1, height: 40, width: 40 }}
                >
                  {pickingRandom ? <CircularProgress size={16} /> : <ShuffleRoundedIcon fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          {/* Tablet / desktop: dropdown filters */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexWrap: 'wrap', alignItems: 'center', gap: 1, mt: 1.5 }}>
            <SingleSelectFilter label="Difficulty" value={filters.difficulty} defaultValue="All" options={DIFFICULTY_OPTIONS} onChange={(v) => patch({ difficulty: v })} />
            <SingleSelectFilter label="Status" value={filters.status} defaultValue="All" options={STATUS_OPTIONS} onChange={(v) => patch({ status: v })} />
            {availableTags.length > 0 && (
              <MultiSelectFilter label="Topics" items={availableTags} nameKey="tag" selected={filters.tags} onToggle={toggleTag} onClear={() => patch({ tags: [] })} />
            )}
            {availableCompanies.length > 0 && (
              <MultiSelectFilter
                label="Companies"
                items={availableCompanies}
                nameKey="company"
                selected={filters.companies}
                onToggle={toggleCompany}
                onClear={() => patch({ companies: [] })}
              />
            )}
            <Box sx={{ ml: 'auto' }}>
              <Tooltip title={filters.search ? 'Results are ordered by relevance while searching' : ''}>
                <span>
                  <SingleSelectFilter label="Sort" value={filters.sort} defaultValue="newest" options={SORT_OPTIONS} onChange={(v) => patch({ sort: v })} disabled={Boolean(filters.search)} showValue />
                </span>
              </Tooltip>
            </Box>
          </Box>

          {/* Active filter chips */}
          {activeCount > 0 && (
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mt: 1.5 }}>
              {filters.difficulty !== 'All' && (
                <Chip size="small" label={filters.difficulty} onDelete={() => patch({ difficulty: 'All' })} sx={{ display: { xs: 'inline-flex', sm: 'none' } }} />
              )}
              {filters.status !== 'All' && (
                <Chip
                  size="small"
                  label={STATUS_OPTIONS.find((s) => s.value === filters.status)?.label}
                  onDelete={() => patch({ status: 'All' })}
                  sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                />
              )}
              {filters.tags.map((t) => (
                <Chip key={`t-${t}`} size="small" color="primary" variant="outlined" label={t} onDelete={() => toggleTag(t)} />
              ))}
              {filters.companies.map((c) => (
                <Chip key={`c-${c}`} size="small" variant="outlined" icon={<BusinessRoundedIcon />} label={c} onDelete={() => toggleCompany(c)} />
              ))}
              <Button size="small" onClick={clearAll} sx={{ textTransform: 'none', minWidth: 0 }}>
                Clear all
              </Button>
            </Stack>
          )}
        </Box>

        {(randomError || (error && problems.length > 0)) && (
          <Box sx={{ px: PAD_X, pb: 1.5 }}>
            {randomError && (
              <Alert severity="warning" sx={{ mb: 1 }} onClose={() => setRandomError(null)}>
                {randomError}
              </Alert>
            )}
            {error && problems.length > 0 && <Alert severity="error">{error}</Alert>}
          </Box>
        )}

        {/* Results meta */}
        <Box ref={listTopRef} sx={{ px: PAD_X, py: 0.75, scrollMarginTop: 80, minHeight: 28 }}>
          <Typography variant="caption" color="text.secondary">
            {loading ? ' ' : error && problems.length === 0 ? ' ' : `Showing ${rangeStart}–${rangeEnd} of ${pagination.total} problems`}
          </Typography>
        </Box>

        <TableHeader />
        <Box sx={{ position: 'relative', borderTop: { xs: '1px solid', sm: 'none' }, borderColor: 'divider' }}>
          {refetching && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 1 }} />}

          {loading ? (
            <SkeletonRows count={Math.min(pageSize, 10)} />
          ) : error && problems.length === 0 ? (
            <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                Couldn&apos;t load problems
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {error}
              </Typography>
              <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => setReloadKey((k) => k + 1)} sx={{ textTransform: 'none' }}>
                Retry
              </Button>
            </Box>
          ) : problems.length === 0 ? (
            <Box sx={{ py: 7, px: 2, textAlign: 'center' }}>
              <SearchOffRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                No problems match your filters
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Try a different keyword or remove some filters.
              </Typography>
              {hasAnyFilter && (
                <Button variant="outlined" onClick={clearAll} sx={{ textTransform: 'none' }}>
                  Clear all filters
                </Button>
              )}
            </Box>
          ) : (
            <Box sx={{ opacity: refetching ? 0.55 : 1, transition: 'opacity 0.15s ease' }}>
              {problems.map((p, i) => (
                <ProblemRow key={p._id} p={p} index={offset + i + 1} />
              ))}
            </Box>
          )}
        </Box>

        {pagination.totalPages > 1 && (
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', py: 1.5, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={pagination.totalPages}
              page={filters.page}
              onChange={changePage}
              color="primary"
              shape="rounded"
              size={isSmUp ? 'medium' : 'small'}
              siblingCount={isSmUp ? 1 : 0}
              boundaryCount={1}
            />
          </Box>
        )}
      </Paper>

      {/* Mobile filter drawer */}
      <Drawer
        anchor="bottom"
        open={drawerOpen && !isSmUp}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { maxHeight: '88vh', borderTopLeftRadius: 16, borderTopRightRadius: 16 } } }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1.5, pb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Filters
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Button size="small" onClick={clearAll} disabled={!hasAnyFilter} sx={{ textTransform: 'none' }}>
              Clear all
            </Button>
            <IconButton size="small" onClick={() => setDrawerOpen(false)} aria-label="Close filters">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>
        <Divider />

        <Box sx={{ px: 2, py: 2, overflowY: 'auto', flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Difficulty
          </Typography>
          <ToggleButtonGroup fullWidth size="small" exclusive value={filters.difficulty} onChange={(_e, v) => v && patch({ difficulty: v })} sx={{ mb: 2.5 }}>
            {DIFFICULTY_OPTIONS.map((o) => (
              <ToggleButton key={o.value} value={o.value} sx={{ textTransform: 'none' }}>
                {o.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Status
          </Typography>
          <ToggleButtonGroup fullWidth size="small" exclusive value={filters.status} onChange={(_e, v) => v && patch({ status: v })} sx={{ mb: 2.5 }}>
            {STATUS_OPTIONS.map((o) => (
              <ToggleButton key={o.value} value={o.value} sx={{ textTransform: 'none' }}>
                {o.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Sort by
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mb: 2.5, opacity: filters.search ? 0.5 : 1 }}>
            {SORT_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                size="small"
                clickable
                disabled={Boolean(filters.search)}
                color={filters.sort === o.value ? 'primary' : 'default'}
                variant={filters.sort === o.value ? 'filled' : 'outlined'}
                label={o.label}
                onClick={() => patch({ sort: o.value })}
              />
            ))}
          </Stack>

          <ChipPicker title="Topics" items={availableTags} nameKey="tag" selected={filters.tags} onToggle={toggleTag} />
          <ChipPicker title="Companies" items={availableCompanies} nameKey="company" selected={filters.companies} onToggle={toggleCompany} />
        </Box>

        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Button fullWidth variant="contained" disableElevation onClick={() => setDrawerOpen(false)} sx={{ textTransform: 'none', py: 1, fontWeight: 700 }}>
            {loading || refetching ? 'Updating…' : `Show ${pagination.total} problems`}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
