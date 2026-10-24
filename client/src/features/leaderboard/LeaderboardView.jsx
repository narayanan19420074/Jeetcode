import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useReducedMotion } from 'framer-motion';
import { Box, Button, Popover, Skeleton, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { leaderboardApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import { DIFF_COLOR } from '../dashboard/dashboardUtils';
import { PLAN_AMBER, PLAN_THEMES } from '../studyplan/planUtils';
import { TIERS, tierFor } from './tiers';
import { APT_COLOR, AvatarRing, MEDAL, Mix, PT, YouChip, activeLabel, calm, mono, sweep } from './lbShared';
import { lbTokens } from './lbTheme';
import EmpireCard from './EmpireCard';

const LIMIT = 30;

// The layout is chosen from the width this view actually gets (not the window), because the
// dashboard sidebar eats a different amount at each breakpoint.
const PANEL_MIN = 900; // side panel (spotlight, next target, tiers) fits from here
const PANEL_W = 288;
const GAP = 16;

const GLASS = 'rgba(255,255,255,0.14)';
const SOFT = 'rgba(255,255,255,0.86)';
const SHADOW = '0 14px 28px -16px rgba(2,6,23,0.85)';
const AMBER_BAR = `linear-gradient(90deg, ${PLAN_AMBER}, #F59E0B)`;
const themeGrad = (name) => (PLAN_THEMES.find((t) => t.name === name) || PLAN_THEMES[0]).gradient;
const TOP_GRAD = {
  1: 'linear-gradient(135deg,#78350F 0%,#B45309 50%,#F59E0B 100%)',
  2: 'linear-gradient(135deg,#0F172A 0%,#334155 55%,#64748B 100%)',
  3: 'linear-gradient(135deg,#431407 0%,#9A3412 55%,#EA580C 100%)',
};
// The side-panel hero changes colour with the tier of the player it shows.
const TIER_GRAD = { bronze: TOP_GRAD[3], silver: TOP_GRAD[2], gold: TOP_GRAD[1], platinum: themeGrad('teal'), diamond: themeGrad('indigo'), legend: themeGrad('plum') };
const blobs = (
  <>
    <Box aria-hidden sx={{ position: 'absolute', right: -50, top: -50, width: 190, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.26), transparent 70%)', pointerEvents: 'none' }} />
    <Box aria-hidden sx={{ position: 'absolute', left: -40, bottom: -30, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)', pointerEvents: 'none' }} />
  </>
);
const clamp2 = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };

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

// ---------- side panel ----------

function Spotlight({ row, isMe, points, learners, topPercent, loading, mode }) {
  const T = lbTokens(useTheme().palette.mode);
  const small = mode === 'tiny';
  if (!row) {
    return (
      <Box sx={{ p: 2.5, flex: '1 1 auto', minHeight: 0, overflow: 'hidden', borderRadius: '20px', bgcolor: T.soft, boxShadow: T.pressed }}>
        {loading ? <Skeleton variant="rounded" height={160} /> : <Typography variant="body2" sx={{ color: T.muted }}>Pick a player to see how they are doing.</Typography>}
      </Box>
    );
  }
  const { tier, next, progress, toNext } = tierFor(row.score);
  const medal = MEDAL[row.rank];
  const st = activeLabel(row.lastActive);
  const stColor = st.live ? '#A7F3D0' : st.color === 'warning.main' ? '#FDE68A' : 'rgba(255,255,255,0.65)';
  const lines = [
    ['Easy', row.easy, points.easy, DIFF_COLOR.Easy],
    ['Medium', row.medium, points.medium, DIFF_COLOR.Medium],
    ['Hard', row.hard, points.hard, DIFF_COLOR.Hard],
    ['Aptitude', row.aptitude, points.aptitude, APT_COLOR],
  ];
  const label = { fontSize: 11, fontWeight: 700, color: SOFT };
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', flex: '1 1 auto', minHeight: 0, p: small ? 1.75 : 2.25, borderRadius: '20px', color: '#fff', background: TIER_GRAD[tier.key], boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), ${SHADOW}` }}>
      {blobs}
      <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AvatarRing src={row.avatarUrl} name={row.name} size={small ? 44 : 52} a={medal ? medal.a : PLAN_AMBER} b={medal ? medal.b : '#F59E0B'} ring={3} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 800, fontSize: 17, lineHeight: 1.25 }}>{row.name}{isMe && <YouChip />}</Typography>
            <Typography noWrap variant="body2" sx={{ color: SOFT }}>@{row.handle}{row.company && !small ? `, ${row.company}` : ''}</Typography>
          </Box>
          {isMe && topPercent && learners > 0 && (
            <Tooltip title={`Top ${topPercent}% of ${learners.toLocaleString()} ranked players`}>
              <Box sx={{ flexShrink: 0, px: 1, py: 0.35, borderRadius: 99, fontSize: 12, fontWeight: 800, color: '#FDE68A', bgcolor: 'rgba(251,191,36,0.18)', border: '1px solid rgba(251,191,36,0.5)' }}>Top {topPercent}%</Box>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 1 }}>
          {[['Rank', `#${row.rank}`], ['Points', row.score.toLocaleString()]].map(([l, val]) => (
            <Box key={l} sx={{ py: small ? 0.75 : 1, textAlign: 'center', borderRadius: '12px', bgcolor: GLASS, minWidth: 0 }}>
              <Typography sx={label}>{l}</Typography>
              <Typography noWrap sx={[{ fontWeight: 900, fontSize: small ? 17 : 20, lineHeight: 1.2 }, mono]}>{val}</Typography>
            </Box>
          ))}
          <Box sx={{ py: small ? 0.75 : 1, textAlign: 'center', borderRadius: '12px', bgcolor: GLASS, minWidth: 0 }}>
            <Typography sx={label}>Streak</Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <LocalFireDepartmentRoundedIcon sx={{ fontSize: small ? 18 : 20, color: PLAN_AMBER }} />
              <Typography sx={[{ fontWeight: 900, fontSize: small ? 17 : 20, lineHeight: 1.2 }, mono]}>{row.streak}</Typography>
            </Box>
          </Box>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6, gap: 1 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#FDE68A', fontWeight: 800, fontSize: 13 }}>
              <WorkspacePremiumRoundedIcon sx={{ fontSize: 18 }} />{tier.name}
            </Box>
            <Typography noWrap sx={{ fontSize: 12, fontWeight: 700, color: SOFT }}>{next ? `${toNext.toLocaleString()} pts to ${next.name}` : 'Top tier reached'}</Typography>
          </Box>
          <Box role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progress to next tier" sx={{ height: 9, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
            <Box sx={{ width: `${Math.max(progress, 4)}%`, height: '100%', borderRadius: 99, background: AMBER_BAR, transition: 'width .6s ease', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }} />
          </Box>
        </Box>

        {mode === 'full' && (
          <Box sx={{ display: 'grid', gap: 0.9 }}>
            {lines.map(([l, n, pts, color]) => (
              <Box key={l} sx={{ display: 'grid', gridTemplateColumns: '10px 1fr auto 64px', alignItems: 'center', columnGap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{l}</Typography>
                <Typography sx={[{ fontWeight: 800, fontSize: 14 }, mono]}>{n}</Typography>
                <Typography variant="caption" sx={[{ textAlign: 'right', color: SOFT }, mono]}>{(n * pts).toLocaleString()} pts</Typography>
              </Box>
            ))}
          </Box>
        )}
        {mode === 'medium' && (
          <Box>
            <Mix row={row} onDark />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.9 }}>
              {lines.map(([l, n, , color]) => (
                <Tooltip key={l} title={l}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                    <Typography sx={[{ fontWeight: 800, fontSize: 13 }, mono]}>{n}</Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </Box>
        )}
        {mode === 'full' && (
          <Box sx={{ pt: 1.25, borderTop: '1px solid rgba(255,255,255,0.18)', display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Typography noWrap variant="caption" sx={{ fontWeight: 700, color: SOFT }}>{row.recent} solved in 7 days</Typography>
            <Typography noWrap variant="caption" sx={{ fontWeight: 800, color: stColor }}>{st.text}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// "12 pts to catch Asha": only for the logged-in player.
function NextTarget({ me, neighbors, points, mode }) {
  const { above, below } = neighbors;
  const solves = above ? Math.ceil(above.gap / points.medium) : 0;
  const head = above ? `${above.gap.toLocaleString()} pts to catch ${above.name}` : me.rank === 1 ? 'You lead this board' : 'Keep solving';
  const sub = above ? `They are #${above.rank}. About ${solves} Medium ${solves === 1 ? 'question' : 'questions'}.` : 'Solve more to stay ahead.';
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1.5, p: mode === 'tiny' ? 1.5 : 2, borderRadius: '20px', color: '#fff', background: themeGrad('ocean'), boxShadow: SHADOW }}>
      {blobs}
      <Box sx={{ position: 'relative', width: 40, height: 40, flexShrink: 0, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: GLASS }}>
        {above ? <TrendingUpRoundedIcon /> : <EmojiEventsRoundedIcon sx={{ color: PLAN_AMBER }} />}
      </Box>
      <Box sx={{ position: 'relative', minWidth: 0, flex: 1 }}>
        <Typography noWrap title={head} sx={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.3 }}>{head}</Typography>
        {mode !== 'tiny' && <Typography noWrap title={sub} sx={{ fontSize: '0.78rem', color: SOFT }}>{sub}</Typography>}
        {mode === 'full' && below && (
          <Typography noWrap sx={{ fontSize: '0.78rem', color: SOFT }}>{below.gap.toLocaleString()} pts ahead of {below.name}</Typography>
        )}
      </Box>
    </Box>
  );
}

function NoteCard({ grad, Icon, title, text, action, mode }) {
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', flexShrink: 0, p: mode === 'tiny' ? 1.5 : 2, borderRadius: '20px', color: '#fff', background: grad, boxShadow: SHADOW }}>
      {blobs}
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, flexShrink: 0, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: GLASS }}><Icon /></Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{title}</Typography>
          {mode !== 'tiny' && <Typography sx={[{ fontSize: '0.78rem', color: SOFT }, clamp2]}>{text}</Typography>}
        </Box>
      </Box>
      {action && <Box sx={{ position: 'relative', mt: 1.25 }}>{action}</Box>}
    </Box>
  );
}

// Six tier icons in a row, the current one lit. Hover for the points needed.
function TiersCard({ currentKey, points, mode }) {
  const T = lbTokens(useTheme().palette.mode);
  return (
    <Box sx={{ p: 1.5, flexShrink: 0, borderRadius: '20px', bgcolor: T.soft, boxShadow: T.raised }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {TIERS.map((t) => {
          const on = t.key === currentKey;
          return (
            <Tooltip key={t.key} title={`${t.name}, ${t.min.toLocaleString()}+ pts`}>
              <Box
                role="img" aria-label={`${t.name} tier, ${t.min} points`} tabIndex={0}
                sx={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', color: on ? '#fff' : t.color, background: on ? `linear-gradient(135deg, ${t.color}, color-mix(in srgb, ${t.color} 55%, #000))` : `color-mix(in srgb, ${t.color} 14%, transparent)`, boxShadow: on ? `0 6px 14px -4px ${t.color}` : 'none' }}
              >
                <WorkspacePremiumRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
            </Tooltip>
          );
        })}
      </Box>
      {mode === 'full' && (
        <Typography variant="caption" noWrap sx={{ display: 'block', mt: 1, textAlign: 'center', color: T.muted }}>
          Easy {points.easy}, Medium {points.medium}, Hard {points.hard}, Aptitude {points.aptitude} pts each
        </Typography>
      )}
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
  const panelMode = size.h >= 780 ? 'full' : size.h >= 600 ? 'medium' : 'tiny';
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
  const selectedTier = selectedRow ? tierFor(selectedRow.score).tier.key : null;
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
          <Box sx={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {!isAuthenticated && (
              <NoteCard
                mode={panelMode} grad={themeGrad('ocean')} Icon={EmojiEventsRoundedIcon} title="See where you stand" text="Log in to get your rank and follow friends."
                action={<Button component={RouterLink} to="/login" fullWidth startIcon={<BoltRoundedIcon />} disableElevation sx={{ height: 40, borderRadius: '14px', bgcolor: PLAN_AMBER, color: '#1B1200', fontWeight: 800, '&:hover': { bgcolor: '#F5B50F' } }}>Log in</Button>}
              />
            )}
            <Spotlight
              mode={panelMode} row={selectedRow} isMe={Boolean(me && selectedRow && selectedRow.userId === me.userId)} points={points}
              learners={stats?.learners || 0} topPercent={stats?.topPercent} loading={firstLoad}
            />
            {me && meta?.neighbors
              ? <NextTarget me={me} neighbors={meta.neighbors} points={points} mode={panelMode} />
              : isAuthenticated && meta && !meta.me && !loading && (
                <NoteCard mode={panelMode} grad={themeGrad('ember')} Icon={BoltRoundedIcon} title="Not ranked yet" text={`Solve a question${period === 'all' ? '' : ' in this period'} to enter the leaderboard.`} />
              )}
            {panelMode !== 'tiny' && <TiersCard currentKey={selectedTier} points={points} mode={panelMode} />}
          </Box>
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
