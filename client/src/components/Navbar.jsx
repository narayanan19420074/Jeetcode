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
  List,
  ListItemButton,
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
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
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
  { to: '/aptitude', label: 'Aptitude Practice', icon: CalculateRoundedIcon },
  { to: '/visualizer', label: 'Visualizer', icon: BarChartRoundedIcon },
  { to: '/pricing', label: 'Pricing', icon: WorkspacePremiumRoundedIcon },
];

// NOTE: Admin deliberately has no Navbar link. Admins reach /admin/login
// directly (see AdminLoginPage / ProtectedRoute redirectTo).

const isActivePath = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);

const DRAWER_WIDTH = 'min(86vw, 320px)';

function DrawerLink({ link, active, onNavigate }) {
  const Icon = link.icon;
  return (
    <ListItemButton
      component={RouterLink}
      to={link.to}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      sx={(t) => ({
        mx: 1.5,
        mb: 0.25,
        px: 1.5,
        py: 1.1,
        borderRadius: '10px',
        gap: 1.5,
        color: active ? t.palette.text.primary : t.palette.text.secondary,
        bgcolor: active ? alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.16 : 0.1) : 'transparent',
        '&:hover': { bgcolor: active ? undefined : t.palette.action.hover, color: t.palette.text.primary },
      })}
    >
      <Icon sx={{ fontSize: 21, color: active ? 'primary.main' : 'inherit' }} />
      <Typography variant="body2" sx={{ fontWeight: active ? 700 : 600 }}>
        {link.label}
      </Typography>
    </ListItemButton>
  );
}

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
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

      {/* Mobile drawer: account on top, two link groups, account actions pinned to the bottom. */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{ paper: { sx: { width: DRAWER_WIDTH, display: 'flex', flexDirection: 'column' } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, height: 56, flexShrink: 0 }}>
          <CodeRoundedIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', flex: 1 }}>
            Jeet<Box component="span" sx={{ color: 'primary.main' }}>Code</Box>
          </Typography>
          <IconButton onClick={() => setMobileOpen(false)} aria-label="Close navigation menu" edge="end">
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5 }} component="nav" aria-label="Main navigation">
          {isAuthenticated && (
            <Box
              component={RouterLink}
              to="/settings"
              onClick={() => setMobileOpen(false)}
              sx={(t) => ({
                mx: 1.5,
                mb: 1.5,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'inherit',
                border: `1px solid ${t.palette.divider}`,
                '&:hover': { bgcolor: t.palette.action.hover },
              })}
            >
              <Avatar
                src={user?.avatarUrl || undefined}
                sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700 }}
              >
                {initialsFromName(user?.name)}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
                  {user?.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                  <LocalFireDepartmentRoundedIcon sx={{ fontSize: 15, color: 'warning.main' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {user?.streakDays ?? 0}-day streak
                  </Typography>
                  {user?.isPro && <ProBadge />}
                </Box>
              </Box>
            </Box>
          )}

          <List disablePadding>
            {PRIMARY_LINKS.map((link) => (
              <DrawerLink key={link.to} link={link} active={isActivePath(pathname, link.to)} onNavigate={() => setMobileOpen(false)} />
            ))}
          </List>

          <Divider sx={{ my: 1.5, mx: 2 }} />

          <List disablePadding>
            {EXPLORE_LINKS.map((link) => (
              <DrawerLink key={link.to} link={link} active={isActivePath(pathname, link.to)} onNavigate={() => setMobileOpen(false)} />
            ))}
          </List>
        </Box>

        <Divider />
        <Box sx={{ p: 1.5, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {isAuthenticated ? (
            <>
              {!user?.isPro && (
                <ListItemButton onClick={handleActivateLicenseClick} sx={{ borderRadius: '10px', gap: 1.5, px: 1.5 }}>
                  <VpnKeyRoundedIcon sx={{ fontSize: 21, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Activate license
                  </Typography>
                </ListItemButton>
              )}
              <ListItemButton onClick={handleSettingsClick} sx={{ borderRadius: '10px', gap: 1.5, px: 1.5 }}>
                <SettingsRoundedIcon sx={{ fontSize: 21, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Settings
                </Typography>
              </ListItemButton>
              <ListItemButton onClick={handleLogout} sx={{ borderRadius: '10px', gap: 1.5, px: 1.5 }}>
                <LogoutRoundedIcon sx={{ fontSize: 21, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Log out
                </Typography>
              </ListItemButton>
            </>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/login"
                onClick={() => setMobileOpen(false)}
                variant="contained"
                disableElevation
                fullWidth
                sx={{ fontWeight: 700, py: 1 }}
              >
                Sign in
              </Button>
              <Button
                component={RouterLink}
                to="/signup"
                onClick={() => setMobileOpen(false)}
                variant="outlined"
                color="inherit"
                fullWidth
                sx={{ fontWeight: 700, py: 1 }}
              >
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
