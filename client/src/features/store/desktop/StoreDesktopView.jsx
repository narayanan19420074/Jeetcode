import { Box, Container, Typography } from '@mui/material';
import { LibraryFont } from '../../dashboard/components/libraryStyle';
import CategoryTabs from './CategoryTabs';
import CourseStrip from './CourseStrip';
import ItemGrid from './ItemGrid';
import MerchNotice from './MerchNotice';
import StoreHeader from './StoreHeader';
import WalletPanel from './WalletPanel';

function WalletRow({ store }) {
  const { isAuthenticated, balance, wallet, claiming, claim, setTab, needLogin, courses, setCourseSlug } = store;
  return (
    <Box sx={{ display: 'grid', gap: 2.5, alignItems: 'stretch', gridTemplateColumns: courses.length ? { md: 'minmax(0,1fr)', lg: '360px minmax(0,1fr)' } : 'minmax(0,1fr)' }}>
      <WalletPanel isAuthenticated={isAuthenticated} balance={balance} daily={wallet?.daily} claiming={claiming} onClaim={claim} onWallet={() => setTab('coins')} onSignIn={needLogin} />
      <CourseStrip courses={courses} onCourse={setCourseSlug} />
    </Box>
  );
}

// Desktop Store in the Library look: wallet and daily reward first, then categories and the item grid.
// Orders and the coin wallet open as dialogs from here, so nobody leaves the page.
export default function StoreDesktopView({ store }) {
  const { isAuthenticated, balance, inTransit, setTab, error, merchLocked, data, user } = store;
  const { categories, cat, setCat, items, loading, buy, setCourseSlug } = store;
  return (
    <LibraryFont>
      <Container maxWidth={false} sx={{ maxWidth: 1240, py: 3, px: 3, display: 'grid', gap: 2.5 }}>
        <StoreHeader isAuthenticated={isAuthenticated} inTransit={inTransit} onOrders={() => setTab('orders')} />
        <WalletRow store={store} />
        {error && <Typography role="alert" color="error" sx={{ fontSize: 15 }}>{error}</Typography>}
        {merchLocked && <MerchNotice minSolved={data?.minSolvedForMerch} solved={user?.totalSolved ?? 0} />}
        <CategoryTabs categories={categories} cat={cat} onCat={setCat} />
        <ItemGrid items={items} loading={loading && !data} balance={balance} signedIn={isAuthenticated} onBuy={buy} onCourse={setCourseSlug} />
      </Container>
    </LibraryFont>
  );
}
