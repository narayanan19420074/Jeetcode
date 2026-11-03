import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button, ButtonBase, Dialog, IconButton, Skeleton, Stack, Tooltip, Typography, Alert } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { DIFF_COLOR, tint } from '../dashboard/dashboardUtils';
import { tierFor } from '../leaderboard/tiers';
import { APT_COLOR, FLAME, PersonAvatar, mono, practisedToday, statusInfo, tonal } from './friendsUi';
import { LIB_ACCENT, LIB_TRACKING, libChipSx, libPanelSx, libSectionTitleSx, libTintBtnSx } from '../dashboard/components/libraryStyle';
import { COLOR_PALETTE, FONT_WEIGHTS, FONT_SIZES, RADII_PX, MOTION } from '../../app/design/designTokens';

// One head-to-head row: my number | label | their number, with a split bar. `lower` = smaller wins (rank).
function VsRow({ label, a, b, lower, lib = false }) {
  const na = a ?? 0;
  const nb = b ?? 0;
  const aWins = lower ? (a != null && (b == null || na < nb)) : na > nb;
  const bWins = lower ? (b != null && (a == null || nb < na)) : nb > na;
  const total = na + nb;
  const share = total > 0 ? (lower ? nb / total : na / total) : 0.5;
  const fmt = (v) => (v == null ? '–' : lower ? `#${v}` : Number(v).toLocaleString());
  if (lib) {
    return (
      <Box sx={{ py: 1.5, borderBottom: '1px solid var(--lib-divider)', '&:last-of-type': { borderBottom: 'none' } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: aWins ? FONT_WEIGHTS.bold : FONT_WEIGHTS.regular, fontSize: FONT_SIZES.title, lineHeight: '24px', fontVariantNumeric: 'tabular-nums', minWidth: 56, color: aWins ? 'var(--jc-easy)' : 'var(--lib-text)' }}>{fmt(a)}</Typography>
          <Typography sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>{label}</Typography>
          <Typography sx={{ fontWeight: bWins ? FONT_WEIGHTS.bold : FONT_WEIGHTS.regular, fontSize: FONT_SIZES.title, lineHeight: '24px', fontVariantNumeric: 'tabular-nums', minWidth: 56, textAlign: 'right', color: bWins ? 'var(--jc-hard)' : 'var(--lib-text)' }}>{fmt(b)}</Typography>
        </Stack>
        <Box sx={{ display: 'flex', height: 6, borderRadius: RADII_PX.pill, overflow: 'hidden', mt: 1, bgcolor: 'var(--lib-chip)', gap: 0.5 }}>
          <Box sx={{ width: `${Math.max(4, Math.min(96, share * 100))}%`, bgcolor: aWins ? 'var(--jc-easy)' : LIB_ACCENT, opacity: aWins ? 1 : 0.45 }} />
          <Box sx={{ flex: 1, bgcolor: bWins ? 'var(--jc-hard)' : 'var(--lib-muted)', opacity: bWins ? 1 : 0.35 }} />
        </Box>
      </Box>
    );
  }
  return (
    <Box sx={{ py: 1 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: aWins ? FONT_WEIGHTS.bold : FONT_WEIGHTS.semibold, color: aWins ? 'success.main' : 'text.primary', minWidth: 56, textAlign: 'left', ...mono }}>{fmt(a)}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</Typography>
        <Typography sx={{ fontWeight: bWins ? FONT_WEIGHTS.bold : FONT_WEIGHTS.semibold, color: bWins ? 'error.main' : 'text.primary', minWidth: 56, textAlign: 'right', ...mono }}>{fmt(b)}</Typography>
      </Stack>
      <Box sx={{ display: 'flex', height: 6, borderRadius: RADII_PX.pill, overflow: 'hidden', mt: 0.5, bgcolor: 'action.hover', gap: 0.5 }}>
        <Box sx={{ width: `${Math.max(4, Math.min(96, share * 100))}%`, bgcolor: aWins ? 'success.main' : 'primary.main', opacity: aWins ? 1 : 0.45, transition: `width ${MOTION.deliberate}ms` }} />
        <Box sx={{ flex: 1, bgcolor: bWins ? 'error.main' : 'text.disabled', opacity: bWins ? 1 : 0.35 }} />
      </Box>
    </Box>
  );
}

// "You vs @friend" — loads both players' numbers from the server.
function Compare({ friend, lib = false }) {
  const me = useSelector((s) => s.auth.user);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    friendsApi
      .compare(friend.userId)
      .then(({ data: d }) => !cancelled && setData(d.data))
      .catch((err) => !cancelled && setError(extractErrorMessage(err)));
    return () => { cancelled = true; };
  }, [friend.userId]);

  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  if (!data) return <Skeleton variant="rounded" height={260} sx={{ mt: 2, borderRadius: RADII_PX.card }} />;

  const { me: a, them: b } = data;
  const rows = [
    ['Rank', a.rank, b.rank, true],
    ['Points', a.score, b.score],
    ['Solved', a.solved, b.solved],
    ['Easy', a.easy, b.easy],
    ['Medium', a.medium, b.medium],
    ['Hard', a.hard, b.hard],
    ['Aptitude', a.aptitude, b.aptitude],
    ['Streak', a.streak, b.streak],
    ['Best streak', a.longestStreak, b.longestStreak],
    ['Solved this week', a.weekSolved, b.weekSolved],
  ];
  let mine = 0;
  let theirs = 0;
  rows.forEach(([, x, y, lower]) => {
    const xv = x ?? (lower ? Infinity : 0);
    const yv = y ?? (lower ? Infinity : 0);
    if (xv === yv) return;
    if (lower ? xv < yv : xv > yv) mine += 1;
    else theirs += 1;
  });
  const verdict = mine === theirs ? 'All square' : mine > theirs ? `You lead ${mine}–${theirs}` : `@${b.handle} leads ${theirs}–${mine}`;

  if (lib) {
    return (
      <Box sx={{ mt: 3 }}>
        <Box sx={{ ...libPanelSx, p: 2, textAlign: 'center' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack sx={{ alignItems: 'center', width: 76, gap: 0.5 }}>
              <PersonAvatar person={{ ...a, name: me?.name || a.name }} size={48} />
              <Typography sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING }}>You</Typography>
            </Stack>
            <Box sx={{ flex: 1, px: 1 }}>
              <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg, lineHeight: '32px', fontVariantNumeric: 'tabular-nums' }}>{mine} : {theirs}</Typography>
              <Typography sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>{verdict}</Typography>
            </Box>
            <Stack sx={{ alignItems: 'center', width: 76, gap: 0.5 }}>
              <PersonAvatar person={b} size={48} />
              <Typography noWrap sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, maxWidth: 76 }}>@{b.handle}</Typography>
            </Stack>
          </Stack>
        </Box>
        <Box sx={{ mt: 1, borderTop: '1px solid var(--lib-divider)' }}>
          {rows.map(([label, x, y, lower]) => <VsRow key={label} label={label} a={x} b={y} lower={lower} lib />)}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, textAlign: 'left' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Stack sx={{ alignItems: 'center', width: 76 }}>
          <PersonAvatar person={{ ...a, name: me?.name || a.name }} size={46} />
          <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold }}>You</Typography>
        </Stack>
        <Box sx={{ textAlign: 'center', flex: 1, px: 1 }}>
          <Typography sx={(t) => ({ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.display, ...mono, background: `linear-gradient(90deg, ${t.palette.success.main}, ${t.palette.error.main})`, WebkitBackgroundClip: 'text', color: 'transparent' })}>
            {mine} : {theirs}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: FONT_WEIGHTS.semibold }}>{verdict}</Typography>
        </Box>
        <Stack sx={{ alignItems: 'center', width: 76 }}>
          <PersonAvatar person={b} size={46} />
          <Typography variant="caption" noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, maxWidth: 76 }}>@{b.handle}</Typography>
        </Stack>
      </Stack>
      {rows.map(([label, x, y, lower]) => <VsRow key={label} label={label} a={x} b={y} lower={lower} />)}
    </Box>
  );
}

function Overview({ f }) {
  const { tier } = tierFor(f.score);
  const stats = [
    [<EmojiEventsRoundedIcon key="r" />, f.rank ? `#${f.rank}` : '–', 'Rank', COLOR_PALETTE.amber[500]],
    [<BoltRoundedIcon key="s" />, f.score.toLocaleString(), 'Points', tier.color],
    [<CheckCircleRoundedIcon key="c" />, f.solved, 'Solved', DIFF_COLOR.Easy],
    [<LocalFireDepartmentRoundedIcon key="f" />, f.streak || 0, 'Streak', FLAME],
  ];
  const parts = [['Easy', f.easy, DIFF_COLOR.Easy], ['Med', f.medium, DIFF_COLOR.Medium], ['Hard', f.hard, DIFF_COLOR.Hard], ['Apt', f.aptitude, APT_COLOR]];
  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mt: 2.5 }}>
        {stats.map(([icon, value, label, color]) => (
          <Box key={label} sx={(t) => ({ py: 1.5, borderRadius: RADII_PX.card, border: `1px solid ${t.palette.divider}` })}>
            <Box sx={{ color, display: 'grid', placeItems: 'center', '& svg': { fontSize: FONT_SIZES.heading } }}>{icon}</Box>
            <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.title, lineHeight: 1.3, ...mono }}>{value}</Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Box>
        ))}
      </Box>
      <Stack direction="row" spacing={0.75} sx={{ mt: 1.5 }}>
        {parts.map(([label, n, color]) => (
          <Box key={label} sx={{ flex: 1, py: 0.5, borderRadius: RADII_PX.control, bgcolor: tint(color, 14) }}>
            <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, color, lineHeight: 1.2, ...mono }}>{n}</Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Box>
        ))}
      </Stack>
    </>
  );
}

// Same profile + "You vs them" content, but inline (no dialog): used by the desktop Friends side panel.
function ClassicProfilePanel({ f, onRemove }) {
  const online = useSelector((s) => Boolean(s.friends.online[f.userId]));
  const [tab, setTab] = useState('overview');
  const { tier } = tierFor(f.score);
  const act = statusInfo(f, online);
  const since = f.since ? new Date(f.since).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : null;
  const pill = (key, label) => (
    <ButtonBase
      key={key}
      onClick={() => setTab(key)}
      aria-pressed={tab === key}
      sx={(t) => ({ flex: 1, height: 36, borderRadius: RADII_PX.pill, fontFamily: 'inherit', fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, bgcolor: tab === key ? t.palette.text.primary : 'transparent', color: tab === key ? t.palette.background.paper : t.palette.text.secondary })}
    >
      {label}
    </ButtonBase>
  );
  return (
    <Box data-chat-scroll sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', scrollbarWidth: 'thin', pt: 2, px: 2.5, pb: 2, textAlign: 'center' }}>
      <PersonAvatar person={f} size={72} ring={tier.color} online={online} />
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.subheading, mt: 1 }}>{f.name}</Typography>
      <Typography variant="body2" color="text.secondary">@{f.handle}</Typography>
      <Stack direction="row" spacing={0.75} useFlexGap sx={{ justifyContent: 'center', flexWrap: 'wrap', mt: 1 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: RADII_PX.pill, bgcolor: tint(tier.color, 16), color: tier.color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body }}>
          <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.title }} /> {tier.name}
        </Box>
        {f.company && (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: RADII_PX.pill, bgcolor: 'action.hover', color: 'text.secondary', fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.body }}>
            <BusinessRoundedIcon sx={{ fontSize: FONT_SIZES.title }} /> {f.company}
          </Box>
        )}
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, borderRadius: RADII_PX.pill, bgcolor: 'action.hover', color: act.live ? 'success.main' : 'text.secondary', fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body }}>
          <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: act.live ? COLOR_PALETTE.green[500] : 'text.disabled' }} />
          {act.text}
        </Box>
      </Stack>
      <Stack direction="row" sx={(t) => ({ mt: 2, p: 0.5, borderRadius: RADII_PX.pill, border: `1px solid ${t.palette.divider}` })}>
        {pill('overview', 'Overview')}
        {pill('compare', 'You vs them')}
      </Stack>
      {tab === 'overview' ? <Overview f={f} /> : <Compare friend={f} />}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2.5 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'text.secondary' }}>
          <PeopleAltRoundedIcon sx={{ fontSize: FONT_SIZES.subheading }} />
          <Typography variant="caption">{since ? `Friends since ${since}` : 'Friends'}</Typography>
        </Stack>
        <Tooltip title="Remove friend">
          <IconButton aria-label={`Remove ${f.name}`} onClick={onRemove} sx={tonal('error')}><PersonRemoveRoundedIcon /></IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

// ---- Phone Library look: same cards, rows and pills as the phone dashboard ----
const scrollRow = { display: 'flex', gap: 1.5, overflowX: 'auto', mx: -2, px: 2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } };

// 115x80 card like the dashboard categories: icon on top, value on the right, label at the bottom.
function StatCard({ icon: Icon, value, label, color, bg }) {
  return (
    <Box
      sx={(t) => ({
        flex: 'none', width: 115, height: 80, p: 1.5, borderRadius: RADII_PX.card, border: '1.5px solid var(--lib-border)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'var(--lib-text)',
        bgcolor: t.palette.mode === 'dark' ? tint(color, 16) : bg,
      })}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        {Icon ? <Icon aria-hidden sx={{ fontSize: FONT_SIZES.displayLg, color }} /> : <Box />}
        <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.heading, lineHeight: '24px', fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
      </Stack>
      <Typography noWrap sx={{ fontSize: FONT_SIZES.bodyLg, lineHeight: '19px', letterSpacing: LIB_TRACKING }}>{label}</Typography>
    </Box>
  );
}

function LibOverview({ f }) {
  const { tier } = tierFor(f.score);
  const stats = [
    { icon: EmojiEventsRoundedIcon, value: f.rank ? `#${f.rank}` : '–', label: 'Rank', color: COLOR_PALETTE.custom.blue3F8CE8, bg: COLOR_PALETTE.blue[50] },
    { icon: BoltRoundedIcon, value: f.score.toLocaleString(), label: 'Points', color: tier.color, bg: tint(tier.color, 14) },
    { icon: CheckCircleRoundedIcon, value: f.solved, label: 'Solved', color: COLOR_PALETTE.custom.emerald22A06B, bg: COLOR_PALETTE.green[50] },
    { icon: LocalFireDepartmentRoundedIcon, value: f.streak || 0, label: 'Streak', color: COLOR_PALETTE.custom.amberF09A2E, bg: COLOR_PALETTE.orange[50] },
  ];
  const levels = [
    { value: f.easy, label: 'Easy', color: COLOR_PALETTE.custom.emerald22A06B, bg: COLOR_PALETTE.green[50] },
    { value: f.medium, label: 'Medium', color: COLOR_PALETTE.custom.amberF09A2E, bg: COLOR_PALETTE.orange[50] },
    { value: f.hard, label: 'Hard', color: COLOR_PALETTE.custom.redEF5B5B, bg: COLOR_PALETTE.rose[50] },
    { value: f.aptitude, label: 'Aptitude', color: APT_COLOR, bg: COLOR_PALETTE.violet[100] },
  ];
  return (
    <>
      <Box sx={{ ...scrollRow, mt: 3 }}>
        {stats.map((c) => <StatCard key={c.label} {...c} />)}
      </Box>
      <Typography component="h2" sx={{ ...libSectionTitleSx, mt: 4, mb: 1.5 }}>Solved by level</Typography>
      <Box sx={scrollRow}>
        {levels.map((c) => <StatCard key={c.label} {...c} />)}
      </Box>
    </>
  );
}

function LibProfilePanel({ f, onRemove }) {
  const online = useSelector((s) => Boolean(s.friends.online[f.userId]));
  const [tab, setTab] = useState('overview');
  const { tier } = tierFor(f.score);
  const since = f.since ? new Date(f.since).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : null;
  const tabs = [['overview', 'Overview'], ['compare', 'You vs them']];
  return (
    <Box data-chat-scroll sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', px: 2, pt: 3, pb: 3, bgcolor: 'var(--lib-bg)' }}>
      <Box sx={{ textAlign: 'center' }}>
        <PersonAvatar person={f} size={81} online={online} />
        <Typography component="h1" noWrap sx={{ mt: 1.5, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg, lineHeight: '32px' }}>{f.name}</Typography>
        <Typography sx={{ fontSize: FONT_SIZES.subheading, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>
          @{f.handle}{since ? ` · Friends since ${since}` : ''}
        </Typography>
        <Stack direction="row" useFlexGap sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, height: 34, px: 2, borderRadius: RADII_PX.pill, bgcolor: tint(tier.color, 16), color: tier.color, fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING }}>
            <WorkspacePremiumRoundedIcon aria-hidden sx={{ fontSize: FONT_SIZES.subheading }} /> {tier.name}
          </Box>
          {f.company && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', height: 34, px: 2, borderRadius: RADII_PX.pill, bgcolor: 'var(--lib-chip)', color: 'var(--lib-chip-text)', fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING }}>
              {f.company}
            </Box>
          )}
        </Stack>
      </Box>

      <Box role="tablist" aria-label="Profile sections" sx={{ display: 'flex', gap: 1, mt: 3 }}>
        {tabs.map(([key, label]) => (
          <ButtonBase key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)} sx={libChipSx(tab === key)}>
            {label}
          </ButtonBase>
        ))}
      </Box>

      {tab === 'overview' ? <LibOverview f={f} /> : <Compare friend={f} lib />}

      <Button fullWidth onClick={onRemove} sx={{ ...libTintBtnSx, mt: 4, bgcolor: tint(COLOR_PALETTE.custom.redEF5B5B, 12), color: 'error.main', '&:hover': { bgcolor: tint(COLOR_PALETTE.custom.redEF5B5B, 20) } }}>
        Remove friend
      </Button>
    </Box>
  );
}

// Inline profile + "You vs them" for the Friends side panel (desktop) and the phone chat. `lib` = phone Library look.
export function FriendProfilePanel({ f, onRemove, lib = false }) {
  return lib ? <LibProfilePanel f={f} onRemove={onRemove} /> : <ClassicProfilePanel f={f} onRemove={onRemove} />;
}

// Friend profile: overview + "You vs friend" compare, with chat / code together / nudge / remove.
export default function FriendProfileDialog({ f, onClose, onRemove, onChat, onCodeTogether, onNudge, nudging }) {
  const online = useSelector((s) => Boolean(s.friends.online[f.userId]));
  const [tab, setTab] = useState('overview');
  const { tier } = tierFor(f.score);
  const act = statusInfo(f, online);
  const since = f.since ? new Date(f.since).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : null;
  const canNudge = !practisedToday(f);

  const pill = (key, label) => (
    <ButtonBase
      key={key}
      onClick={() => setTab(key)}
      aria-pressed={tab === key}
      sx={(t) => ({ flex: 1, height: 36, borderRadius: RADII_PX.pill, fontFamily: 'inherit', fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, bgcolor: tab === key ? t.palette.text.primary : 'transparent', color: tab === key ? t.palette.background.paper : t.palette.text.secondary })}
    >
      {label}
    </ButtonBase>
  );

  const action = (icon, label, onClick, color = 'primary', disabled = false) => (
    <Tooltip title={label}>
      <span>
        <Button aria-label={label} onClick={onClick} disabled={disabled} sx={(t) => ({ ...tonal(color, 48)(t), borderRadius: RADII_PX.card, minWidth: 0, p: 0 })}>
          {icon}
        </Button>
      </span>
    </Tooltip>
  );

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: RADII_PX.card } } }}>
      <Box sx={(t) => ({ position: 'relative', pt: 3, px: 2.5, pb: 2, textAlign: 'center', background: `linear-gradient(180deg, ${tint(tier.color, 14)}, transparent 150px)` })}>
        <IconButton aria-label="Close" onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}><CloseRoundedIcon /></IconButton>
        <PersonAvatar person={f} size={80} ring={tier.color} online={online} />
        <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.heading, mt: 1.5 }}>{f.name}</Typography>
        <Typography variant="body2" color="text.secondary">@{f.handle}</Typography>

        <Stack direction="row" spacing={0.75} useFlexGap sx={{ justifyContent: 'center', flexWrap: 'wrap', mt: 1.5 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: RADII_PX.pill, bgcolor: tint(tier.color, 16), color: tier.color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body }}>
            <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.title }} /> {tier.name}
          </Box>
          {f.company && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: RADII_PX.pill, bgcolor: 'action.hover', color: 'text.secondary', fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.body }}>
              <BusinessRoundedIcon sx={{ fontSize: FONT_SIZES.title }} /> {f.company}
            </Box>
          )}
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, borderRadius: RADII_PX.pill, bgcolor: 'action.hover', color: act.live ? 'success.main' : 'text.secondary', fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: act.live ? COLOR_PALETTE.green[500] : 'text.disabled' }} />
            {act.text}
          </Box>
        </Stack>

        {/* quick actions */}
        <Stack direction="row" spacing={1.25} sx={{ justifyContent: 'center', mt: 2 }}>
          {action(<ChatRoundedIcon />, 'Chat', onChat)}
          {action(<LaptopMacRoundedIcon />, 'Code together', onCodeTogether, 'success')}
          {action(<NotificationsActiveRoundedIcon />, canNudge ? 'Nudge — remind about streak' : 'Already practised today', onNudge, 'warning', !canNudge || nudging)}
        </Stack>

        <Stack direction="row" sx={(t) => ({ mt: 2, p: 0.5, borderRadius: RADII_PX.pill, border: `1px solid ${t.palette.divider}` })}>
          {pill('overview', 'Overview')}
          {pill('compare', 'You vs them')}
        </Stack>

        {tab === 'overview' ? <Overview f={f} /> : <Compare friend={f} />}

        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2.5 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'text.secondary' }}>
            <PeopleAltRoundedIcon sx={{ fontSize: FONT_SIZES.subheading }} />
            <Typography variant="caption">{since ? `Friends since ${since}` : 'Friends'}</Typography>
          </Stack>
          <Tooltip title="Remove friend">
            <IconButton aria-label={`Remove ${f.name}`} onClick={onRemove} sx={tonal('error')}><PersonRemoveRoundedIcon /></IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Dialog>
  );
}
