import { Drawer, ListItemIcon, Menu, MenuItem, MenuList } from '@mui/material';
import { RADII_PX, SIZES } from '../../../app/design/designTokens';

const sheetPaperSx = { borderRadius: `${RADII_PX.dialog} ${RADII_PX.dialog} 0 0`, pb: 'env(safe-area-inset-bottom)' };

function MenuEntries({ entries, onSelect }) {
  return entries.map(({ key, label, icon: Icon, onSelect: select, danger }) => (
    <MenuItem key={key} onClick={() => onSelect(select)} sx={{ minHeight: SIZES.touchTarget, color: danger ? 'error.main' : undefined }}>
      <ListItemIcon sx={{ color: 'inherit' }}><Icon /></ListItemIcon>
      {label}
    </MenuItem>
  ));
}

// Phones get a bottom sheet, larger screens a small popup menu next to the button. Both list the same entries.
export default function PostMenuOverlay({ anchor, isPhone, entries, onClose }) {
  const handleSelect = (select) => {
    onClose();
    select?.();
  };
  if (isPhone) {
    return (
      <Drawer anchor="bottom" open={Boolean(anchor)} onClose={onClose} slotProps={{ paper: { sx: sheetPaperSx } }}>
        <MenuList><MenuEntries entries={entries} onSelect={handleSelect} /></MenuList>
      </Drawer>
    );
  }
  return (
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={onClose}>
      <MenuEntries entries={entries} onSelect={handleSelect} />
    </Menu>
  );
}
