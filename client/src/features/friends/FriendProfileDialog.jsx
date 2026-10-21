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

// One head-to-head row: my number | label | their number, with a split bar. `lower` = smaller wins (rank).
function VsRow({ label, a, b, lower }) {
  const na = a ?? 0;
  const nb = b ?? 0;
  const aWins = lower ? (a != null && (b == null || na < nb)) : na > nb;
  const bWins = lower ? (b != null && (a == null || nb < na)) : nb > na;
  const total = na + nb;
  const share = total > 0 ? (lower ? nb / total : na / total) : 0.5;
  const fmt = (v) => (v == null ? '–' : lower ? `#${v}` : Number(v).toLocaleString());
  return (
    <Box sx={{ py: 0.9 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
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
function Compare({ friend }) {
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
  const verdict = mine === theirs ? 'All square — dead heat!' : mine > theirs ? `You lead ${mine}–${theirs}. Keep going!` : `@${b.handle} leads ${theirs}–${mine}. Catch up!`;

  return (
    <Box sx={{ mt: 2, textAlign: 'left' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack alignItems="center" sx={{ width: 76 }}>
          <PersonAvatar person={{ ...a, name: me?.name || a.name }} size={46} />
          <Typography variant="caption" sx={{ fontWeight: 800 }}>You</Typography>
        </Stack>
        <Box sx={{ textAlign: 'center', flex: 1, px: 1 }}>
          <Typography sx={(t) => ({ fontWeight: 900, fontSize: '1.5rem', ...mono, background: `linear-gradient(90deg, ${t.palette.success.main}, ${t.palette.error.main})`, WebkitBackgroundClip: 'text', color: 'transparent' })}>
            {mine} : {theirs}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{verdict}</Typography>
        </Box>
        <Stack alignItems="center" sx={{ width: 76 }}>
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

        <Stack direction="row" spacing={0.75} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
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
        <Stack direction="row" spacing={1.25} justifyContent="center" sx={{ mt: 2 }}>
          {action(<ChatRoundedIcon />, 'Chat', onChat)}
          {action(<LaptopMacRoundedIcon />, 'Code together', onCodeTogether, 'success')}
          {action(<NotificationsActiveRoundedIcon />, canNudge ? 'Nudge — remind about streak' : 'Already practised today', onNudge, 'warning', !canNudge || nudging)}
        </Stack>

        <Stack direction="row" sx={(t) => ({ mt: 2, p: 0.5, borderRadius: 999, border: `1px solid ${t.palette.divider}` })}>
          {pill('overview', 'Overview')}
          {pill('compare', 'You vs them')}
        </Stack>

        {tab === 'overview' ? <Overview f={f} /> : <Compare friend={f} />}

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2.25 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: 'text.secondary' }}>
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
