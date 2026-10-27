import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, ButtonBase, CircularProgress, Popover, Stack, Tooltip, Typography, alpha } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useSnackbar } from 'notistack';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { fetchFriends } from '../friends/friendsSlice';
import { PersonAvatar } from '../friends/friendsUi';

// "Call a friend" dropdown for a live pair room (opens under the icon, list scrolls inside).
// Every friend (online or offline) has two small buttons:
//  - Send icon     -> in-app invite. Online friends get an Accept / Decline popup right now;
//                     offline friends find it in their JeetCode chat when they are back.
//  - WhatsApp icon -> opens WhatsApp with the room link ready to send.
export default function InviteFriendsDialog({ anchorEl, onClose, roomId, roomTitle }) {
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { friends, online, loaded } = useSelector((s) => s.friends);
  const [busy, setBusy] = useState('');
  const [sent, setSent] = useState({}); // { [userId]: true }

  useEffect(() => {
    if (open && !loaded) dispatch(fetchFriends());
  }, [open, loaded, dispatch]);

  // online first, then A-Z
  const rows = useMemo(
    () => [...friends].sort((a, b) => Number(Boolean(online[b.userId])) - Number(Boolean(online[a.userId])) || (a.name || '').localeCompare(b.name || '')),
    [friends, online]
  );

  const link = `${window.location.origin}/room/${roomId}`;

  const inviteInApp = async (f) => {
    setBusy(f.userId);
    try {
      await friendsApi.roomInvite(f.userId, { roomId, title: roomTitle || undefined });
      setSent((s) => ({ ...s, [f.userId]: true }));
      enqueueSnackbar(online[f.userId] ? `Invite sent to @${f.handle}` : `@${f.handle} is offline. They will see the invite when they are back`, { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(extractErrorMessage(e), { variant: 'error' });
    } finally {
      setBusy('');
    }
  };

  const inviteWhatsApp = (f) => {
    const text = `Hey ${f.name || f.handle}! Come code with me on JeetCode${roomTitle ? ` — ${roomTitle}` : ''}. Join here: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const small = { width: 28, height: 28, borderRadius: '7px' };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { mt: 0.5, width: 'min(300px, calc(100vw - 16px))', maxHeight: 340, display: 'flex', flexDirection: 'column', borderRadius: '12px' } } }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ px: 1.5, pt: 1, pb: 0.5, fontWeight: 800, letterSpacing: 0.4, flexShrink: 0 }}>
        CALL A FRIEND
      </Typography>

      <Box sx={{ overflowY: 'auto', minHeight: 0, pb: 0.5 }}>
        {!loaded ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <CircularProgress size={18} />
          </Box>
        ) : rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, py: 1.5 }}>
            No friends yet. Add friends from the dashboard.
          </Typography>
        ) : (
          rows.map((f) => {
            const isOn = Boolean(online[f.userId]);
            const done = sent[f.userId];
            return (
              <Stack key={f.userId} direction="row" sx={{ alignItems: 'center', gap: 1, px: 1.5, py: 0.6, '&:hover': { bgcolor: 'action.hover' } }}>
                <PersonAvatar person={f} size={28} online={isOn} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.84rem', lineHeight: 1.2 }}>
                    {f.name}
                  </Typography>
                  <Typography noWrap sx={{ fontSize: '0.7rem', lineHeight: 1.2, color: isOn ? 'success.main' : 'text.secondary', fontWeight: isOn ? 700 : 400 }}>
                    {isOn ? 'Online' : 'Offline'}
                  </Typography>
                </Box>
                <Tooltip title={isOn ? 'Send invite' : 'Send invite (they see it later)'}>
                  <span>
                    <ButtonBase
                      onClick={() => inviteInApp(f)}
                      disabled={busy === f.userId}
                      aria-label={`Send ${f.name} an invite`}
                      sx={(t) => ({
                        ...small,
                        color: done ? t.palette.success.main : t.palette.primary.contrastText,
                        bgcolor: done ? alpha(t.palette.success.main, 0.14) : t.palette.primary.main,
                        '&:hover': { bgcolor: done ? alpha(t.palette.success.main, 0.2) : t.palette.primary.dark },
                        '&.Mui-disabled': { opacity: 0.6 },
                      })}
                    >
                      {busy === f.userId ? <CircularProgress size={13} color="inherit" /> : done ? <CheckRoundedIcon sx={{ fontSize: 16 }} /> : <SendRoundedIcon sx={{ fontSize: 15 }} />}
                    </ButtonBase>
                  </span>
                </Tooltip>
                <Tooltip title="Invite on WhatsApp">
                  <ButtonBase
                    onClick={() => inviteWhatsApp(f)}
                    aria-label={`Invite ${f.name} on WhatsApp`}
                    sx={{ ...small, color: '#fff', bgcolor: '#25D366', '&:hover': { bgcolor: '#1EBE5A' } }}
                  >
                    <WhatsAppIcon sx={{ fontSize: 17 }} />
                  </ButtonBase>
                </Tooltip>
              </Stack>
            );
          })
        )}
      </Box>
    </Popover>
  );
}
