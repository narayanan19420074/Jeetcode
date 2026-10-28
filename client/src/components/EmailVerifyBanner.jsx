import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button } from '@mui/material';
import { authApi } from '../api/authApi';
import { extractErrorMessage } from '../api/apiClient';

// Slim reminder for logged-in users whose email is not verified yet. It never blocks anything.
export default function EmailVerifyBanner() {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null); // { severity, text }

  if (!isAuthenticated || !user || user.emailVerified !== false || user.role === 'admin' || hidden) return null;

  const resend = async () => {
    setBusy(true);
    try {
      const { data } = await authApi.resendVerification();
      setNote({ severity: 'success', text: data?.message || 'Verification email sent.' });
    } catch (err) {
      setNote({ severity: 'warning', text: extractErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Alert
      severity={note?.severity || 'info'}
      variant="standard"
      onClose={() => setHidden(true)}
      sx={{ borderRadius: 0, py: 0.25, alignItems: 'center' }}
      action={
        !note?.severity || note.severity === 'warning' ? (
          <Button color="inherit" size="small" onClick={resend} disabled={busy} sx={{ fontWeight: 600 }}>
            {busy ? 'Sending...' : 'Resend email'}
          </Button>
        ) : undefined
      }
    >
      {note ? note.text : `Your email address (${user.email}) is not verified yet. Check your inbox for the verification link.`}
    </Alert>
  );
}
