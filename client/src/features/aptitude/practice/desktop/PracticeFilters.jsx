import { Box, Button, CircularProgress, InputAdornment, MenuItem, Select, Stack, TextField, ToggleButton, ToggleButtonGroup, alpha } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import { DIFFICULTY } from '../../components/aptitudeUi';
import { FONT_WEIGHTS, SIZES } from '../../../../app/design/designTokens';

const STATUS_OPTIONS = [
  ['', 'All statuses'],
  ['todo', 'Todo (not tried)'],
  ['attempted', 'Attempted'],
  ['solved', 'Solved'],
  ['unsolved', 'Not solved yet'],
  ['bookmarked', 'Bookmarked'],
];

function DifficultyToggle({ value, onChange }) {
  return (
    <ToggleButtonGroup size="small" exclusive value={value} onChange={(_, next) => onChange(next ?? '')} aria-label="Difficulty">
      {Object.entries(DIFFICULTY).map(([key, meta]) => (
        <ToggleButton key={key} value={key} sx={{ px: 2, textTransform: 'none', fontWeight: FONT_WEIGHTS.bold, '&.Mui-selected': { color: meta.color, bgcolor: alpha(meta.color, 0.12) } }}>
          {meta.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

// Difficulty, status, search, "Clear filters" and "Pick one". The topic filter is the left column of the page.
export default function PracticeFilters({ practice }) {
  const { filters, update, searchDraft, setSearchDraft, filtersActive, clearFilters, picking, pickRandom } = practice;
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
      <DifficultyToggle value={filters.difficulty} onChange={(difficulty) => update({ difficulty })} />
      <Select size="small" displayEmpty value={filters.status} onChange={(event) => update({ status: event.target.value })} sx={{ minWidth: SIZES.practiceList.statusSelectMinWidth }}>
        {STATUS_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
      </Select>
      <TextField
        size="small"
        placeholder="Search questions"
        value={searchDraft}
        onChange={(event) => setSearchDraft(event.target.value)}
        sx={{ flexGrow: 1, maxWidth: SIZES.practiceList.searchMaxWidth }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }, htmlInput: { 'aria-label': 'Search questions' } }}
      />
      <Box sx={{ flexGrow: 1 }} />
      {filtersActive && <Button size="small" onClick={clearFilters} sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}>Clear filters</Button>}
      <Button variant="contained" disableElevation disabled={picking} sx={{ flexShrink: 0, whiteSpace: 'nowrap' }} onClick={pickRandom} startIcon={picking ? <CircularProgress size={16} color="inherit" /> : <ShuffleRoundedIcon />}>
        Pick one
      </Button>
    </Stack>
  );
}
