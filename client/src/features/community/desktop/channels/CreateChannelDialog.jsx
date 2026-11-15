import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import useCreateChannel from '../../common/channels/useCreateChannel';
import { CHANNEL_DESCRIPTION_MAX, CHANNEL_KINDS, CHANNEL_NAME_MAX } from '../../common/channels/channelKinds';

// Name and description for a new group or newsletter. `onCreated` receives the channel the server saved.
export default function CreateChannelDialog({ open, kind, onClose, onCreated }) {
  const config = CHANNEL_KINDS[kind];
  const { draft, update, submit, saving, error, reset } = useCreateChannel(kind, (channel) => {
    onCreated(channel);
    onClose();
  });
  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : close} fullWidth maxWidth="sm">
      <DialogTitle>{config.createLabel}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField autoFocus label="Name" placeholder={config.namePlaceholder} value={draft.name} disabled={saving} onChange={(e) => update('name')(e.target.value.slice(0, CHANNEL_NAME_MAX))} />
          <TextField label="Description (optional)" multiline minRows={3} value={draft.description} disabled={saving} onChange={(e) => update('description')(e.target.value.slice(0, CHANNEL_DESCRIPTION_MAX))} helperText={`${draft.description.length}/${CHANNEL_DESCRIPTION_MAX}`} />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={saving}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={submit} disabled={saving}>{saving ? 'Creating…' : 'Create'}</Button>
      </DialogActions>
    </Dialog>
  );
}
