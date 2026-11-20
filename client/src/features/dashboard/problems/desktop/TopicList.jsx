import { Box, Typography } from '@mui/material';
import { findSelectedGroup } from '../common/topicNavigation';
import SidebarTextRow from './SidebarTextRow';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../../app/design/designTokens';

function SectionHeading({ children }) {
  return <Typography component="h2" sx={{ mt: 1.5, mb: 0.5, px: 1.5, fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.bold }}>{children}</Typography>;
}

// "All Topics" clears the topic filter, a group selects all of its topics at once, a single topic toggles on its own.
export default function TopicList({ groups, tags, selectedTags, onClear, onSelectGroup, onToggleTag }) {
  const selectedGroup = findSelectedGroup(groups, selectedTags);
  return (
    <Box component="nav" aria-label="Problem topics" sx={{ display: 'flex', flexDirection: 'column' }}>
      <SidebarTextRow active={selectedTags.length === 0} label="All Topics" onClick={onClear} />
      {groups.length > 0 && <SectionHeading>Topic groups</SectionHeading>}
      {groups.map((group) => <SidebarTextRow key={group.key} active={selectedGroup?.key === group.key} label={group.label} onClick={() => onSelectGroup(group)} />)}
      {tags.length > 0 && <SectionHeading>Topics</SectionHeading>}
      {tags.map(({ tag, count }) => <SidebarTextRow key={tag} active={!selectedGroup && selectedTags.includes(tag)} label={tag} count={count} onClick={() => onToggleTag(tag)} />)}
    </Box>
  );
}
