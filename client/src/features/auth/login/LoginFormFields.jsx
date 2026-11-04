import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, CircularProgress, Link, Stack, Typography } from '@mui/material';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';
import TurnstileWidget, { TURNSTILE_SITE_KEY } from '../../../components/TurnstileWidget';
import { AuthField } from '../AuthShell';

const SPINNER_SIZE = 20;

export default function LoginFormFields({ form }) {
  const { email, setEmail, password, setPassword, setCaptchaToken, captchaToken, captchaRef, status, handleSubmit } = form;
  // Sign in stays disabled until the captcha is solved, but only when a captcha is configured.
  const blockedByCaptcha = Boolean(TURNSTILE_SITE_KEY) && !captchaToken;

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <AuthField id="login-email" label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <AuthField id="login-password" label="Password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <Typography variant="body2" sx={{ textAlign: 'right', mt: -1 }}>
          <Link component={RouterLink} to="/forgot-password" underline="hover">
            Forgot password?
          </Link>
        </Typography>
        <TurnstileWidget ref={captchaRef} onToken={setCaptchaToken} action="login" />
        <Button type="submit" variant="contained" disableElevation fullWidth disabled={status === 'loading' || blockedByCaptcha} sx={{ fontWeight: FONT_WEIGHTS.semibold }}>
          {status === 'loading' ? <CircularProgress size={SPINNER_SIZE} color="inherit" /> : 'Sign in'}
        </Button>
      </Stack>
    </Box>
  );
}
