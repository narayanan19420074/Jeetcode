import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Paper, Grid, Button, Chip, Stack, Alert, CircularProgress } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { billingApi } from '../../api/billingApi';
import { loadRazorpayScript } from '../../api/loadRazorpayScript';
import { extractErrorMessage } from '../../api/apiClient';

const FEATURES = [
  'Every company-tagged problem (LeetCode Premium style)',
  'Unlimited AI hints',
  'Full TCS NQT Aptitude test suite',
  'Priority Judge0 queue during peak hours',
];

const MONTHLY_PRICE = 149;
const YEARLY_PRICE = 1199; // ~33% cheaper than 12x monthly

export default function PricingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [status, setStatus] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null); // 'monthly' | 'yearly' | null
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    billingApi.status().then(({ data }) => setStatus(data.data)).catch(() => {});
  }, [isAuthenticated]);

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }
    setError(null);
    setLoadingPlan(plan);
    try {
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) throw new Error('Could not load Razorpay checkout — check your connection and try again.');

      const { data } = await billingApi.checkout(plan);
      const { subscriptionId, keyId } = data.data;

      const razorpayCheckout = new window.Razorpay({
        key: keyId,
        subscription_id: subscriptionId,
        name: 'JeetCode Pro',
        description: `${plan === 'monthly' ? 'Monthly' : 'Yearly'} subscription`,
        theme: { color: '#3B82F6' },
        prefill: { name: user?.name, email: user?.email },
        handler: async (response) => {
          try {
            await billingApi.verify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate('/dashboard');
          } catch (err) {
            setError(extractErrorMessage(err));
          }
        },
        modal: { ondismiss: () => setLoadingPlan(null) },
      });

      razorpayCheckout.open();
    } catch (err) {
      setError(err.message || extractErrorMessage(err));
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await billingApi.cancel();
      const { data } = await billingApi.status();
      setStatus(data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Unlock JeetCode Pro
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Company-tagged problems, unlimited AI hints, and the full aptitude suite.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {status?.isPro && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <WorkspacePremiumRoundedIcon sx={{ color: 'warning.main' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                You're on the {status.proPlan === 'yearly' ? 'Yearly' : 'Monthly'} plan
              </Typography>
              {status.proExpiresAt && (
                <Typography variant="caption" color="text.secondary">
                  Renews / expires {new Date(status.proExpiresAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>
          <Button variant="outlined" color="error" size="small" disabled={cancelling} onClick={handleCancel} sx={{ fontWeight: 600 }}>
            {cancelling ? 'Cancelling…' : 'Cancel subscription'}
          </Button>
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>Monthly</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
              ₹{MONTHLY_PRICE}<Typography component="span" variant="body2" color="text.secondary">/month</Typography>
            </Typography>
            <Stack spacing={1} sx={{ my: 2, flexGrow: 1 }}>
              {FEATURES.map((f) => (
                <Stack key={f} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                  <CheckCircleRoundedIcon fontSize="small" sx={{ color: 'success.main', mt: 0.3 }} />
                  <Typography variant="body2">{f}</Typography>
                </Stack>
              ))}
            </Stack>
            <Button
              variant="outlined"
              disabled={loadingPlan === 'monthly' || status?.isPro}
              onClick={() => handleSubscribe('monthly')}
              sx={{ fontWeight: 700 }}
            >
              {loadingPlan === 'monthly' ? <CircularProgress size={20} /> : status?.isPro ? 'Current plan' : 'Subscribe monthly'}
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderColor: 'primary.main',
              borderWidth: 2,
              position: 'relative',
              background: (t) => (t.palette.mode === 'dark' ? 'linear-gradient(160deg, rgba(59,130,246,0.14), transparent)' : 'linear-gradient(160deg, rgba(59,130,246,0.08), transparent)'),
            }}
          >
            <Chip label="Best value" color="primary" size="small" sx={{ position: 'absolute', top: -12, left: 16, fontWeight: 700 }} />
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>Yearly</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
              ₹{YEARLY_PRICE}<Typography component="span" variant="body2" color="text.secondary">/year</Typography>
            </Typography>
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
              Save {Math.round((1 - YEARLY_PRICE / (MONTHLY_PRICE * 12)) * 100)}% vs monthly
            </Typography>
            <Stack spacing={1} sx={{ my: 2, flexGrow: 1 }}>
              {FEATURES.map((f) => (
                <Stack key={f} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                  <CheckCircleRoundedIcon fontSize="small" sx={{ color: 'success.main', mt: 0.3 }} />
                  <Typography variant="body2">{f}</Typography>
                </Stack>
              ))}
            </Stack>
            <Button
              variant="contained"
              disableElevation
              disabled={loadingPlan === 'yearly' || status?.isPro}
              onClick={() => handleSubscribe('yearly')}
              sx={{ fontWeight: 700 }}
            >
              {loadingPlan === 'yearly' ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : status?.isPro ? 'Current plan' : 'Subscribe yearly'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
