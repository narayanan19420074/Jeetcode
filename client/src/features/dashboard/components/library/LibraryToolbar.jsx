import { Box, Button, Chip, CircularProgress, IconButton, InputAdornment, Stack, TextField, Tooltip } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import { DIFF_COLOR } from '../../dashboardUtils';
import FilterControl from './FilterControl';
import SolvedMeter from './SolvedMeter';
import SortControl from './SortControl';
import useLibraryStyles from './libraryStyles';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../../app/design/designTokens';

const ZERO_COUNTS = { Easy: 0, Medium: 0, Hard: 0 };
const sumCounts = (counts) => counts.Easy + counts.Medium + counts.Hard;

// The "/" key hint inside an empty search box.
function SlashHint() {
  return (
    <InputAdornment position="end">
      <Box
        component="kbd"
        sx={(t) => ({ display: { xs: 'none', md: 'block' }, px: 0.75, borderRadius: '6px', border: `1px solid ${t.palette.divider}`, fontFamily: 'inherit', fontSize: FONT_SIZES.micro, color: 'text.secondary' })}
      >
        /
      </Box>
    </InputAdornment>
  );
}

function SearchField({ lib }) {
  const styles = useLibraryStyles();
  return (
    <TextField
      inputRef={lib.searchRef}
      size="small"
      placeholder="Search questions"
      value={lib.searchText}
      onChange={(e) => lib.setSearchText(e.target.value)}
      sx={styles.search}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: lib.searchText ? undefined : <SlashHint />,
        },
      }}
    />
  );
}

function RandomProblemButton({ lib }) {
  const styles = useLibraryStyles();
  return (
    <Tooltip title="Pick a random problem from this view">
      <span>
        <IconButton onClick={lib.pickOne} disabled={lib.picking} aria-label="Pick a random problem" sx={styles.toolButton}>
          {lib.picking ? <CircularProgress size={18} /> : <ShuffleRoundedIcon fontSize="small" />}
        </IconButton>
      </span>
    </Tooltip>
  );
}

function ProgressSummary({ progress }) {
  const totals = progress?.total || ZERO_COUNTS;
  const solvedBy = progress?.solved || ZERO_COUNTS;
  return (
    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
      <SolvedMeter solved={sumCounts(solvedBy)} total={sumCounts(totals)} solvedBy={solvedBy} totals={totals} />
    </Box>
  );
}

// One removable chip per filter that is on, plus "Clear all".
function ActiveFilters({ lib }) {
  const { query, patch, setSearchText, toggleCompany, clearAll } = lib;
  const statusLabel = query.status === 'solved' ? 'Solved' : 'Unsolved';
  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
      {query.search && <Chip size="small" label={`Search: ${query.search}`} onDelete={() => setSearchText('')} />}
      {query.difficulty !== 'All' && <Chip size="small" label={query.difficulty} onDelete={() => patch({ difficulty: 'All' })} sx={{ color: DIFF_COLOR[query.difficulty] }} />}
      {query.status !== 'All' && <Chip size="small" label={statusLabel} onDelete={() => patch({ status: 'All' })} />}
      {query.companies.map((company) => (
        <Chip key={company} size="small" label={company} onDelete={() => toggleCompany(company)} />
      ))}
      <Button size="small" onClick={clearAll} sx={{ minWidth: 0, fontWeight: FONT_WEIGHTS.bold }}>
        Clear all
      </Button>
    </Stack>
  );
}

// Search and filters stay pinned while the problem list scrolls underneath.
export default function LibraryToolbar({ lib, progress, isAuthenticated }) {
  return (
    <Box sx={(t) => ({ position: { md: 'sticky' }, top: 0, zIndex: 3, py: 0.75, mx: -0.5, px: 0.5, display: 'grid', gap: 1, bgcolor: { md: t.palette.background.default } })}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <SearchField lib={lib} />
        <SortControl sort={lib.query.sort} disabled={lib.sortDisabled} onChange={(sort) => lib.patch({ sort })} />
        <FilterControl lib={lib} isAuthenticated={isAuthenticated} />
        <RandomProblemButton lib={lib} />
        <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
        <ProgressSummary progress={progress} />
      </Stack>
      {lib.anyActive && <ActiveFilters lib={lib} />}
    </Box>
  );
}
