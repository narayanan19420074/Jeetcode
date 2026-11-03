import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { questApi } from '../../../api/questApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { userUpdated } from '../../auth/authSlice';

function useQuestState(isAuthenticated) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const load = useCallback(() => {
    setError(null);
    return questApi.get().then(({ data }) => setState(data.data)).catch((err) => setError(extractErrorMessage(err)));
  }, []);
  useEffect(() => {
    setState(null);
    load();
  }, [load, isAuthenticated]);
  return { state, setState, error, load };
}

// A failed action (already claimed, not enough diamonds, ...) shows the server's message and reloads the real state.
function useQuestFailure(load) {
  const { enqueueSnackbar } = useSnackbar();
  return useCallback((err) => {
    enqueueSnackbar(extractErrorMessage(err), { variant: 'warning' });
    load();
  }, [enqueueSnackbar, load]);
}

function useClaim({ isAuthenticated, login, fail, setState, setBusy, setReward }) {
  const dispatch = useDispatch();
  return useCallback(async (quest) => {
    if (!isAuthenticated) return login();
    setBusy(quest.id);
    try {
      const { data } = await questApi.claim(quest.id);
      setState(data.data.state);
      dispatch(userUpdated(data.data.user));
      setReward(data.data);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
    return undefined;
  }, [isAuthenticated, login, dispatch, fail, setState, setBusy, setReward]);
}

function useConvert({ fail, setState, setTopUp }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [converting, setConverting] = useState(false);
  const convert = useCallback(async (count) => {
    setConverting(true);
    try {
      const { data } = await questApi.convert(count);
      setState(data.data.state);
      dispatch(userUpdated(data.data.user));
      setTopUp({ open: false, want: 1 });
      enqueueSnackbar(`+${count} diamond${count > 1 ? 's' : ''}`, { variant: 'success' });
    } catch (err) {
      fail(err);
    } finally {
      setConverting(false);
    }
  }, [dispatch, enqueueSnackbar, fail, setState, setTopUp]);
  return { convert, converting };
}

// Upgrading the butterfly costs diamonds; with too few the top-up sheet opens instead.
function useUpgrade({ isAuthenticated, login, fail, state, setState, setBusy, setTopUp, flyApi }) {
  const dispatch = useDispatch();
  const wallet = useSelector((store) => store.auth.user);
  const { enqueueSnackbar } = useSnackbar();
  return useCallback(async () => {
    if (!isAuthenticated) return login();
    const next = state.butterfly.next;
    const have = wallet?.diamonds ?? state.diamonds ?? 0;
    if (have < next.cost) {
      setTopUp({ open: true, want: next.cost - have });
      return undefined;
    }
    setBusy('upgrade');
    try {
      const { data } = await questApi.upgradeButterfly();
      setState(data.data.state);
      dispatch(userUpdated(data.data.user));
      setTimeout(() => flyApi.current?.celebrate(), 150);
      enqueueSnackbar(`${next.name} butterfly unlocked`, { variant: 'success' });
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
    return undefined;
  }, [isAuthenticated, login, fail, state, wallet, setState, setBusy, setTopUp, flyApi, dispatch, enqueueSnackbar]);
}

// The server decides everything (progress, claims, diamonds, upgrades); this only holds what it returns and calls it.
export default function useQuestsData(isAuthenticated) {
  const navigate = useNavigate();
  const { state, setState, error, load } = useQuestState(isAuthenticated);
  const [busy, setBusy] = useState(null);
  const [reward, setReward] = useState(null);
  const [topUp, setTopUp] = useState({ open: false, want: 1 });
  const flyApi = useRef(null);
  const login = useCallback(() => navigate('/login'), [navigate]);
  const fail = useQuestFailure(load);
  const claim = useClaim({ isAuthenticated, login, fail, setState, setBusy, setReward });
  const { convert, converting } = useConvert({ fail, setState, setTopUp });
  const upgrade = useUpgrade({ isAuthenticated, login, fail, state, setState, setBusy, setTopUp, flyApi });
  return { state, error, load, busy, reward, setReward, topUp, setTopUp, flyApi, login, claim, convert, converting, upgrade };
}
