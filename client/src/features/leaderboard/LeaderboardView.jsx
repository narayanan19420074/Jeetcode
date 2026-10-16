import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useReducedMotion } from 'framer-motion';
import {
  Alert, Avatar, Badge, Box, ButtonBase, Collapse, IconButton, InputAdornment, Popover, Skeleton, Stack, TextField,
  ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { leaderboardApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import { DIFF_COLOR, surface } from '../dashboard/dashboardUtils';
import { tierFor } from './tiers';

const LIMIT = 30;
const MEDAL = { 1: '#F59E0B', 2: '#94A3B8', 3: '#B45309' };
const APT_COLOR = '#8B5CF6';
const PERIODS = [['all', 'All time'], ['week', 'This week'], ['month', 'This month']];
const TRACKS = [['overall', 'Overall'], ['coding', 'Coding'], ['aptitude', 'Aptitude']];
const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };
// rank | player (profile + name) | streak | score | chevron
const GRID = { xs: '36px minmax(0,1fr) 54px 62px 22px', sm: '52px minmax(0,1fr) 84px 92px 26px' };
const SCROLL = { scrollbarWidth: 'thin', scrollbarGutter: 'stable' };

function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

const utcDay = (d = new Date()) => d.toISOString().slice(0, 10);
function activeLabel(lastActive) {
  if (!lastActive) return { text: 'Not started', color: 'text.disabled', live: false };
  const days = Math.round((Date.parse(utcDay()) - Date.parse(lastActive)) / 86400000);
  if (days <= 0) return { text: 'Active today', color: 'success.main', live: true };
  if (days === 1) return { text: 'Active yesterday', color: 'warning.main', live: false };
  return { text: `${days}d ago`, color: 'text.disabled', live: false };
}

function Streak({ value }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.25 }}>
      <LocalFireDepartmentRoundedIcon sx={{ fontSize: 16, color: value ? 'warning.main' : 'text.disabled' }} />
      <Typography variant="caption" sx={[{ fontWeight: 700 }, mono]}>{value}<Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, color: 'text.secondary', fontWeight: 500 }}>d</Box></Typography>
    </Box>
  );
}

// What this player has solved, and how far the next level is.
function RowDetail({ row }) {
  const { tier, next, progress, toNext } = tierFor(row.score);
  const tiles = [
    ['Easy', row.easy, 10, DIFF_COLOR.Easy],
    ['Medium', row.medium, 20, DIFF_COLOR.Medium],
    ['Hard', row.hard, 40, DIFF_COLOR.Hard],
    ['Aptitude', row.aptitude, 5, APT_COLOR],
  ];
  return (
    <Box sx={(t) => ({ px: { xs: 1.5, sm: 2 }, py: 1.5, bgcolor: t.palette.action.hover, display: 'grid', gap: 1.5 })}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 1 }}>
        {tiles.map(([label, n, pts, color]) => (
          <Box key={label} sx={[surface, { p: 1, textAlign: 'center', minWidth: 0 }]}>
            <Typography sx={[{ fontWeight: 800, fontSize: 18, lineHeight: 1.2, color }, mono]}>{n}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontWeight: 600 }}>{label}</Typography>
            <Typography variant="caption" color="text.disabled" sx={[{ fontSize: 10.5 }, mono]}>{n * pts} pts</Typography>
          </Box>
        ))}
      </Box>

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: tier.color, fontWeight: 700, fontSize: 13 }}>
            <WorkspacePremiumRoundedIcon sx={{ fontSize: 18 }} />{tier.name}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {next ? `${toNext.toLocaleString()} pts to ${next.name}` : 'Top level reached'}
          </Typography>
        </Box>
        <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${progress}%`, bgcolor: tier.color, borderRadius: 3, transition: 'width .5s ease' }} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
          {row.recent} solved in the last 7 days
        </Typography>
      </Box>
    </Box>
  );
}

function Row({ row, isMe, expanded, onToggle, pinned }) {
  const medal = MEDAL[row.rank];
  return (
    <Box id={isMe && !pinned ? 'lb-me' : undefined}>
      <ButtonBase
        onClick={onToggle}
        aria-expanded={expanded}
        sx={(t) => ({
          width: '100%', display: 'grid', gridTemplateColumns: GRID, gap: { xs: 0.75, sm: 1 }, alignItems: 'center', textAlign: 'left',
          px: { xs: 1.25, sm: 2 }, py: 1, fontFamily: 'inherit', borderBottom: `1px solid ${t.palette.divider}`,
          bgcolor: isMe ? `${t.palette.primary.main}14` : 'transparent', boxShadow: isMe ? `inset 3px 0 0 ${t.palette.primary.main}` : 'none',
          '&:hover': { bgcolor: isMe ? undefined : t.palette.action.hover },
        })}
      >
        <Typography sx={[{ fontWeight: 800, fontSize: medal ? 17 : 14, color: medal || 'text.secondary', textAlign: 'center' }, mono]}>{row.rank}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          <Avatar src={row.avatarUrl || undefined} sx={{ width: 34, height: 34, fontSize: 14, fontWeight: 700, ...(medal && { border: `2px solid ${medal}` }) }}>{row.name?.[0]?.toUpperCase()}</Avatar>
          <Typography variant="body2" noWrap sx={{ fontWeight: 700, minWidth: 0 }}>{row.name}{isMe ? ' (you)' : ''}</Typography>
        </Box>
        <Streak value={row.streak} />
        <Typography sx={[{ fontWeight: 800, textAlign: 'right' }, mono]}>{row.score.toLocaleString()}</Typography>
        <ExpandMoreRoundedIcon sx={{ fontSize: 20, color: 'text.disabled', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </ButtonBase>
      <Collapse in={expanded} timeout={220} unmountOnExit><RowDetail row={row} /></Collapse>
    </Box>
  );
}

function SkeletonRows({ count = 14 }) {
  return Array.from({ length: count }, (_, i) => (
    <Box key={i} sx={(t) => ({ display: 'grid', gridTemplateColumns: GRID, gap: 1, alignItems: 'center', px: { xs: 1.25, sm: 2 }, py: 1, borderBottom: `1px solid ${t.palette.divider}` })}>
      <Skeleton variant="text" width={20} sx={{ mx: 'auto' }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Skeleton variant="circular" width={34} height={34} />
        <Skeleton variant="text" width={`${55 + ((i * 17) % 35)}%`} />
      </Box>
      <Skeleton variant="text" width={32} sx={{ mx: 'auto' }} />
      <Skeleton variant="text" width={44} sx={{ ml: 'auto' }} />
      <span />
    </Box>
  ));
}

// Friends: one small card, opens to show how each friend is doing right now.
function FriendsCard({ enabled }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ rows: null, error: '' });
  const friendsVersion = useSelector((s) => s.friends.version);

  // Friends were added/removed elsewhere (Friends tab) — drop the cached list so it reloads.
  useEffect(() => {
    setState({ rows: null, error: '' });
  }, [friendsVersion]);

  useEffect(() => {
    if (!open || !enabled || state.rows) return undefined;
    let cancelled = false;
    leaderboardApi
      .get({ period: 'all', scope: 'friends', track: 'overall', limit: 50 })
      .then(({ data }) => {
        if (cancelled) return;
        const me = data.data.me?.userId;
        setState({ rows: data.data.rows.filter((r) => r.userId !== me), error: '' });
      })
      .catch((err) => !cancelled && setState({ rows: [], error: extractErrorMessage(err) }));
    return () => { cancelled = true; };
  }, [open, enabled, state.rows]);

  const rows = state.rows;
  return (
    <Box sx={[surface, { overflow: 'hidden', flexShrink: 0 }]}>
      <ButtonBase onClick={() => setOpen((o) => !o)} aria-expanded={open} sx={{ width: '100%', justifyContent: 'flex-start', gap: 1.25, px: 1.5, py: 1, fontFamily: 'inherit', textAlign: 'left' }}>
        <GroupsRoundedIcon sx={{ color: 'primary.main' }} />
        <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>Friends</Typography>
        {rows && <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{rows.length}</Typography>}
        <ExpandMoreRoundedIcon sx={{ fontSize: 20, color: 'text.secondary', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </ButtonBase>
      <Collapse in={open} timeout={220}>
        <Box sx={(t) => ({ borderTop: `1px solid ${t.palette.divider}`, maxHeight: 220, overflowY: 'auto', ...SCROLL })}>
          {!enabled && <Typography variant="body2" color="text.secondary" sx={{ p: 1.75 }}>Log in to see your friends.</Typography>}
          {enabled && !rows && [0, 1, 2].map((i) => <Skeleton key={i} height={40} sx={{ mx: 1.5 }} />)}
          {enabled && rows && state.error && <Typography variant="body2" color="error" sx={{ p: 1.75 }}>{state.error}</Typography>}
          {enabled && rows && !state.error && rows.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 1.75 }}>Add friends from the Friends tab and they will show up here.</Typography>
          )}
          {rows?.map((f) => {
            const st = activeLabel(f.lastActive);
            return (
              <Box key={f.userId} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 0.9 }}>
                <Badge variant="dot" overlap="circular" invisible={!st.live} color="success" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                  <Avatar src={f.avatarUrl || undefined} sx={{ width: 30, height: 30, fontSize: 13, fontWeight: 700 }}>{f.name?.[0]?.toUpperCase()}</Avatar>
                </Badge>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 700, lineHeight: 1.25 }}>{f.name}</Typography>
                  <Typography variant="caption" noWrap sx={{ display: 'block', color: st.color, fontWeight: 600 }}>{st.text}</Typography>
                </Box>
                <Streak value={f.streak} />
                <Typography variant="caption" sx={[{ fontWeight: 700, width: 54, textAlign: 'right' }, mono]}>{f.score.toLocaleString()}</Typography>
              </Box>
            );
          })}
        </Box>
      </Collapse>
    </Box>
  );
}

export default function LeaderboardView({ isAuthenticated }) {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState('all');
  // ?scope=friends (from the Friends tab) opens straight on the friends board.
  const [scope, setScope] = useState(() => (isAuthenticated && new URLSearchParams(window.location.search).get('scope') === 'friends' ? 'friends' : 'global'));
  const friendsVersion = useSelector((s) => s.friends.version);
  const [track, setTrack] = useState('overall');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null); // latest response: { me, total, totalUsers, points, ... }
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const q = useDebounced(search);
  const scroller = useRef(null);
  const sentinel = useRef(null);
  const reqId = useRef(0);

  const hasMore = meta ? rows.length < meta.total : false;
  const firstLoad = loading && rows.length === 0;

  useEffect(() => { setPage(1); }, [q, friendsVersion]);

  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    leaderboardApi
      .get({ period, scope, track, q: q || undefined, page, limit: LIMIT })
      .then(({ data: res }) => {
        if (id !== reqId.current) return;
        setRows((prev) => (page === 1 ? res.data.rows : [...prev, ...res.data.rows.filter((r) => !prev.some((p) => p.userId === r.userId))]));
        setMeta(res.data);
        setError('');
      })
      .catch((err) => { if (id === reqId.current) setError(extractErrorMessage(err)); })
      .finally(() => { if (id === reqId.current) setLoading(false); });
  }, [period, scope, track, q, page, friendsVersion]);

  // Endless list: load the next page when the bottom comes into view.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || loading) return undefined;
    const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) setPage((p) => p + 1); }, { root: scroller.current, rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, rows.length]);

  const reset = useCallback(() => {
    setPage(1);
    setRows([]);
    setMeta((m) => (m ? { ...m, total: 0 } : m));
    setOpen(null);
    scroller.current?.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, [reduce]);

  const pick = (setter) => (_, v) => { if (v) { setter(v); reset(); } };
  const me = isAuthenticated ? meta?.me : null;
  const filtersOn = period !== 'all' || track !== 'overall' || scope !== 'global';
  const players = meta?.totalUsers ?? null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, height: { xs: 'calc(100dvh - 150px)', lg: '100%' }, minHeight: 420 }}>
      {/* Header: title, player count, and a few small icon buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Leaderboard</Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <PeopleAltRoundedIcon sx={{ fontSize: 15 }} />
            {players === null ? <Skeleton width={90} /> : <Typography variant="caption" sx={{ fontWeight: 700 }}>{players.toLocaleString()} players</Typography>}
          </Box>
        </Box>
        <Tooltip title="Search"><IconButton onClick={() => { setSearchOpen((o) => !o); if (searchOpen) setSearch(''); }} aria-label="Search players" sx={(t) => ({ border: `1px solid ${t.palette.divider}`, borderRadius: '10px' })}>{searchOpen ? <CloseRoundedIcon fontSize="small" /> : <SearchRoundedIcon fontSize="small" />}</IconButton></Tooltip>
        <Tooltip title="Filters"><IconButton onClick={(e) => setFilterAnchor(e.currentTarget)} aria-label="Leaderboard filters" sx={(t) => ({ border: `1px solid ${t.palette.divider}`, borderRadius: '10px' })}><Badge variant="dot" color="error" invisible={!filtersOn} overlap="circular"><TuneRoundedIcon fontSize="small" /></Badge></IconButton></Tooltip>
      </Box>

      <Collapse in={searchOpen} timeout={200} sx={{ flexShrink: 0 }}>
        <TextField
          size="small" fullWidth placeholder="Search name or @handle" value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 999 } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }, htmlInput: { 'aria-label': 'Search players' } }}
        />
      </Collapse>

      <FriendsCard enabled={isAuthenticated} />

      {error && <Alert severity="error" sx={{ flexShrink: 0 }}>{error}</Alert>}

      {/* The list: the only thing on this page that scrolls */}
      <Box sx={[surface, { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }]}>
        <Box sx={(t) => ({ display: 'grid', gridTemplateColumns: GRID, gap: { xs: 0.75, sm: 1 }, px: { xs: 1.25, sm: 2 }, py: 0.9, borderBottom: `1px solid ${t.palette.divider}`, color: 'text.secondary', flexShrink: 0 })}>
          <Typography variant="caption" sx={{ fontWeight: 800, textAlign: 'center' }}>#</Typography>
          <Typography variant="caption" sx={{ fontWeight: 800 }}>PLAYER</Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, textAlign: 'center' }}>STREAK</Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, textAlign: 'right' }}>SCORE</Typography>
          <span />
        </Box>

        <Box ref={scroller} sx={{ flex: 1, minHeight: 0, overflowY: firstLoad ? 'hidden' : 'auto', overflowX: 'hidden', ...SCROLL, scrollbarGutter: firstLoad ? 'auto' : 'stable' }}>
          {firstLoad && <SkeletonRows />}
          {rows.map((r) => (
            <Row key={r.userId} row={r} isMe={me?.userId === r.userId} expanded={open === r.userId} onToggle={() => setOpen(open === r.userId ? null : r.userId)} />
          ))}
          {!loading && rows.length === 0 && !error && (
            <Typography color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
              {q ? `No player matches "${q}".` : scope === 'friends' ? 'Add friends from the Friends tab and they will show up here.' : 'No one has scored in this period yet. Be the first.'}
            </Typography>
          )}
          {hasMore && <Box ref={sentinel} sx={{ height: 1 }} />}
          {loading && rows.length > 0 && <SkeletonRows count={3} />}
        </Box>

        {/* My own position stays pinned under the list */}
        {me && (
          <Box sx={(t) => ({ flexShrink: 0, borderTop: `2px solid ${t.palette.primary.main}`, maxHeight: '55%', overflowY: 'auto' })}>
            <Row row={me} isMe pinned expanded={open === 'pinned-me'} onToggle={() => setOpen(open === 'pinned-me' ? null : 'pinned-me')} />
          </Box>
        )}
        {isAuthenticated && meta && !meta.me && !loading && (
          <Typography variant="caption" color="text.secondary" sx={(t) => ({ flexShrink: 0, px: 2, py: 1, borderTop: `1px solid ${t.palette.divider}` })}>
            Solve a question{period === 'all' ? '' : ' in this period'} to enter the leaderboard.
          </Typography>
        )}
      </Box>

      <Popover
        anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: '14px', p: 2, width: 320, maxWidth: 'calc(100vw - 24px)', mt: 0.5 } } }}
      >
        <Stack spacing={1.75}>
          {[['Period', period, setPeriod, PERIODS], ['Track', track, setTrack, TRACKS], ['Show', scope, setScope, [['global', 'Everyone'], ['friends', 'Friends']]]].map(([title, value, setter, opts]) => (
            <Box key={title}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 0.4 }}>{title.toUpperCase()}</Typography>
              <ToggleButtonGroup size="small" exclusive fullWidth value={value} onChange={pick(setter)} sx={{ mt: 0.5 }}>
                {opts.map(([v, l]) => <ToggleButton key={v} value={v} disabled={v === 'friends' && !isAuthenticated} sx={{ fontWeight: 700, textTransform: 'none', px: 1 }}>{l}</ToggleButton>)}
              </ToggleButtonGroup>
            </Box>
          ))}
          <Typography variant="caption" color="text.secondary">
            Easy {meta?.points?.easy ?? 10} · Medium {meta?.points?.medium ?? 20} · Hard {meta?.points?.hard ?? 40} · Aptitude {meta?.points?.aptitude ?? 5} points. Each question counts once.
          </Typography>
        </Stack>
      </Popover>
    </Box>
  );
}
