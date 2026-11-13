import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { labelSx, rowBaseSx, rowDividerSx, tileSx } from './navbarMenuStyles';

const rowSx = { ...rowBaseSx, ...rowDividerSx };

// Row of the phone menu: same shape as the rows on the phone pages (tile, 1rem title, divider between rows).
export default function NavbarMenuRow({ to, label, icon: Icon, active, trailing, onNavigate }) {
  return (
    <Box component={RouterLink} to={to} onClick={onNavigate} aria-current={active ? 'page' : undefined} sx={rowSx}>
      <Box sx={tileSx(active)}>
        <Icon />
      </Box>
      <Typography noWrap sx={labelSx(active)}>
        {label}
      </Typography>
      {trailing}
    </Box>
  );
}
