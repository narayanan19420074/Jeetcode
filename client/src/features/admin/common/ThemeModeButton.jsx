import { useDispatch, useSelector } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { toggleThemeMode } from '../../../app/uiSlice';

// Light / dark switch shared by the desktop top bar and the phone top app bar (which sizes it through `sx`).
export default function ThemeModeButton({ sx }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.ui.mode);
  const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Tooltip title={label}>
      <IconButton onClick={() => dispatch(toggleThemeMode())} color="inherit" aria-label={label} sx={sx}>
        {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  );
}
