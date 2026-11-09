import { Alert, Box, Button, ButtonBase, Skeleton, Stack, Typography } from '@mui/material';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import { LIB_TRACKING, LibraryFont, libChipSx, libSectionTitleSx, libTintBtnSx } from '../../dashboard/components/libraryStyle';
import { PersonAvatar, statusInfo } from '../friendsUi';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { acceptFriendInvite } from '../friendsSlice';
import { extractErrorMessage } from '../../../api/apiClient';
import { friendsApi } from '../../../api/friendsApi';
import { previewOf, shortTime } from '../friendsKit';
import { useEffect, useState } from 'react';
import { ACCENT, SUCCESS, scrollRow, solidBtn } from './mobileFriendsStyle';

// Page padding shared by the phone Friends screens.
export function MobileShell({ children }) {
  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>{children}</Box>
    </LibraryFont>
  );
}

export function SectionTitle({ children, first = false }) {
  return (
    <Typography component="h2" sx={{ ...libSectionTitleSx, mb: 1.5, mt: first ? 0 : 4 }}>
      {children}
    </Typography>
  );
}

export function Empty({ title, children, action }) {
  return (
    <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold }}>{title}</Typography>
      <Typography variant="body2" color="var(--lib-muted)" sx={{ mt: 0.5, mb: action ? 2 : 0 }}>
        {children}
      </Typography>
      {action}
    </Box>
  );
}

export function SkeletonRows({ count = 6 }) {
  return Array.from({ length: count }, (_, i) => (
    <Stack key={i} direction="row" sx={{ alignItems: 'center', gap: 1.5, py: 1.5, px: 0.5, borderBottom: '1px solid', borderColor: 'var(--lib-divider)' }}>
      <Skeleton variant="circular" width={48} height={48} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width={`${40 + ((i * 17) % 35)}%`} />
        <Skeleton variant="text" width="65%" />
      </Box>
    </Stack>
  ));
}

export function Pills({ label, options, value, onChange, role = 'tab' }) {
  return (
    <Box sx={scrollRow} role={role === 'tab' ? 'tablist' : 'group'} aria-label={label}>
      {options.map(([v, text, dot]) => {
        const on = v === value;
        return (
          <ButtonBase
            key={v}
            role={role === 'tab' ? 'tab' : undefined}
            aria-selected={role === 'tab' ? on : undefined}
            aria-pressed={role === 'tab' ? undefined : on}
            onClick={() => onChange(v)}
            sx={libChipSx(on)}
          >
            {dot && <Box aria-hidden sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLOR_PALETTE.green[500] }} />}
            {text}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

// ---------- rows ----------

export function FriendRow({ f, last, myId, online, unread, fav, onOpen }) {
  const st = statusInfo(f, online);
  const mine = last && last.from === myId;
  const preview = last ? previewOf(last, myId) : st.text;
  return (
    <Box data-fid={f.userId} sx={{ borderBottom: '1px solid', borderColor: 'var(--lib-divider)', '&:last-of-type': { borderBottom: 'none' } }}>
      <ButtonBase
        onClick={onOpen}
        aria-label={`Chat with ${f.name}${unread ? `, ${unread} unread` : ''}`}
        sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, py: 1.5, px: 0.5, textAlign: 'left', fontFamily: 'inherit', color: 'inherit' }}
      >
        <PersonAvatar person={f} size={48} online={online} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <Typography noWrap sx={{ fontWeight: unread ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING, flex: 1, minWidth: 0 }}>
              {f.name}
            </Typography>
            {fav && <StarRoundedIcon aria-label="Favourite" sx={{ fontSize: FONT_SIZES.title, color: 'warning.main', flexShrink: 0 }} />}
            {last && (
              <Typography sx={{ flexShrink: 0, fontSize: FONT_SIZES.caption, fontWeight: unread ? FONT_WEIGHTS.bold : FONT_WEIGHTS.regular, color: unread ? ACCENT : 'var(--lib-muted)' }}>{shortTime(last.at)}</Typography>
            )}
          </Stack>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            {mine && last.kind === 'text' && (last.read ? <DoneAllRoundedIcon sx={{ fontSize: FONT_SIZES.title, color: ACCENT, flexShrink: 0 }} /> : <DoneRoundedIcon sx={{ fontSize: FONT_SIZES.title, color: 'var(--lib-muted)', flexShrink: 0 }} />)}
            <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: FONT_SIZES.body, letterSpacing: LIB_TRACKING, fontWeight: unread ? FONT_WEIGHTS.medium : FONT_WEIGHTS.regular, color: !last && st.live ? SUCCESS : unread ? 'var(--lib-text)' : 'var(--lib-muted)' }}>
              {preview}
            </Typography>
            {unread > 0 && (
              <Typography component="span" aria-hidden sx={{ flexShrink: 0, minWidth: 22, height: 22, px: 1, borderRadius: RADII_PX.pill, display: 'grid', placeItems: 'center', bgcolor: ACCENT, color: COLOR_PALETTE.white, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold }}>
                {unread > 99 ? '99+' : unread}
              </Typography>
            )}
          </Stack>
        </Box>
      </ButtonBase>
    </Box>
  );
}

export function PersonRow({ person, rank, sub, action }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, py: 1.5, px: 0.5, minHeight: 68, borderBottom: '1px solid', borderColor: 'var(--lib-divider)', '&:last-of-type': { borderBottom: 'none' } }}>
      {rank != null && (
        <Typography sx={{ width: 28, flexShrink: 0, textAlign: 'center', fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.bold, fontVariantNumeric: 'tabular-nums', color: rank <= 3 ? COLOR_PALETTE.amber[500] : 'var(--lib-muted)' }}>{rank}</Typography>
      )}
      <PersonAvatar person={person} size={44} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>
          {person.name}
        </Typography>
        <Typography noWrap color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING }}>
          {sub || `@${person.handle}`}
        </Typography>
      </Box>
      {action}
    </Stack>
  );
}

// ---------- invite link banner (?invite=handle) ----------

export function InviteBanner({ handle, onDone, run, busy }) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true });
    friendsApi
      .previewInvite(handle)
      .then(({ data }) => !cancelled && setState({ loading: false, ...data.data }))
      .catch((err) => !cancelled && setState({ loading: false, error: extractErrorMessage(err) }));
    return () => {
      cancelled = true;
    };
  }, [handle]);

  if (state.loading) return <Skeleton variant="rounded" height={120} sx={{ mt: 1.5, borderRadius: RADII_PX.card }} />;
  if (state.error) return <Alert severity="warning" onClose={onDone} sx={{ mt: 1.5 }}>{state.error}</Alert>;
  if (state.isSelf) return <Alert severity="info" onClose={onDone} sx={{ mt: 1.5 }}>This is your own invite link.</Alert>;
  if (state.relation === 'friends') return <Alert severity="success" onClose={onDone} sx={{ mt: 1.5 }}>You and @{state.user.handle} are already friends.</Alert>;

  const accept = async () => {
    if (await run('invite', acceptFriendInvite(handle), `You and @${handle} are now friends`)) onDone();
  };

  return (
    <Box
      sx={{ mt: 1.5, p: 2, borderRadius: RADII_PX.card, bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)' }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
        <PersonAvatar person={state.user} size={48} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>
            {state.user.name}
          </Typography>
          <Typography noWrap color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.body, letterSpacing: LIB_TRACKING }}>
            Invited you to be friends
          </Typography>
        </Box>
      </Stack>
      <Button onClick={accept} disabled={busy === 'invite'} fullWidth disableElevation variant="contained" sx={{ ...solidBtn, mt: 1.5 }}>
        Accept invite
      </Button>
      <Button onClick={onDone} fullWidth sx={{ ...libTintBtnSx, mt: 0.5, bgcolor: 'transparent', color: ACCENT, '&:hover': { bgcolor: 'transparent' } }}>
        Not now
      </Button>
    </Box>
  );
}

// ---------- the page ----------
