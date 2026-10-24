import { useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Box, Button, Alert, Link, Stack, CircularProgress } from '@mui/material';
import { authApi } from '../../api/authApi';
import { extractErrorMessage } from '../../api/apiClient';
import AuthShell, { AuthField } from './AuthShell';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords match aagala');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      await authApi.resetPassword(token, password);
      setStatus('done');
    } catch (err) {
      setError(extractErrorMessage(err));
      setStatus('idle');
    }
  };

  const footer = (
    <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
      Back to sign in
    </Link>
  );

  if (!token) {
    return (
      <AuthShell title="Reset your password" footer={footer}>
        <Alert severity="error">
          Reset link sariyilla.{' '}
          <Link component={RouterLink} to="/forgot-password">Pudhu link request pannunga</Link>.
        </Alert>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" footer={footer}>
      {status === 'done' ? (
        <Alert severity="success">
          Password update aachu. Ella devices-layum sign out aagiduchu.{' '}
          <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>Sign in</Link>
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && (
              <Alert severity="error">
                {error}{' '}
                <Link component={RouterLink} to="/forgot-password">Pudhu link</Link>
              </Alert>
            )}
            <AuthField
              id="reset-password"
              label="New password"
              type="password"
              autoComplete="new-password"
              helperText="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <AuthField
              id="reset-confirm"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <Button type="submit" variant="contained" disableElevation fullWidth disabled={status === 'loading'} sx={{ fontWeight: 600 }}>
              {status === 'loading' ? <CircularProgress size={20} color="inherit" /> : 'Update password'}
            </Button>
          </Stack>
        </Box>
      )}
    </AuthShell>
  );
}
