import { useCallback, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { aiApi } from '../../api/aiApi';
import { extractErrorMessage } from '../../api/apiClient';
import FixUndoButton from './FixUndoButton';
import { updateCode } from './workspaceSlice';

const requestFixedCode = async (slug, language, code) => {
  const { data } = await aiApi.fix({ problemSlug: slug, language, code });
  return data.data.code;
};

// "Fix": the AI repairs and completes the learner's code and puts it straight into the editor, silently
// (no chat, no voice). The previous code is kept so the change can be undone from the snackbar.
export default function useAiFix({ problemId, slug, language, code, isAuthenticated, onSignIn }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [fixing, setFixing] = useState(false);
  const busy = useRef(false); // blocks a second Fix tap while one is running

  const showFixed = useCallback(
    (previousCode) => {
      const restore = () => dispatch(updateCode({ problemId, language, code: previousCode }));
      enqueueSnackbar('Your code has been fixed', {
        variant: 'success',
        action: (key) => <FixUndoButton snackbarKey={key} onUndo={restore} />,
      });
    },
    [dispatch, enqueueSnackbar, problemId, language]
  );

  const applyFix = useCallback(
    async () => {
      const fixedCode = await requestFixedCode(slug, language, code);
      if (fixedCode.trim() === code.trim()) return enqueueSnackbar('No changes were needed', { variant: 'info' });
      dispatch(updateCode({ problemId, language, code: fixedCode }));
      return showFixed(code);
    },
    [dispatch, enqueueSnackbar, showFixed, problemId, slug, language, code]
  );

  const runFix = useCallback(async () => {
    if (busy.current || !problemId) return;
    if (!isAuthenticated) return onSignIn();
    busy.current = true;
    setFixing(true);
    const progressKey = enqueueSnackbar('Fixing your code…', { variant: 'info', persist: true });
    try {
      await applyFix();
    } catch (error) {
      enqueueSnackbar(extractErrorMessage(error), { variant: 'error' });
    } finally {
      closeSnackbar(progressKey);
      busy.current = false;
      setFixing(false);
    }
  }, [applyFix, closeSnackbar, enqueueSnackbar, isAuthenticated, onSignIn, problemId]);

  return { fixing, runFix };
}
