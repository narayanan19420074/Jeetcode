import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Alert, Link, Stack, CircularProgress, Typography } from '@mui/material';
import { authApi } from '../../api/authApi';
import { extractErrorMessage } from '../../api/apiClient';
import AuthShell, { AuthField } from './AuthShell';
import TurnstileWidget, { TURNSTILE_SITE_KEY } from '../../components/TurnstileWidget';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // email | code | done
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [captcha, setCaptcha] = useState(null);
  const captchaRef = useRef(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const sendCode = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authApi.forgotPassword(email, captcha);
      setStep('code');
    } catch (err) {
      setError(extractErrorMessage(err));
      captchaRef.current?.reset(); // a verification token works only once
    } finally {
      setBusy(false);
    }
  };

  const resetWithCode = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authApi.resetPasswordWithCode(email, code, password);
      setStep('done');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // "Send a new code" goes back to the first step, which asks for the bot check again.
  const askAgain = () => {
    setStep('email');
    setCaptcha(null);
    setCode('');
    setError(null);
  };

  const footer = (
    <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
      Back to sign in
    </Link>
  );

  if (step === 'done') {
    return (
      <AuthShell title="Password updated" footer={footer}>
        <Alert severity="success">
          Your password has been updated and you have been signed out on all devices.{' '}
          <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>Sign in</Link>
        </Alert>
      </AuthShell>
    );
  }

  if (step === 'code') {
    return (
      <AuthShell title="Enter your code" footer={footer}>
        <Box component="form" onSubmit={resetWithCode}>
          <Stack spacing={2}>
            <Alert severity="info">
              If an account exists for <b>{email}</b>, we have sent a 6-digit code. It is valid for 30 minutes. Please check your inbox and spam folder.
            </Alert>
            {error && <Alert severity="error">{error}</Alert>}
            <AuthField
              id="forgot-code"
              label="6-digit code"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 } }}
            />
            <AuthField
              id="forgot-password"
              label="New password"
              type="password"
              autoComplete="new-password"
              helperText="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <AuthField
              id="forgot-confirm"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <Button type="submit" variant="contained" disableElevation fullWidth disabled={busy || code.length !== 6} sx={{ fontWeight: 600 }}>
              {busy ? <CircularProgress size={20} color="inherit" /> : 'Update password'}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Did not get it?{' '}
              <Link component="button" type="button" onClick={askAgain} underline="hover" sx={{ fontWeight: 600, verticalAlign: 'baseline' }}>
                Send a new code
              </Link>
              . You can ask once a minute.
            </Typography>
          </Stack>
        </Box>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset your password" footer={footer}>
      <Box component="form" onSubmit={sendCode}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Enter the email address for your account and we will send you a 6-digit code and a reset link.
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
          <Button type="submit" variant="contained" disableElevation fullWidth disabled={busy || (Boolean(TURNSTILE_SITE_KEY) && !captcha)} sx={{ fontWeight: 600 }}>
            {busy ? <CircularProgress size={20} color="inherit" /> : 'Send code'}
          </Button>
        </Stack>
      </Box>
    </AuthShell>
  );
}
