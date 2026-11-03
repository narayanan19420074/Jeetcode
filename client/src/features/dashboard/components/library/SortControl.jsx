import { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { SORT_OPTIONS } from '../../dashboardUtils';
import useLibraryStyles from './libraryStyles';
import { RADII_PX } from '../../../../app/design/designTokens';

// Sort button with its menu. Sorting is off while searching, because search results are ranked by relevance.
export default function SortControl({ sort, disabled, onChange }) {
  const styles = useLibraryStyles();
  const [anchor, setAnchor] = useState(null);

  const choose = (value) => {
    onChange(value);
    setAnchor(null);
  };

  return (
    <>
      <Tooltip title={disabled ? 'Results are ranked by relevance while searching' : 'Sort'}>
        <span>
          <IconButton onClick={(e) => setAnchor(e.currentTarget)} disabled={disabled} aria-label="Sort problems" sx={styles.toolButton}>
            <SwapVertRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} slotProps={{ paper: { sx: { borderRadius: RADII_PX.card, minWidth: 230 } } }}>
        {SORT_OPTIONS.map((o) => (
          <MenuItem key={o.value} selected={sort === o.value} onClick={() => choose(o.value)} sx={{ justifyContent: 'space-between', gap: 2 }}>
            {o.label}
            {sort === o.value && <CheckRoundedIcon fontSize="small" color="primary" />}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
