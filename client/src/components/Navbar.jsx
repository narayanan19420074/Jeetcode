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
  ListSubheader,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
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

// Primary links — core product flows the user hits often. Kept inline on
// desktop so they're always one click away.
const PRIMARY_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/problems', label: 'Problems' },
  { to: '/prep', label: 'Prep by Company' },
];

// Secondary/reference links — browsed occasionally, not core to the daily
// loop. Grouped under an "Explore" dropdown on desktop so the toolbar
// doesn't sprawl to 7 buttons; still one click away, just not inline.
const EXPLORE_LINKS = [
  { to: '/aptitude', label: 'Aptitude Practice' },
  { to: '/visualizer', label: 'Visualizer' },
  { to: '/learn', label: 'Learn' },
  { to: '/pricing', label: 'Pricing' },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mode = useSelector((s) => s.ui.mode);
  const { isAuthenticated, user, role } = useSelector((s) => s.auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [exploreAnchorEl, setExploreAnchorEl] = useState(null);
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

  // Admin stays a standalone top-level link (not folded into Explore) —
  // it's conditional on role so it adds zero clutter for the ~all-users
  // who never see it, and the admins who do see it expect it front and
  // center, not buried a click deeper.
  const adminLink = role === 'admin' ? { to: '/admin', label: 'Admin' } : null;

  // Mobile drawer flattens everything into one scrollable list (vertical
  // space isn't as tight as toolbar width), but keeps the same
  // primary/explore grouping via a subheader so the split reads the same
  // way it does on desktop.
  const mobileLinks = [...PRIMARY_LINKS, ...(adminLink ? [adminLink] : [])];

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
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
          {PRIMARY_LINKS.map((link) => (
            <Button key={link.to} component={RouterLink} to={link.to} color="inherit" sx={{ fontWeight: 600 }}>
              {link.label}
            </Button>
          ))}
          {adminLink && (
            <Button component={RouterLink} to={adminLink.to} color="inherit" sx={{ fontWeight: 600 }}>
              {adminLink.label}
            </Button>
          )}

          <Button
            onClick={(e) => setExploreAnchorEl(e.currentTarget)}
            color="inherit"
            endIcon={<ExpandMoreRoundedIcon />}
            sx={{ fontWeight: 600 }}
          >
            Explore
          </Button>
          <Menu anchorEl={exploreAnchorEl} open={Boolean(exploreAnchorEl)} onClose={() => setExploreAnchorEl(null)}>
            {EXPLORE_LINKS.map((link) => (
              <MenuItem
                key={link.to}
                component={RouterLink}
                to={link.to}
                onClick={() => setExploreAnchorEl(null)}
              >
                {link.label}
              </MenuItem>
            ))}
          </Menu>
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

      {/* Mobile drawer — mirrors the desktop primary/Explore split via a
          subheader, plus the streak and Pro badge that got hidden from
          the toolbar on small screens. */}
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
            {mobileLinks.map((link) => (
              <ListItemButton
                key={link.to}
                component={RouterLink}
                to={link.to}
                onClick={() => setMobileOpen(false)}
              >
                <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            ))}
          </List>

          <List
            subheader={
              <ListSubheader component="div" sx={{ lineHeight: 2.5, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                EXPLORE
              </ListSubheader>
            }
          >
            {EXPLORE_LINKS.map((link) => (
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
