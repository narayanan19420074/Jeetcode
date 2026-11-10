import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from '@mui/material';

// Shared frame of every Job profile dialog: title, scrolling body, error line and Cancel / Save buttons.
// It is a full screen sheet on phones and a regular dialog on larger screens.
export default function FormDialogShell({ title, children, onSubmit, onClose, saving, submitError, submitLabel = 'Save', destructive = false }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open onClose={saving ? undefined : onClose} fullScreen={isMobile} fullWidth maxWidth="sm" slotProps={{ paper: { component: 'form', onSubmit: handleSubmit } }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {children}
        {submitError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {submitError}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disableElevation color={destructive ? 'error' : 'primary'} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
