import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button, Stack } from '@mui/material';
import { linkedinSignIn } from './authSlice';

// Route: /auth/linkedin/callback
// Same idea as GithubCallbackPage — LinkedIn redirects here with ?code=...
// after consent. The one difference: LinkedIn's token exchange requires
// the exact redirectUri to be sent again, so we reconstruct it identically
// to how LoginPage.jsx built it when starting the flow.
const LINKEDIN_REDIRECT_URI = `${window.location.origin}/auth/linkedin/callback`;

export default function LinkedinCallbackPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const ranOnce = useRef(false);

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
      setError('No authorization code received from LinkedIn.');
      return;
    }

    dispatch(linkedinSignIn({ code, redirectUri: LINKEDIN_REDIRECT_URI })).then((result) => {
      if (linkedinSignIn.fulfilled.match(result)) {
        const dest = result.payload.user.role === 'admin' ? '/admin' : '/dashboard';
        navigate(dest, { replace: true });
      } else {
        setError(result.payload || 'LinkedIn sign-in failed.');
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
        <Typography color="text.secondary">Signing you in with LinkedIn…</Typography>
      </Stack>
    </Box>
  );
}
