import { Link as RouterLink } from 'react-router-dom';
import { Avatar, Box, Button, Divider, Drawer, IconButton, Tooltip, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../app/design/designTokens';
import { LIB_FONT, LibraryFont } from '../../features/dashboard/components/libraryStyle';
import ProBadge from '../ProBadge';
import { LogoMark, LogoName } from './NavbarBrand';
import NavbarMenuRow from './NavbarMenuRow';
import { DASH_SECTIONS, initialsFromName, isActivePath } from './navConfig';
import { ACCENT, TRACKING, footerIconSx, libPal, phoneBtnSx } from './navbarTheme';

const drawerPaperSx = {
  width: SIZES.drawerWidth,
  height: SIZES.viewportHeight,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '0 28px 28px 0',
  bgcolor: (theme) => libPal(theme).bg,
  color: (theme) => libPal(theme).text,
  fontFamily: LIB_FONT,
  pt: 'env(safe-area-inset-top)',
  pb: 'env(safe-area-inset-bottom)',
};

const dividerSx = (theme) => ({ borderColor: libPal(theme).divider });

function DrawerHeader({ mode, onToggleTheme, onClose }) {
  const ThemeIcon = mode === 'dark' ? LightModeRoundedIcon : DarkModeRoundedIcon;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, height: SIZES.navbarHeightPhone, flexShrink: 0 }}>
      <LogoMark />
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <LogoName />
      </Box>
      <IconButton onClick={onToggleTheme} aria-label="Toggle color theme" sx={phoneBtnSx}>
        <ThemeIcon />
      </IconButton>
      <IconButton onClick={onClose} aria-label="Close navigation menu" sx={{ width: SIZES.touchTarget, height: SIZES.touchTarget }}>
        <CloseRoundedIcon />
      </IconButton>
    </Box>
  );
}

function DrawerProfileRow({ user, onNavigate }) {
  return (
    <Box component={RouterLink} to="/you" onClick={onNavigate} sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit' }}>
      <Avatar src={user?.avatarUrl || undefined} sx={{ bgcolor: ACCENT, width: SIZES.menuRowHeight, height: SIZES.menuRowHeight, fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold, flexShrink: 0 }}>
        {initialsFromName(user?.name)}
      </Avatar>
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: TRACKING }}>
          {user?.name}
        </Typography>
        {user?.isPro && (
          <Box sx={{ mt: 0.5 }}>
            <ProBadge />
          </Box>
        )}
      </Box>
    </Box>
  );
}

function DrawerAccountCard({ user, onNavigate }) {
  return (
    <Box sx={(theme) => ({ mb: 1.5, borderRadius: RADII_PX.card, overflow: 'hidden', bgcolor: libPal(theme).chip })}>
      <DrawerProfileRow user={user} onNavigate={onNavigate} />
    </Box>
  );
}

// Coin balance shown at the end of the Store row; it opens the same Store page as the row itself.
function StoreCoinsBadge({ coins }) {
  return (
    <Box aria-label={`${coins} coins`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <MonetizationOnRoundedIcon sx={{ fontSize: FONT_SIZES.display, color: 'warning.main' }} />
      <Typography sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.body, letterSpacing: TRACKING, fontVariantNumeric: 'tabular-nums' }}>{coins.toLocaleString('en-IN')}</Typography>
    </Box>
  );
}

// Dashboard sections are active when the dashboard is open on that view (no view = the default section).
function DrawerLinks({ pathname, dashView, coins, showCoins, onNavigate }) {
  return (
    <Box sx={(theme) => ({ borderTop: `1px solid ${libPal(theme).divider}` })}>
      <NavbarMenuRow to="/store" label="Store" icon={StorefrontRoundedIcon} active={isActivePath(pathname, '/store')} trailing={showCoins ? <StoreCoinsBadge coins={coins} /> : null} onNavigate={onNavigate} />
      <NavbarMenuRow to="/prep" label="Companies" icon={BusinessRoundedIcon} active={isActivePath(pathname, '/prep')} onNavigate={onNavigate} />
      <NavbarMenuRow to="/plans" label="Plans" icon={WorkspacePremiumRoundedIcon} active={isActivePath(pathname, '/plans')} onNavigate={onNavigate} />
      {DASH_SECTIONS.map(({ to, label, icon, view }) => (
        <NavbarMenuRow key={label} to={to} label={label} icon={icon} active={pathname === '/dashboard' && (dashView || null) === view} onNavigate={onNavigate} />
      ))}
    </Box>
  );
}

function FooterIconAction({ title, label, icon: Icon, onClick }) {
  return (
    <Tooltip title={title}>
      <IconButton onClick={onClick} aria-label={label} sx={footerIconSx}>
        <Icon />
      </IconButton>
    </Tooltip>
  );
}

function SignedInFooter({ user, actions }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
      {!user?.isPro && <FooterIconAction title="Activate license" label="Activate license" icon={VpnKeyRoundedIcon} onClick={actions.openLicenseModal} />}
      <FooterIconAction title="Settings" label="Settings" icon={SettingsRoundedIcon} onClick={actions.goToSettings} />
      <FooterIconAction title="Help & support" label="Help and support" icon={HelpOutlineRoundedIcon} onClick={actions.goToHelp} />
      <FooterIconAction title="Log out" label="Log out" icon={LogoutRoundedIcon} onClick={actions.logout} />
    </Box>
  );
}

function SignedOutFooter({ onNavigate }) {
  const buttonSx = { fontWeight: FONT_WEIGHTS.bold, height: SIZES.menuRowHeight, borderRadius: RADII_PX.pill };
  return (
    <>
      <Button component={RouterLink} to="/login" onClick={onNavigate} variant="contained" disableElevation fullWidth sx={buttonSx}>
        Sign in
      </Button>
      <Button component={RouterLink} to="/signup" onClick={onNavigate} variant="outlined" color="inherit" fullWidth sx={buttonSx}>
        Create account
      </Button>
    </>
  );
}

// Phone menu: side sheet with the profile card, icon rows and account actions at the bottom.
export default function NavbarDrawer({ open, pathname, dashView, mode, isAuthenticated, user, coins, actions, onToggleTheme }) {
  return (
    <Drawer anchor="left" open={open} onClose={actions.closeDrawer} transitionDuration={220} slotProps={{ paper: { sx: drawerPaperSx } }}>
      <LibraryFont sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: SIZES.flexShrinkMinWidth }}>
        <DrawerHeader mode={mode} onToggleTheme={onToggleTheme} onClose={actions.closeDrawer} />
        <Divider sx={dividerSx} />
        <Box component="nav" aria-label="Main navigation" sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 1, pb: 1 }}>
          {isAuthenticated && <DrawerAccountCard user={user} onNavigate={actions.closeDrawer} />}
          <DrawerLinks pathname={pathname} dashView={dashView} coins={coins} showCoins={isAuthenticated} onNavigate={actions.closeDrawer} />
        </Box>
        <Divider sx={dividerSx} />
        <Box sx={{ px: 2, py: 1.5, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {isAuthenticated ? <SignedInFooter user={user} actions={actions} /> : <SignedOutFooter onNavigate={actions.closeDrawer} />}
        </Box>
      </LibraryFont>
    </Drawer>
  );
}
