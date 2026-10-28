import { useCallback, useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  InputAdornment,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import SignalCellularAlt1BarRoundedIcon from '@mui/icons-material/SignalCellularAlt1BarRounded';
import SignalCellularAlt2BarRoundedIcon from '@mui/icons-material/SignalCellularAlt2BarRounded';
import SignalCellularAltRoundedIcon from '@mui/icons-material/SignalCellularAltRounded';
import BackToDashboard from '../../../components/BackToDashboard';
import { problemsApi } from '../../../api/problemsApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { DIFF_COLOR, tint } from '../dashboardUtils';
import { SaveToListMenu } from './ListDialogs';

// Phone layout of the Problems page. It uses the same accent colour, rounded panels and tinted
// chips as the phone dashboard (MobileHome), and the page itself scrolls (infinite scroll).

const ACCENT = '#6366F1';
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const SHORT_DIFF = { Easy: 'Easy', Medium: 'Med.', Hard: 'Hard' };
const PAGE_SIZE = 30;

const INITIAL_QUERY = { search: '', difficulty: 'All', status: 'All', sort: 'newest', tags: [], companies: [], page: 1 };

const DIFF_ICON = { Easy: SignalCellularAlt1BarRoundedIcon, Medium: SignalCellularAlt2BarRoundedIcon, Hard: SignalCellularAltRoundedIcon };

function DifficultyTag({ difficulty }) {
  const color = DIFF_COLOR[difficulty] || 'var(--jc-pending)';
  return (
    <Typography
      component="span"
      sx={{
        flexShrink: 0,
        minWidth: 48,
        textAlign: 'center',
        px: 1,
        py: 0.4,
        borderRadius: '10px',
        fontSize: '0.78rem',
        fontWeight: 800,
        lineHeight: 1.2,
        color,
        bgcolor: tint(color, 16),
      }}
    >
      {SHORT_DIFF[difficulty] || difficulty}
    </Typography>
  );
}

function ProblemRow({ p, index, isDaily, saved, onStar }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 'none' } }}>
      <ButtonBase
        component={RouterLink}
        to={`/workspace/${p.slug}`}
        sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 1.5, py: 1.5, pl: 0.5, textAlign: 'left', fontFamily: 'inherit', color: 'inherit' }}
      >
        <Box sx={{ pt: 0.15 }}>
          <DifficultyTag difficulty={p.difficulty} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.35, minWidth: 0 }}>
              {index}. {p.title}
            </Typography>
            {isDaily && <EventRoundedIcon aria-label="Today's challenge" sx={{ fontSize: 17, color: ACCENT, flexShrink: 0 }} />}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.4, color: 'text.secondary' }}>
            {p.solvedByMe && <CheckCircleRoundedIcon aria-label="Solved" sx={{ fontSize: 16, color: 'var(--jc-easy)' }} />}
            <Typography variant="body2" sx={{ fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}>
              Acceptance {(p.acceptanceRate ?? 0).toFixed(1)}%
            </Typography>
            {p.locked && <LockRoundedIcon aria-label="Pro problem" sx={{ fontSize: 14, color: 'warning.main' }} />}
          </Stack>
        </Box>
      </ButtonBase>
      <IconButton
        size="small"
        onClick={(e) => onStar(e.currentTarget, p)}
        aria-label={saved ? `Manage lists for ${p.title}` : `Save ${p.title} to a list`}
        sx={{ width: 44, height: 44 }}
      >
        {saved ? <StarRoundedIcon sx={{ color: 'warning.main' }} /> : <StarBorderRoundedIcon />}
      </IconButton>
    </Box>
  );
}

function SkeletonRows({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.75, pl: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Skeleton variant="rounded" width={48} height={24} sx={{ borderRadius: '10px' }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="40%" />
          </Box>
        </Box>
      ))}
    </>
  );
}

export default function MobileProblems({ isAuthenticated, progress, featured, preset, listsApi }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [q, setQ] = useState(INITIAL_QUERY);
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState({ items: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState(null);
  const [retryTick, setRetryTick] = useState(0);
  const [picking, setPicking] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [saveAnchor, setSaveAnchor] = useState(null);
  const [saveProblem, setSaveProblem] = useState(null);

  const sentinelRef = useRef(null);
  const reqId = useRef(0);
  const hasLoaded = useRef(false);

  const patch = useCallback((p, keepPage = false) => setQ((prev) => ({ ...prev, ...p, ...(keepPage ? {} : { page: 1 }) })), []);

  // Deep links (topic / company / difficulty) arrive pre-filtered.
  useEffect(() => {
    if (!preset) return;
    setSearchText('');
    setQ({ ...INITIAL_QUERY, difficulty: preset.difficulty || 'All', tags: preset.tags || [], companies: preset.companies || [] });
  }, [preset]);

  useEffect(() => {
    const id = setTimeout(() => {
      const next = searchText.trim();
      setQ((prev) => (prev.search === next ? prev : { ...prev, search: next, page: 1 }));
    }, 300);
    return () => clearTimeout(id);
  }, [searchText]);

  useEffect(() => {
    const id = ++reqId.current;
    if (q.page > 1) setLoadingMore(true);
    else if (hasLoaded.current) setRefetching(true);
    else setLoading(true);

    problemsApi
      .list({
        page: q.page,
        limit: PAGE_SIZE,
        difficulty: q.difficulty === 'All' ? undefined : q.difficulty,
        status: q.status === 'All' ? undefined : q.status,
        sort: q.search ? undefined : q.sort,
        search: q.search || undefined,
        tag: q.tags.length ? q.tags : undefined,
        company: q.companies.length ? q.companies : undefined,
      })
      .then(({ data: d }) => {
        if (id !== reqId.current) return;
        setData((prev) => {
          if (d.data.pagination.page <= 1) return d.data;
          const seen = new Set(prev.items.map((x) => x._id));
          return { ...d.data, items: [...prev.items, ...d.data.items.filter((x) => !seen.has(x._id))] };
        });
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
        setLoadingMore(false);
      });
  }, [q, retryTick]);

  // Infinite scroll against the window.
  const hasMore = data.pagination.page < data.pagination.totalPages;
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading || refetching || loadingMore || error) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) setQ((prev) => ({ ...prev, page: prev.page + 1 }));
      },
      { rootMargin: '0px 0px 400px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, refetching, loadingMore, error, data.items.length]);

  const removeTag = (tag) => patch({ tags: q.tags.filter((t) => t !== tag) });
  const toggleCompany = (c) => patch({ companies: q.companies.filter((x) => x !== c) });

  const filterCount = (q.difficulty !== 'All' ? 1 : 0) + (q.status !== 'All' ? 1 : 0) + q.companies.length + q.tags.length;
  const anyActive = filterCount > 0 || q.search !== '';

  const clearAll = () => {
    setSearchText('');
    setQ({ ...INITIAL_QUERY });
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
    if (listsApi.lists.length === 1) {
      const wasSaved = listsApi.lists[0].items.some((i) => i._id === problem._id);
      listsApi.toggleItem('favorite', problem);
      enqueueSnackbar(wasSaved ? 'Removed from Favorite' : 'Added to Favorite', { variant: 'default', autoHideDuration: 1800 });
      return;
    }
    setSaveAnchor(anchor);
    setSaveProblem(problem);
  };

  const closeMenuAnd = (fn) => () => {
    setMenuAnchor(null);
    fn();
  };

  const { items, pagination } = data;
  const totals = progress?.total || { Easy: 0, Medium: 0, Hard: 0 };
  const solvedBy = progress?.solved || { Easy: 0, Medium: 0, Hard: 0 };
  const totalAll = totals.Easy + totals.Medium + totals.Hard;
  const solvedAll = solvedBy.Easy + solvedBy.Medium + solvedBy.Hard;
  const heading = q.tags.length === 1 ? q.tags[0] : q.companies.length === 1 && !q.tags.length ? q.companies[0] : 'All Problems';

  return (
    <Box sx={{ px: 1.75, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
      {/* Back + menu */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <BackToDashboard sx={{ width: 44, height: 44, border: 'none', bgcolor: 'transparent' }} />
        <IconButton
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          aria-label="Filter problems"
          aria-haspopup="menu"
          sx={(t) => ({ width: 44, height: 44, bgcolor: tint(ACCENT, t.palette.mode === 'dark' ? 16 : 9), color: ACCENT })}
        >
          <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
            <MoreHorizRoundedIcon />
            {filterCount > 0 && <Box aria-hidden sx={{ position: 'absolute', top: -6, right: -8, width: 9, height: 9, borderRadius: '50%', bgcolor: 'error.main' }} />}
          </Box>
        </IconButton>
      </Stack>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search problems"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        slotProps={{
          htmlInput: { 'aria-label': 'Search problems' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={(t) => ({
          mt: 1,
          '& .MuiOutlinedInput-root': { borderRadius: 999, height: 48, bgcolor: tint(ACCENT, t.palette.mode === 'dark' ? 16 : 9) },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
        })}
      />

      {/* Header */}
      <Box sx={{ textAlign: 'center', mt: 2.5 }}>
        <Box
          sx={{
            width: 84,
            height: 84,
            mx: 'auto',
            borderRadius: '26px',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            background: `linear-gradient(135deg, ${ACCENT}, color-mix(in srgb, ${ACCENT} 60%, #000))`,
            boxShadow: `0 14px 26px -12px ${ACCENT}`,
          }}
        >
          <CodeRoundedIcon sx={{ fontSize: 44 }} />
        </Box>
        <Typography component="h1" noWrap sx={{ mt: 1.75, fontWeight: 800, fontSize: '1.9rem', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          {heading}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1rem', mt: 0.25 }}>
          Coding practice
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center', mt: 2 }}>
          <Box
            role="progressbar"
            aria-label="Problems solved"
            aria-valuemin={0}
            aria-valuemax={totalAll}
            aria-valuenow={solvedAll}
            sx={{ flex: 1, maxWidth: 260, height: 8, borderRadius: 99, bgcolor: tint(ACCENT, 20), overflow: 'hidden' }}
          >
            <Box sx={{ width: `${totalAll ? Math.min((solvedAll / totalAll) * 100, 100) : 0}%`, height: '100%', borderRadius: 99, bgcolor: ACCENT, transition: 'width .5s' }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {progress ? solvedAll : '–'}
            <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              /{progress ? totalAll.toLocaleString('en-IN') : '–'}
            </Box>
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.25} sx={{ justifyContent: 'center', mt: 2 }}>
          <Button
            onClick={pickOne}
            disabled={picking}
            disableElevation
            variant="contained"
            startIcon={picking ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />}
            sx={{ height: 48, px: 3.5, borderRadius: 999, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: tint(ACCENT, 20), color: ACCENT, '&:hover': { bgcolor: tint(ACCENT, 30) } }}
          >
            Practice
          </Button>
          {featured && (
            <Button
              component={RouterLink}
              to={`/workspace/${featured.slug}`}
              disableElevation
              variant="contained"
              startIcon={<EventRoundedIcon />}
              sx={{ height: 48, px: 2.5, borderRadius: 999, fontWeight: 800, fontSize: '0.95rem', textTransform: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: `color-mix(in srgb, ${ACCENT} 85%, #000)` } }}
            >
              Daily
            </Button>
          )}
        </Stack>
      </Box>

      {/* Active filters */}
      {anyActive && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mt: 1.5 }}>
          {q.search && <Chip size="small" label={`Search: ${q.search}`} onDelete={() => setSearchText('')} />}
          {q.difficulty !== 'All' && <Chip size="small" label={q.difficulty} onDelete={() => patch({ difficulty: 'All' })} sx={{ color: DIFF_COLOR[q.difficulty] }} />}
          {q.tags.map((tag) => (
            <Chip key={tag} size="small" label={tag} onDelete={() => removeTag(tag)} />
          ))}
          {q.status !== 'All' && <Chip size="small" label={q.status === 'solved' ? 'Solved' : 'Unsolved'} onDelete={() => patch({ status: 'All' })} />}
          {q.companies.map((c) => (
            <Chip key={c} size="small" label={c} onDelete={() => toggleCompany(c)} />
          ))}
          <Button size="small" onClick={clearAll} sx={{ minWidth: 0, fontWeight: 700, textTransform: 'none' }}>
            Clear all
          </Button>
        </Stack>
      )}

      {/* List */}
      <Box sx={{ mt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        {error && (
          <Alert
            severity="error"
            sx={{ my: 2 }}
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
          <Box sx={{ py: 7, px: 2, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 800 }}>No problems match this view</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              Loosen a filter or clear them all to see the full library.
            </Typography>
            <Button variant="outlined" onClick={clearAll} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}>
              Clear filters
            </Button>
          </Box>
        ) : (
          <Box sx={{ opacity: refetching ? 0.55 : 1, transition: 'opacity 120ms' }} aria-busy={refetching}>
            {items.map((p, i) => (
              <ProblemRow key={p._id} p={p} index={i + 1} isDaily={p._id === featured?._id} saved={listsApi.isSaved(p._id)} onStar={handleStar} />
            ))}
            <Box ref={sentinelRef} aria-hidden sx={{ height: 1 }} />
            {loadingMore && <SkeletonRows count={3} />}
          </Box>
        )}
      </Box>

      {pagination.total > 0 && !loading && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1.5, fontVariantNumeric: 'tabular-nums' }}>
          Showing {items.length} of {pagination.total}
        </Typography>
      )}

      {/* Filter menu: choosing an item swaps the list below in place */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        slotProps={{ paper: { sx: { borderRadius: '20px', minWidth: 230, py: 0.5 } } }}
      >
        {DIFFICULTIES.map((d) => {
          const Icon = DIFF_ICON[d];
          return (
            <MenuItem key={d} selected={q.difficulty === d} onClick={closeMenuAnd(() => patch({ difficulty: q.difficulty === d ? 'All' : d }))} sx={{ py: 1.25, fontWeight: 700 }}>
              <ListItemIcon sx={{ color: DIFF_COLOR[d] }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              {d}
              {q.difficulty === d && <CheckRoundedIcon fontSize="small" color="primary" sx={{ ml: 'auto' }} />}
            </MenuItem>
          );
        })}
        <MenuItem
          disabled={!isAuthenticated}
          selected={q.status === 'unsolved'}
          onClick={closeMenuAnd(() => patch({ status: q.status === 'unsolved' ? 'All' : 'unsolved' }))}
          sx={{ py: 1.25, fontWeight: 700 }}
        >
          <ListItemIcon>
            <RadioButtonUncheckedRoundedIcon fontSize="small" />
          </ListItemIcon>
          Unsolved
          {q.status === 'unsolved' && <CheckRoundedIcon fontSize="small" color="primary" sx={{ ml: 'auto' }} />}
        </MenuItem>
        <MenuItem
          disabled={!isAuthenticated}
          selected={q.status === 'solved'}
          onClick={closeMenuAnd(() => patch({ status: q.status === 'solved' ? 'All' : 'solved' }))}
          sx={{ py: 1.25, fontWeight: 700 }}
        >
          <ListItemIcon sx={{ color: 'var(--jc-easy)' }}>
            <CheckCircleRoundedIcon fontSize="small" />
          </ListItemIcon>
          Solved
          {q.status === 'solved' && <CheckRoundedIcon fontSize="small" color="primary" sx={{ ml: 'auto' }} />}
        </MenuItem>
        <Divider />
        <MenuItem disabled={!anyActive} onClick={closeMenuAnd(clearAll)} sx={{ py: 1.25, fontWeight: 700 }}>
          <ListItemIcon>
            <FilterAltOffRoundedIcon fontSize="small" />
          </ListItemIcon>
          Remove filters
        </MenuItem>
      </Menu>

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
    </Box>
  );
}
