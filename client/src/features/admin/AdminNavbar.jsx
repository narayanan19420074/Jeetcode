import { useDispatch, useSelector } from 'react-redux';
import { AppBar, Badge, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { toggleThemeMode } from '../../app/uiSlice';
import AdminAccountMenu from './common/AdminAccountMenu';
import { FONT_WEIGHTS } from '../../app/design/designTokens';

function AdminBrand() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CodeRoundedIcon sx={{ color: 'primary.main' }} />
      <Typography variant="h6" sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: '-0.02em' }}>
        Jeet <Box component="span" sx={{ color: 'primary.main' }}>Code</Box>
      </Typography>
    </Box>
  );
}

function ThemeModeButton() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.ui.mode);
  const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Tooltip title={label}>
      <IconButton onClick={() => dispatch(toggleThemeMode())} color="inherit" aria-label={label}>
        {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  );
}

// The badge on the menu button tells phone users there are unread chats before they open the menu.
function MenuButton({ unreadChats, onClick }) {
  return (
    <IconButton onClick={onClick} color="inherit" edge="start" aria-label="Open navigation menu">
      <Badge color="error" variant="dot" invisible={!unreadChats}>
        <MenuRoundedIcon />
      </Badge>
    </IconButton>
  );
}

// Deliberately NOT the client Navbar: no Dashboard/Problems/Prep links, no streak chip, no Pro badge.
export default function AdminNavbar({ showMenuButton, unreadChats, onMenuClick }) {
  return (
    <AppBar position="sticky" elevation={0} color="default" sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: { xs: 1, md: 2 } }}>
        {showMenuButton && <MenuButton unreadChats={unreadChats} onClick={onMenuClick} />}
        <AdminBrand />
        <Box sx={{ flexGrow: 1 }} />
        <ThemeModeButton />
        <AdminAccountMenu />
      </Toolbar>
    </AppBar>
  );
}
