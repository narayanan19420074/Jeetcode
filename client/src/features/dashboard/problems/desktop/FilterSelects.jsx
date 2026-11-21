import { MenuItem, Select, Typography } from '@mui/material';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../../app/design/designTokens';

const selectSx = { bgcolor: 'background.paper', borderRadius: RADII_PX.card, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold };
const PLACEHOLDER = 'Select…';

// The operator box. Every filter means "is", so it is the only choice; it is there to read like a sentence.
export function OperatorSelect() {
  return (
    <Select size="small" value="is" inputProps={{ 'aria-label': 'Operator' }} sx={selectSx}>
      <MenuItem value="is">is</MenuItem>
    </Select>
  );
}

// One choice out of a short list ([value, label] pairs).
export function SingleSelect({ label, value, options, onChange, disabled = false }) {
  return (
    <Select size="small" fullWidth displayEmpty disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} inputProps={{ 'aria-label': label }} sx={selectSx}>
      {options.map(([optionValue, optionLabel]) => <MenuItem key={optionValue} value={optionValue}>{optionLabel}</MenuItem>)}
    </Select>
  );
}

// Several choices out of a long list ({ value, label } items). Empty means no filter, shown as the placeholder.
export function MultiSelect({ label, value, options, onChange }) {
  return (
    <Select
      multiple
      size="small"
      fullWidth
      displayEmpty
      value={value}
      onChange={(event) => onChange(event.target.value)}
      inputProps={{ 'aria-label': label }}
      renderValue={(selected) => (selected.length === 0 ? <Typography component="span" color="text.secondary">{PLACEHOLDER}</Typography> : selected.join(', '))}
      sx={selectSx}
    >
      {options.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
    </Select>
  );
}
