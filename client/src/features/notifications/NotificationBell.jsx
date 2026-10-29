import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Badge, Box, Button, ButtonBase, IconButton, Popover, Tooltip, Typography, alpha } from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import { clearAll, markAllRead, markIdsRead, markRead, selectUnreadNotifications } from './notificationsSlice';
import { TABS, categoryOf, metaOf } from './notificationMeta';
import { relTime } from '../studyplan/planUtils';

// Same accent as the phone pages.
const ACCENT = '#6366F1';

function TabButton({ tab, active, unread, onClick }) {
  const Icon = tab.icon;
  return (
    <ButtonBase
      role="tab"
      aria-selected={active}
      onClick={onClick}
      sx={(t) => ({
        flex: 1,
        gap: 0.75,
        py: 1.1,
        fontFamily: 'inherit',
        fontWeight: 800,
        fontSize: '0.86rem',
        color: active ? 'primary.main' : 'text.secondary',
        borderBottom: `2px solid ${active ? t.palette.primary.main : 'transparent'}`,
        transition: 'color .15s, border-color .15s',
        '&:hover': { bgcolor: t.palette.action.hover },
      })}
    >
      <Icon sx={{ fontSize: 18 }} />
      {tab.label}
      {unread > 0 && (
        <Box component="span" sx={{ minWidth: 18, height: 18, px: 0.5, borderRadius: 9, bgcolor: 'error.main', color: 'error.contrastText', fontSize: 11, fontWeight: 800, display: 'grid', placeItems: 'center' }}>
          {unread}
        </Box>
      )}
    </ButtonBase>
  );
}

function Row({ n, onOpen }) {
  const { icon: Icon, color, cta } = metaOf(n);
  return (
    <Box
      component="button"
      type="button"
      onClick={() => onOpen(n)}
      sx={(t) => ({
        display: 'flex',
        width: '100%',
        gap: 1.5,
        alignItems: 'center',
        textAlign: 'left',
        border: 0,
        borderBottom: `1px solid ${t.palette.divider}`,
        font: 'inherit',
        color: 'inherit',
        cursor: 'pointer',
        px: 2,
        py: 1.4,
        bgcolor: n.read ? 'transparent' : alpha(t.palette.primary.main, 0.07),
        '&:hover': { bgcolor: t.palette.action.hover },
        '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: -2 },
      })}
    >
      <Box sx={{ width: 40, height: 40, borderRadius: '12px', flexShrink: 0, display: 'grid', placeItems: 'center', color, bgcolor: alpha(color, 0.15) }}>
        <Icon sx={{ fontSize: 22 }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: n.read ? 500 : 700, lineHeight: 1.35 }}>{n.text}</Typography>
        <Typography variant="caption" color="text.secondary">{relTime(n.createdAt)}</Typography>
      </Box>
      {n.link && (
        <Box sx={{ flexShrink: 0, px: 1.1, py: 0.3, borderRadius: 99, fontSize: '0.74rem', fontWeight: 800, color, bgcolor: alpha(color, 0.12), whiteSpace: 'nowrap' }}>{cta}</Box>
      )}
      {!n.read && <Box aria-hidden sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />}
    </Box>
  );
}

// Navbar bell. Opens one big card with three tabs: Social (friends), Updates (rank, rewards, offers), Events (contest, daily challenge).
export default function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.notifications.items);
  const unread = useSelector(selectUnreadNotifications);
  const [anchor, setAnchor] = useState(null);
  const [tab, setTab] = useState('social');

  const byTab = useMemo(() => {
    const out = { social: [], updates: [], events: [] };
    items.forEach((n) => out[categoryOf(n)].push(n));
    return out;
  }, [items]);
  const unreadBy = (key) => byTab[key].filter((n) => !n.read).length;

  const open = (e) => {
    // Land on the first tab that has something unread.
    setTab(TABS.find((t) => unreadBy(t.key) > 0)?.key || 'social');
    setAnchor(e.currentTarget);
  };

  // Items on the visible tab are marked read a moment after they are shown (the unread dots stay visible for a bit).
  const visible = byTab[tab];
  const visibleUnreadKey = visible.filter((n) => !n.read).map((n) => n.id).join('|');
  useEffect(() => {
    if (!anchor || !visibleUnreadKey) return undefined;
    const t = setTimeout(() => dispatch(markIdsRead(visibleUnreadKey.split('|'))), 1500);
    return () => clearTimeout(t);
  }, [anchor, tab, visibleUnreadKey, dispatch]);

  const go = (n) => {
    dispatch(markRead(n.id));
    setAnchor(null);
    if (n.link) navigate(n.link);
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={open}
          aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
          sx={(t) => ({ [t.breakpoints.down('md')]: { width: 44, height: 44, color: ACCENT, bgcolor: alpha(ACCENT, t.palette.mode === 'dark' ? 0.16 : 0.09) } })}
        >
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
        slotProps={{
          paper: {
            sx: {
              width: 460,
              maxWidth: 'calc(100vw - 24px)',
              height: 'min(580px, calc(100dvh - 96px))',
              borderRadius: '20px',
              mt: 0.75,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backgroundImage: 'none',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: 2, pt: 1.5, pb: 0.5 }}>
          <Typography component="h2" sx={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.01em' }}>Notifications</Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button size="small" startIcon={<DoneAllRoundedIcon />} disabled={unread === 0} onClick={() => dispatch(markAllRead())} sx={{ fontWeight: 700 }}>Mark all read</Button>
            <Button size="small" color="inherit" disabled={items.length === 0} onClick={() => dispatch(clearAll())} sx={{ fontWeight: 700 }}>Clear</Button>
          </Box>
        </Box>

        <Box role="tablist" sx={(t) => ({ display: 'flex', px: 1, borderBottom: `1px solid ${t.palette.divider}`, flexShrink: 0 })}>
          {TABS.map((t) => (
            <TabButton key={t.key} tab={t} active={tab === t.key} unread={unreadBy(t.key)} onClick={() => setTab(t.key)} />
          ))}
        </Box>

        <Box role="tabpanel" sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' }}>
          {visible.length === 0 ? (
            <Box sx={{ height: '100%', minHeight: 220, display: 'grid', placeItems: 'center', px: 4, textAlign: 'center', color: 'text.secondary' }}>
              <Box>
                {(() => {
                  const Icon = TABS.find((t) => t.key === tab).icon;
                  return <Icon sx={{ fontSize: 40, opacity: 0.5 }} />;
                })()}
                <Typography variant="body2" sx={{ mt: 1 }}>{TABS.find((t) => t.key === tab).empty}</Typography>
              </Box>
            </Box>
          ) : (
            visible.map((n) => <Row key={n.id} n={n} onOpen={go} />)
          )}
        </Box>
      </Popover>
    </>
  );
}
