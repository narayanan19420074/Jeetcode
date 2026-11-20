import { Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, TextField } from '@mui/material';
import { WsButton } from '../wsUi';
import { MAX_REPORT_LENGTH } from './useBugReport';

function BugReportFields({ report }) {
  const { isAuthenticated, message, setMessage, email, setEmail, busy, error } = report;
  return (
    <Stack sx={{ gap: 2, pt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="What went wrong?"
        placeholder="Describe the bug and the steps to reproduce it."
        multiline
        minRows={5}
        maxRows={10}
        fullWidth
        autoFocus
        disabled={busy}
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, MAX_REPORT_LENGTH))}
        helperText={`${message.length}/${MAX_REPORT_LENGTH}`}
      />
      {!isAuthenticated && <TextField label="Your email" type="email" fullWidth disabled={busy} value={email} onChange={(e) => setEmail(e.target.value)} />}
    </Stack>
  );
}

// Desktop workspace dialog for sending a bug report to support.
export default function BugReportDialog({ open, onClose, report }) {
  const { sent, busy, submit } = report;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Report a bug</DialogTitle>
      <DialogContent>{sent ? <DialogContentText>Thanks, we received your report and will look into it.</DialogContentText> : <BugReportFields report={report} />}</DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 0.5 }}>
        <WsButton variant="ghost" onClick={onClose}>
          {sent ? 'Close' : 'Cancel'}
        </WsButton>
        {!sent && (
          <WsButton variant="primary" loading={busy} onClick={submit}>
            Send report
          </WsButton>
        )}
      </DialogActions>
    </Dialog>
  );
}
