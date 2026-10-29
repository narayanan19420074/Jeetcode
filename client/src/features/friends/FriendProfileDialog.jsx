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
      <Box sx={{ py: 1.25, borderBottom: '1px solid var(--lib-divider)', '&:last-of-type': { borderBottom: 'none' } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: aWins ? 700 : 400, fontSize: 16, lineHeight: '24px', fontVariantNumeric: 'tabular-nums', minWidth: 56, color: aWins ? 'var(--jc-easy)' : 'var(--lib-text)' }}>{fmt(a)}</Typography>
          <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>{label}</Typography>
          <Typography sx={{ fontWeight: bWins ? 700 : 400, fontSize: 16, lineHeight: '24px', fontVariantNumeric: 'tabular-nums', minWidth: 56, textAlign: 'right', color: bWins ? 'var(--jc-hard)' : 'var(--lib-text)' }}>{fmt(b)}</Typography>
        </Stack>
        <Box sx={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', mt: 0.75, bgcolor: 'var(--lib-chip)', gap: '2px' }}>
          <Box sx={{ width: `${Math.max(4, Math.min(96, share * 100))}%`, bgcolor: aWins ? 'var(--jc-easy)' : LIB_ACCENT, opacity: aWins ? 1 : 0.45 }} />
          <Box sx={{ flex: 1, bgcolor: bWins ? 'var(--jc-hard)' : 'var(--lib-muted)', opacity: bWins ? 1 : 0.35 }} />
        </Box>
      </Box>
    );
  }
  return (
    <Box sx={{ py: 0.9 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: aWins ? 900 : 600, color: aWins ? 'success.main' : 'text.primary', minWidth: 56, textAlign: 'left', ...mono }}>{fmt(a)}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</Typography>
        <Typography sx={{ fontWeight: bWins ? 900 : 600, color: bWins ? 'error.main' : 'text.primary', minWidth: 56, textAlign: 'right', ...mono }}>{fmt(b)}</Typography>
      </Stack>
      <Box sx={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', mt: 0.5, bgcolor: 'action.hover', gap: '2px' }}>
        <Box sx={{ width: `${Math.max(4, Math.min(96, share * 100))}%`, bgcolor: aWins ? 'success.main' : 'primary.main', opacity: aWins ? 1 : 0.45, transition: 'width .5s' }} />
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
  if (!data) return <Skeleton variant="rounded" height={260} sx={{ mt: 2, borderRadius: '14px' }} />;

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
              <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING }}>You</Typography>
            </Stack>
            <Box sx={{ flex: 1, px: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 26, lineHeight: '32px', fontVariantNumeric: 'tabular-nums' }}>{mine} : {theirs}</Typography>
              <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>{verdict}</Typography>
            </Box>
            <Stack sx={{ alignItems: 'center', width: 76, gap: 0.5 }}>
              <PersonAvatar person={b} size={48} />
              <Typography noWrap sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, maxWidth: 76 }}>@{b.handle}</Typography>
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
          <Typography variant="caption" sx={{ fontWeight: 800 }}>You</Typography>
        </Stack>
        <Box sx={{ textAlign: 'center', flex: 1, px: 1 }}>
          <Typography sx={(t) => ({ fontWeight: 900, fontSize: '1.5rem', ...mono, background: `linear-gradient(90deg, ${t.palette.success.main}, ${t.palette.error.main})`, WebkitBackgroundClip: 'text', color: 'transparent' })}>
            {mine} : {theirs}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{verdict}</Typography>
        </Box>
        <Stack sx={{ alignItems: 'center', width: 76 }}>
          <PersonAvatar person={b} size={46} />
          <Typography variant="caption" noWrap sx={{ fontWeight: 800, maxWidth: 76 }}>@{b.handle}</Typography>
        </Stack>
      </Stack>
      {rows.map(([label, x, y, lower]) => <VsRow key={label} label={label} a={x} b={y} lower={lower} />)}
    </Box>
  );
}

function Overview({ f }) {
  const { tier } = tierFor(f.score);
  const stats = [
    [<EmojiEventsRoundedIcon key="r" />, f.rank ? `#${f.rank}` : '–', 'Rank', '#F59E0B'],
    [<BoltRoundedIcon key="s" />, f.score.toLocaleString(), 'Points', tier.color],
    [<CheckCircleRoundedIcon key="c" />, f.solved, 'Solved', DIFF_COLOR.Easy],
    [<LocalFireDepartmentRoundedIcon key="f" />, f.streak || 0, 'Streak', FLAME],
  ];
  const parts = [['Easy', f.easy, DIFF_COLOR.Easy], ['Med', f.medium, DIFF_COLOR.Medium], ['Hard', f.hard, DIFF_COLOR.Hard], ['Apt', f.aptitude, APT_COLOR]];
  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mt: 2.25 }}>
        {stats.map(([icon, value, label, color]) => (
          <Box key={label} sx={(t) => ({ py: 1.25, borderRadius: '12px', border: `1px solid ${t.palette.divider}` })}>
            <Box sx={{ color, display: 'grid', placeItems: 'center', '& svg': { fontSize: 20 } }}>{icon}</Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.3, ...mono }}>{value}</Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Box>
        ))}
      </Box>
      <Stack direction="row" spacing={0.75} sx={{ mt: 1.5 }}>
        {parts.map(([label, n, color]) => (
          <Box key={label} sx={{ flex: 1, py: 0.6, borderRadius: '10px', bgcolor: tint(color, 14) }}>
            <Typography sx={{ fontWeight: 800, color, lineHeight: 1.2, ...mono }}>{n}</Typography>
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
      sx={(t) => ({ flex: 1, height: 36, borderRadius: 999, fontFamily: 'inherit', fontWeight: 800, fontSize: 14, bgcolor: tab === key ? t.palette.text.primary : 'transparent', color: tab === key ? t.palette.background.paper : t.palette.text.secondary })}
    >
      {label}
    </ButtonBase>
  );
  return (
    <Box data-chat-scroll sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', scrollbarWidth: 'thin', pt: 2, px: 2.5, pb: 2, textAlign: 'center' }}>
      <PersonAvatar person={f} size={72} ring={tier.color} online={online} />
      <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', mt: 1 }}>{f.name}</Typography>
      <Typography variant="body2" color="text.secondary">@{f.handle}</Typography>
      <Stack direction="row" spacing={0.75} useFlexGap sx={{ justifyContent: 'center', flexWrap: 'wrap', mt: 1 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.35, borderRadius: 999, bgcolor: tint(tier.color, 16), color: tier.color, fontWeight: 700, fontSize: 13 }}>
          <WorkspacePremiumRoundedIcon sx={{ fontSize: 16 }} /> {tier.name}
        </Box>
        {f.company && (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.35, borderRadius: 999, bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 600, fontSize: 13 }}>
            <BusinessRoundedIcon sx={{ fontSize: 16 }} /> {f.company}
          </Box>
        )}
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.35, borderRadius: 999, bgcolor: 'action.hover', color: act.live ? 'success.main' : 'text.secondary', fontWeight: 700, fontSize: 13 }}>
          <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: act.live ? '#22C55E' : 'text.disabled' }} />
          {act.text}
        </Box>
      </Stack>
      <Stack direction="row" sx={(t) => ({ mt: 2, p: 0.5, borderRadius: 999, border: `1px solid ${t.palette.divider}` })}>
        {pill('overview', 'Overview')}
        {pill('compare', 'You vs them')}
      </Stack>
      {tab === 'overview' ? <Overview f={f} /> : <Compare friend={f} />}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2.25 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'text.secondary' }}>
          <PeopleAltRoundedIcon sx={{ fontSize: 18 }} />
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
const scrollRow = { display: 'flex', gap: '11px', overflowX: 'auto', mx: -2, px: 2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } };

// 115x80 card like the dashboard categories: icon on top, value on the right, label at the bottom.
function StatCard({ icon: Icon, value, label, color, bg }) {
  return (
    <Box
      sx={(t) => ({
        flex: 'none', width: 115, height: 80, p: '12px', borderRadius: '16px', border: '1.5px solid var(--lib-border)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'var(--lib-text)',
        bgcolor: t.palette.mode === 'dark' ? tint(color, 16) : bg,
      })}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        {Icon ? <Icon aria-hidden sx={{ fontSize: 28, color }} /> : <Box />}
        <Typography sx={{ fontWeight: 700, fontSize: 20, lineHeight: '24px', fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
      </Stack>
      <Typography noWrap sx={{ fontSize: 15, lineHeight: '19px', letterSpacing: LIB_TRACKING }}>{label}</Typography>
    </Box>
  );
}

function LibOverview({ f }) {
  const { tier } = tierFor(f.score);
  const stats = [
    { icon: EmojiEventsRoundedIcon, value: f.rank ? `#${f.rank}` : '–', label: 'Rank', color: '#3F8CE8', bg: '#EDF2F9' },
    { icon: BoltRoundedIcon, value: f.score.toLocaleString(), label: 'Points', color: tier.color, bg: tint(tier.color, 14) },
    { icon: CheckCircleRoundedIcon, value: f.solved, label: 'Solved', color: '#22A06B', bg: '#EAF6EE' },
    { icon: LocalFireDepartmentRoundedIcon, value: f.streak || 0, label: 'Streak', color: '#F09A2E', bg: '#FFF2E3' },
  ];
  const levels = [
    { value: f.easy, label: 'Easy', color: '#22A06B', bg: '#EAF6EE' },
    { value: f.medium, label: 'Medium', color: '#F09A2E', bg: '#FFF2E3' },
    { value: f.hard, label: 'Hard', color: '#EF5B5B', bg: '#FDECEB' },
    { value: f.aptitude, label: 'Aptitude', color: APT_COLOR, bg: '#F1EBFD' },
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
        <Typography component="h1" noWrap sx={{ mt: 1.5, fontWeight: 700, fontSize: 26, lineHeight: '32px' }}>{f.name}</Typography>
        <Typography sx={{ fontSize: 17, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>
          @{f.handle}{since ? ` · Friends since ${since}` : ''}
        </Typography>
        <Stack direction="row" useFlexGap sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, height: 34, px: '14px', borderRadius: 999, bgcolor: tint(tier.color, 16), color: tier.color, fontSize: 15, letterSpacing: LIB_TRACKING }}>
            <WorkspacePremiumRoundedIcon aria-hidden sx={{ fontSize: 18 }} /> {tier.name}
          </Box>
          {f.company && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', height: 34, px: '14px', borderRadius: 999, bgcolor: 'var(--lib-chip)', color: 'var(--lib-chip-text)', fontSize: 15, letterSpacing: LIB_TRACKING }}>
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

      <Button fullWidth onClick={onRemove} sx={{ ...libTintBtnSx, mt: 4, bgcolor: tint('#EF5B5B', 12), color: 'error.main', '&:hover': { bgcolor: tint('#EF5B5B', 20) } }}>
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
      sx={(t) => ({ flex: 1, height: 36, borderRadius: 999, fontFamily: 'inherit', fontWeight: 800, fontSize: 14, bgcolor: tab === key ? t.palette.text.primary : 'transparent', color: tab === key ? t.palette.background.paper : t.palette.text.secondary })}
    >
      {label}
    </ButtonBase>
  );

  const action = (icon, label, onClick, color = 'primary', disabled = false) => (
    <Tooltip title={label}>
      <span>
        <Button aria-label={label} onClick={onClick} disabled={disabled} sx={(t) => ({ ...tonal(color, 48)(t), borderRadius: '14px', minWidth: 0, p: 0 })}>
          {icon}
        </Button>
      </span>
    </Tooltip>
  );

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <Box sx={(t) => ({ position: 'relative', pt: 3, px: 2.5, pb: 2, textAlign: 'center', background: `linear-gradient(180deg, ${tint(tier.color, 14)}, transparent 150px)` })}>
        <IconButton aria-label="Close" onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}><CloseRoundedIcon /></IconButton>
        <PersonAvatar person={f} size={80} ring={tier.color} online={online} />
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', mt: 1.25 }}>{f.name}</Typography>
        <Typography variant="body2" color="text.secondary">@{f.handle}</Typography>

        <Stack direction="row" spacing={0.75} useFlexGap sx={{ justifyContent: 'center', flexWrap: 'wrap', mt: 1.25 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.35, borderRadius: 999, bgcolor: tint(tier.color, 16), color: tier.color, fontWeight: 700, fontSize: 13 }}>
            <WorkspacePremiumRoundedIcon sx={{ fontSize: 16 }} /> {tier.name}
          </Box>
          {f.company && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.35, borderRadius: 999, bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 600, fontSize: 13 }}>
              <BusinessRoundedIcon sx={{ fontSize: 16 }} /> {f.company}
            </Box>
          )}
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.35, borderRadius: 999, bgcolor: 'action.hover', color: act.live ? 'success.main' : 'text.secondary', fontWeight: 700, fontSize: 13 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: act.live ? '#22C55E' : 'text.disabled' }} />
            {act.text}
          </Box>
        </Stack>

        {/* quick actions */}
        <Stack direction="row" spacing={1.25} sx={{ justifyContent: 'center', mt: 2 }}>
          {action(<ChatRoundedIcon />, 'Chat', onChat)}
          {action(<LaptopMacRoundedIcon />, 'Code together', onCodeTogether, 'success')}
          {action(<NotificationsActiveRoundedIcon />, canNudge ? 'Nudge — remind about streak' : 'Already practised today', onNudge, 'warning', !canNudge || nudging)}
        </Stack>

        <Stack direction="row" sx={(t) => ({ mt: 2, p: 0.5, borderRadius: 999, border: `1px solid ${t.palette.divider}` })}>
          {pill('overview', 'Overview')}
          {pill('compare', 'You vs them')}
        </Stack>

        {tab === 'overview' ? <Overview f={f} /> : <Compare friend={f} />}

        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2.25 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'text.secondary' }}>
            <PeopleAltRoundedIcon sx={{ fontSize: 18 }} />
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
