import { useState } from 'react';
import { Box, ClickAwayListener } from '@mui/material';
import SearchField from '../../mobile/SearchField';
import { MIN_QUERY_LENGTH } from '../../common/useDebouncedSearch';
import { SIZES } from '../../../../app/design/designTokens';
import SearchResultsPanel from './SearchResultsPanel';

const MAX_QUERY_LENGTH = 40;

// Search field of the desktop toolbar. The results drop down while the field is in use and close on a click outside
// or on Escape.
export default function ToolbarSearch() {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  const showResults = isActive && query.trim().length >= MIN_QUERY_LENGTH;
  return (
    <ClickAwayListener onClickAway={() => setIsActive(false)}>
      <Box onFocus={() => setIsActive(true)} onKeyDown={(event) => event.key === 'Escape' && setIsActive(false)} sx={{ position: 'relative', flex: 1, display: 'flex', maxWidth: SIZES.communityToolbar.searchMaxWidth }}>
        <SearchField placeholder="Search members and posts" label="Search members and posts" value={query} onChange={(text) => setQuery(text.slice(0, MAX_QUERY_LENGTH))} />
        {showResults && <SearchResultsPanel query={query} />}
      </Box>
    </ClickAwayListener>
  );
}
