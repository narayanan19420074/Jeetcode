import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Alert, Link, Stack, CircularProgress, Typography } from '@mui/material';
import { authApi } from '../../api/authApi';
import { extractErrorMessage } from '../../api/apiClient';
import AuthShell, { AuthField } from './AuthShell';
import TurnstileWidget, { TURNSTILE_SITE_KEY } from '../../components/TurnstileWidget';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent
  const [error, setError] = useState(null);
  const [captcha, setCaptcha] = useState(null);
  const captchaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);
    try {
      await authApi.forgotPassword(email, captcha);
      setStatus('sent');
    } catch (err) {
      setError(extractErrorMessage(err));
      setStatus('idle');
      captchaRef.current?.reset(); // a verification token works only once
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      footer={
        <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
          Back to sign in
        </Link>
      }
    >
      {status === 'sent' ? (
        <Alert severity="success">
          If an account exists for <b>{email}</b>, we have sent a password reset link. It is valid for 30 minutes. Please check your inbox and spam folder.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Enter the email address for your account and we will send you a password reset link.
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <AuthField
              id="forgot-email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TurnstileWidget ref={captchaRef} onToken={setCaptcha} action="forgot-password" />
            <Button type="submit" variant="contained" disableElevation fullWidth disabled={status === 'loading' || (Boolean(TURNSTILE_SITE_KEY) && !captcha)} sx={{ fontWeight: 600 }}>
              {status === 'loading' ? <CircularProgress size={20} color="inherit" /> : 'Send reset link'}
            </Button>
          </Stack>
        </Box>
      )}
    </AuthShell>
  );
}
