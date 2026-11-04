import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { FONT_WEIGHTS } from '../../app/design/designTokens';
import { isDashboardPath } from '../../features/dashboard/desktop/desktopLook';
import { LogoMark, LogoName } from './NavbarBrand';
import { hamburgerSx, phoneBtnSx } from './navbarTheme';

export function HamburgerButton({ onClick }) {
  return (
    <IconButton onClick={onClick} color="inherit" sx={hamburgerSx} aria-label="Open navigation menu">
      <MenuRoundedIcon />
    </IconButton>
  );
}

// The phone Home page shows only the menu button in the top bar; the brand stays visible on every other phone page and on desktop.
export function BrandLink({ isAuthenticated }) {
  const { pathname } = useLocation();
  const brandDisplay = { xs: isDashboardPath(pathname) ? 'none' : 'flex', md: 'flex' };
  return (
    <Box
      component={RouterLink}
      to={isAuthenticated ? '/dashboard' : '/'}
      sx={{ display: brandDisplay, alignItems: 'center', gap: { xs: 1.5, md: 1 }, textDecoration: 'none', color: 'inherit', mr: { xs: 0, md: 2 } }}
    >
      <LogoMark />
      <LogoName />
    </Box>
  );
}

// On phones the theme switch lives in the menu drawer only.
export function ThemeToggleButton({ mode, onToggle }) {
  return (
    <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton onClick={onToggle} color="inherit" aria-label="Toggle color theme" sx={[phoneBtnSx, { display: { xs: 'none', md: 'inline-flex' } }]}>
        {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  );
}

export function SignInButton() {
  return (
    <Button component={RouterLink} to="/login" variant="contained" disableElevation sx={{ fontWeight: FONT_WEIGHTS.bold }}>
      Sign in
    </Button>
  );
}
