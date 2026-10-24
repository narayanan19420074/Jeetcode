import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton,
  MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import { storeApi } from '../../api/storeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from '../auth/authSlice';
import { Coins, ItemArt, fmt } from './storeUtils';

const EMPTY = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' };

function validate(a) {
  const e = {};
  if (a.fullName.trim().length < 2) e.fullName = 'Enter the full name';
  if (!/^[6-9]\d{9}$/.test(a.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number';
  if (a.line1.trim().length < 5) e.line1 = 'Enter the address';
  if (a.city.trim().length < 2) e.city = 'Enter the city';
  if (!a.state) e.state = 'Choose the state';
  if (!/^[1-9]\d{5}$/.test(a.pincode.trim())) e.pincode = 'Enter a valid 6-digit pincode';
  return e;
}

export default function CheckoutDialog({ item, balance, states = [], open, onClose, onDone }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const physical = item?.kind === 'physical';

  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [addr, setAddr] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !item) return;
    setSize(item.sizes?.length === 1 ? item.sizes[0] : '');
    setColor(item.colors?.length === 1 ? item.colors[0] : '');
    setQty(1);
    setErrors({});
    setError(null);
    if (item.kind === 'physical') {
      storeApi.lastAddress().then(({ data }) => {
        const a = data.data.address;
        if (a) setAddr({ ...EMPTY, ...a });
      }).catch(() => {});
    }
  }, [open, item]);

  const maxQty = useMemo(() => {
    if (!item) return 1;
    const byLimit = item.perUser ? Math.max(0, item.perUser - (item.purchased || 0)) : 10;
    const byStock = item.limited ? item.stockLeft : 10;
    return Math.max(1, Math.min(10, byLimit, byStock));
  }, [item]);

  if (!item) return null;
  const total = item.price * (physical ? qty : 1);
  const short = total - balance;
  const set = (k) => (e) => setAddr((a) => ({ ...a, [k]: e.target.value }));

  const submit = async () => {
    setError(null);
    if (physical) {
      if (item.sizes?.length && !size) return setError('Please choose a size');
      if (item.colors?.length && !color) return setError('Please choose a colour');
      const errs = validate(addr);
      setErrors(errs);
      if (Object.keys(errs).length) return setError('Please fix the highlighted address fields');
    }
    setBusy(true);
    try {
      const payload = physical
        ? { qty, variant: { size, color }, address: { ...addr, fullName: addr.fullName.trim(), phone: addr.phone.trim(), pincode: addr.pincode.trim() } }
        : {};
      const { data } = await storeApi.purchase(item.slug, payload);
      if (data.data.user) dispatch(userUpdated(data.data.user));
      else dispatch(userUpdated({ coins: data.data.balance }));
      onDone?.(data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullScreen={fullScreen} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', fontWeight: 800 }}>
        <Box sx={{ flex: 1 }}>Redeem with coins</Box>
        <IconButton onClick={onClose} disabled={busy} aria-label="Close"><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Box sx={{ width: 96, flexShrink: 0 }}><ItemArt art={item.art} accent={item.accent} height={96} radius={2} /></Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800 }}>{item.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>{item.blurb}</Typography>
            <Coins value={item.price} />
          </Box>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {item.kind === 'pro' && (
          <Alert severity="info" sx={{ mb: 2 }}>+{item.days} days of Pro, added instantly on top of any Pro time you already have.</Alert>
        )}
        {item.kind === 'course' && (
          <Alert severity="info" sx={{ mb: 2 }}>{item.lessonCount} lessons unlock instantly and stay on your account for good.</Alert>
        )}

        {physical && (
          <>
            {item.sizes?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.75 }}>Size</Typography>
                <ToggleButtonGroup exclusive size="small" value={size} onChange={(_, v) => v && setSize(v)} sx={{ flexWrap: 'wrap' }}>
                  {item.sizes.map((s) => <ToggleButton key={s} value={s} sx={{ minWidth: 48, fontWeight: 700 }}>{s}</ToggleButton>)}
                </ToggleButtonGroup>
              </Box>
            )}
            {item.colors?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.75 }}>Colour</Typography>
                <ToggleButtonGroup exclusive size="small" value={color} onChange={(_, v) => v && setColor(v)} sx={{ flexWrap: 'wrap' }}>
                  {item.colors.map((c) => <ToggleButton key={c} value={c} sx={{ px: 2, fontWeight: 700 }}>{c}</ToggleButton>)}
                </ToggleButtonGroup>
              </Box>
            )}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ flex: 1 }}>Quantity</Typography>
              <IconButton size="small" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Less"><RemoveRoundedIcon /></IconButton>
              <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 800 }}>{qty}</Typography>
              <IconButton size="small" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="More"><AddRoundedIcon /></IconButton>
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <LocalShippingRoundedIcon color="primary" />
              <Typography sx={{ fontWeight: 800 }}>Delivery address</Typography>
              <Chip size="small" label={`Ships within ${item.shipsTo || 'India'}`} />
            </Stack>
            <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField size="small" label="Full name" value={addr.fullName} onChange={set('fullName')} error={!!errors.fullName} helperText={errors.fullName} autoComplete="name" />
              <TextField size="small" label="Mobile number" value={addr.phone} onChange={set('phone')} error={!!errors.phone} helperText={errors.phone} inputProps={{ inputMode: 'numeric', maxLength: 10 }} autoComplete="tel" />
              <TextField size="small" label="House / street" value={addr.line1} onChange={set('line1')} error={!!errors.line1} helperText={errors.line1} sx={{ gridColumn: { sm: '1 / -1' } }} autoComplete="address-line1" />
              <TextField size="small" label="Area / landmark (optional)" value={addr.line2} onChange={set('line2')} sx={{ gridColumn: { sm: '1 / -1' } }} autoComplete="address-line2" />
              <TextField size="small" label="City" value={addr.city} onChange={set('city')} error={!!errors.city} helperText={errors.city} autoComplete="address-level2" />
              <TextField size="small" select label="State" value={addr.state} onChange={set('state')} error={!!errors.state} helperText={errors.state}>
                {states.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField size="small" label="Pincode" value={addr.pincode} onChange={set('pincode')} error={!!errors.pincode} helperText={errors.pincode} inputProps={{ inputMode: 'numeric', maxLength: 6 }} autoComplete="postal-code" />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              You can cancel for a full coin refund until we start packing. Merch is not exchangeable.
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1, p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">Your balance: {fmt(balance)}</Typography>
          <Stack direction="row" spacing={1} alignItems="center"><Typography variant="body2" color="text.secondary">Total</Typography><Coins value={total} size={20} /></Stack>
        </Stack>
        {short > 0 ? (
          <Alert severity="warning" sx={{ py: 0 }}>You need {fmt(short)} more coins. Solve problems to earn them.</Alert>
        ) : (
          <Button variant="contained" size="large" disableElevation onClick={submit} disabled={busy} sx={{ fontWeight: 800 }}>
            {busy ? <CircularProgress size={22} color="inherit" /> : `Redeem for ${fmt(total)} coins`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
