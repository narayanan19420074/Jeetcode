import { Typography } from '@mui/material';
import FormDialogShell from './FormDialogShell';
import useSubmitState from './useSubmitState';

// Removing an entry cannot be undone, so it always asks first.
export default function ConfirmRemoveDialog({ itemLabel, onConfirm, onClose }) {
  const { saving, submitError, run } = useSubmitState();

  return (
    <FormDialogShell title={`Delete ${itemLabel}?`} onSubmit={() => run(onConfirm)} onClose={onClose} saving={saving} submitError={submitError} submitLabel="Delete" destructive>
      <Typography>This entry will be removed from your Job profile. This cannot be undone.</Typography>
    </FormDialogShell>
  );
}
