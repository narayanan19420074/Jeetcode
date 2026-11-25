import { AppBar, Badge, IconButton, Toolbar, Typography } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import AdminAccountMenu from '../common/AdminAccountMenu';
import ThemeModeButton from '../common/ThemeModeButton';
import { SIZES } from '../../../app/design/designTokens';

// Every icon button of the bar is one touch target (Material asks for 48dp; the app uses 44).
const iconButtonSx = { width: SIZES.touchTarget, height: SIZES.touchTarget };

// Material small top app bar: navigation icon, title, trailing actions. The title is the console name rather than the
// open section, because each page already starts with its own section heading. A dot on the menu icon tells the admin
// that chats are waiting while the drawer is closed.
export default function AdminMobileTopBar({ unreadChats, onMenuClick }) {
  return (
    <AppBar position="sticky" elevation={0} color="default" sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar disableGutters sx={{ minHeight: SIZES.appBarHeight.mobile, px: 1, gap: 0.5 }}>
        <IconButton edge="start" color="inherit" aria-label="Open navigation menu" onClick={onMenuClick} sx={iconButtonSx}>
          <Badge color="error" variant="dot" invisible={!unreadChats}>
            <MenuRoundedIcon />
          </Badge>
        </IconButton>
        <Typography variant="h6" component="div" noWrap sx={{ flexGrow: 1 }}>
          Admin Console
        </Typography>
        <ThemeModeButton sx={iconButtonSx} />
        <AdminAccountMenu />
      </Toolbar>
    </AppBar>
  );
}
