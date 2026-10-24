import { useCallback, useMemo, useState } from 'react';
import { Box, ButtonBase, Skeleton, Stack, Tooltip, Typography, alpha } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import { WS } from '../workspace/wsTokens';
import { wsSurface } from '../workspace/workspaceTheme';
import { WsIconButton } from '../workspace/wsUi';
import { FLAME, PersonAvatar, mono, statusInfo } from './friendsUi';

// ---- small helpers -------------------------------------------------------------------------

// WhatsApp-style time for the chat list: clock today, "Yesterday", weekday, then date.
export function shortTime(iso) {
  const d = new Date(iso);
  const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(new Date()) - day(d)) / 86400000);
  if (diff <= 0) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString(undefined, { weekday: 'short' });
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function previewOf(last, myId) {
  if (!last) return '';
  if (last.kind === 'room') return last.from === myId ? 'You invited to code together' : 'Invited you to code together';
  if (last.kind === 'nudge') return last.from === myId ? 'You sent a streak nudge' : 'Sent you a streak nudge';
  return last.text;
}

// Starred friends stay on top. Stored per user in this browser only.
export function useFavourites(userId) {
  const key = `jc-fav-friends:${userId}`;
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  });
  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  }, [key]);
  const favs = useMemo(() => new Set(ids), [ids]);
  return { favs, toggle };
}

// ---- header pieces -------------------------------------------------------------------------

// Friends (people icon) <-> Global players (globe icon)
export function ScopeSwitch({ value, onChange }) {
  const items = [['friends', 'My friends', <PeopleAltRoundedIcon key="f" />], ['global', 'Global players', <PublicRoundedIcon key="g" />]];
  return (
    <Stack direction="row" role="tablist" sx={(t) => ({ p: '2px', gap: '2px', borderRadius: `${WS.radius}px`, bgcolor: wsSurface(t).raised })}>
      {items.map(([key, label, icon]) => {
        const on = value === key;
        return (
          <Tooltip key={key} title={label}>
            <ButtonBase
              role="tab"
              aria-selected={on}
              aria-label={label}
              onClick={() => onChange(key)}
              sx={(t) => ({
                width: 34, height: 28, borderRadius: `${WS.radius - 2}px`,
                color: on ? t.palette.primary.main : t.palette.text.secondary,
                bgcolor: on ? t.palette.background.paper : 'transparent',
                boxShadow: on ? '0 1px 2px rgba(0,0,0,0.18)' : 'none',
                '& svg': { fontSize: 18 },
                '&:hover': { color: on ? t.palette.primary.main : t.palette.text.primary },
              })}
            >
              {icon}
            </ButtonBase>
          </Tooltip>
        );
      })}
    </Stack>
  );
}

// Count tile with a soft gradient. Only the tile is tinted, never the whole page.
export function StatCard({ icon, label, hint, value, color, active, onClick }) {
  return (
    <Tooltip title={hint}>
      <ButtonBase
        onClick={onClick}
        aria-pressed={active}
        aria-label={`${hint}: ${value}`}
        sx={{
          flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 0.1, minWidth: 0, height: 52, px: 1, borderRadius: '10px', textAlign: 'left',
          background: `linear-gradient(135deg, ${alpha(color, 0.2)}, ${alpha(color, 0.04)})`,
          border: `1px solid ${alpha(color, active ? 0.75 : 0.22)}`,
          transition: 'border-color .15s, transform .15s',
          '&:hover': { borderColor: alpha(color, 0.6) },
          '&:active': { transform: 'scale(0.98)' },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.6} sx={{ color }}>
          <Box sx={{ display: 'inline-flex', '& svg': { fontSize: 15 } }}>{icon}</Box>
          <Typography sx={{ fontWeight: 800, fontSize: 17, lineHeight: 1, color: 'text.primary', ...mono }}>{value}</Typography>
        </Stack>
        <Typography noWrap sx={{ fontSize: 10.5, fontWeight: 600, color: 'text.secondary', lineHeight: 1.2, width: '100%' }}>{label}</Typography>
      </ButtonBase>
    </Tooltip>
  );
}

export function FilterChip({ label, count, active, onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={active}
      sx={(t) => ({
        flexShrink: 0, height: 26, px: 1.1, gap: 0.5, borderRadius: 13, fontSize: 12, fontWeight: 600,
        color: active ? t.palette.primary.main : t.palette.text.secondary,
        bgcolor: active ? alpha(t.palette.primary.main, 0.14) : wsSurface(t).raised,
        '&:hover': { color: active ? t.palette.primary.main : t.palette.text.primary },
      })}
    >
      {label}
      {count > 0 && <Box component="span" sx={{ ...mono, fontSize: 11, opacity: 0.8 }}>{count}</Box>}
    </ButtonBase>
  );
}

export function SectionLabel({ children, right }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, pt: 1.25, pb: 0.5 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'text.secondary' }}>{children}</Typography>
      {right}
    </Stack>
  );
}

export function EmptyNote({ icon, title, children }) {
  return (
    <Stack alignItems="center" spacing={0.5} sx={{ py: 3, px: 3, textAlign: 'center', color: 'text.secondary', '& > svg': { fontSize: 30, opacity: 0.7, mb: 0.5 } }}>
      {icon}
      {title && <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary' }}>{title}</Typography>}
      <Typography variant="body2" sx={{ fontSize: 12.5 }}>{children}</Typography>
    </Stack>
  );
}

export function SkeletonRows({ count = 6 }) {
  return Array.from({ length: count }, (_, i) => (
    <Stack key={i} direction="row" spacing={1.25} alignItems="center" sx={{ px: 2, py: 1 }}>
      <Skeleton variant="circular" width={40} height={40} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width={`${40 + ((i * 17) % 35)}%`} />
        <Skeleton variant="text" width="70%" />
      </Box>
    </Stack>
  ));
}

// ---- rows ----------------------------------------------------------------------------------

const miniBtn = { width: 28, height: 28 };

// One friend, WhatsApp chat-list style: avatar, name + time, last message + unread badge.
// Hover (desktop) reveals quick-action icons; on touch screens the same actions live in the chat header.
export function FriendRow({ f, last, myId, online, unread, selected, fav, canNudge, nudging, coding, onOpen, onFav, onNudge, onCode, onRemove }) {
  const st = statusInfo(f, online);
  const mine = last && last.from === myId;
  const preview = last ? previewOf(last, myId) : st.text;
  return (
    <Box
      data-fid={f.userId}
      sx={(t) => ({
        position: 'relative', mx: 0.75, borderRadius: `${WS.radius}px`,
        bgcolor: selected ? alpha(t.palette.primary.main, 0.12) : 'transparent',
        '&:hover': { bgcolor: selected ? alpha(t.palette.primary.main, 0.14) : alpha(t.palette.text.primary, 0.05) },
        '&:hover .row-actions, &:focus-within .row-actions': { opacity: 1, pointerEvents: 'auto' },
      })}
    >
      <ButtonBase
        onClick={onOpen}
        aria-pressed={selected}
        aria-label={`Chat with ${f.name}${unread ? `, ${unread} unread` : ''}`}
        sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1.25, px: 1, py: 0.9, textAlign: 'left', borderRadius: `${WS.radius}px`, fontFamily: 'inherit' }}
      >
        <PersonAvatar person={f} size={40} online={online} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography noWrap sx={{ fontWeight: unread ? 700 : 600, fontSize: 13.5, lineHeight: 1.3, flex: 1, minWidth: 0 }}>{f.name}</Typography>
            {fav && <StarRoundedIcon sx={{ fontSize: 13, color: '#F59E0B', flexShrink: 0 }} />}
            {last && <Typography sx={{ fontSize: 11, flexShrink: 0, fontWeight: unread ? 700 : 400, color: unread ? 'primary.main' : 'text.disabled' }}>{shortTime(last.at)}</Typography>}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.15 }}>
            {mine && last.kind === 'text' && (last.read ? <DoneAllRoundedIcon sx={{ fontSize: 14, color: 'primary.main', flexShrink: 0 }} /> : <DoneRoundedIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />)}
            <Typography noWrap sx={{ fontSize: 12.5, flex: 1, minWidth: 0, color: !last && st.live ? 'success.main' : unread ? 'text.primary' : 'text.secondary', fontWeight: unread ? 600 : 400 }}>{preview}</Typography>
            {unread > 0 && (
              <Box component="span" aria-hidden sx={{ minWidth: 18, height: 18, px: 0.6, borderRadius: 9, bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{unread > 99 ? '99+' : unread}</Box>
            )}
          </Stack>
        </Box>
      </ButtonBase>
      <Stack
        className="row-actions"
        direction="row"
        spacing={0.25}
        sx={(t) => ({
          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', p: 0.25, borderRadius: `${WS.radius}px`,
          bgcolor: t.palette.background.paper, boxShadow: `0 0 0 1px ${t.palette.divider}`,
          opacity: 0, pointerEvents: 'none', transition: 'opacity .12s',
          '@media (hover: none)': { display: 'none' },
        })}
      >
        <WsIconButton title={fav ? 'Remove from favourites' : 'Add to favourites'} onClick={onFav} sx={miniBtn}>
          {fav ? <StarRoundedIcon sx={{ color: '#F59E0B' }} /> : <StarBorderRoundedIcon />}
        </WsIconButton>
        {canNudge && (
          <WsIconButton title="Nudge: remind about streak" disabled={nudging} onClick={onNudge} sx={{ ...miniBtn, color: FLAME }}>
            <LocalFireDepartmentRoundedIcon />
          </WsIconButton>
        )}
        <WsIconButton title="Code together" disabled={coding} onClick={onCode} sx={miniBtn}><LaptopMacRoundedIcon /></WsIconButton>
        <WsIconButton title="Remove friend" onClick={onRemove} sx={{ ...miniBtn, '&:hover': { color: 'error.main' } }}><PersonRemoveRoundedIcon /></WsIconButton>
      </Stack>
    </Box>
  );
}

// A person who is not (yet) a friend: global list, search results, requests. `action` = icon buttons / Invite button.
export function PersonRow({ person, rank, sub, action }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.1} sx={{ px: 2, py: 0.85, minHeight: 56 }}>
      {rank != null && (
        <Typography sx={{ width: 24, flexShrink: 0, textAlign: 'center', fontSize: 12, fontWeight: 700, color: rank <= 3 ? '#F59E0B' : 'text.disabled', ...mono }}>{rank}</Typography>
      )}
      <PersonAvatar person={person} size={36} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.3 }}>{person.name}</Typography>
        <Typography noWrap sx={{ fontSize: 12, color: 'text.secondary' }}>{sub || `@${person.handle}`}</Typography>
      </Box>
      {action}
    </Stack>
  );
}
