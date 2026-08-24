import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import store from './app/store';
import { getTheme } from './theme/theme';
import { bootstrapSession } from './features/auth/authSlice';
import App from './App.jsx';
import './index.css';

function ThemedApp() {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.ui.mode);
  const bootstrapped = useSelector((s) => s.auth.bootstrapped);
  const theme = getTheme(mode);

  // Restores a session from the httpOnly refresh cookie (if any) before the
  // app renders routes — otherwise ProtectedRoute would briefly see
  // isAuthenticated=false and bounce an already-logged-in user to /login.
  useEffect(() => {
    dispatch(bootstrapSession());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {bootstrapped ? (
          <App />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </Box>
        )}
      </SnackbarProvider>
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
