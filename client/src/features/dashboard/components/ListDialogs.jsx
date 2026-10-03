import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';

// One dialog for both "New list" and "Rename list". onConfirm(name) returns
// true when accepted, false when the name is empty or already taken.
export function NameDialog({ open, title, initial = '', confirmLabel, onClose, onConfirm }) {
  const [name, setName] = useState(initial);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initial);
      setError(false);
    }
  }, [open, initial]);

  const submit = (e) => {
    e.preventDefault();
    if (onConfirm(name)) onClose();
    else setError(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={submit}>
        <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="List name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(false);
            }}
            error={error}
            helperText={error ? 'Enter a name that none of your lists use yet.' : `${name.trim().length}/40`}
            slotProps={{ htmlInput: { maxLength: 40 } }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disableElevation disabled={!name.trim()}>
            {confirmLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// Menu opened from the star on a problem row: tick the lists it belongs to.
export function SaveToListMenu({ anchorEl, problem, lists, onToggle, onCreate, onClose }) {
  const [creating, setCreating] = useState(false);
  const open = Boolean(anchorEl) && Boolean(problem);

  const close = () => {
    setCreating(false);
    onClose();
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        slotProps={{ paper: { sx: { minWidth: 220, borderRadius: '12px', mt: 0.5 } } }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5, display: 'block', fontWeight: 600 }}>
          Save to list
        </Typography>
        {lists.map((l) => {
          const saved = problem ? l.items.some((i) => i._id === problem._id) : false;
          return (
            <MenuItem key={l.id} onClick={() => onToggle(l.id, problem)} sx={{ gap: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                {l.id === 'favorite' ? (
                  <StarRoundedIcon fontSize="small" sx={{ color: 'warning.main' }} />
                ) : (
                  <ListAltRoundedIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText primary={l.name} slotProps={{ primary: { noWrap: true, fontSize: '0.9rem' } }} />
              <Box sx={{ width: 20, display: 'flex', justifyContent: 'flex-end' }}>
                {saved && <CheckRoundedIcon fontSize="small" color="primary" />}
              </Box>
            </MenuItem>
          );
        })}
        <Divider />
        <MenuItem
          onClick={() => {
            setCreating(true);
          }}
          sx={{ gap: 0.5 }}
        >
          <ListItemIcon sx={{ minWidth: 30 }}>
            <AddRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="New list" slotProps={{ primary: { fontSize: '0.9rem' } }} />
        </MenuItem>
      </Menu>

      <NameDialog
        open={creating && open}
        title="Create a list"
        confirmLabel="Create"
        onClose={() => setCreating(false)}
        onConfirm={(name) => {
          const id = onCreate(name);
          if (!id) return false;
          onToggle(id, problem);
          return true;
        }}
      />
    </>
  );
}
