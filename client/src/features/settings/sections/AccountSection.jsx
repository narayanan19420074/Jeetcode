import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Skeleton, Stack, TextField, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { useSnackbar } from 'notistack';
import { usersApi } from '../../../api/usersApi';
import { logoutUser, userUpdated } from '../../auth/authSlice';
import { Card, CardBody, PageTitle, Row, describeError } from '../components/SettingsUi';

function Stat({ label, value }) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.2, fontFamily: '"JetBrains Mono", monospace' }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

function Method({ icon, name, on, detail }) {
  return (
    <Row title={<Stack direction="row" component="span" sx={{ alignItems: 'center', gap: 1 }}>{icon}{name}</Stack>} description={detail} control={<Chip size="small" color={on ? 'success' : 'default'} variant={on ? 'filled' : 'outlined'} label={on ? 'Connected' : 'Not connected'} />} />
  );
}

export default function AccountSection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector((s) => s.auth.user);
  const [account, setAccount] = useState(null);

  // handle change
  const [handle, setHandle] = useState(user.handle);
  const [handleBusy, setHandleBusy] = useState(false);
  const [handleError, setHandleError] = useState(null);
  const [handleDialog, setHandleDialog] = useState(false);

  // export
  const [exporting, setExporting] = useState(false);

  // delete
  const [delOpen, setDelOpen] = useState(false);
  const [delConfirm, setDelConfirm] = useState('');
  const [delPassword, setDelPassword] = useState('');
  const [delBusy, setDelBusy] = useState(false);
  const [delError, setDelError] = useState(null);

  useEffect(() => {
    usersApi.account().then(({ data }) => setAccount(data.data)).catch(() => setAccount({ hasPassword: true, providers: user.providers || {} }));
  }, [user.providers]);

  const handleNorm = handle.trim().toLowerCase();
  const handleValid = /^[a-z0-9_]{3,30}$/.test(handleNorm);

  const changeHandle = async () => {
    setHandleBusy(true);
    setHandleError(null);
    try {
      const { data } = await usersApi.changeHandle(handleNorm);
      dispatch(userUpdated(data.data));
      setHandle(data.data.handle);
      setHandleDialog(false);
      enqueueSnackbar(`Username changed to @${data.data.handle}`, { variant: 'success' });
    } catch (err) {
      setHandleError(describeError(err));
      setHandleDialog(false);
    } finally {
      setHandleBusy(false);
    }
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const res = await usersApi.exportData();
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jeetcode-${user.handle}-export.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      enqueueSnackbar('Your data export has been downloaded', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(describeError(err), { variant: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = async () => {
    setDelBusy(true);
    setDelError(null);
    try {
      await usersApi.deleteAccount({ confirm: delConfirm, password: delPassword || undefined });
      await dispatch(logoutUser());
      navigate('/', { replace: true });
    } catch (err) {
      setDelError(describeError(err));
      setDelBusy(false);
    }
  };

  const isLearner = user.role === 'learner';
  const providers = account?.providers || user.providers || {};

  return (
    <Box>
      <PageTitle title="Account" description="Your username, how you sign in, and your data." />

      <Card title="Overview">
        <CardBody>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <Stat label="Role" value={user.role} />
            <Stat label="Current streak" value={`${user.streakDays ?? 0}d`} />
            <Stat label="Longest streak" value={`${user.longestStreak ?? 0}d`} />
            <Stat label="Problems solved" value={user.totalSolved ?? 0} />
          </Box>
          {user.createdAt && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Member since {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          )}
        </CardBody>
      </Card>

      <Card title="Change username" description="Your username is how people find you. Changing it frees up the old one for anyone to take.">
        <CardBody>
          {handleError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setHandleError(null)}>
              {handleError}
            </Alert>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5, alignItems: { sm: 'flex-start' } }}>
            <TextField
              label="Username"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase())}
              fullWidth
              error={handle !== user.handle && !handleValid}
              helperText="3–30 characters: lowercase letters, numbers and underscores."
              slotProps={{ htmlInput: { maxLength: 30, autoCapitalize: 'none', spellCheck: false }, input: { startAdornment: <Typography color="text.secondary" sx={{ mr: 0.5 }}>@</Typography> } }}
            />
            <Button variant="outlined" color="inherit" disabled={handleNorm === user.handle || !handleValid} onClick={() => setHandleDialog(true)} sx={{ height: 56, flexShrink: 0, borderColor: 'divider' }}>
              Change username
            </Button>
          </Stack>
        </CardBody>
      </Card>

      <Card title="Sign-in methods" description="Ways you can get into this account.">
        {account ? (
          <>
            <Method icon={<MailOutlineRoundedIcon fontSize="small" />} name="Email & password" on={account.hasPassword} detail={account.hasPassword ? user.email : 'No password set yet — add one under Password.'} />
            <Method icon={<GoogleIcon fontSize="small" />} name="Google" on={providers.google} />
            <Method icon={<GitHubIcon fontSize="small" />} name="GitHub" on={providers.github} />
            <Method icon={<LinkedInIcon fontSize="small" />} name="LinkedIn" on={providers.linkedin} />
          </>
        ) : (
          <CardBody>
            <Skeleton height={28} />
            <Skeleton height={28} />
          </CardBody>
        )}
        <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Signing in with a provider that uses this email address links it automatically.
          </Typography>
        </Box>
      </Card>

      <Card title="Export your data" description="Download a copy of everything we store for your account — profile, preferences, solved problems, submissions (with code), aptitude progress and security log — as a JSON file.">
        <CardBody>
          <Button variant="outlined" color="inherit" startIcon={exporting ? <CircularProgress size={16} /> : <DownloadRoundedIcon />} disabled={exporting} onClick={exportData} sx={{ borderColor: 'divider' }}>
            Export account data
          </Button>
        </CardBody>
      </Card>

      <Card tone="danger" title="Danger zone">
        <Row
          title="Delete this account"
          description={
            isLearner
              ? 'Permanently removes your profile, submissions, streaks and aptitude progress. This cannot be undone.'
              : 'Staff accounts own authored content, so they cannot be self-deleted. Ask an admin to change your role first.'
          }
          control={
            <Button variant="outlined" color="error" disabled={!isLearner} onClick={() => setDelOpen(true)}>
              Delete account
            </Button>
          }
        />
      </Card>

      {/* Confirm username change */}
      <Dialog open={handleDialog} onClose={() => !handleBusy && setHandleDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Change username?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <b>@{user.handle}</b> will become <b>@{handleNorm}</b>. Anyone could claim <b>@{user.handle}</b> afterwards.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setHandleDialog(false)} disabled={handleBusy} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" disableElevation onClick={changeHandle} disabled={handleBusy}>
            {handleBusy ? <CircularProgress size={20} color="inherit" /> : 'Yes, change it'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete account */}
      <Dialog open={delOpen} onClose={() => !delBusy && setDelOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>Delete your account?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This permanently deletes your data. Consider exporting it first.
          </Alert>
          {delError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {delError}
            </Alert>
          )}
          <Stack spacing={2}>
            <TextField label={`Type your username (${user.handle}) to confirm`} value={delConfirm} onChange={(e) => setDelConfirm(e.target.value)} fullWidth autoFocus slotProps={{ htmlInput: { autoCapitalize: 'none', spellCheck: false } }} />
            {account?.hasPassword && <TextField label="Password" type="password" value={delPassword} onChange={(e) => setDelPassword(e.target.value)} fullWidth autoComplete="current-password" />}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDelOpen(false)} disabled={delBusy} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="error" disableElevation onClick={deleteAccount} disabled={delBusy || delConfirm.trim().toLowerCase() !== user.handle || (account?.hasPassword && !delPassword)}>
            {delBusy ? <CircularProgress size={20} color="inherit" /> : 'Delete my account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
