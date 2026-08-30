import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Stack,
  Avatar,
  CircularProgress,
  Grid,
} from '@mui/material';
import { usersApi } from '../../api/usersApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from '../auth/authSlice';

const initialsFromName = (name) =>
  (name || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

function StatBlock({ label, value }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

export default function SettingsPage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  // --- Profile form state ---
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileStatus, setProfileStatus] = useState('idle'); // idle | loading | error | success
  const [profileError, setProfileError] = useState(null);

  // --- Password form state ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('idle');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState(null);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileStatus('loading');
    setProfileError(null);
    try {
      const { data } = await usersApi.updateProfile({ name, avatarUrl: avatarUrl || null });
      dispatch(userUpdated(data.data));
      setProfileStatus('success');
    } catch (err) {
      setProfileStatus('error');
      setProfileError(extractErrorMessage(err));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    setPasswordStatus('loading');
    try {
      const { data } = await usersApi.changePassword({
        currentPassword: currentPassword || undefined,
        newPassword,
      });
      setPasswordStatus('success');
      setPasswordSuccessMsg(data.message || 'Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordStatus('error');
      setPasswordError(extractErrorMessage(err));
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', px: 2, py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
        Settings
      </Typography>

      <Stack spacing={3}>
        {/* --- Profile --- */}
        <Paper elevation={0} variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Profile
          </Typography>

          {profileStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {profileError}
            </Alert>
          )}
          {profileStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setProfileStatus('idle')}>
              Profile updated
            </Alert>
          )}

          <Box component="form" onSubmit={handleProfileSubmit}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={avatarUrl || undefined} sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 700 }}>
                  {initialsFromName(name)}
                </Avatar>
                <TextField
                  label="Avatar URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  fullWidth
                  placeholder="https://..."
                  helperText="Paste an image URL. Leave blank to show initials instead."
                />
              </Stack>
              <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
              <TextField label="Email" value={user.email || ''} fullWidth disabled helperText="Email can't be changed here" />
              <TextField label="Handle" value={`@${user.handle || ''}`} fullWidth disabled />
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  disableElevation
                  disabled={profileStatus === 'loading'}
                  sx={{ fontWeight: 700, px: 3 }}
                >
                  {profileStatus === 'loading' ? <CircularProgress size={22} color="inherit" /> : 'Save changes'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* --- Account info (read-only) --- */}
        <Paper elevation={0} variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Account
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <StatBlock label="Role" value={user.role} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatBlock label="Current streak" value={`${user.streakDays ?? 0}d`} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatBlock label="Longest streak" value={`${user.longestStreak ?? 0}d`} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatBlock label="Total solved" value={user.totalSolved ?? 0} />
            </Grid>
          </Grid>
          {user.createdAt && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Member since {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
            </Typography>
          )}
        </Paper>

        {/* --- Password --- */}
        <Paper elevation={0} variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Password
          </Typography>

          {passwordStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          {passwordStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPasswordStatus('idle')}>
              {passwordSuccessMsg}
            </Alert>
          )}

          <Box component="form" onSubmit={handlePasswordSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
                helperText="Leave blank if you signed in with Google or GitHub and have never set a password"
              />
              <Divider />
              <TextField
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                required
                helperText="At least 8 characters"
              />
              <TextField
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                required
              />
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  disableElevation
                  disabled={passwordStatus === 'loading'}
                  sx={{ fontWeight: 700, px: 3 }}
                >
                  {passwordStatus === 'loading' ? <CircularProgress size={22} color="inherit" /> : 'Update password'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}
