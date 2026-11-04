import { Link as RouterLink } from 'react-router-dom';
import { Alert, Divider, Link, Typography } from '@mui/material';
import { FONT_WEIGHTS } from '../../app/design/designTokens';
import AuthShell from './AuthShell';
import LoginFormFields from './login/LoginFormFields';
import SocialSignInButtons from './login/SocialSignInButtons';
import useLoginForm from './login/useLoginForm';

function SignUpPrompt() {
  return (
    <>
      New to JeetCode?{' '}
      <Link component={RouterLink} to="/signup" underline="hover" sx={{ fontWeight: FONT_WEIGHTS.semibold }}>
        Create an account
      </Link>
    </>
  );
}

export default function LoginPage() {
  const form = useLoginForm();
  return (
    <AuthShell title="Sign in to JeetCode" footer={<SignUpPrompt />}>
      {form.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {form.error}
        </Alert>
      )}
      <LoginFormFields form={form} />
      <Divider sx={{ my: 2.5 }}>
        <Typography variant="caption" color="text.secondary">
          or continue with
        </Typography>
      </Divider>
      <SocialSignInButtons />
      <Typography variant="body2" sx={{ textAlign: 'center', mt: 2.5 }}>
        <Link component={RouterLink} to="/dashboard" underline="hover" color="text.secondary">
          Continue as guest
        </Link>
      </Typography>
    </AuthShell>
  );
}
