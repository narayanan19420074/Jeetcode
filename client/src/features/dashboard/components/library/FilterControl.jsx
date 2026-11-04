import { useState } from 'react';
import { Badge, Box, Button, IconButton, Popover, Stack, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import useLibraryStyles from './libraryStyles';
import { FilterChip, FilterHeading } from './FilterParts';
import TopicFilters from './FilterTopics';
import { FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';

const toggleSx = { fontWeight: FONT_WEIGHTS.bold, textTransform: 'none' };

// The panel never grows past the window: the filter fields scroll while the Reset and Show buttons stay in view.
const paperSx = { borderRadius: RADII_PX.card, p: 2.5, width: 340, maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100vh - 96px)', display: 'flex', flexDirection: 'column', mt: 0.5 };
// With every topic inside the panel, it gets wider (in theme spacing units) so the topics wrap into fewer rows.
const TOPICS_PANEL_WIDTH_UNITS = 68;
const topicsPaperSx = (theme) => ({ ...paperSx, width: theme.spacing(TOPICS_PANEL_WIDTH_UNITS) });
const fieldsSx = { flex: 1, minHeight: SIZES.flexShrinkMinHeight, overflowY: 'auto' };

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

// Topics count as filters only when this panel owns them (the dashboard). Elsewhere the topic pills show the selection.
const countFilters = (lib, topicsInFilter) => lib.filterCount + (topicsInFilter ? lib.query.tags.length : 0);

function CompanyFilter({ companies, selected, onToggle }) {
  if (companies.length === 0) return null;
  return (
    <>
      <FilterHeading>Company</FilterHeading>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 168, overflowY: 'auto', mb: 2 }}>
        {companies.map(({ company, count }) => (
          <FilterChip key={company} on={selected.includes(company)} label={`${company} ${count}`} onClick={() => onToggle(company)} />
        ))}
      </Box>
    </>
  );
}

function FilterFields({ lib, isAuthenticated, topicsInFilter }) {
  const { query, patch, companies, toggleCompany } = lib;
  return (
    <Box sx={fieldsSx}>
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
      {topicsInFilter && <TopicFilters lib={lib} />}
      <CompanyFilter companies={companies} selected={query.companies} onToggle={toggleCompany} />
    </Box>
  );
}

function FilterFooter({ activeCount, total, onReset, onDone }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', pt: 1.5 }}>
      <Button size="small" color="inherit" disabled={activeCount === 0} onClick={onReset}>
        Reset
      </Button>
      <Button size="small" variant="contained" disableElevation onClick={onDone}>
        Show {total} problems
      </Button>
    </Stack>
  );
}

function FilterPanel({ lib, isAuthenticated, topicsInFilter, onDone }) {
  const resetFilters = () => lib.patch({ difficulty: 'All', status: 'All', companies: [], ...(topicsInFilter && { tags: [] }) });
  return (
    <>
      <FilterFields lib={lib} isAuthenticated={isAuthenticated} topicsInFilter={topicsInFilter} />
      <FilterFooter activeCount={countFilters(lib, topicsInFilter)} total={lib.pagination.total} onReset={resetFilters} onDone={onDone} />
    </>
  );
}

// Filter button (with a dot while any filter is on) and the popover that holds the filters.
// `topicsInFilter` also puts the topic groups and every topic into the popover.
export default function FilterControl({ lib, isAuthenticated, topicsInFilter = false }) {
  const styles = useLibraryStyles();
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <Tooltip title="Filter">
        <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Filter problems" sx={styles.toolButton}>
          <Badge variant="dot" color="error" invisible={countFilters(lib, topicsInFilter) === 0} overlap="circular">
            <FilterListRoundedIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: topicsInFilter ? topicsPaperSx : paperSx } }}
      >
        <FilterPanel lib={lib} isAuthenticated={isAuthenticated} topicsInFilter={topicsInFilter} onDone={() => setAnchor(null)} />
      </Popover>
    </>
  );
}
