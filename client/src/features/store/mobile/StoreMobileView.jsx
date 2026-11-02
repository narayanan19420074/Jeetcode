import MobileStore from '../MobileStore';
import { MobileOrders, MobileWallet } from '../MobileAccount';
import mobileStoreProps from './mobileStoreProps';

// Phone: the shop, My orders and the wallet are full screens (same look as the phone Problems and You pages).
export default function StoreMobileView({ store }) {
  const { tab, setTab, orders, wallet, refreshKey, claim, claiming, refresh, setCourseSlug } = store;
  const goToShop = () => setTab('shop');
  if (tab === 'orders') {
    return <MobileOrders orders={orders} onBack={goToShop} onChanged={refresh} onOpenCourse={setCourseSlug} onGoShop={goToShop} />;
  }
  if (tab === 'coins') {
    return <MobileWallet wallet={wallet} refreshKey={refreshKey} onClaim={claim} claiming={claiming} onBack={goToShop} />;
  }
  return <MobileStore {...mobileStoreProps(store)} />;
}
