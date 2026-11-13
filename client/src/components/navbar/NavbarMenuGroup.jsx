import { Link as RouterLink } from 'react-router-dom';
import { useId } from 'react';
import { Box, ButtonBase, Collapse, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { FONT_SIZES, FONT_WEIGHTS, MOTION, SIZES } from '../../app/design/designTokens';
import { ACCENT, libPal } from './navbarTheme';
import { labelSx, rowBaseSx, rowDividerSx, tileSx } from './navbarMenuStyles';

const headerSx = { ...rowBaseSx, width: SIZES.fill, textAlign: 'left' };
const chevronSx = (open) => ({ transform: open ? 'rotate(180deg)' : 'none', transition: `transform ${MOTION.standard}ms` });

// Links inside a group line up under the group's label (past the icon tile), without a tile of their own.
const subLinkSx = (active) => (theme) => ({
  display: 'flex',
  alignItems: 'center',
  minHeight: SIZES.touchTarget,
  pl: `calc(${SIZES.menuRowHeight}px + ${theme.spacing(1.5)})`,
  textDecoration: 'none',
  fontSize: FONT_SIZES.body,
  fontWeight: active ? FONT_WEIGHTS.bold : FONT_WEIGHTS.regular,
  color: active ? ACCENT : libPal(theme).text,
});

export function NavbarSubLink({ to, label, active, onNavigate }) {
  return (
    <Box component={RouterLink} to={to} onClick={onNavigate} aria-current={active ? 'page' : undefined} sx={subLinkSx(active)}>
      <Typography noWrap sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
        {label}
      </Typography>
    </Box>
  );
}

// One menu entry that holds several related links, so the phone menu stays short: it shows a single icon and name, and
// the links appear when it is opened. The group is highlighted while one of its links is the current page.
export default function NavbarMenuGroup({ label, icon: Icon, active, open, onToggle, children }) {
  const panelId = useId();
  return (
    <Box sx={rowDividerSx}>
      <ButtonBase onClick={onToggle} aria-expanded={open} aria-controls={panelId} sx={headerSx}>
        <Box sx={tileSx(active)}>
          <Icon />
        </Box>
        <Typography noWrap sx={labelSx(active)}>
          {label}
        </Typography>
        <ExpandMoreRoundedIcon sx={chevronSx(open)} />
      </ButtonBase>
      <Collapse in={open} id={panelId} unmountOnExit>
        {children}
      </Collapse>
    </Box>
  );
}
