import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Alert, Stack, CircularProgress } from '@mui/material';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { adminLoginUser } from './authSlice';

// Deliberately separate from the general LoginPage — no OAuth buttons, no
// "Continue as Guest", no signup link, distinct dark visual treatment so
// it never gets confused with the normal user login. Posts to
// /api/auth/admin-login, which rejects any non-admin account outright
// (same generic error as a wrong password, so it never leaks who is/isn't
// an admin).
export default function AdminLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(adminLoginUser({ email, password }));
    if (adminLoginUser.fulfilled.match(result)) {
      navigate('/admin', { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0b0f19',
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: { xs: 3, sm: 5 }, width: '100%', maxWidth: 400, borderRadius: 3, bgcolor: 'background.paper' }}
      >
        <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <ShieldRoundedIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Admin Access
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Restricted — authorized administrators only.
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Admin email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
            />
            <Button
              type="submit"
              variant="contained"
              disableElevation
              size="large"
              disabled={status === 'loading'}
              sx={{ fontWeight: 700, py: 1.2 }}
            >
              {status === 'loading' ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
