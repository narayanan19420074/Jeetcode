import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Badge, Box, Button, ButtonBase, Drawer, IconButton, Popover, Tooltip, Typography, alpha, useMediaQuery, useTheme } from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { clearAll, markAllRead, markIdsRead, markRead, selectUnreadNotifications } from './notificationsSlice';
import { TABS, categoryOf, metaOf } from './notificationMeta';
import { relTime } from '../studyplan/planUtils';
import {
  LIBRARY_PALETTE,
  LIB_ACCENT,
  LIB_TRACKING,
  LibraryFont,
  libBackBtnSx,
  libChipSx,
  libSmallBtnSx,
  libTintBtnSx,
  useLibraryPalette,
} from '../dashboard/components/libraryStyle';
import { COLOR_PALETTE, FONT_WEIGHTS, FONT_SIZES, RADII_PX, RADII, MOTION } from '../../app/design/designTokens';

// Same accent as the phone pages.
const ACCENT = LIB_ACCENT;

function TabButton({ tab, active, unread, onClick }) {
  const Icon = tab.icon;
  return (
    <ButtonBase
      role="tab"
      aria-selected={active}
      onClick={onClick}
      sx={(t) => ({
        flex: 1,
        gap: 1,
        py: 1,
        fontFamily: 'inherit',
        fontWeight: FONT_WEIGHTS.bold,
        fontSize: FONT_SIZES.body,
        color: active ? 'primary.main' : 'text.secondary',
        borderBottom: `2px solid ${active ? t.palette.primary.main : 'transparent'}`,
        transition: `color ${MOTION.fast}ms, border-color ${MOTION.fast}ms`,
        '&:hover': { bgcolor: t.palette.action.hover },
      })}
    >
      <Icon sx={{ fontSize: FONT_SIZES.subheading }} />
      {tab.label}
      {unread > 0 && (
        <Box component="span" sx={{ minWidth: 18, height: 18, px: 0.5, borderRadius: RADII_PX.pill, bgcolor: 'error.main', color: 'error.contrastText', fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, display: 'grid', placeItems: 'center' }}>
          {unread}
        </Box>
      )}
    </ButtonBase>
  );
}

// Phone tabs: the same pill chips as the other phone pages (name and unread count, no icons).
function PhoneTab({ tab, active, unread, onClick }) {
  return (
    <ButtonBase role="tab" aria-selected={active} onClick={onClick} sx={{ ...libChipSx(active), fontWeight: FONT_WEIGHTS.medium }}>
      {tab.label}
      {unread > 0 && (
        <Box component="span" sx={{ minWidth: 20, height: 20, px: 0.5, borderRadius: RADII_PX.pill, bgcolor: 'error.main', color: 'error.contrastText', fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, display: 'grid', placeItems: 'center' }}>
          {unread}
        </Box>
      )}
    </ButtonBase>
  );
}

// Icon colours are chosen for the light cream cards; in dark mode they are lifted toward white so they stay readable.
const useTone = (color) => {
  const dark = useTheme().palette.mode === 'dark';
  return dark ? `color-mix(in srgb, ${color} 72%, ${COLOR_PALETTE.white})` : color;
};

// Phone card: the same rounded cream panel as the other phone pages. Only the dot and the tint show
// whether it was read, so the text keeps one weight and size and nothing shifts when it is marked read.
function PhoneCard({ n, onOpen }) {
  const pal = useLibraryPalette();
  const { icon: Icon, color, cta } = metaOf(n);
  const tone = useTone(color);
  return (
    <Box
      component="button"
      type="button"
      onClick={() => onOpen(n)}
      sx={{
        display: 'flex',
        width: '100%',
        minHeight: 76,
        gap: 1.5,
        alignItems: 'center',
        textAlign: 'left',
        py: 1.75, px: 2,
        borderRadius: RADII_PX.card,
        border: `1px solid ${pal.border}`,
        font: 'inherit',
        color: pal.text,
        cursor: 'pointer',
        bgcolor: n.read ? pal.chip : `color-mix(in srgb, ${ACCENT} 10%, ${pal.chip})`,
        transition: `background-color ${MOTION.standard}ms`,
        '&:focus-visible': { outline: `2px solid ${ACCENT}`, outlineOffset: 2 },
      }}
    >
      <Box aria-hidden sx={{ width: 44, height: 44, borderRadius: RADII_PX.card, flexShrink: 0, display: 'grid', placeItems: 'center', color: tone, bgcolor: alpha(color, 0.16) }}>
        <Icon sx={{ fontSize: FONT_SIZES.display }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: FONT_SIZES.title, lineHeight: '22px', fontWeight: FONT_WEIGHTS.medium, letterSpacing: LIB_TRACKING }}>{n.text}</Typography>
        <Typography sx={{ mt: 0.5, fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>{relTime(n.createdAt)}</Typography>
      </Box>
      {n.link && (
        <Box sx={{ flexShrink: 0, height: 28, px: 1.5, borderRadius: RADII_PX.pill, display: 'grid', placeItems: 'center', fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium, letterSpacing: LIB_TRACKING, color: tone, bgcolor: alpha(color, 0.14), whiteSpace: 'nowrap' }}>{cta}</Box>
      )}
      <Box aria-hidden sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, bgcolor: n.read ? 'transparent' : ACCENT, transition: `background-color ${MOTION.standard}ms` }} />
    </Box>
  );
}

function Row({ n, onOpen }) {
  const { icon: Icon, color, cta } = metaOf(n);
  const tone = useTone(color);
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
        py: 1.5,
        bgcolor: n.read ? 'transparent' : alpha(t.palette.primary.main, 0.07),
        '&:hover': { bgcolor: t.palette.action.hover },
        '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: -2 },
      })}
    >
      <Box sx={{ width: 40, height: 40, borderRadius: RADII_PX.card, flexShrink: 0, display: 'grid', placeItems: 'center', color: tone, bgcolor: alpha(color, 0.16) }}>
        <Icon sx={{ fontSize: FONT_SIZES.display }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.medium, lineHeight: 1.35 }}>{n.text}</Typography>
        <Typography variant="caption" color="text.secondary">{relTime(n.createdAt)}</Typography>
      </Box>
      {n.link && (
        <Box sx={{ flexShrink: 0, px: 1, py: 0.5, borderRadius: RADII_PX.pill, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: tone, bgcolor: alpha(color, 0.12), whiteSpace: 'nowrap' }}>{cta}</Box>
      )}
      <Box aria-hidden sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: n.read ? 'transparent' : 'primary.main', flexShrink: 0 }} />
    </Box>
  );
}

// Navbar bell. On phones it opens as a bottom sheet with a close arrow; on wider screens as one big card. Three tabs: Social (friends), Updates (rank, rewards, offers), Events (contest, daily challenge).
export default function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const pal = useLibraryPalette();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
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
          sx={(t) => {
            const pal = LIBRARY_PALETTE[t.palette.mode === 'dark' ? 'dark' : 'light'];
            return { [t.breakpoints.down('md')]: { width: 40, height: 40, color: pal.text, bgcolor: pal.player, '&:hover': { bgcolor: pal.player, filter: 'brightness(0.97)' } } };
          }}
        >
          <Badge badgeContent={unread} color="error" max={99}>
            <NotificationsRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          slotProps={{ paper: { sx: { height: '85dvh', maxHeight: '85dvh', borderRadius: `${RADII.card}px ${RADII.card}px 0 0`, backgroundImage: 'none', bgcolor: pal.bg, overflow: 'hidden' } } }}
        >
          {/* The drawer renders outside the page, so it gets the Library font and colours itself. */}
          <LibraryFont sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 2, pt: 1, flexShrink: 0 }}>
              <IconButton onClick={() => setAnchor(null)} aria-label="Close notifications" sx={libBackBtnSx}>
                <KeyboardArrowDownRoundedIcon />
              </IconButton>
              <Typography component="h2" sx={{ flex: 1, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.display, lineHeight: '28px' }}>Notifications</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, px: 2, pt: 1, pb: 1.5, flexShrink: 0 }}>
              <Button
                disableElevation
                disabled={unread === 0}
                onClick={() => dispatch(markAllRead())}
                sx={{ ...libSmallBtnSx, bgcolor: alpha(ACCENT, 0.16), color: ACCENT, '&:hover': { bgcolor: alpha(ACCENT, 0.24) }, '&.Mui-disabled': { bgcolor: alpha(ACCENT, 0.16), color: ACCENT, opacity: 0.5 } }}
              >
                Mark all read
              </Button>
              <Button disableElevation disabled={items.length === 0} onClick={() => dispatch(clearAll())} sx={{ ...libTintBtnSx, ...libSmallBtnSx, '&.Mui-disabled': { color: pal.text, opacity: 0.5 } }}>
                Clear all
              </Button>
            </Box>

            <Box role="tablist" sx={{ display: 'flex', gap: 1, px: 2, pb: 1.5, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
              {TABS.map((t) => (
                <PhoneTab key={t.key} tab={t} active={tab === t.key} unread={unreadBy(t.key)} onClick={() => setTab(t.key)} />
              ))}
            </Box>

            <Box role="tabpanel" sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', px: 2, pb: 'calc(16px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {visible.length === 0 ? (
                <Box sx={{ py: 7, px: 3, textAlign: 'center' }}>
                  {(() => {
                    const Icon = TABS.find((t) => t.key === tab).icon;
                    return (
                      <Box aria-hidden sx={{ width: 64, height: 64, mx: 'auto', mb: 1.5, borderRadius: RADII_PX.card, display: 'grid', placeItems: 'center', bgcolor: pal.chip, color: pal.muted }}>
                        <Icon sx={{ fontSize: FONT_SIZES.hero }} />
                      </Box>
                    );
                  })()}
                  <Typography sx={{ fontSize: FONT_SIZES.title, lineHeight: '22px', letterSpacing: LIB_TRACKING, color: pal.muted }}>{TABS.find((t) => t.key === tab).empty}</Typography>
                </Box>
              ) : (
                visible.map((n) => <PhoneCard key={n.id} n={n} onOpen={go} />)
              )}
            </Box>
          </LibraryFont>
        </Drawer>
      ) : (
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
                borderRadius: RADII_PX.card,
                mt: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backgroundImage: 'none',
              },
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: 2, pt: 1.5, pb: 0.5 }}>
            <Typography component="h2" sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.subheading, letterSpacing: '-0.01em' }}>Notifications</Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button size="small" startIcon={<DoneAllRoundedIcon />} disabled={unread === 0} onClick={() => dispatch(markAllRead())} sx={{ fontWeight: FONT_WEIGHTS.bold }}>Mark all read</Button>
              <Button size="small" color="inherit" disabled={items.length === 0} onClick={() => dispatch(clearAll())} sx={{ fontWeight: FONT_WEIGHTS.bold }}>Clear</Button>
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
                    return <Icon sx={{ fontSize: FONT_SIZES.heroLg, opacity: 0.5 }} />;
                  })()}
                  <Typography variant="body2" sx={{ mt: 1 }}>{TABS.find((t) => t.key === tab).empty}</Typography>
                </Box>
              </Box>
            ) : (
              visible.map((n) => <Row key={n.id} n={n} onOpen={go} />)
            )}
          </Box>
        </Popover>
      )}
    </>
  );
}
