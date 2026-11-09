import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

export function useFriendAction() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [busy, setBusy] = useState('');
  const run = async (key, thunk, okMessage) => {
    setBusy(key);
    const res = await dispatch(thunk);
    setBusy('');
    const ok = res.meta.requestStatus === 'fulfilled';
    enqueueSnackbar(ok ? res.payload || okMessage : res.payload || 'Something went wrong', { variant: ok ? 'success' : 'error' });
    return ok;
  };
  return { busy, run };
}
