import { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { MotionConfig } from 'framer-motion';
import { SnackbarProvider } from 'notistack';
import store from './app/store';
import { getTheme } from './theme/theme';
import { setSystemDark, hydrateFromAccount } from './app/uiSlice';
import { bootstrapSession } from './features/auth/authSlice';
import App from './App.jsx';
import './index.css';

function ThemedApp() {
  const dispatch = useDispatch();
  const { mode, accent, density, fontScale, contrast, reduceMotion, underlineLinks } = useSelector((s) => s.ui);
  const bootstrapped = useSelector((s) => s.auth.bootstrapped);
  const userId = useSelector((s) => s.auth.user?.id);
  const accountPrefs = useSelector((s) => s.auth.user?.preferences);

  // 'system' reduce-motion defers to the OS setting; 'on' forces it.
  const [osReduce, setOsReduce] = useState(() => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    const on = (e) => setOsReduce(e.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  const reduce = reduceMotion === 'on' || (reduceMotion === 'system' && osReduce);

  const theme = useMemo(
    () => getTheme(mode, { accent, density, fontScale, contrast, reduceMotion: reduce, underlineLinks }),
    [mode, accent, density, fontScale, contrast, reduce, underlineLinks]
  );

  // Follow the OS light/dark setting while the theme preference is 'system'.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const on = (e) => dispatch(setSystemDark(e.matches));
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, [dispatch]);

  // Pull the account's saved preferences once per login / session restore, so
  // appearance and editor settings follow the user across devices.
  useEffect(() => {
    if (userId && accountPrefs) dispatch(hydrateFromAccount(accountPrefs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, dispatch]);

  useEffect(() => {
    document.documentElement.dataset.motion = reduce ? 'reduce' : 'full';
    document.documentElement.style.colorScheme = mode;
  }, [reduce, mode]);

  // Restores a session from the httpOnly refresh cookie (if any) before the
  // app renders routes — otherwise ProtectedRoute would briefly see
  // isAuthenticated=false and bounce an already-logged-in user to /login.
  useEffect(() => {
    dispatch(bootstrapSession());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MotionConfig reducedMotion={reduce ? 'always' : 'user'}>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {bootstrapped ? (
          <App />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </Box>
        )}
      </SnackbarProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemedApp />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
