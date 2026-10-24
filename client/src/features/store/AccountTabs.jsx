import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Pagination, Paper, Stack,
  Step, StepLabel, Stepper, Typography, alpha,
} from '@mui/material';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import { useSnackbar } from 'notistack';
import { storeApi } from '../../api/storeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from '../auth/authSlice';
import { Coins, SHIP_STEPS, STATUS_META, fmt, fmtDate, fmtDateTime } from './storeUtils';

// ------------------------------------------------------------------ Orders

function OrderCard({ order, onOpen }) {
  const meta = STATUS_META[order.status] || STATUS_META.placed;
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }} onClick={() => onOpen(order)}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800 }} noWrap>{order.itemName}{order.qty > 1 ? ` ×${order.qty}` : ''}</Typography>
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

function OrderDialog({ order, onClose, onChanged, onOpenCourse }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [busy, setBusy] = useState(false);
  if (!order) return null;
  const physical = order.kind === 'physical';
  const cancelled = order.status === 'cancelled';
  const a = order.address;

  const cancel = async () => {
    setBusy(true);
    try {
      const { data } = await storeApi.cancelOrder(order.id);
      if (data.data.user) dispatch(userUpdated(data.data.user));
      enqueueSnackbar('Order cancelled, coins refunded', { variant: 'success' });
      onChanged();
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
        <Typography variant="body2" color="text.secondary" component="div" sx={{ mb: 2 }}>
          Order {order.orderNo} · {fmtDateTime(order.createdAt)} · <Coins value={order.total} size={16} />
        </Typography>
        {physical && !cancelled && (
          <Stepper activeStep={SHIP_STEPS.indexOf(order.status)} alternativeLabel sx={{ mb: 3 }}>
            {SHIP_STEPS.map((s) => <Step key={s}><StepLabel>{STATUS_META[s].label}</StepLabel></Step>)}
          </Stepper>
        )}
        {cancelled && <Alert severity="info" sx={{ mb: 2 }}>Cancelled{order.cancelReason ? `: ${order.cancelReason}` : ''}. Coins were returned to your wallet.</Alert>}
        {order.kind === 'pro' && order.proUntil && <Alert severity="success" sx={{ mb: 2 }}>Pro active until {fmtDate(order.proUntil)}.</Alert>}
        {order.kind === 'course' && !cancelled && (
          <Button variant="contained" disableElevation sx={{ mb: 2, fontWeight: 800 }} onClick={() => onOpenCourse(order.itemSlug)}>Open course</Button>
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
            <Typography variant="body2" color="text.secondary">{a.fullName}, {a.phone}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />{a.city}, {a.state} {a.pincode}</Typography>
          </Box>
        )}
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Timeline</Typography>
        {[...order.history].reverse().map((h, i) => (
          <Typography key={i} variant="body2" color="text.secondary">{fmtDateTime(h.at)} · {STATUS_META[h.status]?.label || h.status}{h.note ? ` · ${h.note}` : ''}</Typography>
        ))}
      </DialogContent>
      <DialogActions>
        {physical && order.status === 'placed' && <Button color="error" onClick={cancel} disabled={busy}>{busy ? 'Cancelling…' : 'Cancel & refund'}</Button>}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export function OrdersTab({ orders, onChanged, onOpenCourse, onGoShop }) {
  const [open, setOpen] = useState(null);
  if (!orders) return <CircularProgress size={22} />;
  if (orders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography sx={{ fontWeight: 800 }}>No orders yet</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Redeem your coins for Pro, courses or merch.</Typography>
        <Button variant="contained" disableElevation onClick={onGoShop}>Browse the shop</Button>
      </Box>
    );
  }
  return (
    <>
      <Stack spacing={1.5}>{orders.map((o) => <OrderCard key={o.id} order={o} onOpen={setOpen} />)}</Stack>
      <OrderDialog
        order={open && orders.find((o) => o.id === open.id) ? orders.find((o) => o.id === open.id) : null}
        onClose={() => setOpen(null)}
        onChanged={() => { setOpen(null); onChanged(); }}
        onOpenCourse={(slug) => { setOpen(null); onOpenCourse(slug); }}
      />
    </>
  );
}

// ------------------------------------------------------------------ Coins

export function CoinsTab({ wallet, refreshKey, onClaim, claiming }) {
  const [tx, setTx] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const loadTx = useCallback((p) => {
    storeApi.transactions({ page: p, limit: 15 }).then(({ data }) => setTx(data.data)).catch((err) => setError(extractErrorMessage(err)));
  }, []);
  useEffect(() => { loadTx(page); }, [loadTx, page, refreshKey]);

  if (!wallet) return <CircularProgress size={22} />;
  const d = wallet.daily;

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <Paper variant="outlined" sx={(t) => ({ p: 3, borderRadius: 4, background: `linear-gradient(135deg, ${alpha(t.palette.warning.main, 0.18)}, transparent)` })}>
        <Typography variant="body2" color="text.secondary">Balance</Typography>
        <Coins value={wallet.coins} size={44} />
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
          <Chip label={`Earned ${fmt(wallet.earned)}`} variant="outlined" />
          <Chip label={`Spent ${fmt(wallet.spent)}`} variant="outlined" />
          <Chip icon={<LocalFireDepartmentRoundedIcon />} label={`${wallet.streakDays}-day streak`} variant="outlined" />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 800 }}>Daily check-in</Typography>
            <Typography variant="body2" color="text.secondary">
              {d.claimed ? 'Claimed for today. Come back tomorrow.' : d.eligible ? `Ready! Today's reward is ${d.reward} coins.` : 'Solve 1 problem today to unlock it.'}
            </Typography>
          </Box>
          {d.eligible && (
            <Button variant="contained" disableElevation onClick={onClaim} disabled={claiming} sx={{ fontWeight: 800 }}>
              {claiming ? <CircularProgress size={20} color="inherit" /> : `Claim ${d.reward}`}
            </Button>
          )}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>Ways to earn</Typography>
        {wallet.earnWays.map((w, i) => (
          <Stack key={w.id} direction="row" spacing={2} alignItems="center" sx={{ py: 1, borderTop: i ? 1 : 0, borderColor: 'divider' }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>{w.title}</Typography>
              <Typography variant="caption" color="text.secondary">{w.note}</Typography>
            </Box>
            {typeof w.coins === 'number' ? <Coins value={w.coins} /> : <Typography sx={{ fontWeight: 800, color: 'warning.main' }}>{w.coins}</Typography>}
          </Stack>
        ))}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>Coin history</Typography>
        {!tx ? <CircularProgress size={22} /> : tx.items.length === 0 ? (
          <Typography color="text.secondary">No coins yet. Solve your first problem to start earning.</Typography>
        ) : (
          <>
            {tx.items.map((t, i) => (
              <Stack key={t.id} direction="row" spacing={2} alignItems="center" sx={{ py: 1.1, borderTop: i ? 1 : 0, borderColor: 'divider' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>{t.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{fmtDateTime(t.at)}</Typography>
                </Box>
                <Typography sx={{ fontWeight: 800, color: t.amount > 0 ? 'success.main' : 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
                  {t.amount > 0 ? '+' : '−'}{fmt(Math.abs(t.amount))}
                </Typography>
              </Stack>
            ))}
            {tx.pages > 1 && <Pagination sx={{ mt: 2, display: 'flex', justifyContent: 'center' }} count={tx.pages} page={page} onChange={(_, p) => setPage(p)} />}
          </>
        )}
      </Paper>
    </Stack>
  );
}
