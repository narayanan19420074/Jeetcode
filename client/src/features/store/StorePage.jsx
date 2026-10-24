import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert, Badge, Box, Button, Chip, CircularProgress, Container, InputAdornment, LinearProgress, MenuItem, Paper, Skeleton,
  Stack, Tab, Tabs, TextField, Typography, alpha,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import { useSnackbar } from 'notistack';
import { storeApi } from '../../api/storeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from '../auth/authSlice';
import CheckoutDialog from './CheckoutDialog';
import CoursePanel from './CoursePanel';
import { CoinsTab, OrdersTab } from './AccountTabs';
import { Coins, ItemArt, fmt, priceNote } from './storeUtils';

const SORTS = [
  { v: 'popular', l: 'Featured' },
  { v: 'low', l: 'Price: low to high' },
  { v: 'high', l: 'Price: high to low' },
];
const TABS = ['shop', 'orders', 'coins'];

function ItemCard({ item, balance, signedIn, onBuy, onCourse }) {
  const note = priceNote(item);
  const owned = item.owned;
  const afford = signedIn && balance >= item.price;
  const pct = signedIn ? Math.min(100, Math.round((balance / item.price) * 100)) : 0;
  const disabled = item.soldOut && !owned;
  const isCourse = item.kind === 'course';

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25, height: '100%', opacity: disabled ? 0.65 : 1 }}>
      <Box
        sx={{ position: 'relative', cursor: isCourse ? 'pointer' : 'default' }}
        onClick={isCourse ? () => onCourse(item.slug) : undefined}
      >
        <ItemArt art={item.art} accent={item.accent} height={140} />
        <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 8, left: 8 }}>
          {item.popular && <Chip size="small" color="warning" label="Popular" sx={{ fontWeight: 800 }} />}
          {note && <Chip size="small" color={item.soldOut ? 'default' : 'error'} label={note} sx={{ fontWeight: 800 }} />}
        </Stack>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 800, lineHeight: 1.25 }}>{item.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{item.blurb}</Typography>
        {isCourse && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {item.lessonCount} lessons · {Math.round(item.minutes / 60)}h
          </Typography>
        )}
        {item.kind === 'physical' && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Ships within India</Typography>}
      </Box>
      {!owned && signedIn && !afford && (
        <Box>
          <LinearProgress variant="determinate" value={pct} color="warning" sx={{ height: 5, borderRadius: 3 }} />
          <Typography variant="caption" color="text.secondary">{fmt(item.price - balance)} more coins to go</Typography>
        </Box>
      )}
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Coins value={item.price} size={20} />
        {owned ? (
          <Button size="small" variant="outlined" startIcon={<CheckCircleRoundedIcon />} onClick={() => onCourse(item.slug)} sx={{ fontWeight: 800 }}>Open</Button>
        ) : (
          <Button size="small" variant={afford ? 'contained' : 'outlined'} disableElevation disabled={disabled} onClick={() => onBuy(item)} sx={{ fontWeight: 800 }}>
            {disabled ? 'Sold out' : afford ? 'Redeem' : 'View'}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export default function StorePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [params, setParams] = useSearchParams();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [data, setData] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [orders, setOrders] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [claiming, setClaiming] = useState(false);

  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState('popular');
  const [selected, setSelected] = useState(null);
  const [courseSlug, setCourseSlug] = useState(null);

  const tabParam = params.get('tab');
  const tab = isAuthenticated && TABS.includes(tabParam) ? tabParam : 'shop';
  const setTab = (v) => setParams(v === 'shop' ? {} : { tab: v }, { replace: true });
  const balance = wallet?.coins ?? user?.coins ?? 0;

  const loadItems = useCallback(() => {
    storeApi.items().then(({ data: d }) => setData(d.data)).catch((err) => setError(extractErrorMessage(err))).finally(() => setLoading(false));
  }, []);

  const loadAccount = useCallback(() => {
    if (!isAuthenticated) return;
    storeApi.wallet().then(({ data: d }) => {
      setWallet(d.data);
      dispatch(userUpdated({ coins: d.data.coins }));
    }).catch(() => {});
    storeApi.orders().then(({ data: d }) => setOrders(d.data.items)).catch(() => setOrders([]));
    storeApi.myCourses().then(({ data: d }) => setCourses(d.data.items)).catch(() => setCourses([]));
  }, [isAuthenticated, dispatch]);

  const refresh = useCallback(() => {
    loadItems();
    loadAccount();
    setRefreshKey((k) => k + 1);
  }, [loadItems, loadAccount]);
  useEffect(() => { refresh(); }, [refresh]);

  const claim = async () => {
    setClaiming(true);
    try {
      const { data: d } = await storeApi.claimDaily();
      enqueueSnackbar(`+${d.data.amount} coins claimed`, { variant: 'success' });
      setWallet(d.data.wallet);
      dispatch(userUpdated({ coins: d.data.wallet.coins }));
      setRefreshKey((k) => k + 1);
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    } finally {
      setClaiming(false);
    }
  };

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

  const needLogin = () => navigate('/login', { state: { from: '/store' } });
  const buy = (item) => (isAuthenticated ? setSelected(item) : needLogin());

  const done = (res) => {
    const it = selected;
    setSelected(null);
    refresh();
    if (it?.kind === 'course') {
      enqueueSnackbar(`${it.name} unlocked!`, { variant: 'success' });
      setCourseSlug(it.slug);
    } else if (it?.kind === 'pro') {
      enqueueSnackbar(`Pro extended until ${new Date(res.order.proUntil).toLocaleDateString('en-IN')}`, { variant: 'success' });
    } else {
      enqueueSnackbar(`Order ${res.order.orderNo} placed!`, { variant: 'success' });
      setTab('orders');
    }
  };

  const merchLocked = isAuthenticated && data && (user?.totalSolved ?? 0) < data.minSolvedForMerch;
  const inTransit = (orders || []).filter((o) => o.kind === 'physical' && ['placed', 'processing', 'shipped'].includes(o.status)).length;
  const d = wallet?.daily;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 1.5, md: 3 } }}>
      {/* Header: balance + the one daily action */}
      <Paper
        variant="outlined"
        sx={(t) => ({
          p: { xs: 2, md: 2.5 }, mb: 1.5, borderRadius: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center',
          background: `linear-gradient(135deg, ${alpha(t.palette.warning.main, 0.16)}, ${alpha(t.palette.primary.main, 0.08)})`,
        })}
      >
        <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>JeetCode Store</Typography>
          <Typography variant="body2" color="text.secondary">Spend coins you earn by solving.</Typography>
        </Box>
        {isAuthenticated ? (
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Box sx={{ cursor: 'pointer' }} onClick={() => setTab('coins')}>
              <Typography variant="caption" color="text.secondary">Your coins</Typography>
              <Coins value={balance} size={28} />
            </Box>
            {d?.eligible ? (
              <Button variant="contained" disableElevation startIcon={<CardGiftcardRoundedIcon />} onClick={claim} disabled={claiming} sx={{ fontWeight: 800 }}>
                {claiming ? <CircularProgress size={20} color="inherit" /> : `Claim +${d.reward}`}
              </Button>
            ) : d && !d.claimed ? (
              <Button component={RouterLink} to="/problems" size="small" variant="outlined" sx={{ fontWeight: 700 }}>Solve 1 for daily coins</Button>
            ) : d?.claimed ? (
              <Chip icon={<CheckCircleRoundedIcon />} label="Checked in today" color="success" variant="outlined" />
            ) : null}
          </Stack>
        ) : (
          <Button variant="contained" disableElevation onClick={needLogin} sx={{ fontWeight: 800 }}>Sign in to redeem</Button>
        )}
      </Paper>

      {isAuthenticated && (
        <Box sx={{ position: 'sticky', top: { xs: 56, sm: 64 }, zIndex: 2, bgcolor: 'background.default', mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
            <Tab value="shop" label="Shop" />
            <Tab value="orders" label={<Badge color="primary" badgeContent={inTransit} sx={{ '& .MuiBadge-badge': { right: -12 } }}>Orders</Badge>} />
            <Tab value="coins" label="Coins" />
          </Tabs>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {tab === 'orders' && <OrdersTab orders={orders} onChanged={refresh} onOpenCourse={setCourseSlug} onGoShop={() => setTab('shop')} />}
      {tab === 'coins' && <CoinsTab wallet={wallet} refreshKey={refreshKey} onClaim={claim} claiming={claiming} />}

      {tab === 'shop' && (
        <>
          {courses.length > 0 && (
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: 800, mb: 1 }}>Continue learning</Typography>
              <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 0.5, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                {courses.map((c) => (
                  <Paper key={c.slug} variant="outlined" onClick={() => setCourseSlug(c.slug)} sx={{ p: 1.5, borderRadius: 3, minWidth: 230, cursor: 'pointer', flexShrink: 0, '&:hover': { borderColor: 'primary.main' } }}>
                    <Typography sx={{ fontWeight: 800 }} noWrap>{c.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.progress.doneCount}/{c.progress.lessonCount} lessons</Typography>
                    <LinearProgress variant="determinate" value={c.progress.percent} sx={{ mt: 0.75, height: 6, borderRadius: 3 }} />
                  </Paper>
                ))}
              </Box>
            </Box>
          )}

          {merchLocked && (
            <Alert severity="info" icon={<LockRoundedIcon />} sx={{ mb: 2 }}>
              Merch unlocks after you solve {data.minSolvedForMerch} problems. You have solved {user?.totalSolved ?? 0}.
            </Alert>
          )}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }} alignItems={{ md: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', flex: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
              {[{ id: 'all', label: 'All' }, ...(data?.categories || [])].map((c) => (
                <Chip key={c.id} label={c.label} clickable onClick={() => setCat(c.id)} color={cat === c.id ? 'primary' : 'default'} variant={cat === c.id ? 'filled' : 'outlined'} sx={{ fontWeight: 700, flexShrink: 0 }} />
              ))}
            </Box>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} sx={{ flex: 1, minWidth: 0 }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }}
              />
              <TextField size="small" select value={sort} onChange={(e) => setSort(e.target.value)} sx={{ minWidth: 150 }} aria-label="Sort">
                {SORTS.map((s) => <MenuItem key={s.v} value={s.v}>{s.l}</MenuItem>)}
              </TextField>
            </Stack>
          </Stack>

          {loading && !data ? (
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' } }}>
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant="rounded" height={290} sx={{ borderRadius: 3 }} />)}
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Nothing found</Typography>
              <Typography color="text.secondary">Try another search or category.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' } }}>
              {items.map((it) => <ItemCard key={it.slug} item={it} balance={balance} signedIn={isAuthenticated} onBuy={buy} onCourse={setCourseSlug} />)}
            </Box>
          )}
        </>
      )}

      <CheckoutDialog item={selected} balance={balance} states={data?.states} open={Boolean(selected)} onClose={() => setSelected(null)} onDone={done} />
      <CoursePanel
        slug={courseSlug}
        signedIn={isAuthenticated}
        onClose={() => setCourseSlug(null)}
        onProgress={loadAccount}
        onBuy={(course) => { setCourseSlug(null); buy(course); }}
      />
    </Container>
  );
}
