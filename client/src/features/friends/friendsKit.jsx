import { useCallback, useMemo, useState } from 'react';
import { Box, ButtonBase, Skeleton, Stack, Tooltip, Typography, alpha } from '@mui/material';
import { keyframes } from '@emotion/react';
import { motion, useReducedMotion } from 'framer-motion';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import { WS } from '../workspace/wsTokens';
import { wsSurface } from '../workspace/workspaceTheme';
import { WsIconButton } from '../workspace/wsUi';
import { FLAME, GREEN, PersonAvatar, mono, statusInfo } from './friendsUi';

// ---- motion --------------------------------------------------------------------------------
// Everything here is switched off for people who prefer reduced motion.

const spin = keyframes`to { transform: rotate(360deg); }`;
const ripple = keyframes`0% { transform: scale(0.72); opacity: 0.55; } 100% { transform: scale(1.5); opacity: 0; }`;
const bob = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); }`;
const pop = keyframes`0% { transform: scale(0.5); } 60% { transform: scale(1.18); } 100% { transform: scale(1); }`;
const livePulse = keyframes`0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); } 70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }`;
const still = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } };

// Fade + rise. `index` staggers a list (capped, so long lists never feel slow).
export function Reveal({ index = 0, children }) {
  const reduce = useReducedMotion();
  if (reduce) return <div>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut', delay: Math.min(index, 9) * 0.035 }}
    >
      {children}
    </motion.div>
  );
}

// Soft icon badge with two rippling rings: the illustration used by every empty state.
export function PulseArt({ icon, color, size = 64 }) {
  return (
    <Box sx={(t) => ({ position: 'relative', width: size + 28, height: size + 28, display: 'grid', placeItems: 'center', color: color || t.palette.primary.main })}>
      {[0, 1].map((i) => (
        <Box
          key={i}
          aria-hidden
          sx={{ position: 'absolute', width: size, height: size, borderRadius: '50%', border: '1.5px solid currentColor', opacity: 0, animation: `${ripple} 2.8s ease-out ${i * 1.4}s infinite`, ...still }}
        />
      ))}
      <Box
        sx={{ position: 'relative', width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'color-mix(in srgb, currentColor 14%, transparent)', animation: `${bob} 3.2s ease-in-out infinite`, ...still, '& svg': { fontSize: size * 0.44 } }}
      >
        {icon}
      </Box>
    </Box>
  );
}

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

// "12 friends · 3 online" with a live dot.
export function LiveLine({ text, online }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.25, minHeight: 18 }}>
      {online > 0 && <Box component="span" aria-hidden sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: GREEN, flexShrink: 0, animation: `${livePulse} 2s ease-out infinite`, ...still }} />}
      <Typography noWrap sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.3 }}>{text}</Typography>
    </Stack>
  );
}

// Friends / Requests / Sent. Each tab has its own icon, full name on hover, and a count badge.
//   items = [{ key, label, title, icon, count, badge }]   badge = colour for an alert-style count, else a plain number
//   value = key of the active tab, or '' when another screen (find players, activity) is open
export function TabBar({ items, value, onChange }) {
  return (
    <Stack direction="row" role="tablist" sx={(t) => ({ p: '3px', gap: '2px', borderRadius: '12px', bgcolor: wsSurface(t).raised })}>
      {items.map(({ key, label, title, icon, count, badge }) => {
        const on = value === key;
        return (
          <Tooltip key={key} title={title}>
            <ButtonBase
              role="tab"
              aria-selected={on}
              aria-label={count ? `${title}: ${count}` : title}
              onClick={() => onChange(key)}
              sx={(t) => ({
                position: 'relative', flex: 1, minWidth: 0, height: 36, px: 0.5, borderRadius: '9px', fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                color: on ? t.palette.text.primary : t.palette.text.secondary, transition: 'color .2s',
                '&:hover': { color: t.palette.text.primary },
                '& .tab-pill': { backgroundColor: t.palette.background.paper, boxShadow: t.palette.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 3px rgba(15,23,42,0.14)' },
              })}
            >
              {on && <motion.span className="tab-pill" layoutId="friends-tab-pill" transition={{ type: 'spring', stiffness: 520, damping: 40 }} style={{ position: 'absolute', inset: 0, borderRadius: 9 }} />}
              <Box component="span" sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 0.6, minWidth: 0, '& svg': { fontSize: 17, color: on ? 'primary.main' : 'inherit', transition: 'color .2s' } }}>
                {icon}
                <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</Box>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 620, damping: 16 }}
                    style={badge ? { minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9, background: badge, color: '#fff', fontSize: 11, fontWeight: 800, display: 'inline-grid', placeItems: 'center', lineHeight: 1 } : { fontSize: 11.5, fontWeight: 700, opacity: 0.75, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {count > 99 ? '99+' : count}
                  </motion.span>
                )}
              </Box>
            </ButtonBase>
          </Tooltip>
        );
      })}
    </Stack>
  );
}

export function FilterChip({ label, count, active, onClick, dot }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={active}
      sx={(t) => ({
        flexShrink: 0, height: 30, px: 1.5, gap: 0.75, borderRadius: 15, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700,
        color: active ? t.palette.primary.main : t.palette.text.secondary,
        bgcolor: active ? alpha(t.palette.primary.main, 0.14) : wsSurface(t).raised,
        transition: 'background-color .2s, color .2s, transform .12s',
        '&:hover': { color: active ? t.palette.primary.main : t.palette.text.primary },
        '&:active': { transform: 'scale(0.96)' },
      })}
    >
      {dot && <Box component="span" aria-hidden sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: GREEN }} />}
      {label}
      {count > 0 && <Box component="span" sx={{ ...mono, fontSize: 11.5, opacity: 0.8 }}>{count}</Box>}
    </ButtonBase>
  );
}

export function SectionLabel({ children, right }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, pt: 2, pb: 0.75 }}>
      <Typography sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'text.secondary' }}>{children}</Typography>
      {right}
    </Stack>
  );
}

export function EmptyNote({ icon, title, children }) {
  return (
    <Reveal>
      <Stack alignItems="center" spacing={0.5} sx={{ py: 4, px: 3, textAlign: 'center', color: 'text.secondary' }}>
        <PulseArt icon={icon} />
        {title && <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: 'text.primary', pt: 0.5 }}>{title}</Typography>}
        <Typography variant="body2" sx={{ fontSize: 13, maxWidth: 260, lineHeight: 1.5 }}>{children}</Typography>
      </Stack>
    </Reveal>
  );
}

export function SkeletonRows({ count = 6 }) {
  return Array.from({ length: count }, (_, i) => (
    <Stack key={i} direction="row" spacing={1.5} alignItems="center" sx={{ px: 2, py: 1.1 }}>
      <Skeleton variant="circular" width={44} height={44} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width={`${40 + ((i * 17) % 35)}%`} />
        <Skeleton variant="text" width="70%" />
      </Box>
    </Stack>
  ));
}

// ---- rows ----------------------------------------------------------------------------------

const miniBtn = { width: 28, height: 28 };

// Friends who are online right now: a story-style strip with a slowly turning ring.
export function OnlineRail({ people, onOpen }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ px: 2, pt: 0.5, pb: 1.5, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
      {people.map((p, i) => (
        <Reveal key={p.userId} index={i}>
          <ButtonBase onClick={() => onOpen(p.userId)} aria-label={`Chat with ${p.name}, online`} sx={{ flexDirection: 'column', gap: 0.6, width: 56, borderRadius: '10px', fontFamily: 'inherit', transition: 'transform .12s', '&:active': { transform: 'scale(0.95)' } }}>
            <Box sx={{ position: 'relative', width: 52, height: 52 }}>
              <Box aria-hidden sx={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(${GREEN}, #38BDF8, ${GREEN})`, animation: `${spin} 4s linear infinite`, ...still }} />
              <Box sx={(t) => ({ position: 'absolute', inset: '3px', borderRadius: '50%', bgcolor: t.palette.background.paper, display: 'grid', placeItems: 'center' })}>
                <PersonAvatar person={p} size={40} />
              </Box>
            </Box>
            <Typography noWrap sx={{ fontSize: 11.5, fontWeight: 600, color: 'text.secondary', width: '100%', textAlign: 'center' }}>{p.name.split(' ')[0]}</Typography>
          </ButtonBase>
        </Reveal>
      ))}
    </Stack>
  );
}

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
        position: 'relative', mx: 1, mb: 0.25, borderRadius: '12px',
        bgcolor: selected ? alpha(t.palette.primary.main, 0.12) : 'transparent',
        transition: 'background-color .18s',
        '&::before': { content: '""', position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 3, borderRadius: 2, bgcolor: 'primary.main', transform: selected ? 'scaleY(1)' : 'scaleY(0)', transition: 'transform .2s' },
        '&:hover': { bgcolor: selected ? alpha(t.palette.primary.main, 0.14) : alpha(t.palette.text.primary, 0.05) },
        '&:hover .row-actions, &:focus-within .row-actions': { opacity: 1, pointerEvents: 'auto' },
      })}
    >
      <ButtonBase
        onClick={onOpen}
        aria-pressed={selected}
        aria-label={`Chat with ${f.name}${unread ? `, ${unread} unread` : ''}`}
        sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1.5, px: 1.25, py: 1.1, textAlign: 'left', borderRadius: '12px', fontFamily: 'inherit' }}
      >
        <PersonAvatar person={f} size={44} online={online} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography noWrap sx={{ fontWeight: unread ? 700 : 600, fontSize: 14, lineHeight: 1.35, flex: 1, minWidth: 0 }}>{f.name}</Typography>
            {fav && <StarRoundedIcon sx={{ fontSize: 14, color: '#F59E0B', flexShrink: 0 }} />}
            {last && <Typography sx={{ fontSize: 11.5, flexShrink: 0, fontWeight: unread ? 700 : 400, color: unread ? 'primary.main' : 'text.disabled' }}>{shortTime(last.at)}</Typography>}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
            {mine && last.kind === 'text' && (last.read ? <DoneAllRoundedIcon sx={{ fontSize: 15, color: 'primary.main', flexShrink: 0 }} /> : <DoneRoundedIcon sx={{ fontSize: 15, color: 'text.disabled', flexShrink: 0 }} />)}
            <Typography noWrap sx={{ fontSize: 13, flex: 1, minWidth: 0, color: !last && st.live ? 'success.main' : unread ? 'text.primary' : 'text.secondary', fontWeight: unread ? 600 : 400 }}>{preview}</Typography>
            {unread > 0 && (
              <Box
                key={unread}
                component="span"
                aria-hidden
                sx={{ minWidth: 20, height: 20, px: 0.75, borderRadius: '10px', bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: 11.5, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0, animation: `${pop} .35s ease-out`, ...still }}
              >
                {unread > 99 ? '99+' : unread}
              </Box>
            )}
          </Stack>
        </Box>
      </ButtonBase>
      <Stack
        className="row-actions"
        direction="row"
        spacing={0.25}
        sx={(t) => ({
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', p: 0.25, borderRadius: `${WS.radius + 2}px`,
          bgcolor: t.palette.background.paper, boxShadow: `0 0 0 1px ${t.palette.divider}`,
          opacity: 0, pointerEvents: 'none', transition: 'opacity .15s',
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

// A person who is not (yet) a friend: find players, search results, requests. `action` = icon buttons / Add friend button.
export function PersonRow({ person, rank, sub, action }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={(t) => ({ mx: 1, mb: 0.25, px: 1.25, py: 1, minHeight: 64, borderRadius: '12px', transition: 'background-color .18s', '&:hover': { bgcolor: alpha(t.palette.text.primary, 0.04) } })}
    >
      {rank != null && (
        <Typography sx={{ width: 24, flexShrink: 0, textAlign: 'center', fontSize: 12.5, fontWeight: 700, color: rank <= 3 ? '#F59E0B' : 'text.disabled', ...mono }}>{rank}</Typography>
      )}
      <PersonAvatar person={person} size={42} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.35 }}>{person.name}</Typography>
        <Typography noWrap sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.1 }}>{sub || `@${person.handle}`}</Typography>
      </Box>
      {action}
    </Stack>
  );
}
