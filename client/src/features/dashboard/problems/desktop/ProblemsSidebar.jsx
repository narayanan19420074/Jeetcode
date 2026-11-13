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
import { Z_INDEX } from '../../../../app/design/designTokens';

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

// Left column of the Problems page: the way back, a topic search with the filter button, then every topic group and topic.
// The back link and the search stay pinned while the topic list scrolls.
export default function ProblemsSidebar({ lib, isAuthenticated }) {
  const [topicSearch, setTopicSearch] = useState('');
  const entries = useMemo(() => filterTopicEntries({ groups: lib.groups, tags: lib.tags, searchText: topicSearch }), [lib.groups, lib.tags, topicSearch]);
  return (
    <Box>
      <Box sx={{ position: 'sticky', top: 0, zIndex: Z_INDEX.overlap, display: 'grid', gap: 1, pb: 1, bgcolor: 'background.default' }}>
        <BackLink isAuthenticated={isAuthenticated} />
        <TopicSearchRow value={topicSearch} onChange={setTopicSearch} lib={lib} isAuthenticated={isAuthenticated} />
      </Box>
      <TopicList
        entries={entries}
        groups={lib.groups}
        selectedTags={lib.query.tags}
        onClear={() => lib.patch({ tags: [] })}
        onSelectGroup={(group) => lib.patch({ tags: group.tags })}
        onToggleTag={lib.toggleTag}
      />
    </Box>
  );
}
