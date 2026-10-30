import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Box, Button, ButtonBase, CircularProgress, Dialog, IconButton, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import { storeApi } from '../../api/storeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from '../auth/authSlice';
import { tint } from '../dashboard/dashboardUtils';
import {
  LIB_ACCENT,
  LIB_TRACKING,
  LibraryFont,
  PageHeader,
  libBackBtnSx,
  libPanelSx,
  libSectionTitleSx,
  libSolidBtnSx,
  libTintBtnSx,
} from '../dashboard/components/libraryStyle';
import { Coins, SHIP_STEPS, STATUS_META, fmt, fmtDate, fmtDateTime } from './storeUtils';

// Phone screens for My orders and the coin Wallet in the Library look (same page padding, back button, centred
// header, 18px row titles, 15px muted details and cream panels as the phone Store, Problems and Aptitude pages).
// They replace the dialogs the desktop Store uses. Each shows only what a shopper needs.

const ROW_TITLE = { fontWeight: 500, fontSize: 18, lineHeight: '28px', letterSpacing: LIB_TRACKING };
const ROW_META = { fontSize: 15, lineHeight: '20px', letterSpacing: LIB_TRACKING, fontVariantNumeric: 'tabular-nums' };
const BODY = { fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING };
const TOP_BORDER = '1px solid var(--lib-divider)';

const STATUS_COLOR = {
  placed: 'var(--lib-muted)',
  processing: 'var(--jc-medium)',
  shipped: LIB_ACCENT,
  delivered: 'var(--jc-easy)',
  fulfilled: 'var(--jc-easy)',
  cancelled: 'var(--lib-muted)',
};

function Shell({ onBack, backLabel, children }) {
  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
        <IconButton onClick={onBack} aria-label={backLabel} sx={libBackBtnSx}>
          <ArrowBackRoundedIcon />
        </IconButton>
        {children}
      </Box>
    </LibraryFont>
  );
}

function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress size={28} />
    </Box>
  );
}

function SectionTitle({ children, sx }) {
  return (
    <Typography component="h2" sx={{ ...libSectionTitleSx, mt: 4, mb: 0.5, ...sx }}>
      {children}
    </Typography>
  );
}

function StatusPill({ status }) {
  const color = STATUS_COLOR[status] || STATUS_COLOR.placed;
  return (
    <Typography component="span" sx={{ flexShrink: 0, px: '8px', py: '2px', borderRadius: '8px', fontSize: 15, lineHeight: '20px', letterSpacing: LIB_TRACKING, color, bgcolor: tint(color, 14) }}>
      {(STATUS_META[status] || STATUS_META.placed).label}
    </Typography>
  );
}

// One list row: title and a muted line on the left, a value or status on the right.
function Row({ title, meta, right, onClick }) {
  const body = (
    <>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={ROW_TITLE}>
          {title}
        </Typography>
        <Typography noWrap sx={{ ...ROW_META, mt: 0.5, color: 'var(--lib-muted)' }}>
          {meta}
        </Typography>
      </Box>
      {right}
      {onClick && <ChevronRightRoundedIcon aria-hidden sx={{ fontSize: 22, color: 'var(--lib-muted)', flexShrink: 0 }} />}
    </>
  );
  const sx = { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px', py: 2, textAlign: 'left', fontFamily: 'inherit', color: 'inherit', borderBottom: '1px solid var(--lib-divider)' };
  return onClick ? (
    <ButtonBase onClick={onClick} sx={sx}>
      {body}
    </ButtonBase>
  ) : (
    <Box sx={sx}>{body}</Box>
  );
}

// ------------------------------------------------------------------ My orders

function ShipProgress({ status }) {
  const at = SHIP_STEPS.indexOf(status);
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${SHIP_STEPS.length}, 1fr)`, gap: 0.75, mt: 3 }}>
      {SHIP_STEPS.map((s, i) => (
        <Box key={s}>
          <Box sx={{ height: 6, borderRadius: 99, bgcolor: i <= at ? LIB_ACCENT : 'var(--lib-divider)' }} />
          <Typography sx={{ mt: 0.75, fontSize: 14, lineHeight: '20px', textAlign: 'center', color: i <= at ? 'var(--lib-text)' : 'var(--lib-muted)', fontWeight: i === at ? 500 : 400 }}>
            {STATUS_META[s].label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function Note({ children }) {
  return <Box sx={{ ...libPanelSx, p: 2, mt: 3, ...BODY }}>{children}</Box>;
}

function OrderDetail({ order, onBack, onChanged, onOpenCourse }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const physical = order.kind === 'physical';
  const cancelled = order.status === 'cancelled';
  const a = order.address;
  const canCancel = physical && order.status === 'placed';

  const cancel = async () => {
    setBusy(true);
    try {
      const { data } = await storeApi.cancelOrder(order.id);
      if (data.data.user) dispatch(userUpdated(data.data.user));
      enqueueSnackbar('Order cancelled. Your coins were refunded.', { variant: 'success' });
      setConfirm(false);
      onChanged();
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell onBack={onBack} backLabel="Back to orders">
      <Box sx={{ textAlign: 'center', mt: 1.5 }}>
        <Typography component="h1" sx={{ fontWeight: 700, fontSize: 26, lineHeight: '32px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {order.itemName}
          {order.qty > 1 ? ` ×${order.qty}` : ''}
        </Typography>
        <Typography sx={{ fontSize: 17, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>
          {order.orderNo} · {fmtDateTime(order.createdAt)}
        </Typography>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 1.5, mt: 1.5 }}>
          <Coins value={order.total} size={22} />
          <StatusPill status={order.status} />
        </Stack>
      </Box>

      {physical && !cancelled && <ShipProgress status={order.status} />}
      {cancelled && <Note>Cancelled{order.cancelReason ? `: ${order.cancelReason}` : ''}. Your coins were returned to your wallet.</Note>}
      {order.kind === 'pro' && order.proUntil && <Note>Pro is active until {fmtDate(order.proUntil)}.</Note>}

      {order.kind === 'course' && !cancelled && (
        <Button onClick={() => onOpenCourse(order.itemSlug)} fullWidth disableElevation variant="contained" sx={{ ...libSolidBtnSx, mt: 3 }}>
          Open course
        </Button>
      )}

      {order.tracking?.number && (
        <>
          <SectionTitle>Tracking</SectionTitle>
          <Typography sx={BODY}>
            {order.tracking.carrier || 'Courier'} · {order.tracking.number}
          </Typography>
          {order.tracking.url && (
            <Button component="a" href={order.tracking.url} target="_blank" rel="noopener noreferrer" fullWidth disableElevation variant="contained" sx={{ ...libTintBtnSx, mt: 1.5 }}>
              Track package
            </Button>
          )}
        </>
      )}

      {a && (
        <>
          <SectionTitle>Delivering to</SectionTitle>
          <Typography sx={BODY}>
            {a.fullName}, {a.phone}
            <br />
            {a.line1}
            {a.line2 ? `, ${a.line2}` : ''}
            <br />
            {a.city}, {a.state} {a.pincode}
          </Typography>
        </>
      )}

      <SectionTitle>Timeline</SectionTitle>
      <Box sx={{ borderTop: TOP_BORDER }}>
        {[...order.history].reverse().map((h, i) => (
          <Row key={i} title={STATUS_META[h.status]?.label || h.status} meta={`${fmtDateTime(h.at)}${h.note ? ` · ${h.note}` : ''}`} />
        ))}
      </Box>

      {canCancel && (
        <Button onClick={() => setConfirm(true)} fullWidth disableElevation variant="contained" sx={{ ...libTintBtnSx, mt: 3 }}>
          Cancel order
        </Button>
      )}

      <Dialog open={confirm} onClose={() => !busy && setConfirm(false)} slotProps={{ paper: { sx: { borderRadius: '20px', mx: 2, width: '100%', maxWidth: 400 } } }}>
        <LibraryFont sx={{ p: 3, bgcolor: 'var(--lib-bg)' }}>
          <Typography component="h2" sx={libSectionTitleSx}>
            Cancel this order?
          </Typography>
          <Typography sx={{ ...BODY, mt: 1, color: 'var(--lib-muted)' }}>Your {fmt(order.total)} coins will be refunded to your wallet.</Typography>
          <Stack direction="row" sx={{ gap: 1.5, mt: 3 }}>
            <Button onClick={() => setConfirm(false)} disabled={busy} fullWidth disableElevation variant="contained" sx={libTintBtnSx}>
              Keep order
            </Button>
            <Button onClick={cancel} disabled={busy} fullWidth disableElevation variant="contained" sx={libSolidBtnSx}>
              {busy ? 'Cancelling…' : 'Cancel order'}
            </Button>
          </Stack>
        </LibraryFont>
      </Dialog>
    </Shell>
  );
}

export function MobileOrders({ orders, onBack, onChanged, onOpenCourse, onGoShop }) {
  const [openId, setOpenId] = useState(null);
  const open = orders?.find((o) => o.id === openId);

  if (open) {
    return (
      <OrderDetail
        order={open}
        onBack={() => setOpenId(null)}
        onChanged={() => {
          setOpenId(null);
          onChanged();
        }}
        onOpenCourse={onOpenCourse}
      />
    );
  }

  return (
    <Shell onBack={onBack} backLabel="Back to store">
      <PageHeader icon={LocalMallRoundedIcon} title="My orders" subtitle={orders?.length ? `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}` : 'Track what you redeemed'} />
      <Box sx={{ mt: 3 }}>
        {!orders ? (
          <Loading />
        ) : orders.length === 0 ? (
          <Stack sx={{ alignItems: 'center', textAlign: 'center', gap: 0.5, py: 6 }}>
            <Typography sx={{ ...ROW_TITLE, fontWeight: 700 }}>No orders yet</Typography>
            <Typography sx={{ ...BODY, color: 'var(--lib-muted)' }}>Redeem your coins for Pro, courses or merch.</Typography>
            <Button onClick={onGoShop} disableElevation variant="contained" sx={{ ...libSolidBtnSx, mt: 2, px: 4 }}>
              Browse the store
            </Button>
          </Stack>
        ) : (
          <Box sx={{ borderTop: TOP_BORDER }}>
            {orders.map((o) => (
              <Row
                key={o.id}
                title={`${o.itemName}${o.qty > 1 ? ` ×${o.qty}` : ''}`}
                meta={`${fmtDate(o.createdAt)} · ${fmt(o.total)} coins`}
                right={<StatusPill status={o.status} />}
                onClick={() => setOpenId(o.id)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Shell>
  );
}

// ------------------------------------------------------------------ Wallet

export function MobileWallet({ wallet, refreshKey, onClaim, claiming, onBack }) {
  const [tx, setTx] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const loadTx = useCallback((p) => {
    storeApi
      .transactions({ page: p, limit: 10 })
      .then(({ data }) => setTx(data.data))
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);
  useEffect(() => {
    loadTx(page);
  }, [loadTx, page, refreshKey]);

  const d = wallet?.daily;
  const dailyText = d?.claimed ? 'Claimed for today. Come back tomorrow.' : d?.eligible ? `Today's reward is ${d.reward} coins.` : 'Solve 1 problem today to unlock it.';

  return (
    <Shell onBack={onBack} backLabel="Back to store">
      <PageHeader icon={AccountBalanceWalletRoundedIcon} title="Wallet" subtitle="Earn coins by solving problems" />
      {!wallet ? (
        <Loading />
      ) : (
        <>
          {error && (
            <Typography role="alert" color="error" sx={{ mt: 2, fontSize: 15 }}>
              {error}
            </Typography>
          )}

          {/* Balance */}
          <Box sx={{ ...libPanelSx, mt: 3, p: 2 }}>
            <Stack sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 14, letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>Balance</Typography>
              <Coins value={wallet.coins} size={36} />
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', mt: 2, pt: 2, borderTop: TOP_BORDER, textAlign: 'center' }}>
              {[
                ['Earned', fmt(wallet.earned)],
                ['Spent', fmt(wallet.spent)],
                ['Streak', `${wallet.streakDays} ${wallet.streakDays === 1 ? 'day' : 'days'}`],
              ].map(([label, value]) => (
                <Box key={label}>
                  <Typography sx={{ fontWeight: 700, fontSize: 18, lineHeight: '24px', fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
                  <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>{label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Daily check-in */}
          <SectionTitle>Daily check-in</SectionTitle>
          <Typography sx={{ ...BODY, color: 'var(--lib-muted)' }}>{dailyText}</Typography>
          {d?.eligible && (
            <Button onClick={onClaim} disabled={claiming} fullWidth disableElevation variant="contained" sx={{ ...libSolidBtnSx, mt: 1.5 }}>
              {claiming ? 'Claiming…' : `Claim +${d.reward} daily coins`}
            </Button>
          )}

          {/* Ways to earn */}
          <SectionTitle>Ways to earn</SectionTitle>
          <Box sx={{ borderTop: TOP_BORDER }}>
            {wallet.earnWays.map((w) => (
              <Row
                key={w.id}
                title={w.title}
                meta={w.note}
                right={typeof w.coins === 'number' ? <Coins value={w.coins} size={20} /> : <Typography sx={{ ...ROW_META, color: 'var(--lib-text)' }}>{w.coins}</Typography>}
              />
            ))}
          </Box>

          {/* History */}
          <SectionTitle>Coin history</SectionTitle>
          {!tx ? (
            <Loading />
          ) : tx.items.length === 0 ? (
            <Typography sx={{ ...BODY, color: 'var(--lib-muted)' }}>No coins yet. Solve your first problem to start earning.</Typography>
          ) : (
            <>
              <Box sx={{ borderTop: TOP_BORDER }}>
                {tx.items.map((t) => (
                  <Row
                    key={t.id}
                    title={t.title}
                    meta={fmtDateTime(t.at)}
                    right={
                      <Typography component="span" sx={{ ...ROW_TITLE, flexShrink: 0, fontVariantNumeric: 'tabular-nums', color: t.amount > 0 ? 'var(--jc-easy)' : 'var(--lib-text)' }}>
                        {t.amount > 0 ? '+' : '−'}
                        {fmt(Math.abs(t.amount))}
                      </Typography>
                    }
                  />
                ))}
              </Box>
              {tx.pages > 1 && (
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 2, mt: 2 }}>
                  <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} disableElevation variant="contained" sx={{ ...libTintBtnSx, height: 36, px: 2, fontSize: 15 }}>
                    Previous
                  </Button>
                  <Typography sx={{ ...ROW_META, color: 'var(--lib-muted)' }}>
                    {page} / {tx.pages}
                  </Typography>
                  <Button disabled={page >= tx.pages} onClick={() => setPage((p) => p + 1)} disableElevation variant="contained" sx={{ ...libTintBtnSx, height: 36, px: 2, fontSize: 15 }}>
                    Next
                  </Button>
                </Stack>
              )}
            </>
          )}
        </>
      )}
    </Shell>
  );
}
