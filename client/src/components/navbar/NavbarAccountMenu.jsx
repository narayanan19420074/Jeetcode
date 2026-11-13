import { useState } from 'react';
import { Avatar, Box, Button, ButtonBase, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Typography, alpha } from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../app/design/designTokens';
import { LIB_FONT } from '../../features/dashboard/components/libraryStyle';
import { ACCENT, TRACKING, libPal } from './navbarTheme';
import { initialsFromName } from './navConfig';

// Phone account dropdown in the Library look: warm panel, 48px rows, 24px icons, 16px text with the shared tracking.
const accountPaperSx = (theme) => ({
  borderRadius: RADII_PX.card,
  minWidth: SIZES.accountMenuMinWidth.desktop,
  mt: 0.5,
  [theme.breakpoints.down('md')]: {
    minWidth: SIZES.accountMenuMinWidth.mobile,
    mt: 1,
    bgcolor: libPal(theme).chip,
    color: libPal(theme).text,
    backgroundImage: 'none',
    boxShadow: 'none',
    border: `1px solid ${libPal(theme).border}`,
    fontFamily: LIB_FONT,
    '& .MuiTypography-root': { fontFamily: LIB_FONT },
  },
});

const accountItemSx = (theme) => ({
  [theme.breakpoints.down('md')]: {
    minHeight: SIZES.menuRowHeight,
    mx: 1,
    px: 1.5,
    gap: 1.5,
    borderRadius: RADII_PX.card,
    '& .MuiListItemIcon-root': { minWidth: SIZES.flexShrinkMinWidth, color: libPal(theme).chipText },
    '& .MuiSvgIcon-root': { fontSize: FONT_SIZES.display },
    '& .MuiListItemText-primary': { fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: TRACKING },
    '&:hover, &.Mui-focusVisible': { bgcolor: libPal(theme).player },
    '&:active': { bgcolor: alpha(ACCENT, 0.12) },
  },
});

const accountDividerSx = (theme) => ({
  [theme.breakpoints.down('md')]: { my: 0.5, mx: 2, borderColor: libPal(theme).divider },
});

const triggerSx = (theme) => ({
  textTransform: 'none',
  gap: 1,
  pl: 1,
  pr: { xs: 1, sm: 1.5 },
  ml: 0.5,
  [theme.breakpoints.down('md')]: { minWidth: SIZES.iconButton.mobile, width: SIZES.iconButton.mobile, height: SIZES.iconButton.mobile, p: 0, ml: 0, borderRadius: '50%' },
});

const triggerAvatarSx = (theme) => ({
  bgcolor: 'primary.main',
  width: SIZES.navAvatar,
  height: SIZES.navAvatar,
  fontSize: FONT_SIZES.body,
  fontWeight: FONT_WEIGHTS.bold,
  [theme.breakpoints.down('md')]: { bgcolor: ACCENT, color: COLOR_PALETTE.white, width: SIZES.iconButton.mobile, height: SIZES.iconButton.mobile, fontSize: FONT_SIZES.title },
});

function AccountTrigger({ user, onOpen }) {
  return (
    <Button onClick={onOpen} color="inherit" aria-haspopup="menu" aria-label="Account menu" sx={triggerSx}>
      <Avatar src={user?.avatarUrl || undefined} sx={triggerAvatarSx}>
        {initialsFromName(user?.name)}
      </Avatar>
      <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.semibold, display: { xs: 'none', md: 'block' } }}>
        {user?.name}
      </Typography>
    </Button>
  );
}

// Profile shortcut at the top of the dropdown. The avatar only shows on phones, where the dropdown is a card.
function AccountHeader({ user, onClick }) {
  const phoneNameSx = (theme) => ({ fontWeight: FONT_WEIGHTS.bold, [theme.breakpoints.down('md')]: { fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: TRACKING } });
  const phoneHandleSx = (theme) => ({ display: 'block', color: 'text.secondary', [theme.breakpoints.down('md')]: { fontSize: FONT_SIZES.body, lineHeight: '18px', letterSpacing: TRACKING, color: libPal(theme).muted } });
  return (
    <ButtonBase
      onClick={onClick}
      aria-label="Open my profile"
      sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, textAlign: 'left' }}
    >
      <Avatar
        src={user?.avatarUrl || undefined}
        sx={{ display: { xs: 'flex', md: 'none' }, bgcolor: ACCENT, color: COLOR_PALETTE.white, width: SIZES.menuRowHeight, height: SIZES.menuRowHeight, fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold, flexShrink: 0 }}
      >
        {initialsFromName(user?.name)}
      </Avatar>
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography variant="subtitle2" noWrap sx={phoneNameSx}>
          {user?.name}
        </Typography>
        <Typography variant="caption" noWrap sx={phoneHandleSx}>
          @{user?.handle}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

function AccountItem({ icon: Icon, label, onClick }) {
  return (
    <MenuItem onClick={onClick} sx={accountItemSx}>
      <ListItemIcon>
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={label} />
    </MenuItem>
  );
}

export default function NavbarAccountMenu({ user, actions }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const close = () => setAnchorEl(null);
  // Closing the dropdown first keeps it from lingering over the page the action opens.
  const run = (action) => () => {
    close();
    action();
  };

  return (
    <>
      <AccountTrigger user={user} onOpen={(event) => setAnchorEl(event.currentTarget)} />
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close} disableScrollLock slotProps={{ paper: { sx: accountPaperSx } }}>
        <AccountHeader user={user} onClick={run(actions.goToProfile)} />
        <Divider sx={accountDividerSx} />
        <AccountItem icon={PersonRoundedIcon} label="My profile" onClick={run(actions.goToProfile)} />
        <AccountItem icon={WorkOutlineRoundedIcon} label="Job profile" onClick={run(actions.goToJobProfile)} />
        <AccountItem icon={SettingsRoundedIcon} label="Settings" onClick={run(actions.goToSettings)} />
        <AccountItem icon={HelpOutlineRoundedIcon} label="Help & support" onClick={run(actions.goToHelp)} />
        {!user?.isPro && <AccountItem icon={VpnKeyRoundedIcon} label="Activate license" onClick={run(actions.openLicenseModal)} />}
        <Divider sx={accountDividerSx} />
        <AccountItem icon={LogoutRoundedIcon} label="Log out" onClick={run(actions.logout)} />
      </Menu>
    </>
  );
}
