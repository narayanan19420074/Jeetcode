import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../app/design/designTokens';
import { EXPLORE_LINKS, PRIMARY_LINKS, isActivePath } from './navConfig';
import { navButtonSx } from './navLinkStyles';

function ExploreMenu({ anchorEl, pathname, onClose }) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: RADII_PX.card, minWidth: SIZES.accountMenuMinWidth.desktop, mt: 0.5 } } }}
    >
      {EXPLORE_LINKS.map(({ to, label, icon: Icon }) => (
        <MenuItem key={to} component={RouterLink} to={to} selected={isActivePath(pathname, to)} onClick={onClose}>
          <ListItemIcon>
            <Icon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={label} slotProps={{ primary: { fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.body } }} />
        </MenuItem>
      ))}
    </Menu>
  );
}

// Inline links of the desktop bar. The group stretches to the full bar height so the active border sits on the bar's bottom edge.
export default function NavbarDesktopLinks({ pathname }) {
  const [exploreAnchorEl, setExploreAnchorEl] = useState(null);
  const exploreActive = EXPLORE_LINKS.some((link) => isActivePath(pathname, link.to));

  return (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'stretch', alignSelf: 'stretch', gap: 0.5 }}>
      {PRIMARY_LINKS.map(({ to, label }) => (
        <Button
          key={to}
          component={RouterLink}
          to={to}
          aria-current={isActivePath(pathname, to) ? 'page' : undefined}
          sx={navButtonSx(isActivePath(pathname, to))}
        >
          {label}
        </Button>
      ))}
      <Button
        onClick={(event) => setExploreAnchorEl(event.currentTarget)}
        endIcon={<ExpandMoreRoundedIcon />}
        aria-haspopup="menu"
        aria-expanded={Boolean(exploreAnchorEl)}
        sx={navButtonSx(exploreActive)}
      >
        Explore
      </Button>
      <ExploreMenu anchorEl={exploreAnchorEl} pathname={pathname} onClose={() => setExploreAnchorEl(null)} />
    </Box>
  );
}
