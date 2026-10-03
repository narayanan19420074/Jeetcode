import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Alert, Link, Stack, CircularProgress } from '@mui/material';
import { registerUser } from './authSlice';
import AuthShell, { AuthField } from './AuthShell';

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
    <AuthShell
      title="Create your account"
      footer={
        <>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
            Sign in
          </Link>
        </>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <AuthField
            id="signup-name"
            label="Full name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <AuthField
            id="signup-handle"
            label="Handle"
            autoComplete="username"
            value={handle}
            onChange={(e) => setHandle(e.target.value.toLowerCase())}
            helperText="Lowercase letters, numbers, underscores only. This is your public username."
          />
          <AuthField
            id="signup-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthField
            id="signup-password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="At least 8 characters"
          />
          <Button
            type="submit"
            variant="contained"
            disableElevation
            fullWidth
            disabled={status === 'loading'}
            sx={{ fontWeight: 600 }}
          >
            {status === 'loading' ? <CircularProgress size={20} color="inherit" /> : 'Create account'}
          </Button>
        </Stack>
      </Box>
    </AuthShell>
  );
}
