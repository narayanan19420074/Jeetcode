import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, ButtonBase, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { billingApi } from '../../api/billingApi';
import { loadRazorpayScript } from '../../api/loadRazorpayScript';
import { extractErrorMessage } from '../../api/apiClient';
import ActivateLicenseModal from '../../components/ActivateLicenseModal';
import { tint } from '../dashboard/dashboardUtils';
import {
  LIB_ACCENT,
  LIB_TRACKING,
  LibraryFont,
  PageHeader,
  libBackBtnSx,
  libChipSx,
  libPanelSx,
  libSolidBtnSx,
  libTintBtnSx,
  useLibraryPalette,
} from '../dashboard/components/libraryStyle';

// Plans page: Free and Pro in the Library look (cream panels, 16px gutter, Roboto, pill buttons).
// Prices are the same as on the home page. Keep them in sync.
const PRICE = { monthly: 149, yearly: 1199 };
const PERIOD = { monthly: 'month', yearly: 'year' };
const SAVING_PERCENT = Math.round((1 - PRICE.yearly / (PRICE.monthly * 12)) * 100);
const PLAN_LABEL = { monthly: 'Monthly', yearly: 'Yearly', 'license-key': 'License key', 'quest-reward': 'Reward' };
const CHECK_GREEN = '#22A06B'; // same green as the cleared level cards on the dashboard

const FREE_FEATURES = [
  'Coding problems without company tags',
  'Aptitude patterns with lessons',
  'Dashboard, streaks and the leaderboard',
  'Pair rooms and the algorithm visualizer',
];
const PRO_FEATURES = [
  'Every company-tagged coding problem',
  'Unlimited AI hints',
  'The full aptitude test suite',
  'Unlimited mock test attempts',
];

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function FeatureList({ items }) {
  return (
    <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {items.map((text) => (
        <Stack component="li" key={text} direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
          <CheckRoundedIcon aria-hidden sx={{ fontSize: 22, mt: '1px', color: CHECK_GREEN, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>{text}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function PlanPanel({ highlighted = false, children }) {
  return (
    <Box
      sx={{
        ...libPanelSx,
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        ...(highlighted ? { border: `1.5px solid ${LIB_ACCENT}` } : {}),
      }}
    >
      {children}
    </Box>
  );
}

export default function PlansPage() {
  const navigate = useNavigate();
  const pal = useLibraryPalette();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [period, setPeriod] = useState('yearly'); // 'monthly' | 'yearly'
  const [status, setStatus] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [licenseOpen, setLicenseOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    billingApi.status().then(({ data }) => setStatus(data.data)).catch(() => {});
  }, [isAuthenticated]);

  const isPro = Boolean(status?.isPro ?? user?.isPro);
  const subscription = status?.proPlan === 'monthly' || status?.proPlan === 'yearly';

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/plans' } });
      return;
    }
    setError(null);
    setLoadingPlan(plan);
    try {
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) throw new Error('Could not load the payment window. Check your connection and try again.');

      const { data } = await billingApi.checkout(plan);
      const { subscriptionId, keyId } = data.data;

      const checkout = new window.Razorpay({
        key: keyId,
        subscription_id: subscriptionId,
        name: 'JeetCode Pro',
        description: `${PLAN_LABEL[plan]} subscription`,
        theme: { color: LIB_ACCENT },
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

      checkout.open();
    } catch (err) {
      setError(err.message || extractErrorMessage(err));
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      await billingApi.cancel();
      const { data } = await billingApi.status();
      setStatus(data.data);
      setCancelOpen(false);
    } catch (err) {
      setError(extractErrorMessage(err));
      setCancelOpen(false);
    } finally {
      setCancelling(false);
    }
  };

  const planSummary = () => {
    const name = PLAN_LABEL[status?.proPlan] || 'Pro';
    if (!status?.proExpiresAt) return `${name} · No expiry`;
    return `${name} · ${subscription ? 'Current period ends' : 'Active until'} ${formatDate(status.proExpiresAt)}`;
  };

  const linkSx = { color: LIB_ACCENT, fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } };

  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 3, maxWidth: { xs: 640, md: 880 }, mx: 'auto' }}>
        <IconButton component={RouterLink} to={isAuthenticated ? '/dashboard' : '/'} aria-label="Back to dashboard" sx={{ ...libBackBtnSx, display: { md: 'none' } }}>
          <ArrowBackRoundedIcon />
        </IconButton>

        <Box sx={{ mt: { xs: 0, md: 2 } }}>
          <PageHeader icon={WorkspacePremiumRoundedIcon} title="Plans" subtitle="Choose the plan that fits your preparation" />
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2.5 }}>
            {error}
          </Alert>
        )}

        {isPro && status && (
          <Box sx={{ ...libPanelSx, mt: 3, p: 2, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Box aria-hidden sx={{ width: 44, height: 44, borderRadius: '14px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: tint('#F09A2E', 16), color: '#F09A2E' }}>
              <WorkspacePremiumRoundedIcon />
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography sx={{ fontSize: 16, lineHeight: '24px', fontWeight: 500, letterSpacing: LIB_TRACKING }}>Your plan: Pro</Typography>
              <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>{planSummary()}</Typography>
            </Box>
            {subscription && (
              <Button disableElevation onClick={() => setCancelOpen(true)} sx={{ ...libTintBtnSx, height: 36, px: 2, fontSize: 15 }}>
                Cancel subscription
              </Button>
            )}
          </Box>
        )}

        <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5, alignItems: 'stretch' }}>
          {/* Free */}
          <PlanPanel>
            <Box>
              <Typography component="h2" sx={{ fontSize: 20, lineHeight: '28px', fontWeight: 700 }}>Free</Typography>
              <Typography sx={{ mt: 0.5, fontSize: 32, lineHeight: '40px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                ₹0
              </Typography>
              <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>Everything you need to begin</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <FeatureList items={FREE_FEATURES} />
            </Box>
            {!isAuthenticated ? (
              <Button component={RouterLink} to="/signup" disableElevation fullWidth sx={libTintBtnSx}>
                Sign up
              </Button>
            ) : !isPro ? (
              <Button disabled fullWidth sx={{ ...libTintBtnSx, '&.Mui-disabled': { color: pal.text, opacity: 0.6 } }}>
                Current plan
              </Button>
            ) : null}
          </PlanPanel>

          {/* Pro */}
          <PlanPanel highlighted>
            <Box>
              <Typography component="h2" sx={{ fontSize: 20, lineHeight: '28px', fontWeight: 700 }}>Pro</Typography>

              <Box role="group" aria-label="Billing period" sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                {['monthly', 'yearly'].map((p) => (
                  <ButtonBase key={p} onClick={() => setPeriod(p)} aria-pressed={period === p} sx={{ ...libChipSx(period === p), fontWeight: 500 }}>
                    {PLAN_LABEL[p]}
                    {p === 'yearly' && <Box component="span" sx={{ fontSize: 13 }}>Save {SAVING_PERCENT}%</Box>}
                  </ButtonBase>
                ))}
              </Box>

              <Typography sx={{ mt: 1.5, fontSize: 32, lineHeight: '40px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                ₹{PRICE[period].toLocaleString('en-IN')}
                <Box component="span" sx={{ ml: 0.75, fontSize: 16, fontWeight: 400, letterSpacing: LIB_TRACKING, color: pal.muted }}>
                  per {PERIOD[period]}
                </Box>
              </Typography>
              <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>
                {period === 'yearly' ? `Billed yearly. Save ${SAVING_PERCENT}% compared with monthly.` : 'Billed monthly. Cancel anytime.'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ mb: 1.25, fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>Everything in Free, plus:</Typography>
              <FeatureList items={PRO_FEATURES} />
            </Box>
            <Button
              disableElevation
              fullWidth
              disabled={Boolean(loadingPlan) || isPro}
              onClick={() => handleSubscribe(period)}
              sx={{ ...libSolidBtnSx, '&.Mui-disabled': { bgcolor: LIB_ACCENT, color: '#fff', opacity: 0.5 } }}
            >
              {loadingPlan ? <CircularProgress size={22} sx={{ color: '#fff' }} aria-label="Starting checkout" /> : isPro ? 'Current plan' : 'Subscribe'}
            </Button>
          </PlanPanel>
        </Box>

        {isAuthenticated && !isPro && (
          <Typography sx={{ mt: 2.5, textAlign: 'center', fontSize: 15, lineHeight: '22px', letterSpacing: LIB_TRACKING, color: pal.muted }}>
            Have a license key?{' '}
            <Box component="button" type="button" onClick={() => setLicenseOpen(true)} sx={{ ...linkSx, p: 0, border: 0, bgcolor: 'transparent', font: 'inherit', cursor: 'pointer' }}>
              Activate license
            </Box>
          </Typography>
        )}

        <Typography sx={{ mt: 2.5, textAlign: 'center', fontSize: 14, lineHeight: '22px', letterSpacing: LIB_TRACKING, color: pal.muted }}>
          Subscriptions renew automatically until cancelled. See the{' '}
          <Box component={RouterLink} to="/refund" sx={linkSx}>Refund &amp; Cancellation Policy</Box>,{' '}
          <Box component={RouterLink} to="/terms" sx={linkSx}>Terms</Box> and{' '}
          <Box component={RouterLink} to="/privacy" sx={linkSx}>Privacy Policy</Box>.
        </Typography>
      </Box>

      <Dialog
        open={cancelOpen}
        onClose={() => !cancelling && setCancelOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: '24px', bgcolor: pal.bg, backgroundImage: 'none', color: pal.text } } }}
      >
        <DialogTitle sx={{ fontSize: 20, fontWeight: 700 }}>Cancel subscription?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>
            You keep Pro until the end of the period you have already paid for. After that your account moves to the Free plan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button disableElevation disabled={cancelling} onClick={() => setCancelOpen(false)} sx={{ ...libTintBtnSx, height: 40, px: 2.5, fontSize: 16 }}>
            Keep plan
          </Button>
          <Button disableElevation disabled={cancelling} onClick={handleCancel} color="error" variant="contained" sx={{ height: 40, px: 2.5, borderRadius: 999, fontSize: 16, fontWeight: 500, textTransform: 'none' }}>
            {cancelling ? 'Cancelling…' : 'Cancel subscription'}
          </Button>
        </DialogActions>
      </Dialog>

      <ActivateLicenseModal open={licenseOpen} onClose={() => setLicenseOpen(false)} />
    </LibraryFont>
  );
}
