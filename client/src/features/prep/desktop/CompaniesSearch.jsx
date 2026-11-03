import { IconButton, InputAdornment, TextField } from '@mui/material';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES } from '../../../app/design/designTokens';

export default function CompaniesSearch({ query, onQuery }) {
  const palette = useLibraryPalette();
  const clear = query ? (
    <InputAdornment position="end">
      <IconButton size="small" aria-label="Clear search" onClick={() => onQuery('')}><ClearRoundedIcon fontSize="small" /></IconButton>
    </InputAdornment>
  ) : null;
  return (
    <TextField
      fullWidth
      size="small"
      placeholder="Search companies"
      value={query}
      onChange={(event) => onQuery(event.target.value)}
      slotProps={{
        htmlInput: { 'aria-label': 'Search companies' },
        input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment>, endAdornment: clear },
      }}
      sx={{
        maxWidth: 520,
        '& .MuiOutlinedInput-root': { borderRadius: 999, height: 44, bgcolor: palette.player, fontSize: FONT_SIZES.subheading, letterSpacing: LIB_TRACKING, px: 2 },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
      }}
    />
  );
}
