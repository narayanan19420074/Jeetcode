import { useState } from 'react';
import { Avatar, Box, ButtonBase, CircularProgress, Popover, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';

// Popover with your friends. Tap one and they join the plan (and get a notification).
// `memberIds`: Set of user ids already in the plan. `onAdd(friend)` returns a promise.
export default function FriendPicker({ anchorEl, onClose, friends, memberIds, onAdd, onFindFriends }) {
  const [busy, setBusy] = useState('');

  const add = async (f) => {
    setBusy(f.userId);
    try { await onAdd(f); } finally { setBusy(''); }
  };

  return (
    <Popover
      open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { width: 250, maxHeight: 300, mt: 0.5, borderRadius: '12px' } } }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1.5, pt: 1.25, pb: 0.5, fontWeight: 800, letterSpacing: 0.4 }}>ADD FRIENDS TO PLAN</Typography>
      {friends === null ? (
        <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={18} /></Box>
      ) : friends.length === 0 ? (
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">No friends yet.</Typography>
          {onFindFriends && <ButtonBase onClick={onFindFriends} sx={{ mt: 0.5, color: 'primary.main', fontWeight: 700, fontSize: 13 }}>Find friends</ButtonBase>}
        </Box>
      ) : (
        <Box sx={{ pb: 0.5 }}>
          {friends.map((f) => {
            const inPlan = memberIds.has(f.userId);
            return (
              <ButtonBase
                key={f.userId} disabled={inPlan || busy === f.userId} onClick={() => add(f)}
                sx={(t) => ({ width: '100%', justifyContent: 'flex-start', gap: 1, px: 1.5, py: 0.7, textAlign: 'left', fontFamily: 'inherit', '&:hover': { bgcolor: t.palette.action.hover } })}
              >
                <Avatar src={f.avatarUrl || undefined} sx={{ width: 26, height: 26, fontSize: 12, fontWeight: 700 }}>{f.name?.[0]?.toUpperCase()}</Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600, lineHeight: 1.2 }}>{f.name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', lineHeight: 1.2 }}>@{f.handle}</Typography>
                </Box>
                {busy === f.userId ? <CircularProgress size={14} /> : inPlan ? <CheckRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} /> : <PersonAddRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
              </ButtonBase>
            );
          })}
        </Box>
      )}
    </Popover>
  );
}
