import { Component } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

// After a new deploy, old tabs can fail to load a lazy page chunk. A single
// automatic reload fixes that, so the user never sees an error screen for it.
const CHUNK_ERROR = /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;
const RELOAD_KEY = 'jc_chunk_reload_at';

function tryChunkReload(error) {
  if (!CHUNK_ERROR.test(String(error?.message || error))) return false;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 30000) return false; // already tried just now, show the fallback
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

// Catches render crashes anywhere below it and shows a friendly screen instead of a blank page.
// `resetKey` (e.g. the route path) clears the error when it changes, so navigating away recovers.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('UI crashed:', error, info?.componentStack);
    tryChunkReload(error);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const msg = String(error?.message || error).slice(0, 160);
    const reportUrl = `/help?type=bug&err=${encodeURIComponent(msg)}&from=${encodeURIComponent(window.location.pathname)}`;

    return (
      <Box
        role="alert"
        sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: 'background.default', color: 'text.primary' }}
      >
        <Stack spacing={2} sx={{ maxWidth: 440, textAlign: 'center', alignItems: 'center' }}>
          <ErrorOutlineRoundedIcon sx={{ fontSize: 56, color: 'error.main' }} />
          <Typography component="h1" sx={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Something went wrong
          </Typography>
          <Typography color="text.secondary">
            Indha page load aagala. Reload pannunga — adhuvum work aagala na, namakku report pannunga, seekiram fix panrom.
          </Typography>
          {import.meta.env.DEV && (
            <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-word', color: 'error.main' }}>
              {msg}
            </Typography>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%', justifyContent: 'center' }}>
            <Button variant="contained" disableElevation onClick={() => window.location.reload()} sx={{ fontWeight: 700 }}>
              Reload page
            </Button>
            <Button variant="outlined" color="inherit" component="a" href="/" sx={{ fontWeight: 700 }}>
              Go home
            </Button>
            <Button variant="text" color="inherit" component="a" href={reportUrl} sx={{ fontWeight: 700 }}>
              Report problem
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }
}
