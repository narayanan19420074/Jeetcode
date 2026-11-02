import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { storeApi } from '../../../api/storeApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { userUpdated } from '../../auth/authSlice';

function useStoreCatalog() {
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(() => {
    storeApi.items().then(({ data: res }) => setCatalog(res.data)).catch((err) => setError(extractErrorMessage(err))).finally(() => setLoading(false));
  }, []);

  return { data: catalog, error, loading, loadItems };
}

// Wallet, orders and purchased courses only exist for signed-in learners.
function useAccountData(isAuthenticated) {
  const dispatch = useDispatch();
  const [wallet, setWallet] = useState(null);
  const [orders, setOrders] = useState(null);
  const [courses, setCourses] = useState([]);

  const loadAccount = useCallback(() => {
    if (!isAuthenticated) return;
    storeApi.wallet().then(({ data: res }) => {
      setWallet(res.data);
      dispatch(userUpdated({ coins: res.data.coins }));
    }).catch(() => {});
    storeApi.orders().then(({ data: res }) => setOrders(res.data.items)).catch(() => setOrders([]));
    storeApi.myCourses().then(({ data: res }) => setCourses(res.data.items)).catch(() => setCourses([]));
  }, [isAuthenticated, dispatch]);

  return { wallet, setWallet, orders, courses, loadAccount };
}

function useDailyClaim({ setWallet, bumpRefreshKey }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [claiming, setClaiming] = useState(false);

  const claim = async () => {
    setClaiming(true);
    try {
      const { data: res } = await storeApi.claimDaily();
      enqueueSnackbar(`+${res.data.amount} coins claimed`, { variant: 'success' });
      setWallet(res.data.wallet);
      dispatch(userUpdated({ coins: res.data.wallet.coins }));
      bumpRefreshKey();
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    } finally {
      setClaiming(false);
    }
  };

  return { claiming, claim };
}

export default function useStoreData() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const catalog = useStoreCatalog();
  const account = useAccountData(isAuthenticated);
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefreshKey = useCallback(() => setRefreshKey((key) => key + 1), []);
  const daily = useDailyClaim({ setWallet: account.setWallet, bumpRefreshKey });
  const { loadItems } = catalog;
  const { loadAccount } = account;

  const refresh = useCallback(() => {
    loadItems();
    loadAccount();
    bumpRefreshKey();
  }, [loadItems, loadAccount, bumpRefreshKey]);
  useEffect(() => { refresh(); }, [refresh]);

  const balance = account.wallet?.coins ?? user?.coins ?? 0;
  return { isAuthenticated, user, ...catalog, ...account, ...daily, refreshKey, refresh, balance };
}
