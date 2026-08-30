import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Divider,
  Chip,
  Tooltip,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
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

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mode = useSelector((s) => s.ui.mode);
  const { isAuthenticated, user, role } = useSelector((s) => s.auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);

  const handleLogout = async () => {
    setAnchorEl(null);
    setMobileOpen(false);
    await dispatch(logoutUser());
    navigate('/');
  };

  const handleSettingsClick = () => {
    setAnchorEl(null);
    setMobileOpen(false);
    navigate('/settings');
  };

  const handleActivateLicenseClick = () => {
    setAnchorEl(null);
    setMobileOpen(false);
    setLicenseModalOpen(true);
  };

  // Same link set powers both the desktop inline buttons and the mobile
  // drawer list — one array, two renderings, so a new nav link never
  // needs to be added in two places and drift out of sync.
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/problems', label: 'Problems' },
    { to: '/visualizer', label: 'Visualizer' },
    { to: '/learn', label: 'Learn' },
    ...(role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
    { to: '/pricing', label: 'Pricing' },
  ];

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: { xs: 1, sm: 2 } }}>
        {/* Hamburger — mobile only, opens the drawer with nav links */}
        <IconButton
          onClick={() => setMobileOpen(true)}
          color="inherit"
          sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 0.5 }}
          aria-label="Open navigation menu"
        >
          <MenuRoundedIcon />
        </IconButton>

        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', mr: { xs: 0, md: 2 } }}
        >
          <CodeRoundedIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Jeet  <Box component="span" sx={{ color: 'primary.main' }}>Code</Box>
          </Typography>
        </Box>

        {/* Desktop nav links — hidden below md, replaced by the drawer */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
          {navLinks.map((link) => (
            <Button key={link.to} component={RouterLink} to={link.to} color="inherit" sx={{ fontWeight: 600 }}>
              {link.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Streak chip and Pro badge hidden below sm — a ~380px mobile
            viewport doesn't have room for hamburger + logo + these +
            theme toggle + avatar all at once without wrapping/clipping. */}
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
          <IconButton onClick={() => dispatch(toggleThemeMode())} color="inherit">
            {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
        </Tooltip>

        {isAuthenticated ? (
          <>
            <Button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              color="inherit"
              sx={{ textTransform: 'none', gap: 1, pl: 1, pr: { xs: 1, sm: 1.5 }, ml: 1 }}
            >
              <Avatar
                src={user?.avatarUrl || undefined}
                sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700 }}
              >
                {initialsFromName(user?.name)}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                {user?.name}
              </Typography>
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  @{user?.handle}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => setAnchorEl(null)}>Profile</MenuItem>
              <MenuItem onClick={handleSettingsClick}>Settings</MenuItem>
              {!user?.isPro && (
                <MenuItem onClick={handleActivateLicenseClick}>
                  <VpnKeyRoundedIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                  Activate License
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleLogout}>Log out</MenuItem>
            </Menu>
          </>
        ) : (
          <Button component={RouterLink} to="/login" variant="contained" disableElevation sx={{ fontWeight: 700 }}>
            Sign in
          </Button>
        )}
      </Toolbar>

      {/* Mobile drawer — mirrors the desktop nav links, plus the streak
          and Pro badge that got hidden from the toolbar on small screens. */}
      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }} role="presentation">
          <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeRoundedIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              JeetCode
            </Typography>
          </Box>

          {isAuthenticated && (
            <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip
                icon={<LocalFireDepartmentRoundedIcon sx={{ color: 'warning.main !important' }} />}
                label={`${user?.streakDays ?? 0} days`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
              {user?.isPro && <ProBadge />}
            </Box>
          )}

          <Divider sx={{ mb: 1 }} />

          <List>
            {navLinks.map((link) => (
              <ListItemButton
                key={link.to}
                component={RouterLink}
                to={link.to}
                onClick={() => setMobileOpen(false)}
              >
                <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            ))}
            {isAuthenticated && !user?.isPro && (
              <ListItemButton onClick={handleActivateLicenseClick}>
                <VpnKeyRoundedIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                <ListItemText primary="Activate License" primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            )}
          </List>

          {!isAuthenticated && (
            <Box sx={{ px: 2, pt: 1 }}>
              <Button
                component={RouterLink}
                to="/login"
                onClick={() => setMobileOpen(false)}
                variant="contained"
                disableElevation
                fullWidth
                sx={{ fontWeight: 700 }}
              >
                Sign in
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      <ActivateLicenseModal open={licenseModalOpen} onClose={() => setLicenseModalOpen(false)} />
    </AppBar>
  );
}
