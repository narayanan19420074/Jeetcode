import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel,
  MenuItem, Pagination, Paper, Stack, Switch, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField, Typography,
} from '@mui/material';
import { adminApi } from '../../../api/adminApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { STATUS_META, fmt, fmtDateTime } from '../../store/storeUtils';

const NEXT = { placed: ['processing', 'cancelled'], processing: ['shipped', 'cancelled'], shipped: ['delivered'] };

function Stat({ label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, flex: '1 1 140px' }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>{fmt(value)}</Typography>
    </Paper>
  );
}

function OrderDialog({ order, onClose, onSaved, setError }) {
  const [status, setStatus] = useState('');
  const [carrier, setCarrier] = useState('');
  const [number, setNumber] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStatus(NEXT[order?.status]?.[0] || '');
    setCarrier(order?.tracking?.carrier || '');
    setNumber(order?.tracking?.number || '');
    setUrl(order?.tracking?.url || '');
    setNote('');
  }, [order]);

  if (!order) return null;
  const options = NEXT[order.status] || [];
  const a = order.address;

  const save = async () => {
    setBusy(true);
    try {
      await adminApi.updateStoreOrder(order.id, { status, carrier, trackingNumber: number, trackingUrl: url, note });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>{order.orderNo} · {order.itemName}{order.qty > 1 ? ` ×${order.qty}` : ''}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {order.user ? `${order.user.name} (@${order.user.handle}) · ${order.user.email}` : 'Unknown user'} · {fmt(order.total)} coins
        </Typography>
        {(order.variant?.size || order.variant?.color) && (
          <Typography variant="body2" sx={{ mb: 1 }}>Variant: {[order.variant.size, order.variant.color].filter(Boolean).join(' / ')}</Typography>
        )}
        {a && (
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2, userSelect: 'all' }}>
            <Typography variant="body2">{a.fullName} · {a.phone}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />{a.city}, {a.state} {a.pincode}, {a.country}</Typography>
          </Paper>
        )}
        {options.length === 0 ? (
          <Alert severity="info">This order is {STATUS_META[order.status]?.label.toLowerCase()}; nothing more to do.</Alert>
        ) : (
          <Stack spacing={1.5}>
            <TextField select size="small" label="Move to" value={status} onChange={(e) => setStatus(e.target.value)}>
              {options.map((s) => <MenuItem key={s} value={s}>{s === 'cancelled' ? 'Cancel & refund coins' : STATUS_META[s].label}</MenuItem>)}
            </TextField>
            {status === 'shipped' && (
              <>
                <TextField size="small" label="Courier (e.g. India Post)" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
                <TextField size="small" label="Tracking number" value={number} onChange={(e) => setNumber(e.target.value)} required />
                <TextField size="small" label="Tracking link (optional)" value={url} onChange={(e) => setUrl(e.target.value)} />
              </>
            )}
            <TextField size="small" label={status === 'cancelled' ? 'Reason shown to the user' : 'Note (optional)'} value={note} onChange={(e) => setNote(e.target.value)} />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {options.length > 0 && (
          <Button variant="contained" disableElevation onClick={save} disabled={busy || !status} color={status === 'cancelled' ? 'error' : 'primary'}>
            {busy ? 'Saving…' : 'Update order'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function OrdersTab({ setError, onChanged }) {
  const [status, setStatus] = useState('');
  const [kind, setKind] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(null);

  const load = useCallback(() => {
    adminApi.storeOrders({ page, limit: 15, status: status || undefined, kind: kind || undefined, q: q.trim() || undefined })
      .then(({ data: d }) => setData(d.data)).catch((err) => setError(extractErrorMessage(err)));
  }, [page, status, kind, q, setError]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField size="small" label="Search order no, item, user" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} sx={{ flex: 1 }} />
        <TextField select size="small" label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          {Object.entries(STATUS_META).map(([k, m]) => <MenuItem key={k} value={k}>{m.label}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Type" value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }} sx={{ minWidth: 130 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="physical">Merch</MenuItem>
          <MenuItem value="course">Course</MenuItem>
          <MenuItem value="pro">Pro</MenuItem>
        </TextField>
      </Stack>
      {!data ? <CircularProgress /> : (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflowX: 'auto' }}>
          <Table size="small">
            <TableHead><TableRow><TableCell>Order</TableCell><TableCell>Item</TableCell><TableCell>User</TableCell><TableCell align="right">Coins</TableCell><TableCell>Status</TableCell><TableCell>Placed</TableCell></TableRow></TableHead>
            <TableBody>
              {data.items.length === 0 && <TableRow><TableCell colSpan={6}><Typography color="text.secondary" sx={{ py: 2 }}>No orders found.</Typography></TableCell></TableRow>}
              {data.items.map((o) => (
                <TableRow key={o.id} hover sx={{ cursor: 'pointer' }} onClick={() => setOpen(o)}>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{o.orderNo}</TableCell>
                  <TableCell>{o.itemName}{o.qty > 1 ? ` ×${o.qty}` : ''}</TableCell>
                  <TableCell>{o.user ? `@${o.user.handle}` : '—'}</TableCell>
                  <TableCell align="right">{fmt(o.total)}</TableCell>
                  <TableCell><Chip size="small" color={STATUS_META[o.status]?.color} label={STATUS_META[o.status]?.label} /></TableCell>
                  <TableCell>{fmtDateTime(o.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.pagination.totalPages > 1 && <Pagination sx={{ p: 2, display: 'flex', justifyContent: 'center' }} count={data.pagination.totalPages} page={page} onChange={(_, p) => setPage(p)} />}
        </Paper>
      )}
      <OrderDialog order={open} onClose={() => setOpen(null)} setError={setError} onSaved={() => { setOpen(null); load(); onChanged(); }} />
    </>
  );
}

function ItemRow({ item, onSaved, setError }) {
  const [price, setPrice] = useState(String(item.price));
  const [stock, setStock] = useState(item.stock === null ? '' : String(item.stock));
  const [active, setActive] = useState(item.active);
  const [busy, setBusy] = useState(false);
  const dirty = price !== String(item.price) || stock !== (item.stock === null ? '' : String(item.stock)) || active !== item.active;

  const save = async () => {
    setBusy(true);
    try {
      await adminApi.updateStoreItem(item.slug, { price: Number(price), stock: stock === '' ? null : Number(stock), active });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <TableRow>
      <TableCell><Typography sx={{ fontWeight: 700 }}>{item.name}</Typography><Typography variant="caption" color="text.secondary">{item.slug} · {item.kind}</Typography></TableCell>
      <TableCell><TextField size="small" type="number" value={price} onChange={(e) => setPrice(e.target.value)} sx={{ width: 100 }} /></TableCell>
      <TableCell><TextField size="small" type="number" value={stock} placeholder="∞" onChange={(e) => setStock(e.target.value)} sx={{ width: 90 }} /></TableCell>
      <TableCell>{fmt(item.sold)}</TableCell>
      <TableCell><Switch checked={active} onChange={(e) => setActive(e.target.checked)} /></TableCell>
      <TableCell><Button size="small" variant="contained" disableElevation disabled={!dirty || busy} onClick={save}>Save</Button></TableCell>
    </TableRow>
  );
}

function ItemsTab({ setError }) {
  const [items, setItems] = useState(null);
  const load = useCallback(() => { adminApi.storeItems().then(({ data }) => setItems(data.data.items)).catch((err) => setError(extractErrorMessage(err))); }, [setError]);
  useEffect(() => { load(); }, [load]);
  if (!items) return <CircularProgress />;
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflowX: 'auto' }}>
      <Table size="small">
        <TableHead><TableRow><TableCell>Item</TableCell><TableCell>Price (coins)</TableCell><TableCell>Stock (blank = unlimited)</TableCell><TableCell>Sold</TableCell><TableCell>Visible</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>{items.map((i) => <ItemRow key={`${i.slug}-${i.price}-${i.stock}-${i.active}`} item={i} onSaved={load} setError={setError} />)}</TableBody>
      </Table>
    </Paper>
  );
}

function CoinsTab({ setError }) {
  const [handle, setHandle] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ledger, setLedger] = useState(null);

  const loadLedger = useCallback((h) => {
    adminApi.storeLedger(h ? { handle: h } : {}).then(({ data }) => setLedger(data.data.items)).catch(() => setLedger([]));
  }, []);
  useEffect(() => { loadLedger(); }, [loadLedger]);

  const submit = async () => {
    setBusy(true); setMsg(null);
    try {
      const { data } = await adminApi.adjustCoins({ handle: handle.trim().replace(/^@/, ''), amount: Number(amount), note });
      setMsg(`${data.message}. New balance: ${fmt(data.data.balance)}`);
      setAmount(''); setNote('');
      loadLedger(handle.trim().replace(/^@/, ''));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 800, mb: 1.5 }}>Give or take coins</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField size="small" label="User handle" value={handle} onChange={(e) => setHandle(e.target.value)} />
          <TextField size="small" type="number" label="Amount (− to take)" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <TextField size="small" label="Reason (user can see it)" value={note} onChange={(e) => setNote(e.target.value)} sx={{ flex: 1 }} />
          <Button variant="contained" disableElevation onClick={submit} disabled={busy || !handle || !amount || note.trim().length < 3}>Apply</Button>
        </Stack>
        {msg && <Alert severity="success" sx={{ mt: 1.5 }}>{msg}</Alert>}
      </Paper>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflowX: 'auto' }}>
        <Typography sx={{ fontWeight: 800, p: 2, pb: 0 }}>Latest ledger entries</Typography>
        <Table size="small">
          <TableHead><TableRow><TableCell>When</TableCell><TableCell>User</TableCell><TableCell>What</TableCell><TableCell align="right">Coins</TableCell></TableRow></TableHead>
          <TableBody>
            {(ledger || []).map((t) => (
              <TableRow key={t.id}><TableCell>{fmtDateTime(t.at)}</TableCell><TableCell>@{t.handle}</TableCell><TableCell>{t.title}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: t.amount > 0 ? 'success.main' : 'text.primary' }}>{t.amount > 0 ? '+' : '−'}{fmt(Math.abs(t.amount))}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}

export default function AdminStorePage() {
  const [tab, setTab] = useState('orders');
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const loadSummary = useCallback(() => { adminApi.storeSummary().then(({ data }) => setSummary(data.data)).catch(() => {}); }, []);
  useEffect(() => { loadSummary(); }, [loadSummary]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Store</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Ship merch, manage prices and stock, and adjust user coins.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {summary && (
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
          <Stat label="To ship" value={summary.toShip} />
          <Stat label="Shipped" value={summary.orders.shipped || 0} />
          <Stat label="Orders (active)" value={summary.redeemedOrders} />
          <Stat label="Coins redeemed" value={summary.redeemedCoins} />
          <Stat label="Coins in circulation" value={summary.circulating} />
        </Box>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab value="orders" label="Orders" />
        <Tab value="items" label="Items & stock" />
        <Tab value="coins" label="Coins" />
      </Tabs>
      {tab === 'orders' && <OrdersTab setError={setError} onChanged={loadSummary} />}
      {tab === 'items' && <ItemsTab setError={setError} />}
      {tab === 'coins' && <CoinsTab setError={setError} />}
    </Container>
  );
}
