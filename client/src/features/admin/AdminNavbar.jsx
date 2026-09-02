import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
} from '@mui/material';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { toggleThemeMode } from '../../app/uiSlice';
import { logoutUser } from '../auth/authSlice';

const initialsFromName = (name) =>
  (name || 'A')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

// Deliberately NOT the client Navbar — no Dashboard/Problems/Prep/Explore
// links, no streak chip, no Pro badge, no license activation. Just the
// JeetCode mark, a small shield "Admin" badge anchored on the avatar, and
// a logout-only menu. This panel doesn't route anywhere else — leaving
// it takes an explicit logout, not a click on a nav link.
export default function AdminNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mode = useSelector((s) => s.ui.mode);
  const { user } = useSelector((s) => s.auth);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    setAnchorEl(null);
    await dispatch(logoutUser());
    navigate('/admin/login', { replace: true });
  };

  return (
    <AppBar position="sticky" elevation={0} color="default" sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeRoundedIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Jeet <Box component="span" sx={{ color: 'primary.main' }}>Code</Box>
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton onClick={() => dispatch(toggleThemeMode())} color="inherit">
            {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
        </Tooltip>

        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Tooltip title="Admin">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    border: '2px solid',
                    borderColor: 'background.paper',
                  }}
                >
                  <ShieldRoundedIcon sx={{ fontSize: 11, color: 'primary.contrastText' }} />
                </Box>
              </Tooltip>
            }
          >
            <Avatar
              src={user?.avatarUrl || undefined}
              sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700 }}
            >
              {initialsFromName(user?.name)}
            </Avatar>
          </Badge>
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Administrator
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleLogout}>Log out</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
