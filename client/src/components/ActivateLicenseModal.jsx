import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { licenseApi } from '../api/licenseApi';
import { extractErrorMessage } from '../api/apiClient';
import { userUpdated } from '../features/auth/authSlice';

// Shared by Navbar's "Activate License" menu item and SettingsPage's
// License section — one component, two trigger points, so the activation
// flow (and its copy/validation) never drifts between the two places a
// user might find it.
export default function ActivateLicenseModal({ open, onClose }) {
  const dispatch = useDispatch();
  const [licenseKey, setLicenseKey] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | error | success
  const [error, setError] = useState(null);

  const handleClose = () => {
    if (status === 'loading') return; // don't let a click-away cancel an in-flight request
    setLicenseKey('');
    setStatus('idle');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);
    try {
      const { data } = await licenseApi.activate(licenseKey);
      dispatch(userUpdated(data.data.user));
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(extractErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Activate Pro License</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {status === 'success' ? (
            <Alert severity="success">Pro activated! Refresh to see it reflected everywhere.</Alert>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                autoFocus
                label="License key"
                placeholder="JEET-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                fullWidth
                required
                disabled={status === 'loading'}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={status === 'loading'}>
            {status === 'success' ? 'Close' : 'Cancel'}
          </Button>
          {status !== 'success' && (
            <Button type="submit" variant="contained" disableElevation disabled={status === 'loading' || !licenseKey}>
              {status === 'loading' ? <CircularProgress size={20} color="inherit" /> : 'Activate'}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}
