// Maps the shared store state to the props of the phone shop screen (MobileStore).
export default function mobileStoreProps(store) {
  const { isAuthenticated, balance, wallet, claiming, claim, inTransit, setTab, needLogin, courses, setCourseSlug } = store;
  const { merchLocked, data, user, categories, cat, setCat, items, loading, error, buy } = store;
  return {
    isAuthenticated,
    balance,
    daily: wallet?.daily,
    claiming,
    onClaim: claim,
    inTransit,
    onOrders: () => setTab('orders'),
    onWallet: () => setTab('coins'),
    onSignIn: needLogin,
    courses,
    onCourse: setCourseSlug,
    merchLocked: Boolean(merchLocked),
    minSolved: data?.minSolvedForMerch,
    solved: user?.totalSolved ?? 0,
    categories,
    cat,
    onCat: setCat,
    items,
    loading: loading && !data,
    error,
    onBuy: buy,
  };
}
