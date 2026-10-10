import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, LinearProgress, Stack, TextField, Typography } from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { useSnackbar } from 'notistack';
import { usersApi } from '../../../api/usersApi';
import { Card, CardBody, PageTitle, describeError } from '../components/SettingsUi';

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (pw.length >= 12) s += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  const levels = [
    { label: 'Too weak', color: 'error' },
    { label: 'Weak', color: 'error' },
    { label: 'Fair', color: 'warning' },
    { label: 'Good', color: 'info' },
    { label: 'Strong', color: 'success' },
    { label: 'Excellent', color: 'success' },
  ];
  return { score: s, ...levels[s] };
}

export default function PasswordSection() {
  const { enqueueSnackbar } = useSnackbar();
  const [hasPassword, setHasPassword] = useState(null);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    usersApi.account().then(({ data }) => setHasPassword(data.data.hasPassword)).catch(() => setHasPassword(true));
  }, []);

  const st = strength(next);
  const mismatch = confirm.length > 0 && confirm !== next;
  const valid = next.length >= 8 && next === confirm && (hasPassword === false || current.length > 0);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await usersApi.changePassword({ currentPassword: current || undefined, newPassword: next });
      enqueueSnackbar(hasPassword ? 'Password updated' : 'Password set — you can now sign in with email too', { variant: 'success' });
      setCurrent('');
      setNext('');
      setConfirm('');
      setHasPassword(true);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const adornment = {
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton size="small" aria-label={show ? 'Hide passwords' : 'Show passwords'} onClick={() => setShow((v) => !v)} edge="end">
            {show ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
          </IconButton>
        </InputAdornment>
      ),
    },
  };

  return (
    <Box>
      <PageTitle title="Password" description={hasPassword === false ? 'You sign in with a provider. Add a password to also sign in with your email.' : 'Use a long, unique password you don’t use anywhere else.'} />

      <Card title={hasPassword === false ? 'Set a password' : 'Change password'}>
        <CardBody>
          {hasPassword === null ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box component="form" onSubmit={submit} noValidate>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              <Stack spacing={2.25} sx={{ maxWidth: 440 }}>
                {hasPassword && <TextField label="Current password" type={show ? 'text' : 'password'} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" fullWidth slotProps={adornment} />}
                <Box>
                  <TextField label="New password" type={show ? 'text' : 'password'} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" fullWidth helperText="At least 8 characters." slotProps={hasPassword ? undefined : adornment} />
                  {next && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress variant="determinate" value={(st.score / 5) * 100} color={st.color} sx={{ height: 6, borderRadius: 3 }} />
                      <Typography variant="caption" color="text.secondary">
                        Strength: <b>{st.label}</b>
                      </Typography>
                    </Box>
                  )}
                </Box>
                <TextField label="Confirm new password" type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" fullWidth error={mismatch} helperText={mismatch ? "Passwords don't match" : ' '} />
                <Box>
                  <Button type="submit" variant="contained" disableElevation disabled={!valid || busy} sx={{ fontWeight: 700, px: 3 }}>
                    {busy ? <CircularProgress size={22} color="inherit" /> : hasPassword ? 'Update password' : 'Set password'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
