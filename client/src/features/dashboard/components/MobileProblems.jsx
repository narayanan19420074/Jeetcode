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
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
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
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { problemsApi } from '../../../api/problemsApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { DIFF_COLOR, tint } from '../dashboardUtils';
import { SaveToListMenu } from './ListDialogs';
import { LibraryFont, MiniPlayer, useLibraryPalette } from './libraryStyle';

// Phone layout of the Problems page. It uses the same accent colour, rounded panels and tinted
// chips as the phone dashboard (MobileHome), and the page itself scrolls (infinite scroll).

const ACCENT = '#6366F1';
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TRACKING = '0.03em';
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
        minWidth: 43,
        textAlign: 'center',
        px: '5px',
        py: '2px',
        borderRadius: '8px',
        fontSize: 15,
        fontWeight: 400,
        letterSpacing: TRACKING,
        lineHeight: '20px',
        color,
        bgcolor: tint(color, 14),
      }}
    >
      {SHORT_DIFF[difficulty] || difficulty}
    </Typography>
  );
}

function ProblemRow({ p, index, isDaily, saved, onStar, pal }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${pal.divider}`, '&:last-of-type': { borderBottom: 'none' } }}>
      <ButtonBase
        component={RouterLink}
        to={`/workspace/${p.slug}`}
        sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: '10px', py: 2, textAlign: 'left', fontFamily: 'inherit', color: 'inherit' }}
      >
        <Stack sx={{ width: 43, flexShrink: 0, alignItems: 'center', gap: 1.25, pt: '2px' }}>
          <DifficultyTag difficulty={p.difficulty} />
          {p.solvedByMe ? (
            <CheckCircleRoundedIcon aria-label="Solved" sx={{ fontSize: 20, color: 'var(--jc-easy)' }} />
          ) : (
            <RemoveRoundedIcon aria-label="Not solved" sx={{ fontSize: 20, color: pal.muted, opacity: 0.6 }} />
          )}
        </Stack>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 500, fontSize: 18, lineHeight: '28px', letterSpacing: TRACKING, minWidth: 0 }}>
              {index}. {p.title}
            </Typography>
            {isDaily && <EventRoundedIcon aria-label="Today's challenge" sx={{ fontSize: 17, color: ACCENT, flexShrink: 0 }} />}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1.5, color: pal.muted }}>
            <Typography sx={{ fontSize: 15, letterSpacing: TRACKING, fontVariantNumeric: 'tabular-nums' }}>Acceptance {(p.acceptanceRate ?? 0).toFixed(1)}%</Typography>
            {p.locked && <LockRoundedIcon aria-label="Pro problem" sx={{ fontSize: 16, color: 'warning.main' }} />}
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

const BACK_TO_TOP_AFTER = 600; // px scrolled before the button appears

// Floating "back to top" button. It stays hidden until the reader has scrolled down the list.
function BackToTopButton({ pal, bottom }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > BACK_TO_TOP_AFTER);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const goTop = () => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <IconButton
      onClick={goTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      sx={(t) => ({
        position: 'fixed',
        right: 16,
        bottom,
        zIndex: t.zIndex.appBar - 10,
        width: 44,
        height: 44,
        bgcolor: pal.player,
        color: pal.text,
        boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
        '&:hover': { bgcolor: pal.player },
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(8px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 160ms, transform 160ms',
      })}
    >
      <KeyboardArrowUpRoundedIcon />
    </IconButton>
  );
}

function SkeletonRows({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Skeleton variant="rounded" width={43} height={24} sx={{ borderRadius: '8px' }} />
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
  const pal = useLibraryPalette();
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
    <LibraryFont>
    <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: featured ? '84px' : 2, maxWidth: 640, mx: 'auto' }}>
      {/* Back + menu */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton component={RouterLink} to={isAuthenticated ? '/dashboard' : '/'} aria-label="Back to dashboard" sx={{ width: 44, height: 44, ml: -1, color: pal.text }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <IconButton
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          aria-label="Filter problems"
          aria-haspopup="menu"
          sx={{ width: 40, height: 40, bgcolor: pal.player, color: pal.text, '&:hover': { bgcolor: pal.player } }}
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
        placeholder="Search"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        slotProps={{ htmlInput: { 'aria-label': 'Search problems' } }}
        sx={{
          mt: 1,
          px: '4px',
          '& .MuiOutlinedInput-root': { borderRadius: 999, height: 44, bgcolor: pal.player, fontSize: 18, letterSpacing: TRACKING, px: '16px' },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
        }}
      />

      {/* Header */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Box
          sx={{
            width: 81,
            height: 81,
            mx: 'auto',
            borderRadius: '22px',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, #F6DCE3 0%, #EEE3F6 55%, #F8DDEB 100%)',
          }}
        >
          <Box aria-hidden sx={{ width: 46, height: 42, borderRadius: '14px', display: 'grid', placeItems: 'center', background: 'linear-gradient(160deg, #B58AF2, #F28C7A)' }}>
            <CodeRoundedIcon sx={{ fontSize: 28, color: '#fff' }} />
          </Box>
        </Box>
        <Typography component="h1" noWrap sx={{ mt: 1.5, fontWeight: 700, fontSize: 26, lineHeight: '32px' }}>
          {heading}
        </Typography>
        <Typography sx={{ fontSize: 17, lineHeight: '24px', letterSpacing: TRACKING, color: pal.muted }}>Coding practice</Typography>

        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', justifyContent: 'center', mt: 2.5 }}>
          <Box
            role="progressbar"
            aria-label="Problems solved"
            aria-valuemin={0}
            aria-valuemax={totalAll}
            aria-valuenow={solvedAll}
            sx={{ width: 162, height: 8, borderRadius: 99, bgcolor: tint('#F2B63C', 28), overflow: 'hidden' }}
          >
            <Box sx={{ width: `${totalAll ? Math.min((solvedAll / totalAll) * 100, 100) : 0}%`, height: '100%', borderRadius: 99, bgcolor: '#F2B63C', transition: 'width .5s' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 20, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {progress ? solvedAll : '–'}
            <Box component="span" sx={{ color: pal.muted, fontWeight: 400 }}>
              /{progress ? totalAll.toLocaleString('en-IN') : '–'}
            </Box>
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.25} sx={{ justifyContent: 'center', mt: 2.5 }}>
          <Button
            onClick={pickOne}
            disabled={picking}
            disableElevation
            variant="contained"
            startIcon={picking ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />}
            sx={(t) => ({ height: 40, minWidth: 152, px: 3, borderRadius: 999, fontWeight: 500, fontSize: 18, letterSpacing: TRACKING, textTransform: 'none', bgcolor: pal.player, color: t.palette.mode === 'dark' ? pal.text : '#6B4A1E', '&:hover': { bgcolor: pal.player, filter: 'brightness(0.97)' } })}
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
              sx={{ height: 40, px: 2.5, borderRadius: 999, fontWeight: 500, fontSize: 18, letterSpacing: TRACKING, textTransform: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: `color-mix(in srgb, ${ACCENT} 85%, #000)` } }}
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
      <Box sx={{ mt: 3, borderTop: `1px solid ${pal.divider}` }}>
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
              <ProblemRow key={p._id} pal={pal} p={p} index={i + 1} isDaily={p._id === featured?._id} saved={listsApi.isSaved(p._id)} onStar={handleStar} />
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
        slotProps={{ paper: { sx: { borderRadius: '20px', minWidth: 230, py: 0.5, bgcolor: pal.bg } } }}
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
    <MiniPlayer featured={featured} aboveNav={isAuthenticated} />
    <BackToTopButton
      pal={pal}
      bottom={`calc(${isAuthenticated ? 72 : 12}px + ${featured ? 69 : 12}px + env(safe-area-inset-bottom))`}
    />
    </LibraryFont>
  );
}
