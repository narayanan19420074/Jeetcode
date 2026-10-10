import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, Typography } from '@mui/material';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import { useSnackbar } from 'notistack';
import { billingApi } from '../../../api/billingApi';
import ActivateLicenseModal from '../../../components/ActivateLicenseModal';
import { Card, CardBody, PageTitle, Row, describeError } from '../components/SettingsUi';

const PLAN_LABEL = { monthly: 'Monthly subscription', yearly: 'Yearly subscription', 'license-key': 'License key' };

export default function BillingSection() {
  const { enqueueSnackbar } = useSnackbar();
  useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [licenseOpen, setLicenseOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const subscription = user.proPlan === 'monthly' || user.proPlan === 'yearly';
  const expires = user.proExpiresAt ? new Date(user.proExpiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  const cancel = async () => {
    setBusy(true);
    setError(null);
    try {
      const { data } = await billingApi.cancel();
      enqueueSnackbar(data.message || 'Subscription cancelled', { variant: 'success' });
      setCancelOpen(false);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      <PageTitle title="Billing & plans" description="Your plan, license and subscription." />

      <Card title="Current plan">
        <CardBody>
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: user.isPro ? 'warning.main' : 'action.hover', color: user.isPro ? '#111827' : 'text.secondary' }}>
                <WorkspacePremiumRoundedIcon />
              </Box>
              <Box>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{user.isPro ? 'JeetCode Pro' : 'Free plan'}</Typography>
                  {user.isPro && <Chip size="small" color="warning" label="Active" />}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {user.isPro
                    ? `${PLAN_LABEL[user.proPlan] || 'Pro'}${expires ? ` · ${subscription ? 'renews / ends' : 'valid until'} ${expires}` : user.proPlan === 'license-key' ? ' · no expiry' : ''}`
                    : 'Upgrade to unlock Pro problems and company tracks.'}
                </Typography>
              </Box>
            </Stack>
            {!user.isPro && (
              <Button component={RouterLink} to="/pricing" variant="contained" disableElevation sx={{ fontWeight: 700 }}>
                View plans
              </Button>
            )}
          </Stack>
        </CardBody>
        {user.isPro && subscription && (
          <Row title="Cancel subscription" description="You keep Pro until the end of the period you've already paid for." control={<Button color="error" variant="outlined" onClick={() => setCancelOpen(true)}>Cancel subscription</Button>} />
        )}
      </Card>

      {!user.isPro && (
        <Card title="Have a license key?" description="Activate it to unlock Pro instantly.">
          <CardBody>
            <Button variant="outlined" color="inherit" startIcon={<VpnKeyRoundedIcon />} onClick={() => setLicenseOpen(true)} sx={{ borderColor: 'divider' }}>
              Activate license
            </Button>
          </CardBody>
        </Card>
      )}
      {user.isPro && user.proPlan !== 'license-key' && (
        <Card title="License key" description="Got a key from a campus or partner programme?">
          <CardBody>
            <Button variant="outlined" color="inherit" startIcon={<VpnKeyRoundedIcon />} onClick={() => setLicenseOpen(true)} sx={{ borderColor: 'divider' }}>
              Activate license
            </Button>
          </CardBody>
        </Card>
      )}

      <ActivateLicenseModal open={licenseOpen} onClose={() => setLicenseOpen(false)} />

      <Dialog open={cancelOpen} onClose={() => !busy && setCancelOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Cancel your subscription?</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <DialogContentText>Pro stays active until the end of your current billing period{expires ? ` (${expires})` : ''}. It won't renew after that.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelOpen(false)} disabled={busy} color="inherit">
            Keep Pro
          </Button>
          <Button variant="contained" color="error" disableElevation onClick={cancel} disabled={busy}>
            {busy ? <CircularProgress size={20} color="inherit" /> : 'Cancel subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
