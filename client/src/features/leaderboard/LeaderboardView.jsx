import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useReducedMotion } from 'framer-motion';
import { Box, Popover, Typography, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { leaderboardApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import { DIFF_COLOR } from '../dashboard/dashboardUtils';
import { tierFor } from './tiers';
import { APT_COLOR, AvatarRing, PT, calm, mono, sweep } from './lbShared';
import EmpireCard from './EmpireCard';
import LeaderboardPanel from './lbPanel';

const LIMIT = 30;

// The layout is chosen from the width this view actually gets (not the window), because the
// dashboard sidebar eats a different amount at each breakpoint.
const PANEL_MIN = 900; // side panel (player card) fits from here
const PANEL_W = 316;
const GAP = 16;

function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

function useElSize(el, initial = { w: 0, h: 0 }) {
  const [size, setSize] = useState(initial);
  useLayoutEffect(() => {
    if (!el) return undefined;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return size;
}

// What this player has solved, and how far the next level is. Opens in a popover when there is no side panel.
function RowDetail({ row }) {
  const { tier, next, progress, toNext } = tierFor(row.score);
  const tiles = [
    ['Easy', row.easy, PT.easy, DIFF_COLOR.Easy],
    ['Medium', row.medium, PT.medium, DIFF_COLOR.Medium],
    ['Hard', row.hard, PT.hard, DIFF_COLOR.Hard],
    ['Aptitude', row.aptitude, PT.aptitude, APT_COLOR],
  ];
  return (
    <Box sx={(t) => ({ px: 2, py: 1.5, bgcolor: alpha(t.palette.text.primary, 0.035), display: 'grid', gap: 1.5 })}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
        <AvatarRing src={row.avatarUrl} name={row.name} size={38} a={tier.color} b={`color-mix(in srgb, ${tier.color} 40%, #fff)`} />
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 800, lineHeight: 1.25 }}>{row.name}</Typography>
          <Typography noWrap variant="caption" color="text.secondary">@{row.handle}{row.company ? `, ${row.company}` : ''}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 1 }}>
        {tiles.map(([label, n, pts, color]) => (
          <Box key={label} sx={{ p: 1, textAlign: 'center', minWidth: 0, borderRadius: '12px', border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`, background: `linear-gradient(160deg, color-mix(in srgb, ${color} 20%, transparent), transparent 80%)` }}>
            <Typography sx={[{ fontWeight: 900, fontSize: 19, lineHeight: 1.2, color }, mono]}>{n}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontWeight: 700 }}>{label}</Typography>
            <Typography variant="caption" color="text.disabled" sx={[{ fontSize: 10.5 }, mono]}>{n * pts} pts</Typography>
          </Box>
        ))}
      </Box>

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: tier.color, fontWeight: 800, fontSize: 13 }}>
            <WorkspacePremiumRoundedIcon sx={{ fontSize: 18 }} />{tier.name}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {next ? `${toNext.toLocaleString()} pts to ${next.name}` : 'Top level reached'}
          </Typography>
        </Box>
        <Box sx={{ height: 9, borderRadius: 99, bgcolor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', overflow: 'hidden', height: '100%', width: `${Math.max(progress, 4)}%`, borderRadius: 99, background: `linear-gradient(90deg, ${tier.color}, color-mix(in srgb, ${tier.color} 45%, #fff))`, transition: 'width .6s ease', '&::after': { content: '""', position: 'absolute', top: 0, bottom: 0, width: '35%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)', animation: `${sweep} 2.6s ease-in-out infinite`, ...calm } }} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, fontWeight: 600 }}>
          {row.recent} solved in the last 7 days
        </Typography>
      </Box>
    </Box>
  );
}

// ---------- the page ----------

export default function LeaderboardView({ isAuthenticated }) {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState('all');
  // ?scope=friends (from the Friends tab) opens straight on the friends board.
  const [scope, setScope] = useState(() => (isAuthenticated && new URLSearchParams(window.location.search).get('scope') === 'friends' ? 'friends' : 'global'));
  const friendsVersion = useSelector((s) => s.friends.version);
  const [track, setTrack] = useState('overall');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null); // latest response: { me, total, totalUsers, points, ... }
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null); // wide: which player the side panel shows
  const [detail, setDetail] = useState(null); // no side panel: a tapped row opens in a popover
  const [reloadKey, setReloadKey] = useState(0);
  const [wrapEl, setWrapEl] = useState(null);
  const [boardEl, setBoardEl] = useState(null);
  const isLg = useMediaQuery(useTheme().breakpoints.up('lg'));
  // The dashboard puts this view inside a plain div with no height, so "100%" would collapse to the
  // content height and the list would never scroll. On wide screens measure the room instead.
  const [fitH, setFitH] = useState(null);
  useLayoutEffect(() => {
    if (!isLg || !wrapEl) { setFitH(null); return undefined; }
    const measure = () => setFitH(Math.max(420, Math.round(window.innerHeight - wrapEl.getBoundingClientRect().top - 24)));
    measure();
    window.addEventListener('resize', measure);
    const t1 = setTimeout(measure, 450); // after the page's fade-in
    const t2 = setTimeout(measure, 1500); // after the offer banner (if any) loads
    return () => { window.removeEventListener('resize', measure); clearTimeout(t1); clearTimeout(t2); };
  }, [isLg, wrapEl]);
  const size = useElSize(wrapEl, { w: typeof window !== 'undefined' && window.innerWidth >= 1200 ? 1000 : 400, h: 700 });
  const board = useElSize(boardEl, { w: 400, h: 700 });
  const showPanel = size.w >= PANEL_MIN;
  const shortPanel = size.h < 760; // short window: drop the tier strip
  const q = useDebounced(search);
  const scroller = useRef(null);
  const sentinel = useRef(null);
  const reqId = useRef(0);
  const askedFor = useRef(0); // the page we already asked more for, so a burst of scroll events loads it once

  const hasMore = meta ? rows.length < meta.total : false;
  const firstLoad = loading && rows.length === 0;

  useEffect(() => { askedFor.current = 0; setPage(1); }, [q, friendsVersion]);

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
  }, [period, scope, track, q, page, friendsVersion, reloadKey]);

  // Endless list: load the next page when the bottom comes into view (or is scrolled near).
  const askMore = useCallback(() => {
    if (!hasMore || loading || askedFor.current === page) return;
    askedFor.current = page;
    setPage(page + 1);
  }, [hasMore, loading, page]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || loading) return undefined;
    const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) askMore(); }, { root: scroller.current, rootMargin: '160px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, rows.length, askMore]);

  // A tall window may show every loaded row without a scrollbar; keep loading until the list can scroll.
  useEffect(() => {
    const el = scroller.current;
    if (el && hasMore && !loading && el.scrollHeight <= el.clientHeight + 8) askMore();
  }, [hasMore, loading, rows.length, fitH, board.h, askMore]);

  const reset = useCallback(() => {
    setPage(1);
    setRows([]);
    setMeta((m) => (m ? { ...m, total: 0 } : m));
    setDetail(null);
    askedFor.current = 0;
    scroller.current?.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, [reduce]);

  const onTrack = (v) => { if (v !== track) { setTrack(v); reset(); } };
  const onPeriod = (v) => { if (v !== period) { setPeriod(v); reset(); } };
  const onScope = (v) => { if (v !== scope) { setScope(v); reset(); } };
  const reload = () => { askedFor.current = 0; setPage(1); setReloadKey((k) => k + 1); };
  const scrollToMe = () => document.getElementById('lb-me')?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  const showEveryone = () => { setScope('global'); reset(); };
  const me = isAuthenticated ? meta?.me : null;

  // The leader gets its own card (only a player who scored, and not while searching).
  const champion = !q && rows[0] && rows[0].score > 0 ? rows[0] : null;
  const listRows = rows.slice(champion ? 1 : 0);
  const meInList = Boolean(me && listRows.some((r) => r.userId === me.userId));
  const selectedRow = (selectedId && (rows.find((r) => r.userId === selectedId) || (me?.userId === selectedId ? me : null))) || me || champion || rows[0] || null;
  const points = meta?.points || PT;
  const stats = meta?.stats;

  // Wide: tap a player to show them in the side panel. Narrow: tap opens a small detail popover.
  const onPick = (e, row) => {
    if (showPanel) setSelectedId((cur) => (cur === row.userId ? null : row.userId));
    else setDetail({ el: e.currentTarget, row });
  };

  return (
    <Box ref={setWrapEl} sx={{ height: isLg ? (fitH ? `${fitH}px` : '100%') : 'calc(100dvh - 150px)', minHeight: isLg ? 0 : 420 }}>
      <Box sx={{ height: '100%', minHeight: 0, display: 'grid', gridTemplateRows: 'minmax(0, 1fr)', gridTemplateColumns: showPanel ? `minmax(0,1fr) ${PANEL_W}px` : 'minmax(0,1fr)', columnGap: `${GAP}px` }}>
        <Box ref={setBoardEl} sx={{ minWidth: 0, minHeight: 0, height: '100%' }}>
          <EmpireCard
            track={track} period={period} scope={scope} onTrack={onTrack} onPeriod={onPeriod} onScope={onScope}
            isAuthenticated={isAuthenticated} meta={meta} rows={rows} champion={champion} listRows={listRows}
            loading={loading} firstLoad={firstLoad} error={error} q={q} search={search} setSearch={setSearch}
            reload={reload} me={me} meInList={meInList} selectedId={selectedId} onPick={onPick}
            scroller={scroller} sentinel={sentinel} hasMore={hasMore} askMore={askMore} scrollToMe={scrollToMe}
            showEveryone={showEveryone} boardW={board.w} boardH={board.h}
          />
        </Box>

        {showPanel && (
          <LeaderboardPanel
            row={selectedRow} me={me} isAuthenticated={isAuthenticated} meta={meta} period={period} points={points}
            learners={stats?.learners || 0} topPercent={stats?.topPercent} loading={firstLoad} short={shortPanel}
          />
        )}
      </Box>

      <Popover
        anchorEl={detail?.el} open={Boolean(detail)} onClose={() => setDetail(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: { width: 380, maxWidth: 'calc(100vw - 24px)', borderRadius: '14px', overflow: 'hidden', mt: 0.5 } } }}
      >
        {detail && <RowDetail row={detail.row} />}
      </Popover>
    </Box>
  );
}
