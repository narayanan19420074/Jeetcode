import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import ActivateLicenseModal from '../../../components/ActivateLicenseModal';
import { Card, CardBody, PageTitle } from '../components/SettingsUi';

const PLAN_LABEL = { monthly: 'Monthly pass', yearly: 'Yearly pass', 'license-key': 'License key' };

export default function BillingSection() {
  const user = useSelector((s) => s.auth.user);
  const [licenseOpen, setLicenseOpen] = useState(false);

  const expires = user.proExpiresAt ? new Date(user.proExpiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  return (
    <Box>
      <PageTitle title="Billing & plans" description="Your plan and license." />

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
                    ? `${PLAN_LABEL[user.proPlan] || 'Pro'}${expires ? ` · valid until ${expires}` : user.proPlan === 'license-key' ? ' · no expiry' : ''}`
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

    </Box>
  );
}
