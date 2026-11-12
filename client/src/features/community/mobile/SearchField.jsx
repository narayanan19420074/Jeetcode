import { InputAdornment, TextField } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
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

// Pill search field used in the phone top bars. Pass `value` and `onChange(text)` to make it filter something.
export default function SearchField({ placeholder, label, value, onChange }) {
  return (
    <TextField
      placeholder={placeholder}
      value={value}
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      sx={searchFieldSx}
      slotProps={{
        htmlInput: { 'aria-label': label },
        input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={searchIconSx} /></InputAdornment> },
      }}
    />
  );
}
