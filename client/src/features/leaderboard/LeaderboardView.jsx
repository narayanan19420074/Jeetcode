import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { animate, motion, useReducedMotion } from 'framer-motion';
import {
  Alert, Avatar, Badge, Box, Button, ButtonBase, Collapse, IconButton, InputAdornment, Popover, Skeleton, Stack, Tab, Tabs, TextField,
  ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import { leaderboardApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import { DIFF_COLOR, surface } from '../dashboard/dashboardUtils';
import { TIERS, tierFor } from './tiers';

const LIMIT = 30;
const MEDAL = {
  1: { a: '#FDE68A', b: '#F59E0B', text: '#451A03', glow: 'rgba(245,158,11,0.55)' },
  2: { a: '#F1F5F9', b: '#94A3B8', text: '#0F172A', glow: 'rgba(148,163,184,0.5)' },
  3: { a: '#FDBA74', b: '#C2410C', text: '#431407', glow: 'rgba(194,65,12,0.5)' },
};
const grad = (m) => `linear-gradient(135deg, ${m.a}, ${m.b})`;
const AMBER = '#FBBF24';
const APT_COLOR = '#8B5CF6';
const PERIODS = [['all', 'All time'], ['week', 'This week'], ['month', 'This month']];
const TRACKS = [['overall', 'Overall', StarsRoundedIcon], ['coding', 'Coding', CodeRoundedIcon], ['aptitude', 'Aptitude', PsychologyRoundedIcon]];
const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };
const SCROLL = { scrollbarWidth: 'thin', scrollbarGutter: 'stable' };
const PT = { easy: 10, medium: 20, hard: 40, aptitude: 5 };

// Desktop layout is chosen from the width this view actually gets (not the window), because the
// dashboard sidebar eats a different amount at each breakpoint.
const DESKTOP_MIN = 760; // below this: the compact phone layout
const PANEL_MIN = 1000; // side panel (spotlight, next target, tiers) fits from here
const PANEL_W = 300;
const GAP = 16;
const RICH = '72px minmax(0,1fr) 62px 46px 46px 46px 46px 56px 84px';
const COMPACT = '72px minmax(0,1fr) 62px 56px 56px 84px';

// ---- motion (all CSS, switched off for people who asked for less motion) ----
const floatA = keyframes`0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(22px,12px) scale(1.14)}`;
const floatB = keyframes`0%,100%{transform:translate(0,0)}50%{transform:translate(-18px,14px)}`;
const sweep = keyframes`0%{transform:translateX(-160%) skewX(-20deg)}60%,100%{transform:translateX(380%) skewX(-20deg)}`;
const flicker = keyframes`0%,100%{transform:scale(1) rotate(-3deg)}50%{transform:scale(1.2) rotate(4deg)}`;
const bob = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}`;
const pulse = keyframes`0%{box-shadow:0 0 0 0 rgba(251,191,36,0.55)}100%{box-shadow:0 0 0 12px rgba(251,191,36,0)}`;
const twinkle = keyframes`0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:1;transform:scale(1.15)}`;
const glow = keyframes`0%,100%{opacity:.45}50%{opacity:1}`;
const calm = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } };

// Counts up to the score the first time it shows.
function CountUp({ value }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) { setN(value); return undefined; }
    const c = animate(0, value, { duration: 1.1, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [value, reduce]);
  return n.toLocaleString();
}

function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

function useWidth(ref, initial) {
  const [w, setW] = useState(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setW(Math.round(el.getBoundingClientRect().width));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

function timeAgo(iso) {
  if (!iso) return '';
  const s = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

const utcDay = (d = new Date()) => d.toISOString().slice(0, 10);
function activeLabel(lastActive) {
  if (!lastActive) return { text: 'Not started', color: 'text.disabled', live: false };
  const days = Math.round((Date.parse(utcDay()) - Date.parse(lastActive)) / 86400000);
  if (days <= 0) return { text: 'Active today', color: 'success.main', live: true };
  if (days === 1) return { text: 'Active yesterday', color: 'warning.main', live: false };
  return { text: `${days}d ago`, color: 'text.disabled', live: false };
}

function Streak({ value, still = false }) {
  const on = value > 0;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.15 }}>
      <LocalFireDepartmentRoundedIcon
        sx={{ fontSize: 16, color: on ? '#F97316' : 'text.disabled', ...(on && { filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.7))', ...(!still && { animation: `${flicker} 1.4s ease-in-out infinite`, ...calm }) }) }}
      />
      <Typography variant="caption" sx={[{ fontWeight: 800, color: on ? 'text.primary' : 'text.disabled' }, mono]}>{value}d</Typography>
    </Box>
  );
}

function TierChip({ tier }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, px: 0.7, py: 0.05, borderRadius: 99, bgcolor: `color-mix(in srgb, ${tier.color} 16%, transparent)`, color: tier.color, fontSize: 11, fontWeight: 800, lineHeight: 1.6, flexShrink: 0, whiteSpace: 'nowrap' }}>
      <WorkspacePremiumRoundedIcon sx={{ fontSize: 13 }} />{tier.name}
    </Box>
  );
}

// Profile picture with a glowing gradient ring.
function AvatarRing({ src, name, size = 34, a, b, ring = 2.5, inner = 'background.paper' }) {
  return (
    <Box sx={{ p: `${ring}px`, borderRadius: '50%', background: `linear-gradient(135deg, ${a}, ${b})`, display: 'inline-flex', flexShrink: 0 }}>
      <Avatar src={src || undefined} sx={{ width: size, height: size, fontSize: size * 0.4, fontWeight: 700, border: '2px solid', borderColor: inner }}>{name?.[0]?.toUpperCase()}</Avatar>
    </Box>
  );
}

function RankBadge({ rank }) {
  const m = MEDAL[rank];
  if (!m) {
    return <Typography sx={(t) => ({ width: 30, height: 30, borderRadius: '10px', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, color: 'text.secondary', bgcolor: alpha(t.palette.text.primary, 0.06), ...mono })}>{rank}</Typography>;
  }
  return (
    <Box sx={{ width: 32, height: 32, borderRadius: '11px', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 15, color: m.text, background: grad(m), boxShadow: `0 4px 14px -2px ${m.glow}`, ...mono }}>{rank}</Box>
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
    <Box sx={(t) => ({ px: { xs: 1.25, sm: 2 }, py: 1.5, bgcolor: alpha(t.palette.text.primary, 0.035), display: 'grid', gap: 1.5 })}>
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

function Row({ row, index = 0, isMe, expanded, onToggle, pinned }) {
  const reduce = useReducedMotion();
  const medal = MEDAL[row.rank];
  const { tier } = tierFor(row.score);
  const live = activeLabel(row.lastActive).live;
  const ringA = medal ? medal.a : tier.color;
  const ringB = medal ? medal.b : `color-mix(in srgb, ${tier.color} 40%, #fff)`;

  return (
    <motion.div
      id={isMe && !pinned ? 'lb-me' : undefined}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: reduce ? 0 : Math.min(index, 10) * 0.035, ease: 'easeOut' }}
    >
      <Box
        sx={(t) => {
          const paper = t.palette.background.paper;
          return {
            mx: pinned ? 0 : 1, mb: pinned ? 0 : 0.85, borderRadius: '16px', overflow: 'hidden', position: 'relative',
            border: '1.5px solid transparent',
            background: isMe
              ? `linear-gradient(${paper}, ${paper}) padding-box, linear-gradient(135deg, ${t.palette.primary.main}, ${AMBER}) border-box`
              : `linear-gradient(${paper}, ${paper}) padding-box, linear-gradient(${t.palette.divider}, ${t.palette.divider}) border-box`,
            boxShadow: medal ? `0 10px 24px -14px ${medal.glow}` : isMe ? `0 10px 24px -14px ${alpha(t.palette.primary.main, 0.6)}` : 'none',
            '&::before': medal ? { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: grad(medal) } : undefined,
            '&::after': isMe ? { content: '""', position: 'absolute', inset: 0, background: `linear-gradient(100deg, ${alpha(t.palette.primary.main, 0.12)}, transparent 70%)`, pointerEvents: 'none', animation: `${glow} 2.8s ease-in-out infinite`, ...calm } : undefined,
          };
        }}
      >
        <ButtonBase
          onClick={onToggle}
          aria-expanded={expanded}
          sx={(t) => ({
            position: 'relative', zIndex: 1, width: '100%', display: 'grid', gridTemplateColumns: '34px minmax(0,1fr) auto 20px', gap: { xs: 1, sm: 1.5 }, alignItems: 'center', textAlign: 'left',
            px: { xs: 1.25, sm: 2 }, py: 1.1, fontFamily: 'inherit', transition: 'background-color .15s', '&:hover': { bgcolor: t.palette.action.hover },
          })}
        >
          <RankBadge rank={row.rank} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <Badge variant="dot" overlap="circular" invisible={!live} color="success" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
              <AvatarRing src={row.avatarUrl} name={row.name} size={38} a={ringA} b={ringB} />
            </Badge>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 800, lineHeight: 1.25 }}>{row.name}{isMe ? ' (you)' : ''}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, mt: 0.2 }}>
                <TierChip tier={tier} />
                <Streak value={row.streak} />
              </Box>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={[{ fontWeight: 900, fontSize: 18, lineHeight: 1.1, ...(medal && { background: grad(medal), WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }) }, mono]}>
              {pinned ? <CountUp value={row.score} /> : row.score.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: 10.5, letterSpacing: 0.4 }}>PTS</Typography>
          </Box>
          <ExpandMoreRoundedIcon sx={{ fontSize: 20, color: 'text.disabled', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        </ButtonBase>
        <Collapse in={expanded} timeout={220} unmountOnExit><RowDetail row={row} /></Collapse>
      </Box>
    </motion.div>
  );
}

// Top 3 on a stage. Tapping a player opens the same detail as a list row.
const SPARKS = [[8, 18, 0], [20, 60, 0.6], [34, 12, 1.2], [66, 16, 0.3], [80, 55, 0.9], [92, 22, 1.5], [50, 8, 0.45]];
const POD = [
  { ...MEDAL[1], h: 96, av: 66 },
  { ...MEDAL[2], h: 70, av: 54 },
  { ...MEDAL[3], h: 54, av: 54 },
];

function Podium({ rows, meId, openId, onPick }) {
  const reduce = useReducedMotion();
  const order = [1, 0, 2].filter((i) => rows[i]); // 2nd | 1st | 3rd
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', mx: 1, mt: 1, mb: 1, px: { xs: 1.25, sm: 3 }, pt: 2, borderRadius: '18px', color: '#fff', background: 'linear-gradient(160deg,#1E1B4B 0%,#312E81 55%,#5B21B6 100%)', boxShadow: '0 14px 28px -16px rgba(2,6,23,0.85), inset 0 1px 0 rgba(255,255,255,0.18)' }}>
      <Box aria-hidden sx={{ position: 'absolute', left: '50%', top: 10, width: 220, height: 220, ml: '-110px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.34), transparent 68%)', animation: `${glow} 3s ease-in-out infinite`, ...calm }} />
      {SPARKS.map(([x, y, d], i) => (
        <Box key={i} aria-hidden sx={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 4, height: 4, borderRadius: '50%', bgcolor: '#fff', animation: `${twinkle} 2.4s ease-in-out ${d}s infinite`, ...calm }} />
      ))}
      <Box sx={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${order.length}, minmax(0, 1fr))`, gap: 1, alignItems: 'end', maxWidth: 460, mx: 'auto' }}>
        {order.map((i) => {
          const r = rows[i];
          const p = POD[i];
          return (
            <motion.div
              key={r.userId}
              initial={reduce ? false : { opacity: 0, y: 56 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 130, damping: 15, delay: reduce ? 0 : (2 - i) * 0.12 }}
              style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
            >
              <ButtonBase
                onClick={() => onPick(r.userId)} aria-expanded={openId === r.userId} aria-label={`${r.name}, rank ${r.rank}, ${r.score} points`}
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', pb: 0.9, fontFamily: 'inherit', color: 'inherit', borderRadius: '12px' }}
              >
                {i === 0 ? (
                  <EmojiEventsRoundedIcon sx={{ fontSize: 32, color: '#FDE68A', filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.85))', animation: `${bob} 2.2s ease-in-out infinite`, ...calm }} />
                ) : <Box sx={{ height: 8 }} />}
                <Box sx={{ borderRadius: '50%', animation: i === 0 ? `${pulse} 2s ease-out infinite` : 'none', ...calm }}>
                  <AvatarRing src={r.avatarUrl} name={r.name} size={p.av} a={p.a} b={p.b} ring={3.5} inner="#1E1B4B" />
                </Box>
                <Typography noWrap sx={{ maxWidth: '100%', fontWeight: 800, fontSize: 13, mt: 0.8 }}>{r.name}</Typography>
                <Typography sx={[{ fontWeight: 900, fontSize: 15, color: '#FDE68A' }, mono]}><CountUp value={r.score} /><Box component="span" sx={{ fontSize: 10, ml: 0.3, opacity: 0.85 }}>pts</Box></Typography>
                {r.userId === meId && <Box sx={{ mt: 0.3, px: 0.9, py: 0.05, borderRadius: 99, bgcolor: AMBER, color: '#1B1200', fontSize: 10, fontWeight: 900 }}>YOU</Box>}
              </ButtonBase>
              <Box sx={{ position: 'relative', overflow: 'hidden', height: p.h, display: 'grid', placeItems: 'center', borderRadius: '12px 12px 0 0', background: grad(p), boxShadow: `0 -6px 26px -8px ${p.glow}`, '&::after': i === 0 ? { content: '""', position: 'absolute', top: 0, bottom: 0, width: '35%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', animation: `${sweep} 3.4s ease-in-out infinite`, ...calm } : undefined }}>
                <Typography sx={[{ fontWeight: 900, fontSize: p.h * 0.45, lineHeight: 1, color: p.text, opacity: 0.85 }, mono]}>{r.rank}</Typography>
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </Box>
  );
}

function SkeletonRows({ count = 8 }) {
  return Array.from({ length: count }, (_, i) => (
    <Box key={i} sx={(t) => ({ display: 'flex', alignItems: 'center', gap: 1.25, mx: 1, mb: 0.85, px: 1.25, py: 1.1, borderRadius: '16px', border: `1px solid ${t.palette.divider}` })}>
      <Skeleton variant="rounded" width={30} height={30} sx={{ borderRadius: '10px' }} />
      <Skeleton variant="circular" width={38} height={38} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width={`${50 + ((i * 17) % 35)}%`} />
        <Skeleton variant="text" width={70} />
      </Box>
      <Skeleton variant="text" width={40} />
    </Box>
  ));
}

// Friends: one small card, opens to show how each friend is doing right now.
function FriendsCard({ enabled, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
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
    <Box sx={[surface, { overflow: 'hidden', flexShrink: 0, borderRadius: '16px' }]}>
      <ButtonBase onClick={() => setOpen((o) => !o)} aria-expanded={open} sx={{ width: '100%', justifyContent: 'flex-start', gap: 1.25, px: 1.25, py: 1, fontFamily: 'inherit', textAlign: 'left' }}>
        <Box sx={{ width: 34, height: 34, borderRadius: '11px', display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(135deg,#0F766E,#10B981)', boxShadow: '0 6px 14px -6px rgba(16,185,129,0.8)' }}>
          <GroupsRoundedIcon sx={{ fontSize: 20 }} />
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 800, flex: 1 }}>Friends</Typography>
        {rows && <Typography variant="caption" sx={{ fontWeight: 800, px: 1, py: 0.1, borderRadius: 99, color: '#10B981', bgcolor: alpha('#10B981', 0.14), ...mono }}>{rows.length}</Typography>}
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

// ======================= Desktop layout =======================

// Rank change vs last week (all-time, everyone board only — the server sends null otherwise).
function Move({ row }) {
  if (row.isNew) {
    return <Box component="span" sx={(t) => ({ px: 0.7, borderRadius: 99, fontSize: 10.5, fontWeight: 800, color: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.14) })}>new</Box>;
  }
  const m = row.movement;
  if (m === null || m === undefined) return null;
  if (m === 0) return <Box component="span" aria-label="No change since last week" sx={{ color: 'text.disabled', fontSize: 12, width: 20, textAlign: 'center' }}>–</Box>;
  const up = m > 0;
  const Icon = up ? ArrowDropUpRoundedIcon : ArrowDropDownRoundedIcon;
  return (
    <Box component="span" aria-label={`${up ? 'Up' : 'Down'} ${Math.abs(m)} since last week`} sx={[{ display: 'inline-flex', alignItems: 'center', color: up ? 'success.main' : 'error.main', fontSize: 12, fontWeight: 800 }, mono]}>
      <Icon sx={{ fontSize: 22, mx: -0.5 }} />{Math.abs(m)}
    </Box>
  );
}

// How a player's points split across Easy / Medium / Hard / Aptitude.
function Mix({ row, sx }) {
  const parts = [
    [row.easy * PT.easy, DIFF_COLOR.Easy],
    [row.medium * PT.medium, DIFF_COLOR.Medium],
    [row.hard * PT.hard, DIFF_COLOR.Hard],
    [row.aptitude * PT.aptitude, APT_COLOR],
  ].filter(([v]) => v > 0);
  return (
    <Box aria-hidden sx={[{ display: 'flex', gap: '2px', height: 5, borderRadius: 99, overflow: 'hidden', bgcolor: 'divider' }, sx]}>
      {parts.map(([v, c], i) => <Box key={i} sx={{ flex: v, bgcolor: c }} />)}
    </Box>
  );
}

function YouChip() {
  return <Box component="span" sx={(t) => ({ ml: 0.75, px: 0.75, borderRadius: 99, fontSize: 10.5, fontWeight: 800, color: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.14), verticalAlign: 'middle' })}>You</Box>;
}

// One of the three leaders at the top of the board.
function TopCard({ row, isMe, selected, onPick }) {
  const m = MEDAL[row.rank] || MEDAL[3];
  const { tier } = tierFor(row.score);
  return (
    <ButtonBase
      onClick={() => onPick(row.userId)} aria-label={`${row.name}, rank ${row.rank}, ${row.score} points`}
      sx={(t) => ({
        display: 'flex', flexDirection: 'column', alignItems: 'stretch', textAlign: 'left', minWidth: 0, p: 1.75, borderRadius: '14px', fontFamily: 'inherit',
        border: '1px solid', borderColor: selected ? t.palette.primary.main : `color-mix(in srgb, ${m.b} 45%, ${t.palette.divider})`,
        background: `linear-gradient(160deg, color-mix(in srgb, ${m.b} 14%, transparent), transparent 72%)`,
        transition: 'border-color .15s, transform .15s', '&:hover': { borderColor: selected ? t.palette.primary.main : m.b }, '&:active': { transform: 'scale(0.99)' },
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AvatarRing src={row.avatarUrl} name={row.name} size={46} a={m.a} b={m.b} ring={3} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 800, fontSize: 15, lineHeight: 1.25 }}>{row.name}{isMe && <YouChip />}</Typography>
          <Typography noWrap variant="caption" color="text.secondary" sx={{ display: 'block' }}>@{row.handle}</Typography>
        </Box>
        <RankBadge rank={row.rank} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
        <Typography sx={[{ fontWeight: 900, fontSize: 24, lineHeight: 1.1 }, mono]}>
          {row.score.toLocaleString()}<Box component="span" sx={{ fontSize: 11, ml: 0.5, color: 'text.secondary', fontWeight: 700 }}>pts</Box>
        </Typography>
        <TierChip tier={tier} />
      </Box>
      <Mix row={row} sx={{ mt: 1.25 }} />
    </ButtonBase>
  );
}

function DeskRow({ row, tpl, rich, isMe, selected, onSelect, pinned = false }) {
  const { tier } = tierFor(row.score);
  const live = activeLabel(row.lastActive).live;
  const num = (n, color) => (
    <Typography component="div" sx={[{ textAlign: 'right', fontSize: 13, fontWeight: n > 0 ? 700 : 500, color: n > 0 ? color : 'text.disabled' }, mono]}>{n}</Typography>
  );
  return (
    <Box
      id={isMe && !pinned ? 'lb-me' : undefined}
      sx={(t) => ({
        position: 'relative',
        borderBottom: pinned ? 'none' : `1px solid ${t.palette.divider}`,
        bgcolor: selected ? alpha(t.palette.primary.main, 0.1) : isMe ? alpha(t.palette.primary.main, 0.06) : 'transparent',
        '&::before': selected || isMe ? { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, bgcolor: 'primary.main' } : undefined,
      })}
    >
      <ButtonBase
        onClick={onSelect} aria-current={selected ? 'true' : undefined}
        sx={(t) => ({ width: '100%', display: 'grid', gridTemplateColumns: tpl, columnGap: 1, alignItems: 'center', textAlign: 'left', px: 2.5, py: 1, minHeight: 58, fontFamily: 'inherit', transition: 'background-color .15s', '&:hover': { bgcolor: t.palette.action.hover } })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <RankBadge rank={row.rank} />
          <Move row={row} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          <Badge variant="dot" overlap="circular" invisible={!live} color="success" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Avatar src={row.avatarUrl || undefined} sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>{row.name?.[0]?.toUpperCase()}</Avatar>
          </Badge>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{row.name}{isMe && <YouChip />}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
              <TierChip tier={tier} />
              <Typography variant="caption" color="text.secondary" noWrap>@{row.handle}</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}><Streak value={row.streak} still /></Box>

        {rich ? (
          <>
            {num(row.easy, DIFF_COLOR.Easy)}
            {num(row.medium, DIFF_COLOR.Medium)}
            {num(row.hard, DIFF_COLOR.Hard)}
            {num(row.aptitude, APT_COLOR)}
          </>
        ) : num(row.solved, 'text.primary')}

        <Typography component="div" sx={[{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: row.recent > 0 ? 'success.main' : 'text.disabled' }, mono]}>
          {row.recent > 0 ? `+${row.recent}` : '–'}
        </Typography>
        <Typography component="div" sx={[{ textAlign: 'right', fontWeight: 900, fontSize: 16 }, mono]}>{row.score.toLocaleString()}</Typography>
      </ButtonBase>
    </Box>
  );
}

function DeskSkeleton({ count = 9 }) {
  return Array.from({ length: count }, (_, i) => (
    <Box key={i} sx={(t) => ({ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.25, borderBottom: `1px solid ${t.palette.divider}` })}>
      <Skeleton variant="rounded" width={30} height={30} sx={{ borderRadius: '10px' }} />
      <Skeleton variant="circular" width={36} height={36} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width={`${30 + ((i * 13) % 30)}%`} />
        <Skeleton variant="text" width={110} />
      </Box>
      <Skeleton variant="text" width={160} />
      <Skeleton variant="text" width={56} />
    </Box>
  ));
}

const card = [surface, { p: 2.5, flexShrink: 0 }];
const cardTitle = { fontWeight: 800, fontSize: 15 };

// Side panel: the selected player (you by default) in detail.
function Spotlight({ row, isMe, points, learners, topPercent, loading }) {
  if (!row) {
    return (
      <Box sx={card}>
        {loading ? <Skeleton variant="rounded" height={280} /> : <Typography variant="body2" color="text.secondary">Pick a player to see how they are doing.</Typography>}
      </Box>
    );
  }
  const { tier, next, progress, toNext } = tierFor(row.score);
  const medal = MEDAL[row.rank];
  const st = activeLabel(row.lastActive);
  const lines = [
    ['Easy', row.easy, points.easy, DIFF_COLOR.Easy],
    ['Medium', row.medium, points.medium, DIFF_COLOR.Medium],
    ['Hard', row.hard, points.hard, DIFF_COLOR.Hard],
    ['Aptitude', row.aptitude, points.aptitude, APT_COLOR],
  ];
  return (
    <Box sx={card}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
        <AvatarRing src={row.avatarUrl} name={row.name} size={56} a={medal ? medal.a : tier.color} b={medal ? medal.b : `color-mix(in srgb, ${tier.color} 40%, #fff)`} ring={3} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 800, fontSize: 17, lineHeight: 1.25 }}>{row.name}{isMe && <YouChip />}</Typography>
          <Typography noWrap variant="body2" color="text.secondary">@{row.handle}</Typography>
          {row.company && <Typography noWrap variant="caption" color="text.secondary">{row.company}</Typography>}
        </Box>
      </Box>

      <Box sx={(t) => ({ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', mt: 2, py: 1.25, borderTop: `1px solid ${t.palette.divider}`, borderBottom: `1px solid ${t.palette.divider}` })}>
        {[['Rank', `#${row.rank}`], ['Points', row.score.toLocaleString()]].map(([label, value]) => (
          <Box key={label}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
            <Typography sx={[{ fontWeight: 900, fontSize: 20, lineHeight: 1.2 }, mono]}>{value}</Typography>
          </Box>
        ))}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Streak</Typography>
          <Box sx={{ lineHeight: 1.2, mt: 0.2 }}><Streak value={row.streak} still /></Box>
        </Box>
      </Box>
      {isMe && topPercent && learners > 0 && (
        <Typography variant="body2" sx={{ mt: 1.25, fontWeight: 600 }}>Top {topPercent}% of {learners.toLocaleString()} ranked players</Typography>
      )}

      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: tier.color, fontWeight: 800, fontSize: 13 }}>
            <WorkspacePremiumRoundedIcon sx={{ fontSize: 18 }} />{tier.name}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {next ? `${toNext.toLocaleString()} pts to ${next.name}` : 'Top tier reached'}
          </Typography>
        </Box>
        <Box sx={{ height: 8, borderRadius: 99, bgcolor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${Math.max(progress, 3)}%`, borderRadius: 99, bgcolor: tier.color, transition: 'width .5s ease', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }} />
        </Box>
      </Box>

      <Box sx={{ mt: 2, display: 'grid', gap: 1 }}>
        {lines.map(([label, n, pts, color]) => (
          <Box key={label} sx={{ display: 'grid', gridTemplateColumns: '10px 1fr auto 62px', alignItems: 'center', columnGap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
            <Typography sx={[{ fontWeight: 800, fontSize: 14 }, mono]}>{n}</Typography>
            <Typography variant="caption" color="text.secondary" sx={[{ textAlign: 'right' }, mono]}>{(n * pts).toLocaleString()} pts</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={(t) => ({ mt: 2, pt: 1.5, borderTop: `1px solid ${t.palette.divider}`, display: 'flex', justifyContent: 'space-between', gap: 1 })}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{row.recent} solved in the last 7 days</Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color: st.color }}>{st.text}</Typography>
      </Box>
    </Box>
  );
}

// "12 pts to catch Asha" — only for the logged-in player.
function NextTarget({ me, neighbors, points }) {
  const { above, below } = neighbors;
  const solves = above ? Math.ceil(above.gap / points.medium) : 0;
  return (
    <Box sx={card}>
      <Typography sx={cardTitle}>Next target</Typography>
      {above ? (
        <Box sx={{ mt: 1 }}>
          <Typography sx={{ fontWeight: 700 }}>
            <Box component="span" sx={mono}>{above.gap.toLocaleString()} pts</Box> to catch {above.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            They are #{above.rank}. That is about {solves} Medium {solves === 1 ? 'question' : 'questions'}.
          </Typography>
        </Box>
      ) : me.rank === 1 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>You lead this board. Keep solving to stay ahead.</Typography>
      ) : null}
      {below && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: above ? 1.25 : 1 }}>
          You are {below.gap.toLocaleString()} pts ahead of {below.name} (#{below.rank}).
        </Typography>
      )}
    </Box>
  );
}

function TiersCard({ currentKey, points }) {
  return (
    <Box sx={card}>
      <Typography sx={cardTitle}>Tiers</Typography>
      <Box sx={{ mt: 1, display: 'grid', gap: 0.25 }}>
        {[...TIERS].reverse().map((t) => {
          const on = t.key === currentKey;
          return (
            <Box key={t.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6, borderRadius: '10px', bgcolor: on ? `color-mix(in srgb, ${t.color} 15%, transparent)` : 'transparent' }}>
              <WorkspacePremiumRoundedIcon sx={{ fontSize: 18, color: t.color }} />
              <Typography variant="body2" sx={{ flex: 1, fontWeight: on ? 800 : 600 }}>{t.name}</Typography>
              <Typography variant="caption" color="text.secondary" sx={mono}>{t.min.toLocaleString()}+ pts</Typography>
            </Box>
          );
        })}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
        Easy {points.easy}, Medium {points.medium}, Hard {points.hard}, Aptitude {points.aptitude} points. Each question counts once.
      </Typography>
    </Box>
  );
}

function DesktopBoard({ v }) {
  const {
    showPanel, rich, isAuthenticated, meta, rows, podium, listRows, loading, firstLoad, error, q, search, setSearch,
    track, period, scope, pick, setTrack, setPeriod, setScope, reload, me, selectedId, selectedRow, select,
    scroller, sentinel, hasMore, scrollToMe, showEveryone,
  } = v;
  const points = meta?.points || PT;
  const stats = meta?.stats;
  const tpl = rich ? RICH : COMPACT;
  const head = rich ? ['Rank', 'Player', 'Streak', 'Easy', 'Med', 'Hard', 'Apt', 'Week', 'Score'] : ['Rank', 'Player', 'Streak', 'Solved', 'Week', 'Score'];
  const headColor = { Easy: DIFF_COLOR.Easy, Med: DIFF_COLOR.Medium, Hard: DIFF_COLOR.Hard, Apt: APT_COLOR };
  const openPodium = !showPanel ? podium.find((r) => r.userId === selectedId) : null;
  const meVisible = me && listRows.some((r) => r.userId === me.userId);
  const selectedTier = selectedRow ? tierFor(selectedRow.score).tier.key : null;

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'grid', gridTemplateRows: 'minmax(0, 1fr)', gridTemplateColumns: showPanel ? `minmax(0,1fr) ${PANEL_W}px` : 'minmax(0,1fr)', columnGap: `${GAP}px` }}>
      <Box sx={[surface, { display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, overflow: 'hidden' }]}>
        {/* Title, search, filters */}
        <Box sx={{ flexShrink: 0, px: 2.5, pt: 2.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.5rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>Leaderboard</Typography>
              {meta ? (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {meta.totalUsers.toLocaleString()} players, {(stats?.solved ?? 0).toLocaleString()} questions solved. Updated {timeAgo(meta.updatedAt)}.
                </Typography>
              ) : <Skeleton width={280} />}
            </Box>
            <TextField
              size="small" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or @handle"
              sx={{ width: 270, '& .MuiOutlinedInput-root': { borderRadius: 999 } }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment>,
                  endAdornment: search ? <InputAdornment position="end"><IconButton size="small" edge="end" aria-label="Clear search" onClick={() => setSearch('')}><CloseRoundedIcon fontSize="small" /></IconButton></InputAdornment> : null,
                },
                htmlInput: { 'aria-label': 'Search players' },
              }}
            />
            {meVisible && <Tooltip title="Find me in the list"><IconButton onClick={scrollToMe} aria-label="Scroll to my row"><MyLocationRoundedIcon fontSize="small" /></IconButton></Tooltip>}
            <Tooltip title="Refresh"><IconButton onClick={reload} aria-label="Refresh leaderboard"><RefreshRoundedIcon fontSize="small" /></IconButton></Tooltip>
          </Box>

          <Box sx={(t) => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mt: 1, borderBottom: `1px solid ${t.palette.divider}` })}>
            <Tabs value={track} onChange={pick(setTrack)} aria-label="Leaderboard track" sx={{ minHeight: 44, '& .MuiTab-root': { minHeight: 44, minWidth: 0, px: 1.75, textTransform: 'none', fontWeight: 700, fontSize: 14 } }}>
              {TRACKS.map(([val, label, Icon]) => <Tab key={val} value={val} label={label} icon={<Icon sx={{ fontSize: 18 }} />} iconPosition="start" />)}
            </Tabs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, pb: 0.75 }}>
              {[[period, setPeriod, PERIODS, 'Period'], [scope, setScope, [['global', 'Everyone'], ['friends', 'Friends']], 'Show']].map(([value, setter, opts, label]) => (
                <ToggleButtonGroup key={label} size="small" exclusive value={value} onChange={pick(setter)} aria-label={label}
                  sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 700, fontSize: 13, px: 1.5, py: 0.45 } }}>
                  {opts.map(([val, l]) => <ToggleButton key={val} value={val} disabled={val === 'friends' && !isAuthenticated}>{l}</ToggleButton>)}
                </ToggleButtonGroup>
              ))}
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mx: 2.5, mt: 1.5, flexShrink: 0 }} action={<Button color="inherit" size="small" onClick={reload}>Retry</Button>}>{error}</Alert>
        )}

        {/* The list: the only thing here that scrolls */}
        <Box ref={scroller} sx={{ flex: 1, minHeight: 0, overflowY: firstLoad ? 'hidden' : 'auto', overflowX: 'hidden', ...SCROLL }}>
          {firstLoad && <DeskSkeleton />}
          {!firstLoad && podium.length > 0 && (
            <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${podium.length}, minmax(0, 1fr))`, gap: 1.5 }}>
                {podium.map((r) => <TopCard key={r.userId} row={r} isMe={me?.userId === r.userId} selected={selectedId === r.userId} onPick={select} />)}
              </Box>
              <Collapse in={Boolean(openPodium)} timeout={200} unmountOnExit>
                {openPodium && <Box sx={(t) => ({ mt: 1.5, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${t.palette.divider}` })}><RowDetail row={openPodium} /></Box>}
              </Collapse>
            </Box>
          )}
          {!firstLoad && listRows.length > 0 && (
            <Box
              role="row"
              sx={(t) => ({
                position: 'sticky', top: 0, zIndex: 2, display: 'grid', gridTemplateColumns: tpl, columnGap: 1, px: 2.5, py: 1,
                bgcolor: t.palette.background.paper, borderTop: `1px solid ${t.palette.divider}`, borderBottom: `1px solid ${t.palette.divider}`,
              })}
            >
              {head.map((h, i) => (
                <Typography key={h} component="div" title={h === 'Week' ? 'Questions solved in the last 7 days' : undefined}
                  sx={{ fontSize: 12, fontWeight: 700, textAlign: i < 2 ? 'left' : 'right', color: headColor[h] || 'text.secondary' }}>{h}</Typography>
              ))}
            </Box>
          )}
          {listRows.map((r) => (
            <Box key={r.userId}>
              <DeskRow row={r} tpl={tpl} rich={rich} isMe={me?.userId === r.userId} selected={selectedId === r.userId} onSelect={() => select(r.userId)} />
              {!showPanel && (
                <Collapse in={selectedId === r.userId} timeout={200} unmountOnExit>
                  <RowDetail row={r} />
                </Collapse>
              )}
            </Box>
          ))}
          {!loading && rows.length === 0 && !error && (
            <Box sx={{ py: 7, px: 3, textAlign: 'center', color: 'text.secondary' }}>
              <EmojiEventsRoundedIcon sx={{ fontSize: 44, opacity: 0.35 }} />
              <Typography color="text.secondary" sx={{ mt: 0.5, fontWeight: 600 }}>
                {q ? `No player matches "${q}".` : scope === 'friends' ? 'No friends on this board yet. Add friends from the Friends tab.' : 'No one has scored in this period yet. Be the first.'}
              </Typography>
              <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center', gap: 1 }}>
                {q && <Button size="small" variant="outlined" onClick={() => setSearch('')}>Clear search</Button>}
                {!q && scope === 'friends' && <Button size="small" variant="outlined" onClick={showEveryone}>Show everyone</Button>}
                {!q && period !== 'all' && <Button size="small" variant="outlined" onClick={() => pick(setPeriod)(null, 'all')}>Show all time</Button>}
              </Box>
            </Box>
          )}
          {hasMore && <Box ref={sentinel} sx={{ height: 1 }} />}
          {loading && rows.length > 0 && <DeskSkeleton count={3} />}
        </Box>

        {/* My own position stays pinned under the list */}
        {me && (
          <Box sx={(t) => ({ flexShrink: 0, borderTop: `1px solid ${t.palette.divider}`, bgcolor: alpha(t.palette.primary.main, 0.05) })}>
            <DeskRow row={me} tpl={tpl} rich={rich} isMe pinned selected={false} onSelect={() => select(me.userId, true)} />
          </Box>
        )}
        {isAuthenticated && meta && !meta.me && !loading && (
          <Typography variant="body2" color="text.secondary" sx={(t) => ({ flexShrink: 0, px: 2.5, py: 1.25, fontWeight: 600, borderTop: `1px solid ${t.palette.divider}` })}>
            Solve a question{period === 'all' ? '' : ' in this period'} to enter the leaderboard.
          </Typography>
        )}
      </Box>

      {showPanel && (
        <Box className="autohide-scroll" sx={{ minHeight: 0, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: 2, pb: 0.5 }}>
          {!isAuthenticated && (
            <Box sx={card}>
              <Typography sx={cardTitle}>See where you stand</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>Log in to get your rank, follow friends and track your tier.</Typography>
              <Button component={RouterLink} to="/login" variant="contained" disableElevation sx={{ fontWeight: 700 }}>Log in</Button>
            </Box>
          )}
          <Spotlight
            row={selectedRow} isMe={Boolean(me && selectedRow && selectedRow.userId === me.userId)} points={points}
            learners={stats?.learners || 0} topPercent={stats?.topPercent} loading={firstLoad}
          />
          {me && meta?.neighbors && <NextTarget me={me} neighbors={meta.neighbors} points={points} />}
          <FriendsCard enabled={isAuthenticated} defaultOpen />
          <TiersCard currentKey={selectedTier} points={points} />
        </Box>
      )}
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
  const [selectedId, setSelectedId] = useState(null); // desktop: which player the side panel shows
  const [reloadKey, setReloadKey] = useState(0);
  const wrapRef = useRef(null);
  const width = useWidth(wrapRef, typeof window !== 'undefined' && window.innerWidth >= 1200 ? 1000 : 400);
  const wide = width >= DESKTOP_MIN;
  const showPanel = width >= PANEL_MIN;
  const rich = width - (showPanel ? PANEL_W + GAP : 0) >= 760;
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
  }, [period, scope, track, q, page, friendsVersion, reloadKey]);

  // Endless list: load the next page when the bottom comes into view.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || loading) return undefined;
    const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) setPage((p) => p + 1); }, { root: scroller.current, rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, rows.length, wide]);

  const reset = useCallback(() => {
    setPage(1);
    setRows([]);
    setMeta((m) => (m ? { ...m, total: 0 } : m));
    setOpen(null);
    scroller.current?.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, [reduce]);

  const pick = (setter) => (_, v) => { if (v) { setter(v); reset(); } };
  const reload = () => { setPage(1); setReloadKey((k) => k + 1); };
  const select = useCallback((id, force = false) => setSelectedId((cur) => (!force && cur === id ? null : id)), []);
  const scrollToMe = () => document.getElementById('lb-me')?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  const showEveryone = () => { setScope('global'); reset(); };
  const me = isAuthenticated ? meta?.me : null;
  const filtersOn = period !== 'all' || track !== 'overall' || scope !== 'global';
  const players = meta?.totalUsers ?? null;

  // Top 3 get a podium (only players who scored, and not while searching).
  const podium = q ? [] : rows.slice(0, 3).filter((r) => r.score > 0);
  const listRows = rows.slice(podium.length);
  const openPodium = podium.find((r) => r.userId === open);
  const selectedRow = (selectedId && (rows.find((r) => r.userId === selectedId) || (me?.userId === selectedId ? me : null))) || me || podium[0] || rows[0] || null;
  const periodLabel = PERIODS.find(([v]) => v === period)?.[1];
  const glass = { width: 42, height: 42, color: '#fff', bgcolor: 'rgba(255,255,255,0.16)', borderRadius: '13px', '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } };

  const mobile = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, height: '100%', minHeight: 420 }}>
      {/* Banner: title, player count, quick actions and track tabs */}
      <Box sx={{ position: 'relative', overflow: 'hidden', flexShrink: 0, p: { xs: 1.75, sm: 2.25 }, borderRadius: '18px', color: '#fff', background: 'linear-gradient(135deg,#1E1B4B 0%,#3730A3 55%,#6D28D9 100%)', boxShadow: '0 14px 28px -16px rgba(2,6,23,0.85), inset 0 1px 0 rgba(255,255,255,0.18)' }}>
        <Box aria-hidden sx={{ position: 'absolute', right: -50, top: -60, width: 210, height: 210, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.34), transparent 70%)', animation: `${floatA} 9s ease-in-out infinite`, ...calm }} />
        <Box aria-hidden sx={{ position: 'absolute', left: -40, bottom: -70, width: 190, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.28), transparent 70%)', animation: `${floatB} 11s ease-in-out infinite`, ...calm }} />

        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: '15px', display: 'grid', placeItems: 'center', color: '#451A03', background: grad(MEDAL[1]), animation: `${pulse} 2.2s ease-out infinite`, ...calm }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>Leaderboard</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.4, color: 'rgba(255,255,255,0.88)', flexWrap: 'wrap' }}>
              <PeopleAltRoundedIcon sx={{ fontSize: 15 }} />
              {players === null ? <Skeleton width={80} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} /> : <Typography variant="caption" sx={{ fontWeight: 700 }}>{players.toLocaleString()} players</Typography>}
              <Box sx={{ px: 0.9, py: 0.05, borderRadius: 99, bgcolor: 'rgba(251,191,36,0.2)', color: '#FDE68A', fontSize: 11, fontWeight: 800 }}>{periodLabel}</Box>
            </Box>
          </Box>
          <Tooltip title="Search"><IconButton onClick={() => { setSearchOpen((o) => !o); if (searchOpen) setSearch(''); }} aria-label="Search players" sx={glass}>{searchOpen ? <CloseRoundedIcon fontSize="small" /> : <SearchRoundedIcon fontSize="small" />}</IconButton></Tooltip>
          <Tooltip title="Filters"><IconButton onClick={(e) => setFilterAnchor(e.currentTarget)} aria-label="Leaderboard filters" sx={glass}><Badge variant="dot" color="warning" invisible={!filtersOn} overlap="circular"><TuneRoundedIcon fontSize="small" /></Badge></IconButton></Tooltip>
        </Box>

        <Box role="tablist" aria-label="Leaderboard track" sx={{ position: 'relative', display: 'flex', gap: 0.9, mt: 1.5, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {TRACKS.map(([v, label, Icon]) => {
            const on = track === v;
            return (
              <ButtonBase
                key={v} role="tab" aria-selected={on} onClick={() => { if (!on) { setTrack(v); reset(); } }}
                sx={{ flexShrink: 0, gap: 0.6, px: 1.6, py: 0.7, borderRadius: 99, fontFamily: 'inherit', fontSize: 13, fontWeight: 800, transition: 'transform .15s, background-color .2s, box-shadow .2s', color: on ? '#1B1200' : '#fff', bgcolor: on ? undefined : 'rgba(255,255,255,0.14)', background: on ? `linear-gradient(135deg, ${AMBER}, #F59E0B)` : undefined, boxShadow: on ? '0 6px 16px -6px rgba(251,191,36,0.9)' : 'none', '&:active': { transform: 'scale(0.95)' } }}
              >
                <Icon sx={{ fontSize: 17 }} />{label}
              </ButtonBase>
            );
          })}
        </Box>
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
      <Box sx={[surface, (t) => ({ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '18px', backgroundImage: `linear-gradient(180deg, ${alpha(t.palette.primary.main, 0.07)}, transparent 260px)` })]}>
        <Box ref={scroller} sx={{ flex: 1, minHeight: 0, overflowY: firstLoad ? 'hidden' : 'auto', overflowX: 'hidden', pb: 0.5, ...SCROLL, scrollbarGutter: firstLoad ? 'auto' : 'stable' }}>
          {firstLoad && <Box sx={{ pt: 1 }}><SkeletonRows /></Box>}
          {!firstLoad && podium.length > 0 && (
            <>
              <Podium rows={podium} meId={me?.userId} openId={open} onPick={(id) => setOpen(open === id ? null : id)} />
              <Collapse in={Boolean(openPodium)} timeout={220} unmountOnExit>
                {openPodium && <Box sx={(t) => ({ mx: 1, mb: 1, borderRadius: '14px', overflow: 'hidden', border: `1px solid ${t.palette.divider}` })}><RowDetail row={openPodium} /></Box>}
              </Collapse>
            </>
          )}
          {!firstLoad && <Box sx={{ pt: podium.length ? 0 : 1 }} />}
          {listRows.map((r, i) => (
            <Row key={r.userId} row={r} index={i} isMe={me?.userId === r.userId} expanded={open === r.userId} onToggle={() => setOpen(open === r.userId ? null : r.userId)} />
          ))}
          {!loading && rows.length === 0 && !error && (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              <EmojiEventsRoundedIcon sx={{ fontSize: 44, opacity: 0.35, animation: `${bob} 2.4s ease-in-out infinite`, ...calm }} />
              <Typography color="text.secondary" sx={{ mt: 0.5, fontWeight: 600 }}>
                {q ? `No player matches "${q}".` : scope === 'friends' ? 'Add friends from the Friends tab and they will show up here.' : 'No one has scored in this period yet. Be the first.'}
              </Typography>
            </Box>
          )}
          {hasMore && <Box ref={sentinel} sx={{ height: 1 }} />}
          {loading && rows.length > 0 && <SkeletonRows count={3} />}
        </Box>

        {/* My own position stays pinned under the list */}
        {me && (
          <Box sx={(t) => ({ flexShrink: 0, maxHeight: '55%', overflowY: 'auto', p: 0.75, background: `linear-gradient(180deg, ${alpha(t.palette.primary.main, 0.16)}, ${alpha(t.palette.primary.main, 0.05)})`, boxShadow: `0 -10px 24px -14px ${alpha(t.palette.primary.main, 0.7)}` })}>
            <Row row={me} isMe pinned expanded={open === 'pinned-me'} onToggle={() => setOpen(open === 'pinned-me' ? null : 'pinned-me')} />
          </Box>
        )}
        {isAuthenticated && meta && !meta.me && !loading && (
          <Typography variant="caption" color="text.secondary" sx={(t) => ({ flexShrink: 0, px: 2, py: 1, fontWeight: 600, borderTop: `1px solid ${t.palette.divider}` })}>
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

  const desktopView = {
    showPanel, rich, isAuthenticated, meta, rows, podium, listRows, loading, firstLoad, error, q, search, setSearch,
    track, period, scope, pick, setTrack, setPeriod, setScope, reload, me, selectedId, selectedRow, select,
    scroller, sentinel, hasMore, scrollToMe, showEveryone,
  };

  return (
    <Box ref={wrapRef} sx={{ height: { xs: 'calc(100dvh - 150px)', lg: '100%' }, minHeight: 420 }}>
      {wide ? <DesktopBoard v={desktopView} /> : mobile}
    </Box>
  );
}
