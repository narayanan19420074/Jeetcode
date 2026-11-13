import { IconButton, InputAdornment, TextField } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { libSearchSx } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, SIZES } from '../../../app/design/designTokens';

const searchFieldSx = {
  ...libSearchSx,
  mt: 0,
  px: 0,
  flex: 1,
  '& .MuiOutlinedInput-root': { ...libSearchSx['& .MuiOutlinedInput-root'], height: SIZES.phoneSearchHeight, px: 1.5, fontSize: FONT_SIZES.title },
  '& .MuiOutlinedInput-input': { py: 0 },
};
const searchIconSx = { fontSize: SIZES.iconSize.small };

function ClearButton({ onClear }) {
  return (
    <InputAdornment position="end">
      <IconButton size="small" edge="end" aria-label="Clear search" onClick={onClear}>
        <CloseRoundedIcon sx={searchIconSx} />
      </IconButton>
    </InputAdornment>
  );
}

// Pill search field used in the phone top bars. Pass `value` and `onChange(text)` to make it filter something; a clear
// button appears while it holds text.
export default function SearchField({ placeholder, label, value, onChange }) {
  const hasText = Boolean(value) && Boolean(onChange);
  return (
    <TextField
      placeholder={placeholder}
      value={value}
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      sx={searchFieldSx}
      slotProps={{
        htmlInput: { 'aria-label': label },
        input: {
          startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={searchIconSx} /></InputAdornment>,
          endAdornment: hasText ? <ClearButton onClear={() => onChange('')} /> : undefined,
        },
      }}
    />
  );
}
