import { InputAdornment, TextField } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { libSearchSx } from '../../dashboard/components/libraryStyle';

const searchFieldSx = { ...libSearchSx, mt: 0, px: 0, flex: 1 };

// Pill search field used in the phone top bars. Display only for now.
export default function SearchField({ placeholder, label }) {
  return (
    <TextField
      placeholder={placeholder}
      sx={searchFieldSx}
      slotProps={{
        htmlInput: { 'aria-label': label },
        input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> },
      }}
    />
  );
}
