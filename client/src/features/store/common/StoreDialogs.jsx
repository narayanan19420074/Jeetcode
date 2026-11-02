import { FFDialog } from '../../quests/QuestParts';
import CheckoutDialog from '../CheckoutDialog';
import CoursePanel from '../CoursePanel';
import { CoinsTab, OrdersTab } from '../AccountTabs';

function PurchaseDialogs({ store }) {
  const { selected, setSelected, balance, data, done, courseSlug, setCourseSlug, isAuthenticated, loadAccount, buy } = store;
  const buyCourse = (course) => {
    setCourseSlug(null);
    buy(course);
  };
  return (
    <>
      <CheckoutDialog item={selected} balance={balance} states={data?.states} open={Boolean(selected)} onClose={() => setSelected(null)} onDone={done} />
      <CoursePanel slug={courseSlug} signedIn={isAuthenticated} onClose={() => setCourseSlug(null)} onProgress={loadAccount} onBuy={buyCourse} />
    </>
  );
}

// Orders and the coin wallet are dialogs on desktop and full screens on phones. Checkout and courses are dialogs on both.
export default function StoreDialogs({ store, isPhone }) {
  const { tab, setTab, orders, wallet, refreshKey, claim, claiming, refresh, setCourseSlug } = store;
  const goToShop = () => setTab('shop');
  return (
    <>
      <FFDialog open={!isPhone && tab === 'orders'} onClose={goToShop} title="My orders" wide>
        <OrdersTab orders={orders} onChanged={refresh} onOpenCourse={setCourseSlug} onGoShop={goToShop} />
      </FFDialog>
      <FFDialog open={!isPhone && tab === 'coins'} onClose={goToShop} title="Coin wallet" wide>
        <CoinsTab wallet={wallet} refreshKey={refreshKey} onClaim={claim} claiming={claiming} />
      </FFDialog>
      <PurchaseDialogs store={store} />
    </>
  );
}
