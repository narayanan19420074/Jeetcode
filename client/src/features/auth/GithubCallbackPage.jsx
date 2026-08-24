import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button, Stack } from '@mui/material';
import { githubSignIn } from './authSlice';

// Route: /auth/github/callback
// GitHub redirects here after the user approves the app, with ?code=...
// in the URL. This page's only job is: grab that code, finish the
// sign-in via the backend, then send the user on to their dashboard.
export default function GithubCallbackPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const ranOnce = useRef(false); // StrictMode/dev double-mount guard — a code can only be exchanged once

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const code = searchParams.get('code');
    const providerError = searchParams.get('error_description') || searchParams.get('error');

    if (providerError) {
      setError(providerError);
      return;
    }
    if (!code) {
      setError('No authorization code received from GitHub.');
      return;
    }

    dispatch(githubSignIn({ code })).then((result) => {
      if (githubSignIn.fulfilled.match(result)) {
        const dest = result.payload.user.role === 'admin' ? '/admin' : '/dashboard';
        navigate(dest, { replace: true });
      } else {
        setError(result.payload || 'GitHub sign-in failed.');
      }
    });
  }, [dispatch, navigate, searchParams]);

  if (error) {
    return (
      <Box
        sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}
      >
        <Stack spacing={2} alignItems="center" sx={{ maxWidth: 420 }}>
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/login', { replace: true })}>
            Back to sign in
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Stack spacing={2} alignItems="center">
        <CircularProgress />
        <Typography color="text.secondary">Signing you in with GitHub…</Typography>
      </Stack>
    </Box>
  );
}
