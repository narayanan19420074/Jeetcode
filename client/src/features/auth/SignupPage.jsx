import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Stack,
  CircularProgress,
} from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { registerUser } from './authSlice';

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser({ name, handle, email, password }));
    if (registerUser.fulfilled.match(result)) {
      navigate('/dashboard', { replace: true });
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
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Every feature. Zero cost. Built so nobody's blocked from FAANG prep by a price tag.
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required autoFocus />
            <TextField
              label="Handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase())}
              fullWidth
              required
              helperText="Lowercase letters, numbers, underscores only — this is your public username"
            />
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              helperText="At least 8 characters"
            />
            <Button
              type="submit"
              variant="contained"
              disableElevation
              size="large"
              disabled={status === 'loading'}
              sx={{ fontWeight: 700, py: 1.2 }}
            >
              {status === 'loading' ? <CircularProgress size={22} color="inherit" /> : 'Create account'}
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
