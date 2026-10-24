import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress,
  Paper, Stack, Step, StepLabel, Stepper, Tab, Tabs, Typography,
} from '@mui/material';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import { useSnackbar } from 'notistack';
import { storeApi } from '../../api/storeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from '../auth/authSlice';
import { Coins, SHIP_STEPS, STATUS_META, fmtDate, fmtDateTime, fmt } from './storeUtils';

function OrderCard({ order, onOpen }) {
  const meta = STATUS_META[order.status] || STATUS_META.placed;
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }} onClick={() => onOpen(order)}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800 }} noWrap>
            {order.itemName}{order.qty > 1 ? ` ×${order.qty}` : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {order.orderNo} · {fmtDate(order.createdAt)}
            {order.variant?.size ? ` · ${order.variant.size}` : ''}{order.variant?.color ? ` · ${order.variant.color}` : ''}
          </Typography>
        </Box>
        <Stack alignItems="flex-end" spacing={0.5}>
          <Coins value={order.total} />
          <Chip size="small" color={meta.color} label={meta.label} sx={{ fontWeight: 700 }} />
        </Stack>
      </Stack>
    </Paper>
  );
}

function OrderDialog({ order, onClose, onCancelled }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [busy, setBusy] = useState(false);
  if (!order) return null;
  const physical = order.kind === 'physical';
  const cancelled = order.status === 'cancelled';
  const step = SHIP_STEPS.indexOf(order.status);
  const a = order.address;

  const cancel = async () => {
    setBusy(true);
    try {
      const { data } = await storeApi.cancelOrder(order.id);
      if (data.data.user) dispatch(userUpdated(data.data.user));
      enqueueSnackbar('Order cancelled, coins refunded', { variant: 'success' });
      onCancelled();
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>{order.itemName}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Order {order.orderNo} · {fmtDateTime(order.createdAt)} · <Coins value={order.total} size={16} />
        </Typography>

        {physical && !cancelled && (
          <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
            {SHIP_STEPS.map((s) => <Step key={s}><StepLabel>{STATUS_META[s].label}</StepLabel></Step>)}
          </Stepper>
        )}
        {cancelled && <Alert severity="info" sx={{ mb: 2 }}>Cancelled{order.cancelReason ? `: ${order.cancelReason}` : ''}. Coins were returned to your wallet.</Alert>}
        {order.kind === 'pro' && order.proUntil && <Alert severity="success" sx={{ mb: 2 }}>Pro active until {fmtDate(order.proUntil)}.</Alert>}
        {order.kind === 'course' && (
          <Button component={RouterLink} to={`/store/course/${order.itemSlug}`} variant="contained" disableElevation sx={{ mb: 2, fontWeight: 800 }}>Open course</Button>
        )}

        {order.tracking?.number && (
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Tracking</Typography>
            <Typography sx={{ fontWeight: 700 }}>{order.tracking.carrier || 'Courier'} · {order.tracking.number}</Typography>
            {order.tracking.url && <Button size="small" href={order.tracking.url} target="_blank" rel="noopener noreferrer">Track package</Button>}
          </Paper>
        )}

        {a && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Delivering to</Typography>
            <Typography variant="body2" color="text.secondary">
              {a.fullName}, {a.phone}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />{a.city}, {a.state} {a.pincode}
            </Typography>
          </Box>
        )}

        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Timeline</Typography>
        {[...order.history].reverse().map((h, i) => (
          <Typography key={i} variant="body2" color="text.secondary">
            {fmtDateTime(h.at)} · {STATUS_META[h.status]?.label || h.status}{h.note ? ` · ${h.note}` : ''}
          </Typography>
        ))}
      </DialogContent>
      <DialogActions>
        {physical && order.status === 'placed' && (
          <Button color="error" onClick={cancel} disabled={busy}>{busy ? 'Cancelling…' : 'Cancel & refund'}</Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function Library({ courses }) {
  if (!courses) return <CircularProgress size={22} />;
  if (!courses.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography sx={{ fontWeight: 800 }}>No courses yet</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Courses you redeem show up here with your progress.</Typography>
        <Button component={RouterLink} to="/store?cat=courses" variant="contained" disableElevation>Browse courses</Button>
      </Box>
    );
  }
  return (
    <Stack spacing={1.5}>
      {courses.map((c) => (
        <Paper key={c.slug} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800 }}>{c.name}</Typography>
              <Typography variant="caption" color="text.secondary">{c.progress.doneCount}/{c.progress.lessonCount} lessons · bought {fmtDate(c.purchasedAt)}</Typography>
              <LinearProgress variant="determinate" value={c.progress.percent} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
            </Box>
            <Button component={RouterLink} to={`/store/course/${c.slug}`} variant="outlined" sx={{ fontWeight: 800 }}>{c.progress.doneCount ? 'Continue' : 'Start'}</Button>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

export default function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'library' ? 'library' : 'orders';
  const [orders, setOrders] = useState(null);
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(null);

  const load = useCallback(() => {
    storeApi.orders().then(({ data }) => setOrders(data.data.items)).catch((err) => setError(extractErrorMessage(err)));
    storeApi.myCourses().then(({ data }) => setCourses(data.data.items)).catch(() => setCourses([]));
  }, []);
  useEffect(() => { load(); }, [load]);

  const physical = (orders || []).filter((o) => o.kind === 'physical' && ['placed', 'processing', 'shipped'].includes(o.status)).length;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, flex: 1 }}>Orders & library</Typography>
        <Button component={RouterLink} to="/store" startIcon={<StorefrontRoundedIcon />} variant="contained" disableElevation sx={{ fontWeight: 800 }}>Store</Button>
      </Stack>
      {physical > 0 && <Typography color="text.secondary" sx={{ mb: 1 }}>{fmt(physical)} order{physical > 1 ? 's' : ''} on the way.</Typography>}
      <Tabs value={tab} onChange={(_, v) => setParams(v === 'orders' ? {} : { tab: v }, { replace: true })} sx={{ mb: 2 }}>
        <Tab value="orders" label="Orders" />
        <Tab value="library" label={`My courses${courses?.length ? ` (${courses.length})` : ''}`} />
      </Tabs>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {tab === 'orders' ? (
        !orders ? <CircularProgress size={22} /> : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography sx={{ fontWeight: 800 }}>No orders yet</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>Redeem your coins for Pro, courses or merch.</Typography>
            <Button component={RouterLink} to="/store" variant="contained" disableElevation>Open store</Button>
          </Box>
        ) : <Stack spacing={1.5}>{orders.map((o) => <OrderCard key={o.id} order={o} onOpen={setOpen} />)}</Stack>
      ) : <Library courses={courses} />}

      <OrderDialog order={open} onClose={() => setOpen(null)} onCancelled={() => { setOpen(null); load(); }} />
    </Container>
  );
}
