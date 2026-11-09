import { Avatar, Box, ButtonBase, IconButton, Popover, Skeleton, TextField, Tooltip, Typography } from '@mui/material';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, hexAlpha } from '../../../app/design/designTokens';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import { relTime } from '../planUtils';
import { surface } from '../../dashboard/dashboardUtils';

export function FriendsPanel({ friends, onFindFriends, onJoinCode, codeInput, setCodeInput, codeError }) {
  return (
    <Box sx={[surface, { p: 1.5 }]}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', maxHeight: 112, overflowY: 'auto', scrollbarWidth: 'thin' }}>
        {friends === null && <Skeleton width={160} height={28} />}
        {friends?.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
            No friends yet. <ButtonBase onClick={onFindFriends} sx={{ color: 'primary.main', fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, verticalAlign: 'baseline' }}>Find friends</ButtonBase>
          </Typography>
        )}
        {friends?.map((f) => (
          <Box key={f.userId} sx={(t) => ({ display: 'flex', alignItems: 'center', gap: 1, pl: 0.5, pr: 1, py: 0.5, borderRadius: RADII_PX.pill, border: `1px solid ${t.palette.divider}` })}>
            <Avatar src={f.avatarUrl || undefined} sx={{ width: 22, height: 22, fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold }}>{f.name?.[0]?.toUpperCase()}</Avatar>
            <Typography variant="body2" noWrap sx={{ fontWeight: FONT_WEIGHTS.semibold, maxWidth: 120 }}>{f.name}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, mt: 1, alignItems: 'center' }}>
        <TextField
          size="small" placeholder="Have an invite link? Paste it" value={codeInput} onChange={(e) => setCodeInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onJoinCode()} error={Boolean(codeError)} helperText={codeError || undefined}
          slotProps={{ htmlInput: { 'aria-label': 'Invite link or code' } }} sx={{ '& .MuiInputBase-input': { py: 0.75, px: 1.25, fontSize: FONT_SIZES.body } }} fullWidth
        />
        <Tooltip title="Find plan"><IconButton onClick={onJoinCode} aria-label="Find plan" size="small"><GroupAddRoundedIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    </Box>
  );
}

// ---------- notifications (bell) ----------

export function NotificationsPopover({ anchorEl, onClose, items, onOpenPlan }) {
  return (
    <Popover
      open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { width: 300, maxHeight: 340, mt: 0.5, borderRadius: RADII_PX.card } } }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1.5, pt: 1.5, pb: 0.5, fontWeight: FONT_WEIGHTS.bold, letterSpacing: 0.4 }}>NOTIFICATIONS</Typography>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, pb: 1.5 }}>Nothing new.</Typography>
      ) : items.map((n) => (
        <ButtonBase
          key={n.id} onClick={() => onOpenPlan(n.plan.id)}
          sx={(t) => ({ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 1, px: 1.5, py: 1, textAlign: 'left', fontFamily: 'inherit', bgcolor: n.read ? 'transparent' : hexAlpha(t.palette.primary.main, 0.071), '&:hover': { bgcolor: t.palette.action.hover } })}
        >
          <Avatar src={n.actor.avatarUrl || undefined} sx={{ width: 26, height: 26, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, mt: 0.5 }}>{n.actor.name?.[0]?.toUpperCase()}</Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.3 }}><b>{n.actor.name}</b> added you to <b>{n.plan.title}</b></Typography>
            <Typography variant="caption" color="text.secondary">{relTime(n.createdAt)}</Typography>
          </Box>
        </ButtonBase>
      ))}
    </Popover>
  );
}

// ---------- plan card ----------
