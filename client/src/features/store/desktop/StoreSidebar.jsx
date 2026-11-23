import { Box } from '@mui/material';
import BackToDashboard from '../../../components/BackToDashboard';
import CourseProgressCard from './CourseProgressCard';
import WalletCard from './WalletCard';

// Left column of the Store page: the way back, your coins and the courses you can continue.
export default function StoreSidebar({ store }) {
  const { isAuthenticated, balance, wallet, claiming, claim, setTab, needLogin, inTransit, courses, setCourseSlug } = store;
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box><BackToDashboard /></Box>
      <WalletCard isAuthenticated={isAuthenticated} balance={balance} daily={wallet?.daily} claiming={claiming} onClaim={claim} onWallet={() => setTab('coins')} inTransit={inTransit} onOrders={() => setTab('orders')} onSignIn={needLogin} />
      <CourseProgressCard courses={courses} onOpen={setCourseSlug} />
    </Box>
  );
}
