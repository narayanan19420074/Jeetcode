import { Stack } from '@mui/material';
import EntryFormField from './EntryFormField';
import FormDialogShell from './FormDialogShell';
import useEntryForm from './useEntryForm';

// Generic form dialog: the intro and every entry type (experience, education, certification) use it.
export default function EntryFormDialog({ title, fields, initialValues, onSubmit, onClose }) {
  const form = useEntryForm({ fields, initialValues, onSubmit });

  return (
    <FormDialogShell title={title} onSubmit={form.submit} onClose={onClose} saving={form.saving} submitError={form.submitError}>
      <Stack spacing={2}>
        {fields.map((field) => (
          <EntryFormField
            key={field.name}
            field={field}
            value={form.values[field.name]}
            error={form.errors[field.name]}
            disabled={Boolean(field.disabledWhen && form.values[field.disabledWhen])}
            onChange={form.setValue}
          />
        ))}
      </Stack>
    </FormDialogShell>
  );
}
