import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, ButtonBase, Drawer, Typography, alpha } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { ADMIN_MORE_ITEMS, isAdminItemActive } from '../common/adminNavItems';
import { LIB_ACCENT, LIB_TRACKING, LibraryFont, LibrarySheetHeader, librarySheetPaperSx, useLibraryPalette } from '../../dashboard/components/libraryStyle';

const ACTIVE_TILE_TINT = 0.16;
// Admins leave the console for the learner app from here; the phone header has no room for the User | Admin switch.
const USER_MODE_ROW = { to: '/dashboard', label: 'Switch to user mode', icon: PersonRoundedIcon };

const rowSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  width: SIZES.fill,
  minHeight: SIZES.adminMoreRow,
  textAlign: 'left',
  '&:last-of-type > :last-child': { borderBottom: 0 },
};

const tileSx = (pal, active) => ({
  width: SIZES.iconButton.mobile,
  height: SIZES.iconButton.mobile,
  flexShrink: 0,
  borderRadius: RADII_PX.circle,
  display: 'grid',
  placeItems: 'center',
  bgcolor: active ? alpha(LIB_ACCENT, ACTIVE_TILE_TINT) : pal.player,
  color: active ? LIB_ACCENT : pal.text,
});

const labelBoxSx = (pal) => ({
  flex: 1,
  minHeight: SIZES.adminMoreRow,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${pal.divider}`,
});

// One section: round icon tile, label, chevron; the open section is tinted with the accent.
function MoreRow({ icon: Icon, label, to, active = false, onNavigate }) {
  const pal = useLibraryPalette();
  return (
    <ButtonBase component={RouterLink} to={to} onClick={onNavigate} aria-current={active ? 'page' : undefined} sx={rowSx}>
      <Box aria-hidden sx={tileSx(pal, active)}>
        <Icon />
      </Box>
      <Box sx={labelBoxSx(pal)}>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING, fontWeight: active ? FONT_WEIGHTS.bold : FONT_WEIGHTS.regular, color: active ? LIB_ACCENT : pal.text }}>
          {label}
        </Typography>
        <ChevronRightRoundedIcon aria-hidden sx={{ color: pal.muted }} />
      </Box>
    </ButtonBase>
  );
}

// Bottom sheet opened by the "More" tab: the admin sections that have no tab, plus the switch to user mode.
export default function AdminMoreSheet({ open, onClose }) {
  const pal = useLibraryPalette();
  const { pathname } = useLocation();
  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: librarySheetPaperSx(pal) } }}>
      <LibraryFont>
        <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>
          <LibrarySheetHeader title="More" onClose={onClose} />
          {ADMIN_MORE_ITEMS.map((item) => (
            <MoreRow key={item.to} icon={item.icon} label={item.label} to={item.to} active={isAdminItemActive(pathname, item)} onNavigate={onClose} />
          ))}
          <MoreRow {...USER_MODE_ROW} onNavigate={onClose} />
        </Box>
      </LibraryFont>
    </Drawer>
  );
}
