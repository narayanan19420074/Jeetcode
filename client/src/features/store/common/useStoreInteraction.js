import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { DEFAULT_SHELF_FILTERS, hasActiveShelfFilters, purchaseMessage, shelfItems } from './storeSelectors';

const TABS = ['shop', 'orders', 'coins'];

// ?tab=orders and ?tab=coins (also the old wallet and orders links) open the matching dialog or phone screen on top of the shop.
export function useStoreTab(isAuthenticated) {
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const tab = isAuthenticated && TABS.includes(requested) ? requested : 'shop';
  const setTab = (value) => setParams(value === 'shop' ? {} : { tab: value }, { replace: true });
  return { tab, setTab };
}

// The shelf: category, search text, price limit and sort order. Phones only use the category.
export function useStoreShelf(catalog, balance) {
  const [filters, setFilters] = useState(DEFAULT_SHELF_FILTERS);
  const patch = (changes) => setFilters((previous) => ({ ...previous, ...changes }));
  const categories = useMemo(() => [{ id: 'all', label: 'All' }, ...(catalog?.categories || [])], [catalog]);
  const items = useMemo(() => shelfItems([...(catalog?.items || [])], filters, balance), [catalog, filters, balance]);
  return {
    ...filters,
    categories,
    items,
    setCat: (cat) => patch({ cat }),
    setSearch: (search) => patch({ search }),
    setSort: (sort) => patch({ sort }),
    setBudget: (budget) => patch({ budget }),
    resetFilters: () => setFilters(DEFAULT_SHELF_FILTERS),
    hasActiveFilters: hasActiveShelfFilters(filters),
  };
}

// Which item is being checked out, which course panel is open, and what happens after a purchase.
export function useCheckoutFlow({ isAuthenticated, refresh, setTab }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [selected, setSelected] = useState(null);
  const [courseSlug, setCourseSlug] = useState(null);

  const needLogin = () => navigate('/login', { state: { from: '/store' } });
  const buy = (item) => (isAuthenticated ? setSelected(item) : needLogin());

  const done = (result) => {
    const item = selected;
    setSelected(null);
    refresh();
    enqueueSnackbar(purchaseMessage(item, result), { variant: 'success' });
    if (item?.kind === 'course') setCourseSlug(item.slug);
    else if (item?.kind !== 'pro') setTab('orders');
  };

  return { selected, setSelected, courseSlug, setCourseSlug, needLogin, buy, done };
}
