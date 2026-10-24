import { Avatar, Box, ButtonBase, Dialog, InputBase, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import { mono, statusInfo } from './friendsUi';
import { previewOf, shortTime } from './friendsKit';
import { SERIF } from './friendsTheme';

// Small modules for the Friends "room". Every piece is raised (stands out of the floor) or pressed
// (sits into it), in the same two colours.

const ring = keyframes`0%{box-shadow:0 0 0 0 rgba(180,71,107,0.55)}70%{box-shadow:0 0 0 7px rgba(180,71,107,0)}100%{box-shadow:0 0 0 0 rgba(180,71,107,0)}`;
const calm = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } };

export const moduleSx = (T, extra) => ({ borderRadius: '28px', bgcolor: T.base, boxShadow: T.raised, border: T.border, ...extra });

// Round neumorphic icon button. `accent` = the one main action, `on` = a toggle that is switched on.
export function RoundBtn({ T, title, onClick, accent = false, on = false, size = 42, disabled = false, sx, children }) {
  return (
    <Tooltip title={title}>
      <span>
        <ButtonBase
          onClick={onClick} disabled={disabled} aria-label={title} aria-pressed={on || undefined}
          sx={{
            width: size, height: size, flexShrink: 0, borderRadius: '50%', color: accent ? T.onAccent : on ? T.accent : T.muted,
            background: accent ? T.accentGrad : T.base, boxShadow: accent ? T.accentGlow : on ? T.pressed : T.raisedSm, opacity: disabled ? 0.5 : 1,
            transition: 'box-shadow .18s, transform .15s', '& svg': { fontSize: size * 0.48 },
            '&:hover': { boxShadow: accent ? T.accentGlow : T.pressed, color: accent ? T.onAccent : T.accent }, '&:active': { transform: 'scale(0.95)' },
            ...sx,
          }}
        >
          {children}
        </ButtonBase>
      </span>
    </Tooltip>
  );
}

// Small text button (Add, Accept, Cancel).
export function PillBtn({ T, onClick, disabled, accent = true, startIcon, children }) {
  return (
    <ButtonBase
      onClick={onClick} disabled={disabled}
      sx={{
        flexShrink: 0, gap: 0.6, height: 36, px: 1.75, borderRadius: 99, fontFamily: 'inherit', fontSize: 13, fontWeight: 800,
        color: accent ? T.onAccent : T.accent, background: accent ? T.accentGrad : T.base, boxShadow: accent ? T.accentGlow : T.raisedSm, opacity: disabled ? 0.55 : 1,
        '& svg': { fontSize: 18 }, '&:active': { transform: 'scale(0.96)' },
      }}
    >
      {startIcon}{children}
    </ButtonBase>
  );
}

// A quiet label for a state, e.g. "Sent" or "Friends".
export function Tag({ T, icon, children }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, height: 32, px: 1.4, borderRadius: 99, fontSize: 12.5, fontWeight: 700, color: T.muted, bgcolor: T.base, boxShadow: T.pressed, flexShrink: 0, '& svg': { fontSize: 15 } }}>
      {icon}{children}
    </Box>
  );
}

// Profile picture. Online friends get a soft rose ring and a pulsing dot.
export function Face({ T, person, size = 46, online = false }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <Box sx={{ p: '3px', borderRadius: '50%', background: online ? T.accentGrad : T.base, boxShadow: online ? 'none' : T.raisedSm }}>
        <Avatar
          src={person.avatarUrl || undefined} alt={person.name}
          sx={{ width: size, height: size, fontSize: size * 0.4, fontWeight: 800, color: T.accent, bgcolor: T.base, border: `2px solid ${T.base}` }}
        >
          {person.name?.[0]?.toUpperCase()}
        </Avatar>
      </Box>
      {online && (
        <Box component="span" aria-label="Online now" sx={{ position: 'absolute', right: 0, bottom: 1, width: 12, height: 12, borderRadius: '50%', background: T.accentGrad, border: `2.5px solid ${T.base}`, boxSizing: 'content-box', animation: `${ring} 2.2s ease-out infinite`, ...calm }} />
      )}
    </Box>
  );
}

// One of the three tiles: Friends, Invites, Sent. The picked tile sinks in and turns rose.
export function SegmentTile({ T, icon, label, value, active, alert, onClick }) {
  return (
    <ButtonBase
      onClick={onClick} aria-pressed={active} aria-label={`${label}: ${value}`}
      sx={{ position: 'relative', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.25, minWidth: 0, p: 1.75, borderRadius: '24px', textAlign: 'left', fontFamily: 'inherit', bgcolor: T.base, boxShadow: active ? T.pressed : T.raised, transition: 'box-shadow .2s', '&:active': { transform: 'scale(0.98)' } }}
    >
      <Box sx={{ width: 34, height: 34, borderRadius: '12px', display: 'grid', placeItems: 'center', color: active ? T.onAccent : T.accent, background: active ? T.accentGrad : T.base, boxShadow: active ? T.accentGlow : T.raisedSm, '& svg': { fontSize: 19 } }}>{icon}</Box>
      {alert && value > 0 && <Box aria-hidden sx={{ position: 'absolute', top: 14, right: 14, width: 9, height: 9, borderRadius: '50%', background: T.accentGrad, animation: `${ring} 2.2s ease-out infinite`, ...calm }} />}
      <Box>
        <Typography sx={[{ fontWeight: 800, fontSize: 26, lineHeight: 1, color: active ? T.accent : T.ink }, mono]}>{value}</Typography>
        <Typography noWrap sx={{ mt: 0.5, fontSize: 12.5, fontWeight: 700, color: T.muted }}>{label}</Typography>
      </Box>
    </ButtonBase>
  );
}

// All / Online: a pressed groove with a raised thumb.
export function SubTabs({ T, value, onChange, options }) {
  return (
    <Box role="tablist" sx={{ display: 'inline-grid', gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`, gap: '4px', p: '4px', borderRadius: 99, bgcolor: T.base, boxShadow: T.pressed }}>
      {options.map(([v, label, count]) => {
        const on = value === v;
        return (
          <ButtonBase
            key={v} role="tab" aria-selected={on} onClick={() => onChange(v)}
            sx={{ gap: 0.75, height: 36, px: 2.25, borderRadius: 99, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, color: on ? T.accent : T.muted, bgcolor: T.base, boxShadow: on ? T.raisedSm : 'none', transition: 'box-shadow .2s, color .2s' }}
          >
            {label}
            <Box component="span" sx={[{ fontSize: 12, px: 0.8, borderRadius: 99, color: on ? T.onAccent : T.muted, background: on ? T.accentGrad : 'transparent' }, mono]}>{count}</Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

export function SearchField({ T, value, onChange, inputRef, placeholder, right }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1, px: 1.75, height: 44, borderRadius: 99, bgcolor: T.base, boxShadow: T.pressed }}>
        <SearchRoundedIcon sx={{ fontSize: 20, color: T.muted }} />
        <InputBase
          inputRef={inputRef} value={value} onChange={(e) => onChange(e.target.value.slice(0, 40))} placeholder={placeholder}
          inputProps={{ 'aria-label': 'Search', autoCapitalize: 'none', autoCorrect: 'off' }}
          sx={{ flex: 1, minWidth: 0, fontSize: 14, color: T.ink, '& input::placeholder': { color: T.muted, opacity: 1 } }}
        />
        {value && (
          <ButtonBase aria-label="Clear search" onClick={() => onChange('')} sx={{ color: T.muted, borderRadius: '50%' }}><CloseRoundedIcon sx={{ fontSize: 19 }} /></ButtonBase>
        )}
      </Box>
      {right}
    </Box>
  );
}

const mini = (T, color) => ({ width: 32, height: 32, borderRadius: '50%', color: color || T.muted, bgcolor: T.base, boxShadow: T.raisedSm, '& svg': { fontSize: 17 }, '&:hover': { boxShadow: T.pressed, color: color || T.accent }, '&.Mui-disabled': { opacity: 0.5 } });

// One friend: a raised card with room around it. Hover shows quick actions.
export function FriendCard({ T, f, last, myId, online, unread, selected, fav, canNudge, nudging, coding, onOpen, onFav, onNudge, onCode, onRemove }) {
  const st = statusInfo(f, online);
  const mine = last && last.from === myId;
  const preview = last ? previewOf(last, myId) : st.text;
  return (
    <Box
      data-fid={f.userId}
      sx={{ position: 'relative', borderRadius: '22px', bgcolor: T.base, boxShadow: selected ? T.pressed : T.raised, transition: 'box-shadow .2s', '&:hover .row-actions, &:focus-within .row-actions': { opacity: 1, pointerEvents: 'auto' }, '&::before': selected ? { content: '""', position: 'absolute', left: 0, top: 18, bottom: 18, width: 4, borderRadius: 4, background: T.accentGrad } : undefined }}
    >
      <ButtonBase
        onClick={onOpen} aria-pressed={selected} aria-label={`Chat with ${f.name}${unread ? `, ${unread} unread` : ''}`}
        sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1.75, px: 2, py: 1.6, textAlign: 'left', borderRadius: '22px', fontFamily: 'inherit', color: T.ink }}
      >
        <Face T={T} person={f} online={online} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.6}>
            <Typography noWrap sx={{ fontWeight: unread ? 800 : 700, fontSize: 15, lineHeight: 1.3, flex: 1, minWidth: 0 }}>{f.name}</Typography>
            {fav && <StarRoundedIcon sx={{ fontSize: 15, color: T.accent, flexShrink: 0 }} />}
            {last && <Typography sx={{ fontSize: 11.5, flexShrink: 0, fontWeight: unread ? 800 : 500, color: unread ? T.accent : T.muted }}>{shortTime(last.at)}</Typography>}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.3 }}>
            {mine && last.kind === 'text' && (last.read ? <DoneAllRoundedIcon sx={{ fontSize: 15, color: T.accent, flexShrink: 0 }} /> : <DoneRoundedIcon sx={{ fontSize: 15, color: T.muted, flexShrink: 0 }} />)}
            <Typography noWrap sx={{ fontSize: 13, flex: 1, minWidth: 0, color: !last && st.live ? T.accent : unread ? T.ink : T.muted, fontWeight: unread || (!last && st.live) ? 700 : 500 }}>{preview}</Typography>
            {unread > 0 && (
              <Box component="span" aria-hidden sx={{ minWidth: 20, height: 20, px: 0.7, borderRadius: 10, background: T.accentGrad, color: T.onAccent, fontSize: 11.5, fontWeight: 800, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{unread > 99 ? '99+' : unread}</Box>
            )}
          </Stack>
        </Box>
      </ButtonBase>
      <Stack
        className="row-actions" direction="row" spacing={0.75}
        sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', p: 0.75, borderRadius: 99, bgcolor: T.base, boxShadow: T.raised, opacity: 0, pointerEvents: 'none', transition: 'opacity .15s', '@media (hover: none)': { display: 'none' } }}
      >
        <Tooltip title={fav ? 'Remove from favourites' : 'Add to favourites'}><ButtonBase aria-label="Favourite" onClick={onFav} sx={mini(T, fav ? T.accent : undefined)}>{fav ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}</ButtonBase></Tooltip>
        {canNudge && <Tooltip title="Nudge: remind about streak"><span><ButtonBase aria-label="Nudge" disabled={nudging} onClick={onNudge} sx={mini(T)}><LocalFireDepartmentRoundedIcon /></ButtonBase></span></Tooltip>}
        <Tooltip title="Code together"><span><ButtonBase aria-label="Code together" disabled={coding} onClick={onCode} sx={mini(T)}><LaptopMacRoundedIcon /></ButtonBase></span></Tooltip>
        <Tooltip title="Remove friend"><ButtonBase aria-label="Remove friend" onClick={onRemove} sx={mini(T)}><PersonRemoveRoundedIcon /></ButtonBase></Tooltip>
      </Stack>
    </Box>
  );
}

// Someone who is not a friend yet (an invite, a sent request, a search result).
export function PersonCard({ T, person, rank, sub, action }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.5, minHeight: 74, borderRadius: '22px', bgcolor: T.base, boxShadow: T.raised }}>
      {rank != null && <Typography sx={[{ width: 24, flexShrink: 0, textAlign: 'center', fontSize: 13, fontWeight: 800, color: rank <= 3 ? T.accent : T.muted }, mono]}>{rank}</Typography>}
      <Face T={T} person={person} size={42} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.3, color: T.ink }}>{person.name}</Typography>
        <Typography noWrap sx={{ fontSize: 12.5, color: T.muted }}>{sub || `@${person.handle}`}</Typography>
      </Box>
      {action}
    </Stack>
  );
}

export function Empty({ T, icon, title, children, action }) {
  return (
    <Stack alignItems="center" spacing={1} sx={{ py: 5, px: 3, textAlign: 'center' }}>
      <Box sx={{ width: 64, height: 64, borderRadius: '22px', display: 'grid', placeItems: 'center', color: T.accent, bgcolor: T.base, boxShadow: T.pressed, '& svg': { fontSize: 30 } }}>{icon}</Box>
      <Typography sx={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19, color: T.ink }}>{title}</Typography>
      <Typography sx={{ fontSize: 13.5, color: T.muted, maxWidth: 260 }}>{children}</Typography>
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  );
}

export function SkeletonCards({ T, count = 5 }) {
  return Array.from({ length: count }, (_, i) => (
    <Stack key={i} direction="row" spacing={1.5} alignItems="center" sx={{ px: 2, py: 1.6, borderRadius: '22px', bgcolor: T.base, boxShadow: T.raised }}>
      <Skeleton variant="circular" width={52} height={52} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width={`${40 + ((i * 17) % 35)}%`} />
        <Skeleton variant="text" width="70%" />
      </Box>
    </Stack>
  ));
}

// Add a friend: search everyone, invite with one tap, or share a link instead.
export function AddFriendDialog({ T, open, onClose, q, setQ, onShare, loading, error, hasMore, onMore, empty, children }) {
  return (
    <Dialog
      open={open} onClose={onClose} fullWidth maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: '30px', bgcolor: T.base, backgroundImage: T.blush, boxShadow: T.raised, border: T.border, overflow: 'hidden', m: 1.5, width: 'calc(100% - 24px)' } } }}
    >
      <Box sx={{ p: 2.5, pb: 1.5, display: 'grid', gap: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography component="h2" sx={{ fontFamily: SERIF, fontWeight: 700, fontSize: 24, lineHeight: 1.2, color: T.ink }}>Add a friend</Typography>
            <Typography sx={{ fontSize: 13, color: T.muted }}>Find someone by name or @handle.</Typography>
          </Box>
          <RoundBtn T={T} title="Share your invite link" onClick={onShare}><IosShareRoundedIcon /></RoundBtn>
          <RoundBtn T={T} title="Close" onClick={onClose}><CloseRoundedIcon /></RoundBtn>
        </Stack>
        <SearchField T={T} value={q} onChange={setQ} placeholder="Search all players" />
      </Box>
      <Box className="autohide-scroll" sx={{ px: 2.5, pb: 2.5, pt: 1, display: 'grid', gap: 1.5, maxHeight: '55vh', overflowY: 'auto', overscrollBehavior: 'contain', alignContent: 'start' }}>
        {children}
        {loading && <SkeletonCards T={T} count={3} />}
        {error && <Typography sx={{ fontSize: 13, color: T.muted }}>{error}</Typography>}
        {empty && <Typography sx={{ py: 3, textAlign: 'center', fontSize: 13.5, color: T.muted }}>No player found. Try another name.</Typography>}
        {hasMore && <Box sx={{ textAlign: 'center' }}><PillBtn T={T} accent={false} onClick={onMore} disabled={loading}>Show more players</PillBtn></Box>}
      </Box>
    </Dialog>
  );
}
