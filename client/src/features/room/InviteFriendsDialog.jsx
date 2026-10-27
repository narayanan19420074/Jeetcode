import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, ButtonBase, CircularProgress, Dialog, DialogContent, Stack, Tooltip, Typography, alpha } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useSnackbar } from 'notistack';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { fetchFriends } from '../friends/friendsSlice';
import { PersonAvatar } from '../friends/friendsUi';
import { WsIconButton } from '../workspace/wsUi';

// "Call a friend" for a live pair room.
// Every friend (online or offline) has two buttons:
//  - Send icon     -> in-app invite. Online friends get an Accept / Decline popup right now;
//                     offline friends find it in their JeetCode chat when they are back.
//  - WhatsApp icon -> opens WhatsApp with the room link ready to send.
export default function InviteFriendsDialog({ open, onClose, roomId, roomTitle }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { friends, online, loaded } = useSelector((s) => s.friends);
  const [busy, setBusy] = useState('');
  const [sent, setSent] = useState({}); // { [userId]: 'live' | 'whatsapp' }

  useEffect(() => {
    if (open && !loaded) dispatch(fetchFriends());
  }, [open, loaded, dispatch]);

  // online first, then A-Z
  const rows = useMemo(
    () => [...friends].sort((a, b) => Number(Boolean(online[b.userId])) - Number(Boolean(online[a.userId])) || (a.name || '').localeCompare(b.name || '')),
    [friends, online]
  );

  const link = `${window.location.origin}/room/${roomId}`;

  const send = (f) => friendsApi.roomInvite(f.userId, { roomId, title: roomTitle || undefined });

  const inviteInApp = async (f) => {
    setBusy(f.userId);
    try {
      await send(f);
      setSent((s) => ({ ...s, [f.userId]: 'live' }));
      enqueueSnackbar(online[f.userId] ? `Invite sent to @${f.handle}` : `@${f.handle} is offline. They will see the invite when they are back`, { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(extractErrorMessage(e), { variant: 'error' });
    } finally {
      setBusy('');
    }
  };

  const inviteWhatsApp = (f) => {
    // Open WhatsApp first, straight from the tap, so the browser does not block it as a popup.
    const text = `Hey ${f.name || f.handle}! Come code with me on JeetCode${roomTitle ? ` — ${roomTitle}` : ''}. Join here: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth scroll="paper">
      <Stack direction="row" sx={{ alignItems: 'center', pl: 2.5, pr: 1, pt: 1.5, pb: 0.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', flex: 1 }}>Call a friend</Typography>
        <WsIconButton title="Close" size="lg" onClick={onClose}>
          <CloseRoundedIcon />
        </WsIconButton>
      </Stack>
      <DialogContent dividers sx={{ p: 0 }}>
        {!loaded ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={22} />
          </Box>
        ) : rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
            No friends yet. Add friends from the dashboard, then call them here.
          </Typography>
        ) : (
          rows.map((f) => {
            const isOn = Boolean(online[f.userId]);
            const done = sent[f.userId];
            return (
              <Stack key={f.userId} direction="row" sx={{ alignItems: 'center', gap: 1.5, px: 2.5, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
                <PersonAvatar person={f} size={40} online={isOn} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.92rem', lineHeight: 1.25 }}>
                    {f.name}
                  </Typography>
                  <Typography noWrap variant="caption" color={isOn ? 'success.main' : 'text.secondary'} sx={{ display: 'block', fontWeight: isOn ? 700 : 400 }}>
                    {isOn ? 'Online now' : `@${f.handle} · offline`}
                  </Typography>
                </Box>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                  <Tooltip title={isOn ? 'Send invite (popup on their screen)' : 'Send invite (they see it when they are back)'}>
                    <span>
                      <ButtonBase
                        onClick={() => inviteInApp(f)}
                        disabled={busy === f.userId}
                        aria-label={`Send ${f.name} an invite`}
                        sx={(t) => ({
                          width: 36,
                          height: 36,
                          borderRadius: '8px',
                          color: done === 'live' ? t.palette.success.main : t.palette.primary.contrastText,
                          bgcolor: done === 'live' ? alpha(t.palette.success.main, 0.14) : t.palette.primary.main,
                          '&:hover': { bgcolor: done === 'live' ? alpha(t.palette.success.main, 0.2) : t.palette.primary.dark },
                          '&.Mui-disabled': { opacity: 0.6 },
                        })}
                      >
                        {busy === f.userId ? <CircularProgress size={16} color="inherit" /> : done === 'live' ? <CheckRoundedIcon sx={{ fontSize: 20 }} /> : <SendRoundedIcon sx={{ fontSize: 18 }} />}
                      </ButtonBase>
                    </span>
                  </Tooltip>
                  <Tooltip title="Invite on WhatsApp">
                    <ButtonBase
                      onClick={() => inviteWhatsApp(f)}
                      aria-label={`Invite ${f.name} on WhatsApp`}
                      sx={{ width: 36, height: 36, borderRadius: '8px', color: '#fff', bgcolor: '#25D366', '&:hover': { bgcolor: '#1EBE5A' } }}
                    >
                      <WhatsAppIcon sx={{ fontSize: 20 }} />
                    </ButtonBase>
                  </Tooltip>
                </Stack>
              </Stack>
            );
          })
        )}
      </DialogContent>
    </Dialog>
  );
}
