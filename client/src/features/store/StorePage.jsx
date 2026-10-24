import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, CircularProgress, Container, InputAdornment, MenuItem, Paper, Skeleton, Stack, Tab, Tabs,
  TextField, Typography, alpha,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { useSnackbar } from 'notistack';
import { storeApi } from '../../api/storeApi';
import { extractErrorMessage } from '../../api/apiClient';
import CheckoutDialog from './CheckoutDialog';
import { Coins, ItemArt, fmt, priceNote } from './storeUtils';

const SORTS = [
  { v: 'popular', l: 'Featured' },
  { v: 'low', l: 'Price: low to high' },
  { v: 'high', l: 'Price: high to low' },
];

function ItemCard({ item, balance, signedIn, onOpen }) {
  const note = priceNote(item);
  const owned = item.owned;
  const afford = signedIn && balance >= item.price;
  const pct = signedIn ? Math.min(100, Math.round((balance / item.price) * 100)) : 0;
  const disabled = item.soldOut && !owned;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25, height: '100%', opacity: disabled ? 0.65 : 1 }}>
      <Box sx={{ position: 'relative' }}>
        <ItemArt art={item.art} accent={item.accent} height={150} />
        <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 8, left: 8 }}>
          {item.popular && <Chip size="small" color="warning" label="Popular" sx={{ fontWeight: 800 }} />}
          {note && <Chip size="small" color={item.soldOut ? 'default' : 'error'} label={note} sx={{ fontWeight: 800 }} />}
        </Stack>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 800, lineHeight: 1.25 }}>{item.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{item.blurb}</Typography>
        {item.kind === 'course' && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {item.lessonCount} lessons · {Math.round(item.minutes / 60)}h · {item.level}
          </Typography>
        )}
        {item.kind === 'physical' && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Ships within India</Typography>
        )}
      </Box>
      {!owned && signedIn && !afford && (
        <Box>
          <Box sx={{ height: 5, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden' }}>
            <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: 'warning.main' }} />
          </Box>
          <Typography variant="caption" color="text.secondary">{fmt(item.price - balance)} more coins to go</Typography>
        </Box>
      )}
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Coins value={item.price} size={20} />
        {owned ? (
          <Button component={RouterLink} to={`/store/course/${item.slug}`} size="small" variant="outlined" startIcon={<CheckCircleRoundedIcon />} sx={{ fontWeight: 800 }}>Open</Button>
        ) : (
          <Button size="small" variant={afford ? 'contained' : 'outlined'} disableElevation disabled={disabled} onClick={() => onOpen(item)} sx={{ fontWeight: 800 }}>
            {disabled ? 'Sold out' : afford ? 'Redeem' : 'View'}
          </Button>
        )}
      </Stack>
      {item.kind === 'course' && !owned && (
        <Button component={RouterLink} to={`/store/course/${item.slug}`} size="small" color="inherit" sx={{ alignSelf: 'flex-start', mt: -0.5, textDecoration: 'underline' }}>See syllabus</Button>
      )}
    </Paper>
  );
}

export default function StorePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [params, setParams] = useSearchParams();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const balance = user?.coins ?? 0;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('popular');
  const [selected, setSelected] = useState(null);

  const cat = params.get('cat') || 'all';
  const setCat = (v) => setParams(v === 'all' ? {} : { cat: v }, { replace: true });

  const load = useCallback(() => {
    setLoading(true);
    storeApi.items()
      .then(({ data: d }) => setData(d.data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load, isAuthenticated]);

  const items = useMemo(() => {
    let list = data?.items || [];
    if (cat !== 'all') list = list.filter((i) => i.category === cat);
    const s = q.trim().toLowerCase();
    if (s) list = list.filter((i) => `${i.name} ${i.blurb}`.toLowerCase().includes(s));
    const sorted = [...list];
    if (sort === 'low') sorted.sort((a, b) => a.price - b.price);
    else if (sort === 'high') sorted.sort((a, b) => b.price - a.price);
    else sorted.sort((a, b) => Number(b.popular) - Number(a.popular));
    return sorted;
  }, [data, cat, q, sort]);

  const open = (item) => {
    if (!isAuthenticated) return navigate('/login', { state: { from: '/store' } });
    setSelected(item);
  };

  const done = (res) => {
    const it = selected;
    setSelected(null);
    load();
    if (it?.kind === 'course') {
      enqueueSnackbar(`${it.name} unlocked!`, { variant: 'success' });
      navigate(`/store/course/${it.slug}`);
    } else if (it?.kind === 'pro') {
      enqueueSnackbar(`Pro extended until ${new Date(res.order.proUntil).toLocaleDateString('en-IN')}`, { variant: 'success' });
    } else {
      enqueueSnackbar(`Order ${res.order.orderNo} placed!`, { variant: 'success' });
      navigate('/store/orders');
    }
  };

  const locked = isAuthenticated && data && (user?.totalSolved ?? 0) < data.minSolvedForMerch;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper
        variant="outlined"
        sx={(t) => ({
          p: { xs: 2, md: 3 }, mb: 3, borderRadius: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center',
          background: `linear-gradient(135deg, ${alpha(t.palette.warning.main, 0.16)}, ${alpha(t.palette.primary.main, 0.1)})`,
        })}
      >
        <Box sx={{ flex: '1 1 260px' }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>JeetCode Store</Typography>
          <Typography color="text.secondary">Spend the coins you earn by solving: Pro, courses and merch.</Typography>
        </Box>
        {isAuthenticated ? (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Paper sx={{ px: 2, py: 1, borderRadius: 3 }}>
              <Typography variant="caption" color="text.secondary">Your coins</Typography>
              <Coins value={balance} size={26} />
            </Paper>
            <Button component={RouterLink} to="/store/wallet" startIcon={<AccountBalanceWalletRoundedIcon />} variant="outlined" sx={{ fontWeight: 700 }}>Wallet</Button>
            <Button component={RouterLink} to="/store/orders" startIcon={<ReceiptLongRoundedIcon />} variant="outlined" sx={{ fontWeight: 700 }}>Orders</Button>
          </Stack>
        ) : (
          <Button component={RouterLink} to="/login" state={{ from: '/store' }} variant="contained" disableElevation sx={{ fontWeight: 800 }}>Sign in to redeem</Button>
        )}
      </Paper>

      {locked && (
        <Alert severity="info" icon={<LockRoundedIcon />} sx={{ mb: 2 }}>
          Merch unlocks after you solve {data.minSolvedForMerch} problems. You have solved {user?.totalSolved ?? 0}.
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }} alignItems={{ md: 'center' }}>
        <Tabs value={cat} onChange={(_, v) => setCat(v)} variant="scrollable" scrollButtons="auto" sx={{ flex: 1, minHeight: 40 }}>
          <Tab value="all" label="All" />
          {(data?.categories || []).map((c) => <Tab key={c.id} value={c.id} label={c.label} />)}
        </Tabs>
        <TextField
          size="small" placeholder="Search store" value={q} onChange={(e) => setQ(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }}
          sx={{ minWidth: { md: 220 } }}
        />
        <TextField size="small" select value={sort} onChange={(e) => setSort(e.target.value)} sx={{ minWidth: 190 }} aria-label="Sort">
          {SORTS.map((s) => <MenuItem key={s.v} value={s.v}>{s.l}</MenuItem>)}
        </TextField>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && !data ? (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' } }}>
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant="rounded" height={300} sx={{ borderRadius: 3 }} />)}
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Nothing found</Typography>
          <Typography color="text.secondary">Try another search or category.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' } }}>
          {items.map((it) => <ItemCard key={it.slug} item={it} balance={balance} signedIn={isAuthenticated} onOpen={open} />)}
        </Box>
      )}
      {loading && data && <Box sx={{ textAlign: 'center', mt: 2 }}><CircularProgress size={20} /></Box>}

      <CheckoutDialog item={selected} balance={balance} states={data?.states} open={Boolean(selected)} onClose={() => setSelected(null)} onDone={done} />
    </Container>
  );
}
