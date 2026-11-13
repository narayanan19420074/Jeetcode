import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, InputAdornment, Stack, TextField } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterControl from '../../components/library/FilterControl';
import useLibraryStyles from '../../components/library/libraryStyles';
import { NavButton } from '../../components/SidebarParts';
import { filterTopicEntries } from '../common/topicNavigation';
import TopicList from './TopicList';
import SidebarLists from './SidebarLists';
import { BORDER_WIDTHS, SIZES } from '../../../../app/design/designTokens';

function TopicSearchRow({ value, onChange, lib, isAuthenticated }) {
  const styles = useLibraryStyles();
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <TextField
        size="small"
        placeholder="Search topics"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        sx={styles.search}
        slotProps={{
          htmlInput: { 'aria-label': 'Search topics' },
          input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> },
        }}
      />
      <FilterControl lib={lib} isAuthenticated={isAuthenticated} />
    </Stack>
  );
}

function BackLink({ isAuthenticated }) {
  const navigate = useNavigate();
  return (
    <NavButton
      active={false}
      icon={ArrowBackRoundedIcon}
      label={isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
      onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
    />
  );
}

// Left column of the Problems page: the way back and a topic search with the filter button stay on top, the topics scroll
// in the middle, and the learner's lists stay at the bottom.
export default function ProblemsSidebar({ lib, isAuthenticated, listsApi }) {
  const [topicSearch, setTopicSearch] = useState('');
  const entries = useMemo(() => filterTopicEntries({ groups: lib.groups, tags: lib.tags, searchText: topicSearch }), [lib.groups, lib.tags, topicSearch]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: { lg: SIZES.fill }, minHeight: SIZES.flexShrinkMinHeight }}>
      <Box sx={{ display: 'grid', gap: 1, pb: 1, flexShrink: 0 }}>
        <BackLink isAuthenticated={isAuthenticated} />
        <TopicSearchRow value={topicSearch} onChange={setTopicSearch} lib={lib} isAuthenticated={isAuthenticated} />
      </Box>
      <Box className="autohide-scroll" sx={{ flex: 1, minHeight: SIZES.flexShrinkMinHeight, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <TopicList
          entries={entries}
          groups={lib.groups}
          selectedTags={lib.query.tags}
          onClear={() => lib.patch({ tags: [] })}
          onSelectGroup={(group) => lib.patch({ tags: group.tags })}
          onToggleTag={lib.toggleTag}
        />
      </Box>
      <Box className="autohide-scroll" sx={{ flexShrink: 0, maxHeight: SIZES.sidebarListsMaxHeight, overflowY: 'auto', borderTop: `${BORDER_WIDTHS.thin}px solid`, borderColor: 'divider' }}>
        <SidebarLists listsApi={listsApi} />
      </Box>
    </Box>
  );
}
