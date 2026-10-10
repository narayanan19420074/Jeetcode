import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import { useSnackbar } from 'notistack';
import { usersApi } from '../../../api/usersApi';
import { Card, PageTitle, describeError, formatDateTime, relativeTime } from '../components/SettingsUi';

export default function SessionsSection() {
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [allOpen, setAllOpen] = useState(false);
  const [allBusy, setAllBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await usersApi.sessions();
      setItems(data.data);
      setError(null);
    } catch (err) {
      setError(describeError(err));
      setItems([]);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const revoke = async (id) => {
    setBusyId(id);
    try {
      await usersApi.revokeSession(id);
      enqueueSnackbar('Device signed out', { variant: 'success' });
      await load();
    } catch (err) {
      enqueueSnackbar(describeError(err), { variant: 'error' });
    } finally {
      setBusyId(null);
    }
  };

  const revokeAll = async () => {
    setAllBusy(true);
    try {
      const { data } = await usersApi.revokeOtherSessions();
      enqueueSnackbar(data.message, { variant: 'success' });
      setAllOpen(false);
      await load();
    } catch (err) {
      enqueueSnackbar(describeError(err), { variant: 'error' });
      setAllOpen(false);
    } finally {
      setAllBusy(false);
    }
  };

  const others = (items || []).filter((s) => !s.current);

  return (
    <Box>
      <PageTitle
        title="Sessions"
        description="Devices that are signed in to your account. Sign out anything you don't recognise."
        action={
          others.length > 0 ? (
            <Button size="small" color="error" variant="outlined" onClick={() => setAllOpen(true)} sx={{ flexShrink: 0 }}>
              Sign out other devices
            </Button>
          ) : null
        }
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Card title={items ? `${items.length} active session${items.length === 1 ? '' : 's'}` : 'Active sessions'}>
        {items === null && (
          <Box sx={{ p: 3 }}>
            <Skeleton height={48} />
            <Skeleton height={48} />
          </Box>
        )}
        {items?.length === 0 && !error && (
          <Typography color="text.secondary" sx={{ p: 3 }}>
            No active sessions.
          </Typography>
        )}
        {items?.map((s, i) => {
          const Icon = s.device.mobile ? PhoneIphoneRoundedIcon : LaptopMacRoundedIcon;
          return (
            <Stack key={s.id} direction="row" sx={{ gap: 2, px: { xs: 2, sm: 3 }, py: 2, alignItems: 'center', borderBottom: i === items.length - 1 ? 'none' : '1px solid', borderColor: 'divider' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '10px', display: 'grid', placeItems: 'center', bgcolor: 'action.hover', flexShrink: 0 }}>
                <Icon />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontWeight: 700 }}>{s.device.label}</Typography>
                  {s.current && <Chip size="small" color="success" label="This device" />}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {s.ip || 'Unknown IP'} ·{' '}
                  <Tooltip title={`Signed in ${formatDateTime(s.signedInAt)}`}>
                    <span>last active {relativeTime(s.lastActiveAt)}</span>
                  </Tooltip>
                </Typography>
              </Box>
              {!s.current && (
                <Button size="small" color="error" variant="outlined" disabled={busyId === s.id} onClick={() => revoke(s.id)}>
                  {busyId === s.id ? <CircularProgress size={16} /> : 'Sign out'}
                </Button>
              )}
            </Stack>
          );
        })}
      </Card>

      <Dialog open={allOpen} onClose={() => !allBusy && setAllOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Sign out other devices?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {others.length} other session{others.length === 1 ? '' : 's'} will be signed out. This device stays signed in.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setAllOpen(false)} disabled={allBusy}>
            Cancel
          </Button>
          <Button variant="contained" color="error" disableElevation onClick={revokeAll} disabled={allBusy}>
            {allBusy ? <CircularProgress size={20} color="inherit" /> : 'Sign out others'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
