import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Alert, CircularProgress, Link, Stack, Typography } from '@mui/material';
import { authApi } from '../../api/authApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from './authSlice';
import AuthShell from './AuthShell';

export default function VerifyEmailPage() {
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [state, setState] = useState({ status: token ? 'loading' : 'error', message: token ? '' : 'Verification link sariyilla.' });
  const started = useRef(false); // the token is single use; StrictMode must not call twice

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    authApi
      .verifyEmail(token)
      .then(() => {
        dispatch(userUpdated({ emailVerified: true })); // no-op when logged out
        setState({ status: 'ok', message: '' });
      })
      .catch((err) => setState({ status: 'error', message: extractErrorMessage(err) }));
  }, [token, dispatch]);

  return (
    <AuthShell
      title="Email verification"
      footer={
        <Link component={RouterLink} to="/dashboard" underline="hover" sx={{ fontWeight: 600 }}>
          Go to dashboard
        </Link>
      }
    >
      {state.status === 'loading' && (
        <Stack alignItems="center" spacing={1.5} sx={{ py: 2 }}>
          <CircularProgress size={28} />
          <Typography variant="body2">Verify pannikitte irukkom...</Typography>
        </Stack>
      )}
      {state.status === 'ok' && <Alert severity="success">Email verify aachu. Nandri!</Alert>}
      {state.status === 'error' && <Alert severity="error">{state.message}</Alert>}
    </AuthShell>
  );
}
