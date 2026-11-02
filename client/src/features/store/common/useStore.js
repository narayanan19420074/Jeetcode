import useStoreData from './useStoreData';
import { useCheckoutFlow, useStoreShelf, useStoreTab } from './useStoreInteraction';
import { countInTransit, isMerchLocked } from './storeSelectors';

// Everything the Store page needs, shared by the phone and desktop layouts.
export default function useStore() {
  const base = useStoreData();
  const { tab, setTab } = useStoreTab(base.isAuthenticated);
  const shelf = useStoreShelf(base.data);
  const checkout = useCheckoutFlow({ isAuthenticated: base.isAuthenticated, refresh: base.refresh, setTab });
  const merchLocked = isMerchLocked(base.isAuthenticated, base.data, base.user);
  const inTransit = countInTransit(base.orders);
  return { ...base, tab, setTab, ...shelf, ...checkout, merchLocked, inTransit };
}
