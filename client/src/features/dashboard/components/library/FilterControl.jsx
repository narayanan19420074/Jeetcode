import { useState } from 'react';
import { Badge, Box, Button, Chip, IconButton, Popover, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import useLibraryStyles from './libraryStyles';
import { FONT_WEIGHTS } from '../../../../app/design/designTokens';

const toggleSx = { fontWeight: FONT_WEIGHTS.bold, textTransform: 'none' };

function FilterHeading({ children }) {
  return (
    <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.bold, mb: 1 }}>
      {children}
    </Typography>
  );
}

function OptionGroup({ value, options, onChange, disabled = false }) {
  return (
    <ToggleButtonGroup size="small" exclusive fullWidth disabled={disabled} value={value} onChange={(_, next) => next && onChange(next)}>
      {options.map(([optionValue, label]) => (
        <ToggleButton key={optionValue} value={optionValue} sx={toggleSx}>
          {label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

const DIFFICULTY_OPTIONS = ['All', 'Easy', 'Medium', 'Hard'].map((d) => [d, d]);
const STATUS_OPTIONS = [['All', 'All'], ['solved', 'Solved'], ['unsolved', 'Unsolved']];

function CompanyFilter({ companies, selected, onToggle }) {
  if (companies.length === 0) return null;
  return (
    <>
      <FilterHeading>Company</FilterHeading>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: 168, overflowY: 'auto', mb: 2 }}>
        {companies.map(({ company, count }) => {
          const on = selected.includes(company);
          return (
            <Chip
              key={company}
              size="small"
              clickable
              onClick={() => onToggle(company)}
              color={on ? 'primary' : 'default'}
              variant={on ? 'filled' : 'outlined'}
              label={`${company} ${count}`}
            />
          );
        })}
      </Box>
    </>
  );
}

function FilterPanel({ lib, isAuthenticated, onDone }) {
  const { query, patch, companies, filterCount, pagination, toggleCompany } = lib;
  return (
    <>
      <FilterHeading>Difficulty</FilterHeading>
      <Box sx={{ mb: 2 }}>
        <OptionGroup value={query.difficulty} options={DIFFICULTY_OPTIONS} onChange={(difficulty) => patch({ difficulty })} />
      </Box>
      <FilterHeading>Status</FilterHeading>
      <Tooltip title={isAuthenticated ? '' : 'Log in to filter by status'}>
        <Box sx={{ mb: 2 }}>
          <OptionGroup value={query.status} options={STATUS_OPTIONS} disabled={!isAuthenticated} onChange={(status) => patch({ status })} />
        </Box>
      </Tooltip>
      <CompanyFilter companies={companies} selected={query.companies} onToggle={toggleCompany} />
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Button size="small" color="inherit" disabled={filterCount === 0} onClick={() => patch({ difficulty: 'All', status: 'All', companies: [] })}>
          Reset
        </Button>
        <Button size="small" variant="contained" disableElevation onClick={onDone}>
          Show {pagination.total} problems
        </Button>
      </Stack>
    </>
  );
}

// Filter button (with a dot while any filter is on) and the popover that holds the filters.
export default function FilterControl({ lib, isAuthenticated }) {
  const styles = useLibraryStyles();
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <Tooltip title="Filter">
        <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Filter problems" sx={styles.toolButton}>
          <Badge variant="dot" color="error" invisible={lib.filterCount === 0} overlap="circular">
            <FilterListRoundedIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { borderRadius: '14px', p: 2.25, width: 340, maxWidth: 'calc(100vw - 24px)', mt: 0.5 } } }}
      >
        <FilterPanel lib={lib} isAuthenticated={isAuthenticated} onDone={() => setAnchor(null)} />
      </Popover>
    </>
  );
}
