import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Alert,
  Badge,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Pagination,
  Popover,
  Select,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded';
import { problemsApi } from '../../../api/problemsApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { CATEGORY_GROUPS, DIFF_COLOR, SORT_OPTIONS, surface } from '../dashboardUtils';
import { SaveToListMenu } from './ListDialogs';

const PAGE_SIZES = [25, 50, 100];
const TOPIC_ROW_H = 34;
const PAD_X = { xs: '12px', sm: '18px' };
const STAR_W = 44;
const ACC_W = 64;
const DIFF_W = 72;

const INITIAL_QUERY = {
  search: '',
  difficulty: 'All',
  status: 'All',
  sort: 'newest',
  tags: [],
  companies: [],
  page: 1,
  pageSize: 50,
};

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

// ---------------------------------------------------------------- categories

function CategoryPills({ groups, selectedTags, onSelect, onClear }) {
  const noTags = selectedTags.length === 0;
  const pill = (active) => (t) => ({
    flexShrink: 0,
    gap: 0.9,
    px: 2,
    py: 0.85,
    borderRadius: 999,
    fontFamily: 'inherit',
    border: `1px solid ${active ? 'transparent' : t.palette.divider}`,
    bgcolor: active ? t.palette.text.primary : alpha(t.palette.background.paper, 0.6),
    color: active ? t.palette.background.default : t.palette.text.primary,
    transition: 'background-color 120ms, border-color 120ms',
    '&:hover': { borderColor: active ? 'transparent' : t.palette.text.secondary },
    '&.Mui-focusVisible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
  });

  return (
    <Box
      role="group"
      aria-label="Topic groups"
      sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 0.5, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
    >
      <ButtonBase onClick={onClear} aria-pressed={noTags} sx={pill(noTags)}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          All Topics
        </Typography>
      </ButtonBase>
      {groups.map((g) => {
        const active = sameSet(selectedTags, g.tags);
        return (
          <ButtonBase key={g.key} onClick={() => onSelect(g)} aria-pressed={active} sx={pill(active)}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: g.color }} />
            <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
              {g.label}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

// ------------------------------------------------------------------- topics

function TopicRow({ tags, selected, onToggle }) {
  const innerRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return undefined;
    const measure = () => setOverflowing(el.scrollHeight > TOPIC_ROW_H + 4);
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tags]);

  if (!tags.length) return null;
  const collapsed = !expanded && overflowing;

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        ref={innerRef}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          columnGap: 2,
          rowGap: 0.25,
          overflow: 'hidden',
          maxHeight: expanded ? 'none' : TOPIC_ROW_H,
          pr: collapsed ? 12 : 0,
          maskImage: collapsed ? 'linear-gradient(to right, #000 calc(100% - 130px), transparent calc(100% - 40px))' : 'none',
          WebkitMaskImage: collapsed ? 'linear-gradient(to right, #000 calc(100% - 130px), transparent calc(100% - 40px))' : 'none',
        }}
      >
        {tags.map(({ tag, count }) => {
          const on = selected.includes(tag);
          return (
            <ButtonBase
              key={tag}
              onClick={() => onToggle(tag)}
              aria-pressed={on}
              sx={(t) => ({
                gap: 0.75,
                height: TOPIC_ROW_H,
                px: 0.5,
                borderRadius: '8px',
                fontFamily: 'inherit',
                '&:hover': { bgcolor: t.palette.action.hover },
                '&.Mui-focusVisible': { outline: `2px solid ${t.palette.primary.main}` },
              })}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: on ? 800 : 500, color: on ? 'primary.main' : 'text.primary', whiteSpace: 'nowrap' }}
              >
                {tag}
              </Typography>
              <Box
                sx={(t) => ({
                  px: 0.75,
                  borderRadius: 999,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  lineHeight: 1.7,
                  fontVariantNumeric: 'tabular-nums',
                  bgcolor: on ? alpha(t.palette.primary.main, 0.16) : t.palette.action.hover,
                  color: on ? 'primary.main' : 'text.secondary',
                })}
              >
                {count}
              </Box>
            </ButtonBase>
          );
        })}
      </Box>
      {overflowing && (
        <ButtonBase
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          sx={{
            gap: 0.25,
            height: TOPIC_ROW_H,
            fontFamily: 'inherit',
            color: 'text.secondary',
            ...(expanded ? { display: 'flex', ml: 'auto', mt: 0.25 } : { position: 'absolute', top: 0, right: 0 }),
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {expanded ? 'Collapse' : 'Expand'}
          </Typography>
          {expanded ? <KeyboardDoubleArrowUpRoundedIcon fontSize="small" /> : <KeyboardDoubleArrowDownRoundedIcon fontSize="small" />}
        </ButtonBase>
      )}
    </Box>
  );
}

// --------------------------------------------------------------------- rows

function StatusIcon({ solved }) {
  return solved ? (
    <CheckCircleRoundedIcon sx={{ fontSize: 20, color: 'success.main' }} titleAccess="Solved" />
  ) : (
    <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 20, color: 'action.disabled' }} titleAccess="Not solved yet" />
  );
}

function ColumnHeader({ label, width, sortKey, sortValue, onSort, disabled }) {
  const asc = `${sortKey}-asc`;
  const desc = `${sortKey}-desc`;
  const active = sortValue === asc || sortValue === desc;
  const content = (
    <>
      <Typography variant="caption" sx={{ fontWeight: 700, color: active ? 'text.primary' : 'text.secondary' }}>
        {label}
      </Typography>
      {active && (sortValue === asc ? <ArrowUpwardRoundedIcon sx={{ fontSize: 13 }} /> : <ArrowDownwardRoundedIcon sx={{ fontSize: 13 }} />)}
    </>
  );
  return (
    <ButtonBase
      disabled={disabled}
      onClick={() => onSort(sortValue === desc ? asc : desc)}
      sx={{ width, justifyContent: 'flex-end', gap: 0.25, fontFamily: 'inherit', opacity: disabled ? 0.5 : 1, display: { xs: 'none', sm: 'flex' } }}
    >
      {content}
    </ButtonBase>
  );
}

function ProblemRow({ p, index, isDaily, saved, onStar }) {
  return (
    <Box
      sx={(t) => ({
        display: 'flex',
        alignItems: 'center',
        borderBottom: `1px solid ${t.palette.divider}`,
        '&:last-of-type': { borderBottom: 'none' },
        '&:nth-of-type(even)': { bgcolor: alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.025 : 0.018) },
        '&:hover': { bgcolor: alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.09 : 0.05) },
        '&:hover .row-star, &:focus-within .row-star': { opacity: 1 },
      })}
    >
      <Box
        component={RouterLink}
        to={`/workspace/${p.slug}`}
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: PAD_X,
          py: 1.35,
          color: 'inherit',
          textDecoration: 'none',
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2, borderRadius: '8px' },
        }}
      >
        <Box sx={{ display: 'flex', flexShrink: 0 }}>
          <StatusIcon solved={p.solvedByMe} />
        </Box>
        <Typography variant="body2" noWrap sx={{ fontWeight: 600, minWidth: 0, fontSize: '0.9rem' }}>
          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
            {index}.
          </Box>{' '}
          {p.title}
        </Typography>
        {isDaily && (
          <Tooltip title="Today's challenge">
            <EventRoundedIcon sx={{ fontSize: 17, color: 'primary.main', flexShrink: 0 }} />
          </Tooltip>
        )}
        {p.locked && (
          <Tooltip title="Pro problem">
            <LockRoundedIcon sx={{ fontSize: 15, color: 'warning.main', flexShrink: 0 }} />
          </Tooltip>
        )}
        <Box sx={{ flex: 1 }} />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: { xs: 'none', sm: 'block' }, width: ACC_W, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
        >
          {(p.acceptanceRate ?? 0).toFixed(1)}%
        </Typography>
        <Typography
          variant="body2"
          sx={{ width: DIFF_W, textAlign: 'right', flexShrink: 0, fontWeight: 700, color: DIFF_COLOR[p.difficulty] || 'text.secondary' }}
        >
          {p.difficulty}
        </Typography>
      </Box>
      <Box sx={{ width: STAR_W, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        <Tooltip title={saved ? 'Saved to a list' : 'Save to a list'}>
          <IconButton
            className="row-star"
            size="small"
            onClick={(e) => onStar(e.currentTarget, p)}
            aria-label={saved ? `Manage lists for ${p.title}` : `Save ${p.title} to a list`}
            sx={{ opacity: saved ? 1 : { xs: 0.6, md: 0 }, '&:focus-visible': { opacity: 1 } }}
          >
            {saved ? <StarRoundedIcon fontSize="small" sx={{ color: 'warning.main' }} /> : <StarBorderRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function SkeletonRows({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: PAD_X, py: 1.6, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" sx={{ flex: 1, maxWidth: 360 }} />
          <Box sx={{ flex: 1 }} />
          <Skeleton variant="text" width={52} />
        </Box>
      ))}
    </>
  );
}

// Small completion ring + "x/y Solved", like LeetCode's list header.
function SolvedMeter({ solved, total }) {
  const pct = total ? Math.min(solved / total, 1) : 0;
  const r = 9;
  const C = 2 * Math.PI * r;
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="3" />
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke="#10B981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${C * pct} ${C}`}
          transform="rotate(-90 12 12)"
        />
      </svg>
      <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {solved}
        <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          /{total} Solved
        </Box>
      </Typography>
    </Stack>
  );
}

// --------------------------------------------------------------------- main

export default function ProblemLibrary({ isAuthenticated, progress, dailyId, preset, listsApi }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [q, setQ] = useState(INITIAL_QUERY);
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState({ items: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState(null);
  const [retryTick, setRetryTick] = useState(0);

  const [tags, setTags] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [picking, setPicking] = useState(false);

  const [sortAnchor, setSortAnchor] = useState(null);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [saveAnchor, setSaveAnchor] = useState(null);
  const [saveProblem, setSaveProblem] = useState(null);

  const searchRef = useRef(null);
  const reqId = useRef(0);
  const hasLoaded = useRef(false);

  const patch = useCallback((p, keepPage = false) => setQ((prev) => ({ ...prev, ...p, ...(keepPage ? {} : { page: 1 }) })), []);

  // One-time lookups for the topic chips and company filter.
  useEffect(() => {
    problemsApi.getTags().then(({ data: d }) => setTags(d.data.items)).catch(() => setTags([]));
    problemsApi.getCompanies().then(({ data: d }) => setCompanies(d.data.items)).catch(() => setCompanies([]));
  }, []);

  // "Browse by company/topic" from the Explore view lands here pre-filtered.
  useEffect(() => {
    if (!preset) return;
    setSearchText('');
    setQ({ ...INITIAL_QUERY, tags: preset.tags || [], companies: preset.companies || [] });
  }, [preset]);

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      const next = searchText.trim();
      setQ((prev) => (prev.search === next ? prev : { ...prev, search: next, page: 1 }));
    }, 300);
    return () => clearTimeout(id);
  }, [searchText]);

  // Press "/" anywhere on the page to jump to search.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const id = ++reqId.current;
    if (hasLoaded.current) setRefetching(true);
    else setLoading(true);

    problemsApi
      .list({
        page: q.page,
        limit: q.pageSize,
        difficulty: q.difficulty === 'All' ? undefined : q.difficulty,
        status: q.status === 'All' ? undefined : q.status,
        sort: q.search ? undefined : q.sort,
        search: q.search || undefined,
        tag: q.tags.length ? q.tags : undefined,
        company: q.companies.length ? q.companies : undefined,
      })
      .then(({ data: d }) => {
        if (id !== reqId.current) return;
        setData(d.data);
        setError(null);
      })
      .catch((err) => {
        if (id !== reqId.current) return;
        setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (id !== reqId.current) return;
        hasLoaded.current = true;
        setLoading(false);
        setRefetching(false);
      });
  }, [q, retryTick]);

  const availableTagNames = useMemo(() => new Set(tags.map((t) => t.tag)), [tags]);
  const groups = useMemo(
    () => CATEGORY_GROUPS.map((g) => ({ ...g, tags: g.tags.filter((t) => availableTagNames.has(t)) })).filter((g) => g.tags.length > 0),
    [availableTagNames]
  );

  const toggleTag = (tag) => patch({ tags: q.tags.includes(tag) ? q.tags.filter((t) => t !== tag) : [...q.tags, tag] });
  const toggleCompany = (c) => patch({ companies: q.companies.includes(c) ? q.companies.filter((x) => x !== c) : [...q.companies, c] });

  const filterCount = (q.difficulty !== 'All' ? 1 : 0) + (q.status !== 'All' ? 1 : 0) + q.companies.length;
  const anyActive = filterCount > 0 || q.tags.length > 0 || q.search !== '';

  const clearAll = () => {
    setSearchText('');
    setQ({ ...INITIAL_QUERY, pageSize: q.pageSize });
  };

  const pickOne = () => {
    setPicking(true);
    problemsApi
      .getRandom({
        difficulty: q.difficulty === 'All' ? undefined : q.difficulty,
        status: q.status === 'All' ? undefined : q.status,
        tag: q.tags.length ? q.tags : undefined,
        company: q.companies.length ? q.companies : undefined,
      })
      .then(({ data: d }) => navigate(`/workspace/${d.data.slug}`))
      .catch((err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'warning' }))
      .finally(() => setPicking(false));
  };

  const handleStar = (anchor, problem) => {
    // With only the default Favorite list, one click saves/unsaves.
    if (listsApi.lists.length === 1) {
      const wasSaved = listsApi.lists[0].items.some((i) => i._id === problem._id);
      listsApi.toggleItem('favorite', problem);
      enqueueSnackbar(wasSaved ? 'Removed from Favorite' : 'Added to Favorite', { variant: 'default', autoHideDuration: 1800 });
      return;
    }
    setSaveAnchor(anchor);
    setSaveProblem(problem);
  };

  const { items, pagination } = data;
  const offset = (q.page - 1) * q.pageSize;
  const totals = progress?.total || { Easy: 0, Medium: 0, Hard: 0 };
  const solvedBy = progress?.solved || { Easy: 0, Medium: 0, Hard: 0 };
  const totalAll = totals.Easy + totals.Medium + totals.Hard;
  const solvedAll = solvedBy.Easy + solvedBy.Medium + solvedBy.Hard;
  const sortDisabled = q.search !== '';

  return (
    <Stack spacing={1.5}>
      <CategoryPills
        groups={groups}
        selectedTags={q.tags}
        onSelect={(g) => patch({ tags: g.tags })}
        onClear={() => patch({ tags: [] })}
      />

      <TopicRow tags={tags} selected={q.tags} onToggle={toggleTag} />

      {/* Toolbar */}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <TextField
          inputRef={searchRef}
          size="small"
          placeholder="Search questions"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ flex: 1, minWidth: 0, maxWidth: 420, '& .MuiOutlinedInput-root': { borderRadius: 999 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchText ? undefined : (
                <InputAdornment position="end">
                  <Box
                    component="kbd"
                    sx={(t) => ({
                      display: { xs: 'none', md: 'block' },
                      px: 0.75,
                      borderRadius: '6px',
                      border: `1px solid ${t.palette.divider}`,
                      fontFamily: 'inherit',
                      fontSize: '0.7rem',
                      color: 'text.secondary',
                    })}
                  >
                    /
                  </Box>
                </InputAdornment>
              ),
            },
          }}
        />

        <Tooltip title={sortDisabled ? 'Results are ranked by relevance while searching' : 'Sort'}>
          <span>
            <IconButton
              onClick={(e) => setSortAnchor(e.currentTarget)}
              disabled={sortDisabled}
              aria-label="Sort problems"
              sx={(t) => ({ border: `1px solid ${t.palette.divider}`, borderRadius: '10px' })}
            >
              <SwapVertRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Filter">
          <IconButton
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            aria-label="Filter problems"
            sx={(t) => ({ border: `1px solid ${t.palette.divider}`, borderRadius: '10px' })}
          >
            <Badge variant="dot" color="error" invisible={filterCount === 0} overlap="circular">
              <FilterListRoundedIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Pick a random problem from this view">
          <span>
            <IconButton
              onClick={pickOne}
              disabled={picking}
              aria-label="Pick a random problem"
              sx={(t) => ({ border: `1px solid ${t.palette.divider}`, borderRadius: '10px' })}
            >
              {picking ? <CircularProgress size={18} /> : <ShuffleRoundedIcon fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>

        <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <SolvedMeter solved={solvedAll} total={totalAll} />
        </Box>
      </Stack>

      {/* Active filters */}
      {anyActive && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
          {q.search && <Chip size="small" label={`Search: ${q.search}`} onDelete={() => setSearchText('')} />}
          {q.difficulty !== 'All' && <Chip size="small" label={q.difficulty} onDelete={() => patch({ difficulty: 'All' })} sx={{ color: DIFF_COLOR[q.difficulty] }} />}
          {q.status !== 'All' && <Chip size="small" label={q.status === 'solved' ? 'Solved' : 'Unsolved'} onDelete={() => patch({ status: 'All' })} />}
          {q.companies.map((c) => (
            <Chip key={c} size="small" label={c} onDelete={() => toggleCompany(c)} />
          ))}
          <Button size="small" onClick={clearAll} sx={{ minWidth: 0, fontWeight: 700 }}>
            Clear all
          </Button>
        </Stack>
      )}

      {/* The list */}
      <Box sx={[surface, { overflow: 'hidden' }]}>
        <Box
          sx={(t) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            height: 38,
            pl: PAD_X,
            pr: { xs: '12px', sm: `calc(18px + ${STAR_W}px)` },
            borderBottom: `1px solid ${t.palette.divider}`,
            bgcolor: alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.03 : 0.025),
          })}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', pl: '32px' }}>
            Title
          </Typography>
          <Box sx={{ flex: 1 }} />
          <ColumnHeader label="Acceptance" width={ACC_W} sortKey="acceptance" sortValue={q.sort} onSort={(s) => patch({ sort: s })} disabled={sortDisabled} />
          <ColumnHeader label="Difficulty" width={DIFF_W} sortKey="difficulty" sortValue={q.sort} onSort={(s) => patch({ sort: s })} disabled={sortDisabled} />
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ m: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => setRetryTick((n) => n + 1)}>
                Try again
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <SkeletonRows />
        ) : items.length === 0 && !error ? (
          <Box sx={{ py: 7, px: 3, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 800 }}>No problems match this view</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              Loosen a filter or clear them all to see the full library.
            </Typography>
            <Button variant="outlined" onClick={clearAll}>
              Clear filters
            </Button>
          </Box>
        ) : (
          <Box sx={{ opacity: refetching ? 0.55 : 1, transition: 'opacity 120ms' }} aria-busy={refetching}>
            {items.map((p, i) => (
              <ProblemRow
                key={p._id}
                p={p}
                index={offset + i + 1}
                isDaily={p._id === dailyId}
                saved={listsApi.isSaved(p._id)}
                onStar={handleStar}
              />
            ))}
          </Box>
        )}

        {pagination.total > 0 && (
          <Box
            sx={(t) => ({
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              px: PAD_X,
              py: 1.25,
              borderTop: `1px solid ${t.palette.divider}`,
            })}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums', minWidth: 150 }}>
              Showing {offset + 1} to {Math.min(offset + q.pageSize, pagination.total)} of {pagination.total}
            </Typography>
            <Pagination
              count={pagination.totalPages}
              page={q.page}
              onChange={(_, v) => patch({ page: v }, true)}
              shape="rounded"
              size="small"
              siblingCount={1}
              color="primary"
            />
            <Select
              size="small"
              value={q.pageSize}
              onChange={(e) => patch({ pageSize: e.target.value })}
              aria-label="Problems per page"
              sx={{ minWidth: 120, fontSize: '0.85rem' }}
            >
              {PAGE_SIZES.map((n) => (
                <MenuItem key={n} value={n}>
                  {n} / page
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}
      </Box>

      {/* Sort menu */}
      <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)} slotProps={{ paper: { sx: { borderRadius: '12px', minWidth: 230 } } }}>
        {SORT_OPTIONS.map((o) => (
          <MenuItem
            key={o.value}
            selected={q.sort === o.value}
            onClick={() => {
              patch({ sort: o.value });
              setSortAnchor(null);
            }}
            sx={{ justifyContent: 'space-between', gap: 2 }}
          >
            {o.label}
            {q.sort === o.value && <CheckRoundedIcon fontSize="small" color="primary" />}
          </MenuItem>
        ))}
      </Menu>

      {/* Filter popover */}
      <Popover
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { borderRadius: '14px', p: 2.25, width: 340, maxWidth: 'calc(100vw - 24px)', mt: 0.5 } } }}
      >
        <Typography variant="body2" sx={{ fontWeight: 800, mb: 1 }}>
          Difficulty
        </Typography>
        <ToggleButtonGroup size="small" exclusive fullWidth value={q.difficulty} onChange={(_, v) => v && patch({ difficulty: v })} sx={{ mb: 2 }}>
          {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
            <ToggleButton key={d} value={d} sx={{ fontWeight: 700, textTransform: 'none' }}>
              {d}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Typography variant="body2" sx={{ fontWeight: 800, mb: 1 }}>
          Status
        </Typography>
        <Tooltip title={isAuthenticated ? '' : 'Log in to filter by status'}>
          <Box sx={{ mb: 2 }}>
            <ToggleButtonGroup
              size="small"
              exclusive
              fullWidth
              disabled={!isAuthenticated}
              value={q.status}
              onChange={(_, v) => v && patch({ status: v })}
            >
              <ToggleButton value="All" sx={{ fontWeight: 700, textTransform: 'none' }}>
                All
              </ToggleButton>
              <ToggleButton value="solved" sx={{ fontWeight: 700, textTransform: 'none' }}>
                Solved
              </ToggleButton>
              <ToggleButton value="unsolved" sx={{ fontWeight: 700, textTransform: 'none' }}>
                Unsolved
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Tooltip>

        {companies.length > 0 && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 800, mb: 1 }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: 168, overflowY: 'auto', mb: 2 }}>
              {companies.map(({ company, count }) => {
                const on = q.companies.includes(company);
                return (
                  <Chip
                    key={company}
                    size="small"
                    clickable
                    onClick={() => toggleCompany(company)}
                    color={on ? 'primary' : 'default'}
                    variant={on ? 'filled' : 'outlined'}
                    label={`${company} ${count}`}
                  />
                );
              })}
            </Box>
          </>
        )}

        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Button
            size="small"
            color="inherit"
            disabled={filterCount === 0}
            onClick={() => patch({ difficulty: 'All', status: 'All', companies: [] })}
          >
            Reset
          </Button>
          <Button size="small" variant="contained" disableElevation onClick={() => setFilterAnchor(null)}>
            Show {pagination.total} problems
          </Button>
        </Stack>
      </Popover>

      <SaveToListMenu
        anchorEl={saveAnchor}
        problem={saveProblem}
        lists={listsApi.lists}
        onToggle={listsApi.toggleItem}
        onCreate={listsApi.createList}
        onClose={() => {
          setSaveAnchor(null);
          setSaveProblem(null);
        }}
      />
    </Stack>
  );
}
