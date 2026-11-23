import { Box, Button, Typography } from '@mui/material';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import FilterRow from '../../dashboard/components/FilterRow';
import { useLibraryCardSx } from '../../dashboard/components/libraryCardStyles';
import { useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { OperatorSelect, SingleSelect } from '../../dashboard/problems/desktop/FilterSelects';
import { BUDGET_OPTIONS, SORT_OPTIONS } from '../common/storeSelectors';
import { COLOR_PALETTE, FONT_SIZES } from '../../../app/design/designTokens';

// Sorting is not a filter, so its select has no "is" box and spans the whole row.
const fullRowSx = { gridColumn: '1 / -1' };

// Filters of the Store page, built like the Problems page's filter card: "Match all of the following filters", then one row
// per filter. The price limit needs an account because it compares with the learner's coins.
export default function StoreFilterCard({ store }) {
  const cardSx = useLibraryCardSx();
  const palette = useLibraryPalette();
  const { categories, cat, setCat, budget, setBudget, sort, setSort, isAuthenticated, hasActiveFilters, resetFilters } = store;
  return (
    <Box component="section" aria-label="Filters" sx={cardSx}>
      <Typography sx={{ fontSize: FONT_SIZES.body, color: palette.muted }}>Match <b>all</b> of the following filters:</Typography>
      <FilterRow icon={CategoryRoundedIcon} color={COLOR_PALETTE.violet} label="Category">
        <OperatorSelect />
        <SingleSelect label="Category" value={cat} options={categories.map((category) => [category.id, category.label])} onChange={setCat} />
      </FilterRow>
      <FilterRow icon={MonetizationOnRoundedIcon} color={COLOR_PALETTE.amber} label="Price" hint={isAuthenticated ? undefined : 'Sign in to filter by your coins'}>
        <OperatorSelect />
        <SingleSelect label="Price" value={budget} options={BUDGET_OPTIONS} disabled={!isAuthenticated} onChange={setBudget} />
      </FilterRow>
      <FilterRow icon={SortRoundedIcon} color={COLOR_PALETTE.blue} label="Sort by">
        <Box sx={fullRowSx}><SingleSelect label="Sort by" value={sort} options={SORT_OPTIONS} onChange={setSort} /></Box>
      </FilterRow>
      <Button size="small" color="inherit" disabled={!hasActiveFilters} onClick={resetFilters} sx={{ justifySelf: 'end' }}>Clear all</Button>
    </Box>
  );
}
