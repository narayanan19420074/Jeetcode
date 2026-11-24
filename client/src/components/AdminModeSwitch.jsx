import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { setViewMode } from '../app/uiSlice';
import { showMobileBottomNav } from './MobileBottomNav';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES, Z_INDEX } from '../app/design/designTokens';

// The mode follows the page: opening the admin console means admin mode, opening the normal app means user mode.
// The saved mode only decides where an admin lands after signing in.
export function useRememberMode(mode) {
  const dispatch = useDispatch();
  const saved = useSelector((state) => state.ui.viewMode);
  useEffect(() => {
    if (saved !== mode) dispatch(setViewMode(mode));
  }, [dispatch, saved, mode]);
}

const pillSx = (bottomNav) => (theme) => ({
  position: 'fixed',
  left: theme.spacing(2),
  bottom: {
    xs: bottomNav ? `calc(${SIZES.bottomNavHeight}px + env(safe-area-inset-bottom) + ${theme.spacing(1.5)})` : `calc(env(safe-area-inset-bottom) + ${theme.spacing(2)})`,
    md: theme.spacing(2),
  },
  zIndex: Z_INDEX.dock,
  borderRadius: RADII_PX.pill,
  textTransform: 'none',
  fontSize: FONT_SIZES.body,
  fontWeight: FONT_WEIGHTS.semibold,
  px: 1.5,
});

// Shown to admin accounts on the normal app (user mode): one tap goes back to the admin console. Learners never see it.
export function AdminModePill() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.role);
  useRememberMode('user');
  if (role !== 'admin') return null;
  return (
    <Button variant="contained" size="small" startIcon={<ShieldRoundedIcon />} onClick={() => navigate('/admin')} aria-label="Switch to admin mode" sx={pillSx(showMobileBottomNav(pathname))}>
      Admin mode
    </Button>
  );
}

// User | Admin switch in the admin console's top bar. "User" opens the app as a normal learner sees it.
export function AdminModeToggle() {
  const navigate = useNavigate();
  useRememberMode('admin');
  const handleChange = (_event, next) => {
    if (next === 'user') navigate('/dashboard');
  };
  return (
    <ToggleButtonGroup exclusive size="small" value="admin" onChange={handleChange} aria-label="View mode" sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: FONT_WEIGHTS.semibold, px: 1.5 } }}>
      <ToggleButton value="user" aria-label="User mode">User</ToggleButton>
      <ToggleButton value="admin" aria-label="Admin mode">Admin</ToggleButton>
    </ToggleButtonGroup>
  );
}
