import { Box, Button, Typography } from '@mui/material';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import FilterRow from '../../components/FilterRow';
import { useLibraryPalette } from '../../components/libraryStyle';
import { MultiSelect, OperatorSelect, SingleSelect } from './FilterSelects';
import { COLOR_PALETTE, FONT_SIZES, RADII_PX } from '../../../../app/design/designTokens';

const DIFFICULTY_OPTIONS = ['All', 'Easy', 'Medium', 'Hard'].map((level) => [level, level]);
// Status values are the ones the library query already uses.
const STATUS_OPTIONS = [['All', 'All'], ['solved', 'Solved'], ['unsolved', 'Unsolved']];

const toOptions = (items, key) => items.map((item) => ({ value: item[key], label: `${item[key]} (${item.count})` }));

// Filters of the Problems page as one grey card, built like a sentence: "Match all of the following filters", then one
// row per filter. Status needs an account because solved problems are saved per user.
export default function ProblemFilterCard({ lib, isAuthenticated }) {
  const pal = useLibraryPalette();
  const { query, patch, companies, tags, filterCount } = lib;
  const clearAll = () => patch({ difficulty: 'All', status: 'All', companies: [], tags: [] });
  return (
    <Box component="section" aria-label="Filters" sx={{ display: 'grid', gap: 2, p: 2, borderRadius: RADII_PX.dialog, bgcolor: pal.chip, border: `1px solid ${pal.border}` }}>
      <Typography sx={{ fontSize: FONT_SIZES.body, color: pal.muted }}>Match <b>all</b> of the following filters:</Typography>
      <FilterRow icon={BusinessRoundedIcon} color={COLOR_PALETTE.violet} label="Companies">
        <OperatorSelect />
        <MultiSelect label="Companies" value={query.companies} options={toOptions(companies, 'company')} onChange={(next) => patch({ companies: next })} />
      </FilterRow>
      <FilterRow icon={BarChartRoundedIcon} color={COLOR_PALETTE.amber} label="Difficulty">
        <OperatorSelect />
        <SingleSelect label="Difficulty" value={query.difficulty} options={DIFFICULTY_OPTIONS} onChange={(difficulty) => patch({ difficulty })} />
      </FilterRow>
      <FilterRow icon={CheckCircleRoundedIcon} color={COLOR_PALETTE.emerald} label="Status" hint={isAuthenticated ? undefined : 'Sign in to filter by status'}>
        <OperatorSelect />
        <SingleSelect label="Status" value={query.status} options={STATUS_OPTIONS} disabled={!isAuthenticated} onChange={(status) => patch({ status })} />
      </FilterRow>
      <FilterRow icon={LocalOfferRoundedIcon} color={COLOR_PALETTE.blue} label="Topics">
        <OperatorSelect />
        <MultiSelect label="Topics" value={query.tags} options={toOptions(tags, 'tag')} onChange={(next) => patch({ tags: next })} />
      </FilterRow>
      <Button size="small" color="inherit" disabled={filterCount + query.tags.length === 0} onClick={clearAll} sx={{ justifySelf: 'end' }}>Clear all</Button>
    </Box>
  );
}
