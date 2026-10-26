import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Box, Typography, Paper, Grid, Button, Chip, Stack, Alert, CircularProgress } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { billingApi } from '../../api/billingApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from '../auth/authSlice';

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
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const returnedOrder = searchParams.get('order');
  const { isAuthenticated } = useSelector((s) => s.auth);

  const [status, setStatus] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null); // 'monthly' | 'yearly' | null
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(Boolean(returnedOrder));
  const pollRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    billingApi.status().then(({ data }) => setStatus(data.data)).catch(() => {});
  }, [isAuthenticated]);

  // Back from the YouPI checkout page: the signed webhook activates Pro on the
  // server, so poll the order until it flips to paid (or give up after ~2 min).
  useEffect(() => {
    if (!returnedOrder || !isAuthenticated) return undefined;
    let tries = 0;
    const tick = async () => {
      tries += 1;
      try {
        const { data } = await billingApi.orderStatus(returnedOrder);
        const orderStatus = data.data.status;
        if (orderStatus === 'paid') {
          const res = await billingApi.status();
          dispatch(userUpdated(res.data.data));
          setStatus(res.data.data);
          setConfirming(false);
          navigate('/dashboard');
          return;
        }
        if (orderStatus !== 'created') {
          setConfirming(false);
          setError(`Payment ${orderStatus}. No money is taken unless it is confirmed — you can try again.`);
          return;
        }
      } catch (err) {
        setError(extractErrorMessage(err));
        setConfirming(false);
        return;
      }
      if (tries >= 40) {
        setConfirming(false);
        setError('Still waiting for the bank confirmation. If you paid, Pro will switch on automatically within a few minutes — refresh later.');
        return;
      }
      pollRef.current = setTimeout(tick, 3000);
    };
    tick();
    return () => clearTimeout(pollRef.current);
  }, [returnedOrder, isAuthenticated, dispatch, navigate]);

  const handleBuy = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }
    setError(null);
    setLoadingPlan(plan);
    try {
      const { data } = await billingApi.checkout(plan);
      window.location.href = data.data.checkoutUrl; // YouPI hosted UPI checkout
    } catch (err) {
      setError(extractErrorMessage(err));
      setLoadingPlan(null);
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

      {confirming && (
        <Alert severity="info" icon={<CircularProgress size={18} />} sx={{ mb: 3 }}>
          Confirming your payment with the bank… this can take up to a minute.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {status?.isPro && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <WorkspacePremiumRoundedIcon sx={{ color: 'warning.main' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                You have Pro ({status.proPlan === 'yearly' ? 'Yearly' : status.proPlan === 'monthly' ? 'Monthly' : 'Active'} pass)
              </Typography>
              {status.proExpiresAt && (
                <Typography variant="caption" color="text.secondary">
                  Valid until {new Date(status.proExpiresAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>Monthly</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
              ₹{MONTHLY_PRICE}<Typography component="span" variant="body2" color="text.secondary">for 30 days</Typography>
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
              disabled={Boolean(loadingPlan) || confirming || status?.isPro}
              onClick={() => handleBuy('monthly')}
              sx={{ fontWeight: 700 }}
            >
              {loadingPlan === 'monthly' ? <CircularProgress size={20} /> : status?.isPro ? 'Current plan' : 'Pay ₹' + MONTHLY_PRICE + ' via UPI'}
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
              ₹{YEARLY_PRICE}<Typography component="span" variant="body2" color="text.secondary">for 1 year</Typography>
            </Typography>
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
              One-time payment, no auto-renew · Save {Math.round((1 - YEARLY_PRICE / (MONTHLY_PRICE * 12)) * 100)}% vs monthly
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
              disabled={Boolean(loadingPlan) || confirming || status?.isPro}
              onClick={() => handleBuy('yearly')}
              sx={{ fontWeight: 700 }}
            >
              {loadingPlan === 'yearly' ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : status?.isPro ? 'Current plan' : 'Pay ₹' + YEARLY_PRICE + ' via UPI'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
