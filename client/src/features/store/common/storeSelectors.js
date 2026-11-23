// Merch stays locked until the learner has solved enough problems, so coins alone cannot buy it on day one.
export const isMerchLocked = (isAuthenticated, catalog, user) => Boolean(isAuthenticated && catalog && (user?.totalSolved ?? 0) < catalog.minSolvedForMerch);

const IN_TRANSIT_STATUSES = ['placed', 'processing', 'shipped'];

// Physical orders the learner is still waiting for. Instant items (Pro, courses) are never in transit.
export const countInTransit = (orders) => (orders || []).filter((order) => order.kind === 'physical' && IN_TRANSIT_STATUSES.includes(order.status)).length;

export function purchaseMessage(item, result) {
  if (item?.kind === 'course') return `${item.name} unlocked!`;
  if (item?.kind === 'pro') return `Pro extended until ${new Date(result.order.proUntil).toLocaleDateString('en-IN')}`;
  return `Order ${result.order.orderNo} placed!`;
}

// What the button on an item card says and does. Owned items and courses open the course panel, everything else opens checkout.
export function itemAction(item, balance, signedIn) {
  const owned = Boolean(item.owned);
  const soldOut = Boolean(item.soldOut) && !owned;
  const afford = Boolean(signedIn) && balance >= item.price;
  const label = owned ? 'Open' : soldOut ? 'Sold out' : afford ? 'Redeem' : 'View';
  return { owned, soldOut, afford, label, opensCourse: owned || item.kind === 'course' };
}

// ---- Shelf (the list of items shown in the Store) ----
export const SORT_OPTIONS = [['featured', 'Featured'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']];
export const BUDGET_OPTIONS = [['all', 'Any price'], ['affordable', 'Within my coins']];
export const DEFAULT_SHELF_FILTERS = { cat: 'all', search: '', sort: 'featured', budget: 'all' };

// Featured puts popular items first; the other two order by price. Ties keep the catalog order.
const SORTERS = {
  featured: (a, b) => Number(b.popular) - Number(a.popular),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
};

const matchesSearch = (item, text) => !text.trim() || `${item.name} ${item.blurb}`.toLowerCase().includes(text.trim().toLowerCase());
const isAffordable = (item, balance) => !item.soldOut && item.price <= balance;

// The items to show for the chosen category, search text, price limit and sort order.
export function shelfItems(items, { cat, search, sort, budget }, balance) {
  return items
    .filter((item) => cat === 'all' || item.category === cat)
    .filter((item) => matchesSearch(item, search))
    .filter((item) => budget !== 'affordable' || isAffordable(item, balance))
    .sort(SORTERS[sort] ?? SORTERS.featured);
}

export const hasActiveShelfFilters = (filters) => Object.keys(DEFAULT_SHELF_FILTERS).some((key) => key !== 'sort' && filters[key] !== DEFAULT_SHELF_FILTERS[key]);
