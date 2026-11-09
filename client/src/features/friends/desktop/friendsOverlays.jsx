import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ListItemIcon, Menu, MenuItem } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';
import FriendChat from '../FriendChat';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { practisedToday } from '../friendsUi';
import { removeFriend } from '../friendsSlice';
import { SORTS } from './friendsStyle';

export function renderOverlays(c) {
  const { acting, busy, chatActions, chatFriend, chatId, chatOverlay, closeInvite, codeTogether, confirm, copy, desktop, error, friends, inviteAnchor, link, message, nudge, panelMode, phone, run, setChatId, setConfirm, setPanelMode, setSortAnchor, setSortBy, share, sortAnchor, sortBy } = c;
  const overlays = (
    <>
      {/* invite menu */}
      <Menu anchorEl={inviteAnchor} open={Boolean(inviteAnchor)} onClose={closeInvite}>
        <MenuItem onClick={copy} sx={{ minHeight: 44 }}><ListItemIcon><ContentCopyRoundedIcon fontSize="small" /></ListItemIcon>Copy link</MenuItem>
        <MenuItem onClick={share} sx={{ minHeight: 44 }}><ListItemIcon><IosShareRoundedIcon fontSize="small" /></ListItemIcon>Share…</MenuItem>
        <MenuItem component="a" href={`https://wa.me/?text=${encodeURIComponent(`${message} ${link}`)}`} target="_blank" rel="noopener noreferrer" onClick={closeInvite} sx={{ minHeight: 44 }}>
          <ListItemIcon><WhatsAppIcon fontSize="small" /></ListItemIcon>WhatsApp
        </MenuItem>
      </Menu>

      {/* sort menu */}
      <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}>
        {SORTS.map(([key, label]) => (
          <MenuItem key={key} selected={sortBy === key} onClick={() => { setSortBy(key); setSortAnchor(null); }} sx={{ minHeight: 42, fontSize: FONT_SIZES.body }}>
            <ListItemIcon>{sortBy === key ? <CheckCircleRoundedIcon fontSize="small" color="primary" /> : null}</ListItemIcon>{label}
          </MenuItem>
        ))}
      </Menu>

      {/* phone / tablet: chat opens as a full-height drawer */}
      {!desktop && (
        <FriendChat
          friend={chatFriend}
          lib={phone}
          onClose={() => setChatId(null)}
          onCodeTogether={(f) => codeTogether(f)}
          actions={chatFriend && !phone ? chatActions(chatFriend) : null}
          overlay={chatFriend ? chatOverlay(chatFriend) : null}
          profileOpen={panelMode === 'profile'}
          onToggleProfile={() => setPanelMode((m) => (m === 'profile' ? 'chat' : 'profile'))}
          onNudge={chatFriend && !practisedToday(chatFriend) ? () => { setPanelMode('chat'); nudge(chatFriend); } : undefined}
          nudging={Boolean(chatFriend) && acting === `nudge:${chatFriend.userId}`}
          onRemove={() => setConfirm(chatFriend)}
        />
      )}

      <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: FONT_WEIGHTS.bold }}>Remove friend?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm?.name} (@{confirm?.handle}) will leave your friends list and friends leaderboard. You can add them again later.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disableElevation
            disabled={busy === 'remove'}
            onClick={async () => {
              if (await run('remove', removeFriend(confirm.userId), 'Friend removed')) {
                if (chatId === confirm.userId) setChatId(null);
                setConfirm(null);
              }
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
  return overlays;
}
