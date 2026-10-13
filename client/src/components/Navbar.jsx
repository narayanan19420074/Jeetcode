import { useState } from 'react';
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
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import { toggleThemeMode } from '../app/uiSlice';
import { logoutUser } from '../features/auth/authSlice';
import ProBadge from '../components/ProBadge';
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
  { to: '/prep', label: 'Prep by Company', icon: BusinessRoundedIcon },
];

// Reference links — grouped under "Explore" on desktop, second group on mobile.
// (Learn topics are reached through Aptitude Practice -> a pattern.)
const EXPLORE_LINKS = [
  { to: '/companies', label: 'Companies', icon: ApartmentRoundedIcon },
  { to: '/aptitude', label: 'One for All Aptitude', icon: CalculateRoundedIcon },
  { to: '/visualizer', label: 'Visualizer', icon: BarChartRoundedIcon },
  { to: '/pricing', label: 'Pricing', icon: WorkspacePremiumRoundedIcon },
];

// NOTE: Admin deliberately has no Navbar link. Admins reach /admin/login
// directly (see AdminLoginPage / ProtectedRoute redirectTo).

const isActivePath = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);

// Sections of the dashboard, reachable straight from the phone menu.
const DASH_SECTIONS = [
  { to: '/dashboard', label: 'Library', icon: LibraryBooksRoundedIcon, view: null },
  { to: '/dashboard?view=quests', label: 'Quests', icon: EmojiEventsRoundedIcon, view: 'quests' },
  { to: '/dashboard?view=explore', label: 'Explore', icon: ExploreRoundedIcon, view: 'explore' },
  { to: '/dashboard?view=plans', label: 'Study Plan', icon: SchoolRoundedIcon, view: 'plans' },
  { to: '/dashboard?view=leaderboard', label: 'Leaderboard', icon: LeaderboardRoundedIcon, view: 'leaderboard' },
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

function MenuHeading({ children }) {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1.5, mb: 0.5, fontWeight: 800, letterSpacing: 0.6 }}>
      {children}
    </Typography>
  );
}

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

  const handleActivateLicenseClick = () => {
    closeAll();
    setLicenseModalOpen(true);
  };

  const exploreActive = EXPLORE_LINKS.some((l) => isActivePath(pathname, l.to));

  const navButtonSx = (active) => (t) => ({
    fontWeight: 600,
    color: active ? t.palette.primary.main : 'inherit',
    bgcolor: active ? alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.14 : 0.08) : 'transparent',
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
              component={RouterLink}
              to="/you"
              onClick={() => setMobileOpen(false)}
              sx={(t) => ({
                mb: 2.5,
                p: 1.75,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderRadius: '24px',
                textDecoration: 'none',
                color: 'inherit',
                bgcolor: alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.18 : 0.12),
              })}
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
          )}

          <MenuHeading>MENU</MenuHeading>
          <Box sx={{ display: 'grid', gap: 0.25, mb: 1.5 }}>
            {[...PRIMARY_LINKS, ...EXPLORE_LINKS].map((link) => (
              <MenuRow key={link.to} {...link} active={isActivePath(pathname, link.to)} onNavigate={() => setMobileOpen(false)} />
            ))}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <MenuHeading>DASHBOARD</MenuHeading>
          <Box sx={{ display: 'grid', gap: 0.25 }}>
            {DASH_SECTIONS.map(({ to, label, icon, view }) => (
              <MenuRow
                key={label}
                to={to}
                label={label}
                icon={icon}
                active={pathname === '/dashboard' && (dashView || null) === view}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </Box>
        </Box>

        <Divider />
        <Box sx={{ p: 2, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {isAuthenticated ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: user?.isPro ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 1 }}>
              {!user?.isPro && (
                <Button onClick={handleActivateLicenseClick} color="inherit" variant="outlined" startIcon={<VpnKeyRoundedIcon />} sx={{ fontWeight: 700, borderRadius: '12px', textTransform: 'none', px: 1 }}>
                  License
                </Button>
              )}
              <Button onClick={handleSettingsClick} color="inherit" variant="outlined" startIcon={<SettingsRoundedIcon />} sx={{ fontWeight: 700, borderRadius: '12px', textTransform: 'none', px: 1 }}>
                Settings
              </Button>
              <Button onClick={handleLogout} color="inherit" variant="outlined" startIcon={<LogoutRoundedIcon />} sx={{ fontWeight: 700, borderRadius: '12px', textTransform: 'none', px: 1 }}>
                Log out
              </Button>
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
