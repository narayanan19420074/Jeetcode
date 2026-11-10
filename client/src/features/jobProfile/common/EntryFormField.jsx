import { Checkbox, FormControlLabel, MenuItem, TextField } from '@mui/material';

const isMonth = (field) => field.type === 'month';

function CheckboxField({ field, value, onChange }) {
  return <FormControlLabel label={field.label} control={<Checkbox checked={Boolean(value)} onChange={(event) => onChange(field.name, event.target.checked)} />} />;
}

function SelectField({ field, value, onChange, textFieldProps }) {
  return (
    <TextField {...textFieldProps} select value={value} onChange={(event) => onChange(field.name, event.target.value)}>
      <MenuItem value="">Not specified</MenuItem>
      {field.options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );
}

// One input of a Job profile form, drawn from its field definition (see jobProfileConfig.js).
export default function EntryFormField({ field, value, error, disabled, onChange }) {
  if (field.type === 'checkbox') return <CheckboxField field={field} value={value} onChange={onChange} />;

  const textFieldProps = {
    label: field.label,
    required: field.required,
    disabled,
    error: Boolean(error),
    helperText: error || field.helper,
    fullWidth: true,
    slotProps: { htmlInput: { maxLength: field.maxLength }, inputLabel: isMonth(field) ? { shrink: true } : undefined },
  };
  if (field.type === 'select') return <SelectField field={field} value={value} onChange={onChange} textFieldProps={textFieldProps} />;

  return (
    <TextField
      {...textFieldProps}
      type={isMonth(field) ? 'month' : field.type === 'url' ? 'url' : 'text'}
      multiline={field.type === 'multiline'}
      minRows={field.type === 'multiline' ? 3 : undefined}
      value={value}
      onChange={(event) => onChange(field.name, event.target.value)}
    />
  );
}
