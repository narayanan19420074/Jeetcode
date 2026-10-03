import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Alert,
  Divider,
  Link,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { loginUser, googleSignIn } from './authSlice';
import AuthShell, { AuthField } from './AuthShell';

// These env vars must exist in client/.env. GITHUB redirect URI must EXACTLY
// match what's registered on GitHub's app settings (trailing slashes matter).
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URI = `${window.location.origin}/auth/github/callback`;

const iconBtnSx = {
  width: 40,
  height: 40,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
};

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

  // Google Identity Services — renders its own icon-only button into
  // googleBtnRef once the GSI script (loaded via index.html) is ready.
  // The GSI script in index.html is `async defer`, so on a fresh page load it
  // may not exist yet when this component mounts. Poll briefly until it does.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;

    let timer;
    let tries = 0;
    const render = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) {
        if (tries++ < 50) timer = setTimeout(render, 200); // ~10s max
        return;
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          const result = await dispatch(googleSignIn({ idToken: response.credential }));
          if (googleSignIn.fulfilled.match(result)) {
            goToDest(result.payload.user);
          }
        },
      });
      googleBtnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'icon',
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
      });
    };
    render();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // GitHub — no SDK, just redirect to GitHub's consent screen.
  const handleGithubClick = () => {
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', GITHUB_CLIENT_ID);
    url.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI);
    url.searchParams.set('scope', 'read:user user:email');
    window.location.href = url.toString();
  };

  return (
    <AuthShell
      title="Sign in to JeetCode"
      footer={
        <>
          New to JeetCode?{' '}
          <Link component={RouterLink} to="/signup" underline="hover" sx={{ fontWeight: 600 }}>
            Create an account
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
            id="login-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthField
            id="login-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            disableElevation
            fullWidth
            disabled={status === 'loading'}
            sx={{ fontWeight: 600 }}
          >
            {status === 'loading' ? <CircularProgress size={20} color="inherit" /> : 'Sign in'}
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 2.5 }}>
        <Typography variant="caption" color="text.secondary">
          or continue with
        </Typography>
      </Divider>

      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', alignItems: 'center' }}>
        {/* Google renders its own icon button here */}
        <Box ref={googleBtnRef} sx={{ height: 40, display: 'flex', alignItems: 'center' }} />

        <Tooltip title="GitHub">
          <IconButton aria-label="Continue with GitHub" onClick={handleGithubClick} sx={iconBtnSx}>
            <GitHubIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* LinkedIn: pending product approval on LinkedIn's side */}
        <Tooltip title="LinkedIn (coming soon)">
          <span>
            <IconButton aria-label="LinkedIn (coming soon)" disabled sx={iconBtnSx}>
              <LinkedInIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Typography variant="body2" sx={{ textAlign: 'center', mt: 2.5 }}>
        <Link component={RouterLink} to="/dashboard" underline="hover" color="text.secondary">
          Continue as guest
        </Link>
      </Typography>
    </AuthShell>
  );
}
