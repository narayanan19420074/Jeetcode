import { useEffect, useRef, useState } from 'react';
import { Box, Button, ButtonBase, CircularProgress, IconButton, InputAdornment, Skeleton, Stack, SwipeableDrawer, TextField, Typography } from '@mui/material';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { problemsApi } from '../../api/problemsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { LIB_TRACKING, LibraryFont, libChipSx, libIconBtnSx, libSearchSx, libSectionTitleSx, libTintBtnSx, useLibraryPalette } from '../dashboard/components/libraryStyle';
import { PhoneDifficultyTag } from './phoneStyle';

const PAGE_SIZE = 30;
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const SWIPE_AREA = 28; // px along the left edge where a swipe to the right pulls the list open

// Phone problem list: pull it from the left edge of the screen (or open it from the header menu).
// Same rows as the phone Problems page. The list is fetched when it opens and cleared once it has closed.
//   onSelect(slug)  called when a problem is tapped; the list closes itself after
export default function PhoneProblemList({ open, onOpen, onClose, currentSlug, onSelect }) {
  const pal = useLibraryPalette();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const fetchedKey = useRef(null);

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (!open) return undefined;
    const key = `${search}|${difficulty}|${page}|${reloadKey}`;
    if (fetchedKey.current === key) return undefined;
    fetchedKey.current = key;

    let cancelled = false;
    setLoading(true);
    setError(null);
    problemsApi
      .list({
        page,
        limit: PAGE_SIZE,
        difficulty: difficulty === 'All' ? undefined : difficulty,
        sort: search ? undefined : 'newest',
        search: search || undefined,
      })
      .then(({ data }) => {
        if (cancelled) return;
        setItems((prev) => (page === 1 ? data.data.items : [...prev, ...data.data.items]));
        setTotal(data.data.pagination.total);
        setTotalPages(data.data.pagination.totalPages);
      })
      .catch((err) => {
        if (cancelled) return;
        fetchedKey.current = null;
        setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      // Filter changed mid-request: let the next effect run fetch again.
      if (fetchedKey.current === key) fetchedKey.current = null;
    };
  }, [open, search, difficulty, page, reloadKey]);

  // Once the slide-out has finished: forget everything so the next open is fresh.
  useEffect(() => {
    if (open) return undefined;
    const t = setTimeout(() => {
      fetchedKey.current = null;
      setItems([]);
      setPage(1);
      setTotal(0);
      setTotalPages(1);
      setError(null);
      setSearchInput('');
      setSearch('');
      setDifficulty('All');
    }, 400);
    return () => clearTimeout(t);
  }, [open]);

  const pickDifficulty = (d) => {
    setDifficulty((prev) => (prev === d ? 'All' : d));
    setPage(1);
  };

  const choose = (p) => {
    onClose();
    if (p.slug !== currentSlug) onSelect(p.slug);
  };

  const firstLoad = loading && items.length === 0;

  return (
    <SwipeableDrawer
      anchor="left"
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      swipeAreaWidth={SWIPE_AREA}
      disableDiscovery
      sx={{ '& .MuiDrawer-paper': { width: 'min(88vw, 380px)', maxWidth: '100%', borderRadius: '0 24px 24px 0', backgroundImage: 'none', backgroundColor: pal.bg, color: pal.text } }}
    >
      {/* Portals do not inherit the library variables, so the list gets its own scope. */}
      <LibraryFont sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, pl: 2, pr: 1.5, pt: 'calc(12px + env(safe-area-inset-top))', flexShrink: 0 }}>
          <Typography component="h2" sx={{ ...libSectionTitleSx, flex: 1 }}>
            Problems
            {total > 0 && (
              <Box component="span" sx={{ ml: 1, color: pal.muted, fontWeight: 400, fontVariantNumeric: 'tabular-nums' }}>
                {total.toLocaleString('en-IN')}
              </Box>
            )}
          </Typography>
          <IconButton onClick={onClose} aria-label="Close problem list" sx={libIconBtnSx}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <Box sx={{ px: 2, pb: 1.5, flexShrink: 0 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            slotProps={{
              htmlInput: { 'aria-label': 'Search problems' },
              input: {
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton size="small" aria-label="Clear search" onClick={() => setSearchInput('')} edge="end">
                      <ClearRoundedIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
            sx={{ ...libSearchSx, mt: 0.5, px: 0 }}
          />
          <Stack direction="row" sx={{ gap: 1, mt: 1.5 }}>
            {DIFFICULTIES.map((d) => (
              <ButtonBase key={d} aria-pressed={difficulty === d} onClick={() => pickDifficulty(d)} sx={libChipSx(difficulty === d)}>
                {d}
              </ButtonBase>
            ))}
          </Stack>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2, borderTop: `1px solid ${pal.divider}`, pb: 'calc(16px + env(safe-area-inset-bottom))' }}>
          {firstLoad &&
            Array.from({ length: 8 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 2 }}>
                <Skeleton variant="rounded" width={43} height={24} sx={{ borderRadius: '8px' }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width={`${50 + ((i * 17) % 40)}%`} />
                  <Skeleton variant="text" width="30%" height={16} />
                </Box>
              </Box>
            ))}

          {error && (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 15, letterSpacing: LIB_TRACKING, color: pal.muted, mb: 1.5 }}>{error}</Typography>
              <Button disableElevation onClick={() => setReloadKey((k) => k + 1)} sx={{ ...libTintBtnSx, height: 36, px: 2, fontSize: 15 }}>
                Try again
              </Button>
            </Box>
          )}

          {!firstLoad && !error && items.length === 0 && (
            <Typography sx={{ py: 5, textAlign: 'center', fontSize: 15, letterSpacing: LIB_TRACKING, color: pal.muted }}>No problems match.</Typography>
          )}

          {items.map((p, i) => {
            const current = p.slug === currentSlug;
            return (
              <ButtonBase
                key={p._id}
                onClick={() => choose(p)}
                aria-current={current ? 'true' : undefined}
                sx={{
                  display: 'flex',
                  width: 'calc(100% + 16px)',
                  mx: '-8px',
                  px: '8px',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  gap: '10px',
                  py: 1.75,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  color: 'inherit',
                  borderRadius: '16px',
                  bgcolor: current ? pal.chip : 'transparent',
                }}
              >
                <Stack sx={{ width: 43, flexShrink: 0, alignItems: 'center', gap: 1.25, pt: '2px' }}>
                  <PhoneDifficultyTag difficulty={p.difficulty} />
                  {p.solvedByMe && <CheckCircleRoundedIcon aria-label="Solved" sx={{ fontSize: 20, color: 'var(--jc-easy)' }} />}
                </Stack>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'flex-start', minWidth: 0 }}>
                    <Typography
                      sx={{
                        minWidth: 0,
                        fontWeight: current ? 700 : 500,
                        fontSize: 16,
                        lineHeight: '24px',
                        letterSpacing: LIB_TRACKING,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                      }}
                    >
                      {i + 1}. {p.title}
                    </Typography>
                    {p.locked && <LockRoundedIcon aria-label="Pro problem" sx={{ fontSize: 16, mt: '4px', color: 'warning.main', flexShrink: 0 }} />}
                  </Stack>
                  <Typography sx={{ mt: 0.5, fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted, fontVariantNumeric: 'tabular-nums' }}>
                    Acceptance {(p.acceptanceRate ?? 0).toFixed(1)}%
                  </Typography>
                </Box>
              </ButtonBase>
            );
          })}

          {!error && items.length > 0 && page < totalPages && (
            <Box sx={{ pt: 1.5, display: 'flex', justifyContent: 'center' }}>
              <Button disableElevation disabled={loading} onClick={() => setPage((n) => n + 1)} sx={{ ...libTintBtnSx, height: 36, px: 2, fontSize: 15 }}>
                {loading ? <CircularProgress size={16} color="inherit" /> : 'Load more'}
              </Button>
            </Box>
          )}
        </Box>
      </LibraryFont>
    </SwipeableDrawer>
  );
}
