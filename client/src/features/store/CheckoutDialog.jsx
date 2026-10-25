import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, IconButton, MenuItem, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import { storeApi } from '../../api/storeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from '../auth/authSlice';
import { Choice, Eyebrow, FFButton, FFDialog, Notice, Tag } from '../quests/QuestParts';
import { FF } from '../quests/questUtils';
import { Coins, ItemArt, fmt } from './storeUtils';

// Text fields in the game look: square corners, sunken fill. Colours follow the app theme, so light and dark both work.
const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 0, bgcolor: FF.well }, '& .MuiInputLabel-root': { fontWeight: 600 } };
const stepBtn = { color: FF.text, border: `1px solid ${FF.line}`, borderRadius: 0 };

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

  const footer = (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ fontSize: 13.5, color: FF.muted }}>Your balance: <Box component="span" sx={{ color: FF.text, fontWeight: 800 }}>{fmt(balance)}</Box></Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 13.5, color: FF.muted }}>Total</Typography>
          <Coins value={total} size={22} />
        </Box>
      </Box>
      {short > 0 ? (
        <Notice tone="warning">You need {fmt(short)} more coins. Solve problems to earn them.</Notice>
      ) : (
        <FFButton onClick={submit} disabled={busy} sx={{ width: '100%', minHeight: 54, fontSize: 16 }}>
          {busy ? 'Redeeming…' : `Redeem for ${fmt(total)} coins`}
        </FFButton>
      )}
    </Box>
  );

  return (
    <FFDialog open={open} onClose={onClose} title="Redeem with coins" busy={busy} footer={footer}>
      <Box sx={{ display: 'flex', gap: 2.5, mb: 3 }}>
        <Box sx={{ width: 104, flexShrink: 0, border: `1px solid ${FF.line}` }}><ItemArt art={item.art} accent={item.accent} height={104} image={item.image} /></Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 18, color: FF.text }}>{item.name}</Typography>
          <Typography sx={{ mt: 0.5, mb: 1.25, fontSize: 14, color: FF.muted }}>{item.blurb}</Typography>
          <Coins value={item.price} />
        </Box>
      </Box>

      {error && <Notice tone="error" sx={{ mb: 3 }}>{error}</Notice>}

      {item.kind === 'pro' && <Notice tone="info">+{item.days} days of Pro, added instantly on top of any Pro time you already have.</Notice>}
      {item.kind === 'course' && <Notice tone="info">{item.lessonCount} lessons unlock instantly and stay on your account for good.</Notice>}

      {physical && (
        <Box sx={{ display: 'grid', gap: 3 }}>
          {item.sizes?.length > 0 && (
            <Box>
              <Eyebrow sx={{ mb: 1 }}>Size</Eyebrow>
              <Choice label="Size" options={item.sizes.map((x) => ({ id: x, label: x }))} value={size} onChange={setSize} />
            </Box>
          )}
          {item.colors?.length > 0 && (
            <Box>
              <Eyebrow sx={{ mb: 1 }}>Colour</Eyebrow>
              <Choice label="Colour" options={item.colors.map((x) => ({ id: x, label: x }))} value={color} onChange={setColor} />
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Eyebrow sx={{ flex: 1 }}>Quantity</Eyebrow>
            <IconButton onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Less" sx={stepBtn}><RemoveRoundedIcon /></IconButton>
            <Typography sx={{ minWidth: 32, textAlign: 'center', fontWeight: 900, fontSize: 18, color: FF.text }}>{qty}</Typography>
            <IconButton onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="More" sx={stepBtn}><AddRoundedIcon /></IconButton>
          </Box>

          <Box sx={{ borderTop: `1px solid ${FF.line}`, pt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.25, mb: 2.5 }}>
              <LocalShippingRoundedIcon sx={{ color: FF.orangeInk }} />
              <Typography sx={{ fontWeight: 900, color: FF.text }}>Delivery address</Typography>
              <Tag>Ships within {item.shipsTo || 'India'}</Tag>
            </Box>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField sx={fieldSx} size="small" label="Full name" value={addr.fullName} onChange={set('fullName')} error={!!errors.fullName} helperText={errors.fullName} autoComplete="name" />
              <TextField sx={fieldSx} size="small" label="Mobile number" value={addr.phone} onChange={set('phone')} error={!!errors.phone} helperText={errors.phone} inputProps={{ inputMode: 'numeric', maxLength: 10 }} autoComplete="tel" />
              <TextField sx={{ ...fieldSx, gridColumn: { sm: '1 / -1' } }} size="small" label="House / street" value={addr.line1} onChange={set('line1')} error={!!errors.line1} helperText={errors.line1} autoComplete="address-line1" />
              <TextField sx={{ ...fieldSx, gridColumn: { sm: '1 / -1' } }} size="small" label="Area / landmark (optional)" value={addr.line2} onChange={set('line2')} autoComplete="address-line2" />
              <TextField sx={fieldSx} size="small" label="City" value={addr.city} onChange={set('city')} error={!!errors.city} helperText={errors.city} autoComplete="address-level2" />
              <TextField sx={fieldSx} size="small" select label="State" value={addr.state} onChange={set('state')} error={!!errors.state} helperText={errors.state}>
                {states.map((st) => <MenuItem key={st} value={st}>{st}</MenuItem>)}
              </TextField>
              <TextField sx={fieldSx} size="small" label="Pincode" value={addr.pincode} onChange={set('pincode')} error={!!errors.pincode} helperText={errors.pincode} inputProps={{ inputMode: 'numeric', maxLength: 6 }} autoComplete="postal-code" />
            </Box>
            <Typography sx={{ mt: 2, fontSize: 12.5, color: FF.muted }}>
              You can cancel for a full coin refund until we start packing. Merch is not exchangeable.
            </Typography>
          </Box>
        </Box>
      )}
    </FFDialog>
  );
}
