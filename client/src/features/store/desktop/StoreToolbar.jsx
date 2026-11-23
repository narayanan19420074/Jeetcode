import { InputAdornment, Stack, TextField, Typography } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import useLibraryStyles from '../../dashboard/components/library/libraryStyles';
import { useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';

// Top of the item list: the page title and a search box, in the same search style as the Problems page.
export default function StoreToolbar({ search, onSearch, count }) {
  const styles = useLibraryStyles();
  const palette = useLibraryPalette();
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline' }}>
        <Typography component="h1" sx={{ fontSize: FONT_SIZES.heading, fontWeight: FONT_WEIGHTS.bold }}>Store</Typography>
        <Typography sx={{ fontSize: FONT_SIZES.body, color: palette.muted, fontVariantNumeric: 'tabular-nums' }}>{count} {count === 1 ? 'item' : 'items'}</Typography>
      </Stack>
      <TextField
        size="small"
        placeholder="Search items"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        inputProps={{ 'aria-label': 'Search items' }}
        sx={styles.search}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }}
      />
    </Stack>
  );
}
