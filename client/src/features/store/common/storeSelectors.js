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
