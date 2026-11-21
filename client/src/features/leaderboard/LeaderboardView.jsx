import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useReducedMotion } from 'framer-motion';
import { Box, Popover, useMediaQuery, useTheme } from '@mui/material';
import { leaderboardApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import { PT } from './lbShared';
import LeaderboardBoard from './desktop/LeaderboardBoard';
import LeaderboardSidePanel from './desktop/LeaderboardSidePanel';
import RowDetail from './desktop/RowDetail';
import MobileLeaderboard from './MobileLeaderboard';
import { RADII_PX } from '../../app/design/designTokens';

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
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  // Phones get their own full-screen layout (MobileLeaderboard); the page scrolls instead of an inner list.
  const isPhone = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
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
    const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) askMore(); }, { root: isPhone ? null : scroller.current, rootMargin: isPhone ? '0px 0px 400px 0px' : '160px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, rows.length, askMore, isPhone]);

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

  if (isPhone) {
    return (
      <MobileLeaderboard
        isAuthenticated={isAuthenticated} track={track} period={period} scope={scope} onTrack={onTrack} onPeriod={onPeriod} onScope={onScope}
        search={search} setSearch={setSearch} q={q} rows={rows} meta={meta} me={me} loading={loading} firstLoad={firstLoad} error={error}
        reload={reload} hasMore={hasMore} sentinel={sentinel} scrollToMe={scrollToMe} showEveryone={showEveryone}
      />
    );
  }

  return (
    <Box ref={setWrapEl} sx={{ height: isLg ? (fitH ? `${fitH}px` : '100%') : 'calc(100dvh - 150px)', minHeight: isLg ? 0 : 420 }}>
      <Box sx={{ height: '100%', minHeight: 0, display: 'grid', gridTemplateRows: 'minmax(0, 1fr)', gridTemplateColumns: showPanel ? `minmax(0,1fr) ${PANEL_W}px` : 'minmax(0,1fr)', columnGap: `${GAP}px` }}>
        <Box ref={setBoardEl} sx={{ minWidth: 0, minHeight: 0, height: '100%' }}>
          <LeaderboardBoard
            track={track} period={period} scope={scope} onTrack={onTrack} onPeriod={onPeriod} onScope={onScope}
            isAuthenticated={isAuthenticated} meta={meta} rows={rows} champion={champion} listRows={listRows}
            loading={loading} firstLoad={firstLoad} error={error} q={q} search={search} setSearch={setSearch}
            reload={reload} me={me} meInList={meInList} selectedId={selectedId} onPick={onPick}
            scroller={scroller} sentinel={sentinel} hasMore={hasMore} askMore={askMore} scrollToMe={scrollToMe}
            showEveryone={showEveryone} boardW={board.w} boardH={board.h}
          />
        </Box>

        {showPanel && (
          <LeaderboardSidePanel
            row={selectedRow} me={me} isAuthenticated={isAuthenticated} meta={meta} period={period} track={track} onTrack={onTrack} points={points}
            learners={stats?.learners || 0} topPercent={stats?.topPercent} loading={firstLoad} short={shortPanel}
          />
        )}
      </Box>

      <Popover
        anchorEl={detail?.el} open={Boolean(detail)} onClose={() => setDetail(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: { width: 380, maxWidth: 'calc(100vw - 24px)', borderRadius: RADII_PX.card, overflow: 'hidden', mt: 0.5 } } }}
      >
        {detail && <RowDetail row={detail.row} />}
      </Popover>
    </Box>
  );
}
