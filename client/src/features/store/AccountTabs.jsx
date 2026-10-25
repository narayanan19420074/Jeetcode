import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import { useSnackbar } from 'notistack';
import { storeApi } from '../../api/storeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from '../auth/authSlice';
import { Eyebrow, FFButton, FFDialog, Notice, Tag } from '../quests/QuestParts';
import { FF, cut } from '../quests/questUtils';
import { Coins, SHIP_STEPS, STATUS_META, fmt, fmtDate, fmtDateTime } from './storeUtils';

// Orders and the coin wallet. Both open from the Store header in a dialog, so the shop stays the only page.

const rowSx = { display: 'flex', alignItems: 'center', gap: 2, width: '100%', p: 2.5, textAlign: 'left', bgcolor: FF.panelHi, border: `1px solid ${FF.line}`, clipPath: cut(9), '&:hover': { borderColor: FF.orange }, '&:focus-visible': { outline: `2px solid ${FF.orange}`, outlineOffset: 2 } };

// ------------------------------------------------------------------ Orders

function OrderCard({ order, onOpen }) {
  const meta = STATUS_META[order.status] || STATUS_META.placed;
  return (
    <ButtonBase onClick={() => onOpen(order)} sx={rowSx}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 800, color: FF.text }}>{order.itemName}{order.qty > 1 ? ` ×${order.qty}` : ''}</Typography>
        <Typography noWrap sx={{ mt: 0.5, fontSize: 12.5, color: FF.muted }}>
          {order.orderNo} · {fmtDate(order.createdAt)}
          {order.variant?.size ? ` · ${order.variant.size}` : ''}{order.variant?.color ? ` · ${order.variant.color}` : ''}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
        <Coins value={order.total} />
        <Tag tone={meta.tone}>{meta.label}</Tag>
      </Box>
    </ButtonBase>
  );
}

// Four-step progress for physical orders: placed, packing, shipped, delivered.
function ShipProgress({ status }) {
  const at = SHIP_STEPS.indexOf(status);
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${SHIP_STEPS.length}, 1fr)`, gap: 0.75, mb: 3 }}>
      {SHIP_STEPS.map((s, i) => (
        <Box key={s}>
          <Box sx={{ height: 7, bgcolor: i <= at ? FF.orange : FF.well, border: `1px solid ${i <= at ? FF.orange : FF.line}` }} />
          <Typography sx={{ mt: 0.75, fontSize: 11.5, fontWeight: i === at ? 900 : 600, color: i <= at ? FF.text : FF.muted, textAlign: 'center' }}>{STATUS_META[s].label}</Typography>
        </Box>
      ))}
    </Box>
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

  const showCancel = physical && order.status === 'placed';
  return (
    <FFDialog
      open
      onClose={onClose}
      title={order.itemName}
      busy={busy}
      footer={showCancel && <FFButton tone="dark" onClick={cancel} disabled={busy} sx={{ width: '100%' }}>{busy ? 'Cancelling…' : 'Cancel & refund'}</FFButton>}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3, color: FF.muted, fontSize: 13.5 }}>
        <span>{order.orderNo} · {fmtDateTime(order.createdAt)}</span>
        <Coins value={order.total} size={16} />
      </Box>
      {physical && !cancelled && <ShipProgress status={order.status} />}
      {cancelled && <Notice tone="info" sx={{ mb: 3 }}>Cancelled{order.cancelReason ? `: ${order.cancelReason}` : ''}. Coins were returned to your wallet.</Notice>}
      {order.kind === 'pro' && order.proUntil && <Notice tone="success" sx={{ mb: 3 }}>Pro active until {fmtDate(order.proUntil)}.</Notice>}
      {order.kind === 'course' && !cancelled && (
        <FFButton onClick={() => onOpenCourse(order.itemSlug)} sx={{ mb: 3, width: '100%' }}>Open course</FFButton>
      )}
      {order.tracking?.number && (
        <Box sx={{ p: 2, mb: 3, bgcolor: FF.well, border: `1px solid ${FF.line}` }}>
          <Eyebrow>Tracking</Eyebrow>
          <Typography sx={{ mt: 0.5, fontWeight: 800, color: FF.text }}>{order.tracking.carrier || 'Courier'} · {order.tracking.number}</Typography>
          {order.tracking.url && (
            <FFButton component="a" href={order.tracking.url} target="_blank" rel="noopener noreferrer" tone="dark" sx={{ mt: 1.5, minHeight: 38 }}>Track package</FFButton>
          )}
        </Box>
      )}
      {a && (
        <Box sx={{ mb: 3 }}>
          <Eyebrow sx={{ mb: 0.75 }}>Delivering to</Eyebrow>
          <Typography sx={{ fontSize: 14, lineHeight: 1.7, color: FF.text }}>{a.fullName}, {a.phone}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />{a.city}, {a.state} {a.pincode}</Typography>
        </Box>
      )}
      <Eyebrow sx={{ mb: 0.75 }}>Timeline</Eyebrow>
      {[...order.history].reverse().map((h, i) => (
        <Typography key={i} sx={{ py: 0.5, fontSize: 13.5, color: FF.muted }}>{fmtDateTime(h.at)} · <Box component="span" sx={{ color: FF.text, fontWeight: 700 }}>{STATUS_META[h.status]?.label || h.status}</Box>{h.note ? ` · ${h.note}` : ''}</Typography>
      ))}
    </FFDialog>
  );
}

export function OrdersTab({ orders, onChanged, onOpenCourse, onGoShop }) {
  const [open, setOpen] = useState(null);
  if (!orders) return <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}><CircularProgress size={24} /></Box>;
  if (orders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography sx={{ fontWeight: 900, fontSize: 18, color: FF.text }}>No orders yet</Typography>
        <Typography sx={{ mt: 0.75, mb: 3, color: FF.muted }}>Redeem your coins for Pro, courses or merch.</Typography>
        <FFButton onClick={onGoShop}>Browse the shop</FFButton>
      </Box>
    );
  }
  return (
    <>
      <Box sx={{ display: 'grid', gap: 2 }}>{orders.map((o) => <OrderCard key={o.id} order={o} onOpen={setOpen} />)}</Box>
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
    storeApi.transactions({ page: p, limit: 10 }).then(({ data }) => setTx(data.data)).catch((err) => setError(extractErrorMessage(err)));
  }, []);
  useEffect(() => { loadTx(page); }, [loadTx, page, refreshKey]);

  if (!wallet) return <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}><CircularProgress size={24} /></Box>;
  const d = wallet.daily;

  return (
    <Box sx={{ display: 'grid', gap: 4 }}>
      {error && <Notice tone="error">{error}</Notice>}

      <Box sx={{ textAlign: 'center', py: 3, bgcolor: FF.well, border: `1px solid ${FF.line}` }}>
        <Eyebrow>Balance</Eyebrow>
        <Box sx={{ mt: 1 }}><Coins value={wallet.coins} size={44} /></Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Tag>Earned {fmt(wallet.earned)}</Tag>
          <Tag>Spent {fmt(wallet.spent)}</Tag>
          <Tag tone="orange"><LocalFireDepartmentRoundedIcon sx={{ fontSize: 14 }} /> {wallet.streakDays}-day streak</Tag>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 900, color: FF.text }}>Daily check-in</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 14, color: FF.muted }}>
            {d.claimed ? 'Claimed for today. Come back tomorrow.' : d.eligible ? `Ready! Today's reward is ${d.reward} coins.` : 'Solve 1 problem today to unlock it.'}
          </Typography>
        </Box>
        {d.eligible && <FFButton tone="green" onClick={onClaim} disabled={claiming}>{claiming ? 'Claiming…' : `Claim ${d.reward}`}</FFButton>}
      </Box>

      <Box>
        <Eyebrow sx={{ mb: 1 }}>Ways to earn</Eyebrow>
        {wallet.earnWays.map((w) => (
          <Box key={w.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderTop: `1px solid ${FF.line}` }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, color: FF.text }}>{w.title}</Typography>
              <Typography sx={{ fontSize: 13, color: FF.muted }}>{w.note}</Typography>
            </Box>
            {typeof w.coins === 'number' ? <Coins value={w.coins} /> : <Typography sx={{ fontWeight: 900, color: FF.coinInk }}>{w.coins}</Typography>}
          </Box>
        ))}
      </Box>

      <Box>
        <Eyebrow sx={{ mb: 1 }}>Coin history</Eyebrow>
        {!tx ? <CircularProgress size={22} /> : tx.items.length === 0 ? (
          <Typography sx={{ py: 1, color: FF.muted }}>No coins yet. Solve your first problem to start earning.</Typography>
        ) : (
          <>
            {tx.items.map((t) => (
              <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderTop: `1px solid ${FF.line}` }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 700, color: FF.text }}>{t.title}</Typography>
                  <Typography sx={{ fontSize: 12.5, color: FF.muted }}>{fmtDateTime(t.at)}</Typography>
                </Box>
                <Typography sx={{ fontWeight: 900, color: t.amount > 0 ? FF.greenInk : FF.text, fontVariantNumeric: 'tabular-nums' }}>
                  {t.amount > 0 ? '+' : '−'}{fmt(Math.abs(t.amount))}
                </Typography>
              </Box>
            ))}
            {tx.pages > 1 && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <FFButton tone="dark" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} sx={{ minHeight: 38 }}>Prev</FFButton>
                <Typography sx={{ fontWeight: 800, fontSize: 13, color: FF.muted, fontVariantNumeric: 'tabular-nums' }}>{page} / {tx.pages}</Typography>
                <FFButton tone="dark" disabled={page >= tx.pages} onClick={() => setPage((p) => p + 1)} sx={{ minHeight: 38 }}>Next</FFButton>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
