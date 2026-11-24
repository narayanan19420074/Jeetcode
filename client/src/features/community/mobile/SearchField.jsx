import { IconButton, InputAdornment, TextField } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import { libSearchSx } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, RADII_PX, SIZES } from '../../../app/design/designTokens';

// A grey rounded box like the LinkedIn search bar: filled while idle, white with a dark outline while typing.
const rootSx = libSearchSx['& .MuiOutlinedInput-root'];
const searchFieldSx = {
  ...libSearchSx,
  mt: 0,
  px: 0,
  flex: 1,
  '& .MuiOutlinedInput-root': {
    ...rootSx,
    borderRadius: RADII_PX.control,
    height: SIZES.phoneSearchHeight,
    px: 1.5,
    fontSize: FONT_SIZES.title,
    '&.Mui-focused': { bgcolor: 'background.paper' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--lib-text)', borderWidth: 1.5 },
  },
  '& .MuiOutlinedInput-input': { py: 0 },
  '& .MuiInputAdornment-positionStart': { mr: 1.25, color: 'var(--lib-muted)' },
  '& input::placeholder': { color: 'var(--lib-muted)', opacity: 1 },
};
const searchIconSx = { fontSize: SIZES.iconSize.medium };

function ClearButton({ onClear }) {
  return (
    <InputAdornment position="end">
      <IconButton size="small" edge="end" aria-label="Clear search" onClick={onClear} sx={{ color: 'var(--lib-text)' }}>
        <HighlightOffRoundedIcon sx={searchIconSx} />
      </IconButton>
    </InputAdornment>
  );
}

// Search field used in the phone top bars. Pass `value` and `onChange(text)` to make it filter something; a clear
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
