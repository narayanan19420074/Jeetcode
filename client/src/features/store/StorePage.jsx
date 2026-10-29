import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, ButtonBase, Container, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { useSnackbar } from 'notistack';
import { storeApi } from '../../api/storeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { userUpdated } from '../auth/authSlice';
import { Bar, Choice, Coin, Eyebrow, FFButton, FFDialog, Notice, Panel, Stat, Tag } from '../quests/QuestParts';
import { FF, cut } from '../quests/questUtils';
import CheckoutDialog from './CheckoutDialog';
import CoursePanel from './CoursePanel';
import MobileStore from './MobileStore';
import { CoinsTab, OrdersTab } from './AccountTabs';
import { Coins, ItemArt, fmt, priceNote } from './storeUtils';
import BackToDashboard from '../../components/BackToDashboard';

// The Store is one screen in the same game look as Quests: a wallet bar, category buttons and a grid of item tiles.
// Orders and the coin wallet open as dialogs from the top bar, so nobody has to leave the page.
const TABS = ['shop', 'orders', 'coins'];
const GRID = { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' };

function ItemCard({ item, balance, signedIn, onBuy, onCourse }) {
  const note = priceNote(item);
  const owned = item.owned;
  const afford = signedIn && balance >= item.price;
  const disabled = item.soldOut && !owned;
  const isCourse = item.kind === 'course';
  const need = item.price - balance;
  const open = () => (owned || isCourse ? onCourse(item.slug) : onBuy(item));

  return (
    <Panel n={14} sx={{ display: 'flex', flexDirection: 'column', height: '100%', opacity: disabled ? 0.6 : 1, transition: 'background-color .15s', '&:hover': { bgcolor: disabled ? FF.line : FF.orange } }}>
      <Box sx={{ position: 'relative', m: '1px', mb: 0 }}>
        <ButtonBase onClick={isCourse ? () => onCourse(item.slug) : undefined} disabled={!isCourse} aria-label={isCourse ? `Open ${item.name}` : undefined} sx={{ display: 'block', width: '100%', cursor: isCourse ? 'pointer' : 'default', '&.Mui-disabled': { pointerEvents: 'none' } }}>
          <ItemArt art={item.art} accent={item.accent} height={150} image={item.image} />
        </ButtonBase>
        {(item.popular || note) && (
          <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {item.popular && <Tag tone="orange">Popular</Tag>}
            {note && <Tag tone={item.soldOut ? 'dark' : 'red'}>{note}</Tag>}
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5, gap: 0.5, minWidth: 0 }}>
        <Typography component="h3" noWrap title={item.name} sx={{ fontWeight: 900, fontSize: 15.5, letterSpacing: '0.01em', color: FF.text }}>{item.name}</Typography>
        <Typography noWrap title={item.blurb} sx={{ fontSize: 13, color: FF.muted }}>{item.blurb}</Typography>

        <Box sx={{ mt: 'auto', pt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 0 }}>
            <Coins value={item.price} size={19} />
            {!owned && signedIn && !afford && !disabled && (
              <Typography sx={{ mt: 0.5, fontSize: 12, color: FF.muted }}>Need {fmt(need)} more</Typography>
            )}
          </Box>
          {owned ? (
            <FFButton tone="dark" onClick={open} sx={{ minHeight: 38, px: 2 }}>Open</FFButton>
          ) : (
            <FFButton tone={afford ? 'orange' : 'dark'} disabled={disabled} onClick={open} sx={{ minHeight: 38, px: 2 }}>
              {disabled ? 'Sold out' : afford ? 'Redeem' : 'View'}
            </FFButton>
          )}
        </Box>
      </Box>
    </Panel>
  );
}

export default function StorePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [params, setParams] = useSearchParams();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });

  const [data, setData] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [orders, setOrders] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [claiming, setClaiming] = useState(false);

  const [cat, setCat] = useState('all');
  const [selected, setSelected] = useState(null);
  const [courseSlug, setCourseSlug] = useState(null);

  // ?tab=orders and ?tab=coins (old links) open the matching dialog on top of the shop.
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

  // Featured first: popular items, then the catalog order.
  const items = useMemo(() => {
    let list = data?.items || [];
    if (cat !== 'all') list = list.filter((i) => i.category === cat);
    return [...list].sort((a, b) => Number(b.popular) - Number(a.popular));
  }, [data, cat]);

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
  const categories = [{ id: 'all', label: 'All' }, ...(data?.categories || [])];

  const dialogs = (
    <>
      <FFDialog open={tab === 'orders'} onClose={() => setTab('shop')} title="My orders" wide>
        <OrdersTab orders={orders} onChanged={refresh} onOpenCourse={setCourseSlug} onGoShop={() => setTab('shop')} />
      </FFDialog>
      <FFDialog open={tab === 'coins'} onClose={() => setTab('shop')} title="Coin wallet" wide>
        <CoinsTab wallet={wallet} refreshKey={refreshKey} onClaim={claim} claiming={claiming} />
      </FFDialog>

      <CheckoutDialog item={selected} balance={balance} states={data?.states} open={Boolean(selected)} onClose={() => setSelected(null)} onDone={done} />
      <CoursePanel
        slug={courseSlug}
        signedIn={isAuthenticated}
        onClose={() => setCourseSlug(null)}
        onProgress={loadAccount}
        onBuy={(course) => { setCourseSlug(null); buy(course); }}
      />
    </>
  );

  // Phone: its own layout (same look as the phone Problems and You pages). Orders, wallet, checkout and courses stay in their dialogs.
  if (isMobile) {
    return (
      <>
        <MobileStore
          isAuthenticated={isAuthenticated}
          balance={balance}
          daily={d}
          claiming={claiming}
          onClaim={claim}
          inTransit={inTransit}
          onOrders={() => setTab('orders')}
          onWallet={() => setTab('coins')}
          onSignIn={needLogin}
          courses={courses}
          onCourse={setCourseSlug}
          merchLocked={Boolean(merchLocked)}
          minSolved={data?.minSolvedForMerch}
          solved={user?.totalSolved ?? 0}
          categories={categories}
          cat={cat}
          onCat={setCat}
          items={items}
          loading={loading && !data}
          error={error}
          onBuy={buy}
        />
        {dialogs}
      </>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <BackToDashboard sx={{ mb: 1.5 }} />

      {/* Top bar: title, wallet, the one daily action, orders */}
      <Panel n={18} sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3, p: { xs: 2.5, md: 3.5 }, background: 'linear-gradient(90deg, rgba(255,122,0,0.16), transparent 55%)' }}>
          <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
            <Eyebrow sx={{ color: FF.orangeInk }}>JeetCode</Eyebrow>
            <Typography component="h1" sx={{ fontWeight: 900, fontSize: { xs: 30, md: 36 }, lineHeight: 1.1, letterSpacing: '0.04em', textTransform: 'uppercase', color: FF.text }}>Store</Typography>
            <Typography sx={{ mt: 0.75, fontSize: 14, color: FF.muted }}>Spend the coins you earn by solving.</Typography>
          </Box>

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
              <Stat icon={<Coin size={22} />} value={fmt(balance)} label="Your coins · open wallet" onClick={() => setTab('coins')} />
              {d?.eligible ? (
                <FFButton tone="green" disabled={claiming} onClick={claim} sx={{ minHeight: 44 }}>
                  <CardGiftcardRoundedIcon sx={{ fontSize: 20 }} /> {claiming ? 'Claiming…' : `Claim +${d.reward}`}
                </FFButton>
              ) : d && !d.claimed ? (
                <FFButton component={RouterLink} to="/problems" tone="dark" sx={{ minHeight: 44 }}>Solve 1 for daily coins</FFButton>
              ) : d?.claimed ? (
                <Tag tone="green" sx={{ height: 44, px: 2, fontSize: 12, clipPath: cut(8) }}><CheckCircleRoundedIcon sx={{ fontSize: 18 }} /> Checked in today</Tag>
              ) : null}
              <FFButton tone="dark" onClick={() => setTab('orders')} aria-label="My orders" sx={{ position: 'relative', minHeight: 44 }}>
                <LocalMallRoundedIcon sx={{ fontSize: 20 }} /> Orders
                {inTransit > 0 && <Box component="span" sx={{ position: 'absolute', top: 2, right: 2, minWidth: 20, height: 20, px: 0.5, display: 'grid', placeItems: 'center', fontSize: 12, color: '#fff', bgcolor: FF.red, borderRadius: 10 }}>{inTransit}</Box>}
              </FFButton>
            </Box>
          ) : (
            <FFButton onClick={needLogin}>Sign in to redeem</FFButton>
          )}
        </Box>
      </Panel>

      {error && <Notice tone="error" sx={{ mb: 3 }}>{error}</Notice>}

      {courses.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Eyebrow sx={{ mb: 1.5 }}>Continue learning</Eyebrow>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            {courses.map((c) => (
              <ButtonBase key={c.slug} onClick={() => setCourseSlug(c.slug)} sx={{ display: 'block', minWidth: 250, flexShrink: 0, p: 2.5, textAlign: 'left', bgcolor: FF.panel, border: `1px solid ${FF.line}`, clipPath: cut(10), '&:hover': { borderColor: FF.orange }, '&:focus-visible': { outline: `2px solid ${FF.orange}`, outlineOffset: 2 } }}>
                <Typography noWrap sx={{ fontWeight: 900, color: FF.text }}>{c.name}</Typography>
                <Typography sx={{ mt: 0.25, mb: 1.25, fontSize: 12.5, color: FF.muted }}>{c.progress.doneCount}/{c.progress.lessonCount} lessons</Typography>
                <Bar pct={c.progress.percent} height={7} />
              </ButtonBase>
            ))}
          </Box>
        </Box>
      )}

      {merchLocked && (
        <Notice tone="info" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LockRoundedIcon sx={{ fontSize: 20, color: FF.blueInk }} />
          Merch unlocks after you solve {data.minSolvedForMerch} problems. You have solved {user?.totalSolved ?? 0}.
        </Notice>
      )}

      <Box sx={{ mb: 4 }}>
        <Choice label="Category" options={categories} value={cat} onChange={setCat} />
      </Box>

      {loading && !data ? (
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: GRID }}>
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant="rectangular" height={290} sx={{ bgcolor: FF.panel, clipPath: cut(14) }} />)}
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 20, color: FF.text }}>Nothing here yet</Typography>
          <Typography sx={{ mt: 0.75, color: FF.muted }}>Try another category.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: { xs: 2, md: 3 }, gridTemplateColumns: GRID }}>
          {items.map((it) => <ItemCard key={it.slug} item={it} balance={balance} signedIn={isAuthenticated} onBuy={buy} onCourse={setCourseSlug} />)}
        </Box>
      )}

      {dialogs}
    </Container>
  );
}
