import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Avatar, Badge, Box, Divider, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { logoutUser } from '../../auth/authSlice';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const initialsFromName = (name) =>
  (name || 'A')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const shieldBadgeSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: SIZES.iconSize.small,
  height: SIZES.iconSize.small,
  borderRadius: RADII_PX.circle,
  bgcolor: 'primary.main',
  border: '2px solid',
  borderColor: 'background.paper',
};

const avatarSx = {
  bgcolor: 'primary.main',
  width: SIZES.navAvatar,
  height: SIZES.navAvatar,
  fontSize: FONT_SIZES.body,
  fontWeight: FONT_WEIGHTS.bold,
};

function AdminShieldBadge() {
  return (
    <Tooltip title="Admin">
      <Box sx={shieldBadgeSx}>
        <ShieldRoundedIcon sx={{ fontSize: FONT_SIZES.micro, color: 'primary.contrastText' }} />
      </Box>
    </Tooltip>
  );
}

function AccountMenuHeader({ name }) {
  return (
    <>
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: FONT_WEIGHTS.bold }}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Administrator
        </Typography>
      </Box>
      <Divider />
    </>
  );
}

// Avatar button with the logout-only menu. Leaving the admin console takes an explicit logout.
export default function AdminAccountMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    setAnchorEl(null);
    await dispatch(logoutUser());
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} aria-label="Open account menu">
        <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} badgeContent={<AdminShieldBadge />}>
          <Avatar src={user?.avatarUrl || undefined} sx={avatarSx}>
            {initialsFromName(user?.name)}
          </Avatar>
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <AccountMenuHeader name={user?.name} />
        <MenuItem onClick={handleLogout}>Log out</MenuItem>
      </Menu>
    </>
  );
}
