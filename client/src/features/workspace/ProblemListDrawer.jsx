import { useEffect, useRef, useState } from 'react';
import { Box, ButtonBase, Chip, CircularProgress, Drawer, InputAdornment, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { problemsApi } from '../../api/problemsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { difficultyColor } from '../../app/theme';
import { WsButton, WsIconButton } from './wsUi';
import { wsSurface } from './workspaceTheme';

const PAGE_SIZE = 30;
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

// Left-side overlay with the problem list. Used by the workspace AND the pair room.
// onSelect(slug) is called when a problem is tapped; the drawer closes itself after.
// The list is fetched when the drawer opens and cleared again once it has closed.
export default function ProblemListDrawer({ open, onClose, currentSlug, onSelect, disabled = false }) {
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
      const v = searchInput.trim();
      setSearch(v);
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

  // After the slide-out finishes: forget everything so the next open is fresh.
  const resetAll = () => {
    fetchedKey.current = null;
    setItems([]);
    setPage(1);
    setTotal(0);
    setTotalPages(1);
    setError(null);
    setSearchInput('');
    setSearch('');
    setDifficulty('All');
  };

  const pickDifficulty = (d) => {
    setDifficulty((prev) => (prev === d ? 'All' : d));
    setPage(1);
  };

  const choose = (p) => {
    if (disabled) return;
    onClose();
    if (p.slug !== currentSlug) onSelect(p.slug);
  };

  const firstLoad = loading && items.length === 0;

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        transition: { onExited: resetAll },
        paper: { sx: (t) => ({ width: { xs: 'min(88vw, 380px)', sm: 400 }, maxWidth: '100%', bgcolor: wsSurface(t).chrome, backgroundImage: 'none' }) },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, pl: 2, pr: 1, pb: 0.75, pt: 'calc(8px + env(safe-area-inset-top))', flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', flex: 1 }}>Problems</Typography>
        {total > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
            {total}
          </Typography>
        )}
        <WsIconButton title="Close" size="lg" onClick={onClose}>
          <CloseRoundedIcon />
        </WsIconButton>
      </Stack>

      <Box sx={{ px: 2, pb: 1, flexShrink: 0 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search problems"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchInput ? (
                <InputAdornment position="end">
                  <ClearRoundedIcon fontSize="small" sx={{ cursor: 'pointer' }} onClick={() => setSearchInput('')} />
                </InputAdornment>
              ) : null,
            },
          }}
        />
        <Stack direction="row" sx={{ gap: 0.75, mt: 1 }}>
          {DIFFICULTIES.map((d) => {
            const on = difficulty === d;
            const color = difficultyColor(d);
            return (
              <Chip
                key={d}
                clickable
                size="small"
                label={d}
                onClick={() => pickDifficulty(d)}
                variant="outlined"
                sx={{
                  fontWeight: 700,
                  color,
                  borderColor: on ? color : 'divider',
                  bgcolor: on ? `color-mix(in srgb, ${color} 14%, transparent)` : 'transparent',
                }}
              />
            );
          })}
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', borderTop: '1px solid', borderColor: 'divider', opacity: disabled ? 0.6 : 1 }}>
        {firstLoad && (
          <Box>
            {Array.from({ length: 8 }).map((_, i) => (
              <Box key={i} sx={{ px: 2, py: 1.5, minHeight: 56 }}>
                <Skeleton variant="text" width={`${50 + ((i * 17) % 40)}%`} />
                <Skeleton variant="text" width="25%" height={16} />
              </Box>
            ))}
          </Box>
        )}

        {error && (
          <Box sx={{ py: 5, px: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {error}
            </Typography>
            <WsButton variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>
              Retry
            </WsButton>
          </Box>
        )}

        {!firstLoad && !error && items.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 5, px: 2, textAlign: 'center' }}>
            No problems match.
          </Typography>
        )}

        {items.map((p, i) => {
          const current = p.slug === currentSlug;
          return (
            <ButtonBase
              key={p._id}
              onClick={() => choose(p)}
              aria-current={current ? 'true' : undefined}
              sx={(t) => ({
                display: 'flex',
                width: '100%',
                justifyContent: 'flex-start',
                textAlign: 'left',
                alignItems: 'center',
                gap: 1.25,
                px: 2,
                py: 1.1,
                minHeight: 56,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: current ? alpha(t.palette.primary.main, 0.1) : 'transparent',
                '&:hover': { bgcolor: current ? alpha(t.palette.primary.main, 0.14) : 'action.hover' },
                '&:active': { bgcolor: 'action.selected' },
              })}
            >
              {p.solvedByMe ? (
                <CheckCircleRoundedIcon sx={{ fontSize: 20, color: 'success.main', flexShrink: 0 }} />
              ) : (
                <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 20, color: 'action.disabled', flexShrink: 0 }} />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: current ? 700 : 500,
                    fontSize: '0.92rem',
                    lineHeight: 1.35,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                    color: current ? 'primary.main' : 'text.primary',
                  }}
                >
                  {i + 1}. {p.title}
                </Typography>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 0.25 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: difficultyColor(p.difficulty) }}>{p.difficulty}</Typography>
                  {p.locked && <LockRoundedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />}
                </Stack>
              </Box>
            </ButtonBase>
          );
        })}

        {!error && items.length > 0 && page < totalPages && (
          <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center' }}>
            <WsButton variant="secondary" disabled={loading} onClick={() => setPage((n) => n + 1)}>
              {loading ? <CircularProgress size={16} /> : 'Load more'}
            </WsButton>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
