import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Divider, Drawer, IconButton, Tooltip } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { FONT_WEIGHTS, RADII_PX, SIZES } from '../../app/design/designTokens';
import { LIB_FONT, LibraryFont } from '../../features/dashboard/components/libraryStyle';
import ProBadge from '../ProBadge';
import { LogoMark, LogoName } from './NavbarBrand';
import NavbarMenuRow from './NavbarMenuRow';
import { DASH_SECTIONS, isActivePath } from './navConfig';
import { footerIconSx, libPal, phoneBtnSx } from './navbarTheme';

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

// Phone menu rows, most used first: own progress, learning plan and company prep, then competition and
// social, then Explore, Store and Plans. Dashboard sections come from DASH_SECTIONS (looked up by view).
const dashRow = (view) => ({ ...DASH_SECTIONS.find((section) => section.view === view), isDashboard: true });
const DRAWER_ROWS = [
  { to: '/you', label: 'My stats', icon: InsightsRoundedIcon, signedInOnly: true },
  dashRow('plans'),
  { to: '/prep', label: 'Companies', icon: BusinessRoundedIcon },
  dashRow('contest'),
  dashRow('quests'),
  dashRow('leaderboard'),
  dashRow('friends'),
  dashRow('explore'),
  { to: '/store', label: 'Store', icon: StorefrontRoundedIcon },
  { to: '/plans', label: 'Plans', icon: WorkspacePremiumRoundedIcon },
];

// Dashboard sections are active when the dashboard is open on that view (no view = the default section).
const isRowActive = (row, pathname, dashView) => (row.isDashboard ? pathname === '/dashboard' && (dashView || null) === row.view : isActivePath(pathname, row.to));

function DrawerLinks({ pathname, dashView, user, isAuthenticated, onNavigate }) {
  return (
    <Box>
      {DRAWER_ROWS.filter((row) => isAuthenticated || !row.signedInOnly).map((row) => (
        <NavbarMenuRow
          key={row.label}
          to={row.to}
          label={row.label}
          icon={row.icon}
          active={isRowActive(row, pathname, dashView)}
          trailing={row.to === '/you' && user?.isPro ? <ProBadge /> : null}
          onNavigate={onNavigate}
        />
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
export default function NavbarDrawer({ open, pathname, dashView, mode, isAuthenticated, user, actions, onToggleTheme }) {
  return (
    <Drawer anchor="left" open={open} onClose={actions.closeDrawer} transitionDuration={220} slotProps={{ paper: { sx: drawerPaperSx } }}>
      <LibraryFont sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: SIZES.flexShrinkMinWidth }}>
        <DrawerHeader mode={mode} onToggleTheme={onToggleTheme} onClose={actions.closeDrawer} />
        <Divider sx={dividerSx} />
        <Box component="nav" aria-label="Main navigation" sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 1, pb: 1 }}>
          <DrawerLinks pathname={pathname} dashView={dashView} user={user} isAuthenticated={isAuthenticated} onNavigate={actions.closeDrawer} />
        </Box>
        <Divider sx={dividerSx} />
        <Box sx={{ px: 2, py: 1.5, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {isAuthenticated ? <SignedInFooter user={user} actions={actions} /> : <SignedOutFooter onNavigate={actions.closeDrawer} />}
        </Box>
      </LibraryFont>
    </Drawer>
  );
}
