import { useState, useEffect, useRef } from 'react';
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
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { loginUser, googleSignIn, githubSignIn } from './authSlice';

// These 3 env vars must exist in client/.env — see WIRING.md section on
// frontend setup. GOOGLE_CLIENT_ID must match the backend's, GITHUB/LINKEDIN
// redirect URIs must EXACTLY match what's registered on each provider's app
// settings (trailing slashes matter).
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URI = `${window.location.origin}/auth/github/callback`;

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const googleBtnRef = useRef(null);

  const goToDest = (user) => {
    const dest = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/dashboard');
    navigate(dest, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      goToDest(result.payload.user);
    }
  };

  // Google Identity Services — renders its own styled button into
  // googleBtnRef once the GSI script (loaded via index.html, see
  // WIRING.md) is ready. The button itself hands us a signed idToken via
  // this callback; we never touch Google credentials directly.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts?.id || !googleBtnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        const result = await dispatch(googleSignIn({ idToken: response.credential }));
        if (googleSignIn.fulfilled.match(result)) {
          goToDest(result.payload.user);
        }
      },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'outline',
      size: 'large',
      width: 360,
      text: 'continue_with',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // GitHub — no SDK, just redirect to GitHub's consent screen. GitHub
  // redirects back to /auth/github/callback?code=..., which is a
  // separate page (GithubCallbackPage.jsx) that finishes the sign-in.
  const handleGithubClick = () => {
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', GITHUB_CLIENT_ID);
    url.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI);
    url.searchParams.set('scope', 'read:user user:email');
    window.location.href = url.toString();
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

        <Stack spacing={1.5}>
          {/* Google renders its own button here via the GSI script */}
          <Box ref={googleBtnRef} sx={{ display: 'flex', justifyContent: 'center' }} />

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GitHubIcon />}
            onClick={handleGithubClick}
            sx={{ fontWeight: 600 }}
          >
            Continue with GitHub
          </Button>

          {/* LinkedIn: pending product approval on LinkedIn's side — see
              WIRING.md. Button wired but will 401 until that clears. */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LinkedInIcon />}
            disabled
            sx={{ fontWeight: 600 }}
          >
            Continue with LinkedIn (pending approval)
          </Button>
        </Stack>

        <Divider sx={{ my: 3 }} />

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
