import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Badge, Box, Button, Divider, IconButton, Popover, Tooltip, Typography, alpha } from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import { clearAll, markAllRead, markRead, selectUnreadNotifications } from './notificationsSlice';
import { relTime } from '../studyplan/planUtils';

const META = {
  request: { icon: PersonAddAlt1RoundedIcon, color: '#6366F1' },
  accepted: { icon: HowToRegRoundedIcon, color: '#22C55E' },
  room: { icon: LaptopMacRoundedIcon, color: '#0EA5E9' },
  nudge: { icon: LocalFireDepartmentRoundedIcon, color: '#F97316' },
  leaderboard: { icon: LeaderboardRoundedIcon, color: '#F59E0B' },
};

// Navbar bell: friend requests, room invites, nudges, leaderboard moves.
export default function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.notifications.items);
  const unread = useSelector(selectUnreadNotifications);
  const [anchor, setAnchor] = useState(null);

  const open = (e) => {
    setAnchor(e.currentTarget);
    if (unread) setTimeout(() => dispatch(markAllRead()), 1500); // unread dots stay visible for a moment
  };
  const go = (n) => {
    dispatch(markRead(n.id));
    setAnchor(null);
    if (n.link) navigate(n.link);
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={open} aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}>
          <Badge badgeContent={unread} color="error" max={99}>
            <NotificationsRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxWidth: 'calc(100vw - 24px)', borderRadius: '16px', mt: 0.5 } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25 }}>
          <Typography sx={{ fontWeight: 800 }}>Notifications</Typography>
          {items.length > 0 && <Button size="small" onClick={() => dispatch(clearAll())} sx={{ fontWeight: 700 }}>Clear all</Button>}
        </Box>
        <Divider />
        {items.length === 0 ? (
          <Box sx={{ py: 5, px: 2, textAlign: 'center', color: 'text.secondary' }}>
            <NotificationsRoundedIcon sx={{ fontSize: 32, opacity: 0.6 }} />
            <Typography variant="body2" sx={{ mt: 0.5 }}>You are all caught up.</Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
            {items.map((n) => {
              const { icon: Icon, color } = META[n.type] || META.request;
              return (
                <Box
                  key={n.id}
                  component="button"
                  type="button"
                  onClick={() => go(n)}
                  sx={(t) => ({ display: 'flex', width: '100%', gap: 1.25, alignItems: 'flex-start', textAlign: 'left', border: 0, font: 'inherit', color: 'inherit', cursor: 'pointer', px: 2, py: 1.25, bgcolor: n.read ? 'transparent' : alpha(t.palette.primary.main, 0.07), '&:hover': { bgcolor: t.palette.action.hover } })}
                >
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', color, bgcolor: alpha(color, 0.15) }}>
                    <Icon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: n.read ? 500 : 700, lineHeight: 1.35 }}>{n.text}</Typography>
                    <Typography variant="caption" color="text.secondary">{relTime(n.createdAt)}</Typography>
                  </Box>
                  {!n.read && <Box aria-hidden sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.75 }} />}
                </Box>
              );
            })}
          </Box>
        )}
      </Popover>
    </>
  );
}
