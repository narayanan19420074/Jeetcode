import { Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';

// The "⋮" editor menu. items: [{ key, label, icon, onClick } | { key, divider: true }]
// Falsy entries are skipped, so pages can write  problem && { ... }.
export default function MoreMenu({ anchorEl, onClose, items }) {
  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      {items.filter(Boolean).map((it) =>
        it.divider ? (
          <Divider key={it.key} />
        ) : (
          <MenuItem
            key={it.key}
            onClick={() => {
              onClose();
              it.onClick();
            }}
          >
            <ListItemIcon>{it.icon}</ListItemIcon>
            <ListItemText>{it.label}</ListItemText>
          </MenuItem>
        )
      )}
    </Menu>
  );
}
