import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Tooltip,
  Drawer,
  alpha,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import { useSnackbar } from 'notistack';
import { storeApi } from '../api/storeApi';
import { toggleThemeMode } from '../app/uiSlice';
import { logoutUser, userUpdated } from '../features/auth/authSlice';
import ProBadge from '../components/ProBadge';
import NotificationBell from '../features/notifications/NotificationBell';
import ActivateLicenseModal from '../components/ActivateLicenseModal';

const initialsFromName = (name) =>
  (name || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

// Core product flows — inline on desktop, first group in the mobile drawer.
const PRIMARY_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardRoundedIcon },
  { to: '/problems', label: 'Problems', icon: FormatListBulletedRoundedIcon },
  { to: '/prep', label: 'Companies', icon: BusinessRoundedIcon },
  { to: '/exams', label: 'Exams', icon: AssignmentRoundedIcon },
  { to: '/store', label: 'Store', icon: StorefrontRoundedIcon },
];

// Reference links — grouped under "Explore" on desktop, second group on mobile.
// (Learn topics are reached through Aptitude Practice -> a pattern.)
const EXPLORE_LINKS = [
  { to: '/aptitude', label: 'One for All Aptitude', icon: CalculateRoundedIcon },
  { to: '/visualizer', label: 'Visualizer', icon: BarChartRoundedIcon },
  { to: '/pricing', label: 'Pricing', icon: WorkspacePremiumRoundedIcon },
];

// NOTE: Admin deliberately has no Navbar link. Admins reach /admin/login
// directly (see AdminLoginPage / ProtectedRoute redirectTo).

const isActivePath = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);

// Phone menu = the dashboard sections (same list as the desktop dashboard sidebar).
// Every section is a view inside /dashboard.
const DASH_SECTIONS = [
  { to: '/dashboard', label: 'Library', icon: LibraryBooksRoundedIcon, view: null },
  { to: '/dashboard?view=contest', label: 'Contest', icon: MilitaryTechRoundedIcon, view: 'contest' },
  { to: '/dashboard?view=quests', label: 'Quests', icon: EmojiEventsRoundedIcon, view: 'quests' },
  { to: '/dashboard?view=explore', label: 'Explore', icon: ExploreRoundedIcon, view: 'explore' },
  { to: '/dashboard?view=plans', label: 'Study Plan', icon: SchoolRoundedIcon, view: 'plans' },
  { to: '/dashboard?view=leaderboard', label: 'Leaderboard', icon: LeaderboardRoundedIcon, view: 'leaderboard' },
  { to: '/dashboard?view=friends', label: 'Friends', icon: PeopleAltRoundedIcon, view: 'friends' },
];

// GPay-style row used in the phone menu: tonal icon bubble + label, full width.
function MenuRow({ to, label, icon: Icon, active, onNavigate }) {
  return (
    <Box
      component={RouterLink}
      to={to}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      sx={(t) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        minHeight: 56,
        px: 1.5,
        borderRadius: '16px',
        textDecoration: 'none',
        color: active ? t.palette.primary.main : 'inherit',
        bgcolor: active ? alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.2 : 0.12) : 'transparent',
        transition: 'background-color .15s',
        '&:active': { bgcolor: alpha(t.palette.primary.main, 0.16) },
      })}
    >
      <Icon sx={{ fontSize: 24, color: 'primary.main' }} />
      <Typography sx={{ fontWeight: active ? 800 : 500, fontSize: '1rem' }}>{label}</Typography>
    </Box>
  );
}

const footerIconSx = (t) => ({
  width: 48,
  height: 48,
  color: 'text.secondary',
  bgcolor: alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.14 : 0.08),
  '&:hover': { bgcolor: alpha(t.palette.primary.main, 0.18), color: 'primary.main' },
});

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const dashView = new URLSearchParams(search).get('view');
  const mode = useSelector((s) => s.ui.mode);
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [exploreAnchorEl, setExploreAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const coins = user?.coins ?? 0;
  const coinsRef = useRef(coins);
  useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

  // Keep the coin chip fresh: coins are earned on the server (solves, quests),
  // so check on every page change, every 45s, and when the tab comes back.
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let stopped = false;
    const poll = () => {
      if (document.visibilityState === 'hidden') return;
      storeApi
        .balance()
        .then(({ data }) => {
          if (stopped) return;
          const next = data.data.coins;
          const prev = coinsRef.current;
          if (next === prev) return;
          if (next > prev) enqueueSnackbar(`+${next - prev} coins earned`, { variant: 'success' });
          dispatch(userUpdated({ coins: next }));
        })
        .catch(() => {});
    };
    poll();
    const id = setInterval(poll, 45000);
    document.addEventListener('visibilitychange', poll);
    return () => {
      stopped = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', poll);
    };
  }, [isAuthenticated, pathname, dispatch, enqueueSnackbar]);

  const closeAll = () => {
    setAnchorEl(null);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    closeAll();
    await dispatch(logoutUser());
    navigate('/');
  };

  const handleProfileClick = () => {
    closeAll();
    navigate('/you');
  };

  const handleSettingsClick = () => {
    closeAll();
    navigate('/settings');
  };

  const handleHelpClick = () => {
    closeAll();
    navigate('/help');
  };

  const handleActivateLicenseClick = () => {
    closeAll();
    setLicenseModalOpen(true);
  };

  const exploreActive = EXPLORE_LINKS.some((l) => isActivePath(pathname, l.to));

  const navButtonSx = (active) => (t) => ({
    fontWeight: active ? 800 : 600,
    borderRadius: 99,
    px: 2,
    color: active ? t.palette.text.primary : t.palette.text.secondary,
    bgcolor: active ? alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.24 : 0.16) : 'transparent',
    '&:hover': { bgcolor: alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.2 : 0.1) },
  });

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: { xs: 1, sm: 2 } }}>
        {/* Hamburger — below md only */}
        <IconButton
          onClick={() => setMobileOpen(true)}
          color="inherit"
          edge="start"
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          aria-label="Open navigation menu"
        >
          <MenuRoundedIcon />
        </IconButton>

        <Box
          component={RouterLink}
          to={isAuthenticated ? '/dashboard' : '/'}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', mr: { xs: 0, md: 2 } }}
        >
          <CodeRoundedIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Jeet<Box component="span" sx={{ color: 'primary.main' }}>Code</Box>
          </Typography>
        </Box>

        {/* Desktop links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
          {PRIMARY_LINKS.map((link) => (
            <Button
              key={link.to}
              component={RouterLink}
              to={link.to}
              aria-current={isActivePath(pathname, link.to) ? 'page' : undefined}
              sx={navButtonSx(isActivePath(pathname, link.to))}
            >
              {link.label}
            </Button>
          ))}

          <Button
            onClick={(e) => setExploreAnchorEl(e.currentTarget)}
            endIcon={<ExpandMoreRoundedIcon />}
            aria-haspopup="menu"
            aria-expanded={Boolean(exploreAnchorEl)}
            sx={navButtonSx(exploreActive)}
          >
            Explore
          </Button>
          <Menu
            anchorEl={exploreAnchorEl}
            open={Boolean(exploreAnchorEl)}
            onClose={() => setExploreAnchorEl(null)}
            slotProps={{ paper: { sx: { borderRadius: '12px', minWidth: 220, mt: 0.5 } } }}
          >
            {EXPLORE_LINKS.map(({ to, label, icon: Icon }) => (
              <MenuItem
                key={to}
                component={RouterLink}
                to={to}
                selected={isActivePath(pathname, to)}
                onClick={() => setExploreAnchorEl(null)}
              >
                <ListItemIcon>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={label} slotProps={{ primary: { fontWeight: 600, fontSize: '0.9rem' } }} />
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Streak and Pro badge live in the drawer on phones */}
        {isAuthenticated && (
          <Tooltip title={`${user?.streakDays ?? 0}-day streak`}>
            <Chip
              icon={<LocalFireDepartmentRoundedIcon sx={{ color: 'warning.main !important' }} />}
              label={`${user?.streakDays ?? 0} days`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 700, display: { xs: 'none', sm: 'flex' } }}
            />
          </Tooltip>
        )}

        {isAuthenticated && (
          <Tooltip title="Your coins. Open wallet">
            <Chip
              component={RouterLink}
              to="/store?tab=coins"
              clickable
              icon={<MonetizationOnRoundedIcon sx={{ color: 'warning.main !important' }} />}
              label={coins.toLocaleString('en-IN')}
              size="small"
              variant="outlined"
              aria-label={`${coins} coins, open wallet`}
              sx={{ fontWeight: 700, display: { xs: 'none', sm: 'inline-flex' } }}
            />
          </Tooltip>
        )}

        {isAuthenticated && user?.isPro && (
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <ProBadge />
          </Box>
        )}

        <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton onClick={() => dispatch(toggleThemeMode())} color="inherit" aria-label="Toggle color theme">
            {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
        </Tooltip>

        {isAuthenticated ? (
          <>
            <NotificationBell />
            <Button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              color="inherit"
              aria-haspopup="menu"
              aria-label="Account menu"
              sx={{ textTransform: 'none', gap: 1, pl: 1, pr: { xs: 1, sm: 1.5 }, ml: 0.5 }}
            >
              <Avatar
                src={user?.avatarUrl || undefined}
                sx={{ bgcolor: 'primary.main', width: 34, height: 34, fontSize: '0.85rem', fontWeight: 700 }}
              >
                {initialsFromName(user?.name)}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                {user?.name}
              </Typography>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              slotProps={{ paper: { sx: { borderRadius: '12px', minWidth: 220, mt: 0.5 } } }}
            >
              <Box sx={{ px: 2, py: 1.25 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  @{user?.handle}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleProfileClick}>
                <ListItemIcon>
                  <PersonRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="My profile" />
              </MenuItem>
              <MenuItem onClick={handleSettingsClick}>
                <ListItemIcon>
                  <SettingsRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </MenuItem>
              <MenuItem onClick={handleHelpClick}>
                <ListItemIcon>
                  <HelpOutlineRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Help & support" />
              </MenuItem>
              {!user?.isPro && (
                <MenuItem onClick={handleActivateLicenseClick}>
                  <ListItemIcon>
                    <VpnKeyRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Activate license" />
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Log out" />
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button component={RouterLink} to="/login" variant="contained" disableElevation sx={{ fontWeight: 700 }}>
            Sign in
          </Button>
        )}
      </Toolbar>

      {/* Phone menu: GPay-style side sheet — profile card, icon rows, account actions at the bottom. */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        transitionDuration={220}
        slotProps={{
          paper: {
            sx: {
              width: 'min(88vw, 360px)',
              height: '100dvh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '0 28px 28px 0',
              backgroundImage: (t) => `linear-gradient(180deg, ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.14 : 0.2)} 0, transparent 220px)`,
              pt: 'env(safe-area-inset-top)',
              pb: 'env(safe-area-inset-bottom)',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, height: 60, flexShrink: 0 }}>
          <CodeRoundedIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', flex: 1 }}>
            Jeet<Box component="span" sx={{ color: 'primary.main' }}>Code</Box>
          </Typography>
          <IconButton onClick={() => dispatch(toggleThemeMode())} aria-label="Toggle color theme">
            {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
          <IconButton onClick={() => setMobileOpen(false)} aria-label="Close navigation menu" edge="end">
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }} component="nav" aria-label="Main navigation">
          {isAuthenticated && (
            <Box
              sx={(t) => ({
                mb: 2.5,
                borderRadius: '24px',
                overflow: 'hidden',
                bgcolor: alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.18 : 0.12),
              })}
            >
              <Box
                component={RouterLink}
                to="/you"
                onClick={() => setMobileOpen(false)}
                sx={{ p: 1.75, display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit' }}
              >
                <Avatar src={user?.avatarUrl || undefined} sx={{ bgcolor: 'primary.main', width: 48, height: 48, fontSize: '1rem', fontWeight: 700 }}>
                  {initialsFromName(user?.name)}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap sx={{ fontWeight: 800 }}>
                    {user?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                    <LocalFireDepartmentRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {user?.streakDays ?? 0}-day streak
                    </Typography>
                    {user?.isPro && <ProBadge />}
                  </Box>
                </Box>
              </Box>
              <Box
                component={RouterLink}
                to="/store?tab=coins"
                onClick={() => setMobileOpen(false)}
                aria-label={`${coins} coins, open wallet`}
                sx={(t) => ({
                  px: 1.75,
                  py: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  textDecoration: 'none',
                  color: 'inherit',
                  borderTop: `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
                  '&:active': { bgcolor: alpha(t.palette.primary.main, 0.12) },
                })}
              >
                <MonetizationOnRoundedIcon sx={{ fontSize: 24, color: 'warning.main' }} />
                <Typography sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', flex: 1 }}>
                  {coins.toLocaleString('en-IN')} coins
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Wallet
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'grid', gap: 0.25 }}>
            <MenuRow to="/store" label="Store" icon={StorefrontRoundedIcon} active={isActivePath(pathname, '/store')} onNavigate={() => setMobileOpen(false)} />
            {DASH_SECTIONS.map(({ to, label, icon, view }) => (
              <MenuRow
                key={label}
                to={to}
                label={label}
                icon={icon}
                active={
                  view === undefined
                    ? isActivePath(pathname, to)
                    : pathname === '/dashboard' && (dashView || null) === view
                }
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </Box>
        </Box>

        <Divider />
        <Box sx={{ p: 2, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              {!user?.isPro && (
                <Tooltip title="Activate license">
                  <IconButton onClick={handleActivateLicenseClick} aria-label="Activate license" sx={footerIconSx}>
                    <VpnKeyRoundedIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Settings">
                <IconButton onClick={handleSettingsClick} aria-label="Settings" sx={footerIconSx}>
                  <SettingsRoundedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Help & support">
                <IconButton onClick={handleHelpClick} aria-label="Help and support" sx={footerIconSx}>
                  <HelpOutlineRoundedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Log out">
                <IconButton onClick={handleLogout} aria-label="Log out" sx={footerIconSx}>
                  <LogoutRoundedIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <>
              <Button component={RouterLink} to="/login" onClick={() => setMobileOpen(false)} variant="contained" disableElevation fullWidth sx={{ fontWeight: 700, py: 1.1, borderRadius: '12px' }}>
                Sign in
              </Button>
              <Button component={RouterLink} to="/signup" onClick={() => setMobileOpen(false)} variant="outlined" color="inherit" fullWidth sx={{ fontWeight: 700, py: 1.1, borderRadius: '12px' }}>
                Create account
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      <ActivateLicenseModal open={licenseModalOpen} onClose={() => setLicenseModalOpen(false)} />
    </AppBar>
  );
}
