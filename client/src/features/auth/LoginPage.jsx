import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Link,
  Stack,
  CircularProgress,
} from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { loginUser } from './authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      const dest = location.state?.from?.pathname || (result.payload.user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(dest, { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: { xs: 3, sm: 5 }, width: '100%', maxWidth: 440, borderRadius: 3 }}
      >
        <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <CodeRoundedIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Free, forever. No paywalls between you and your next offer.
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
              label="Email"
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

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Button
          component={RouterLink}
          to="/dashboard"
          fullWidth
          variant="outlined"
          sx={{ fontWeight: 600 }}
        >
          Continue as Guest
        </Button>

        <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
          New here?{' '}
          <Link component={RouterLink} to="/signup" underline="hover" sx={{ fontWeight: 600 }}>
            Create a free account
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
