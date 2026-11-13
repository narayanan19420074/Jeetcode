import { Box, Typography } from '@mui/material';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import TagRoundedIcon from '@mui/icons-material/TagRounded';
import { NavButton } from '../../components/SidebarParts';
import { findSelectedGroup } from '../common/topicNavigation';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../../app/design/designTokens';

function SectionHeading({ children }) {
  return <Typography sx={{ mt: 1.5, mb: 0.5, px: 1.5, fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.bold }}>{children}</Typography>;
}

function GroupButtons({ groups, selectedGroup, onSelectGroup }) {
  return groups.map((group) => (
    <NavButton dense key={group.key} active={selectedGroup?.key === group.key} icon={CategoryRoundedIcon} accent={group.color} label={group.label} onClick={() => onSelectGroup(group)} />
  ));
}

function TagButtons({ tags, selectedTags, isGroupSelected, onToggleTag }) {
  return tags.map(({ tag, count }) => (
    <NavButton dense key={tag} active={!isGroupSelected && selectedTags.includes(tag)} icon={TagRoundedIcon} label={tag} count={count} onClick={() => onToggleTag(tag)} />
  ));
}

// "All Topics" clears the topic filter, a group selects all of its topics at once, a single topic toggles on its own.
export default function TopicList({ entries, groups, selectedTags, onClear, onSelectGroup, onToggleTag }) {
  const selectedGroup = findSelectedGroup(groups, selectedTags);
  const isEmpty = !entries.showAll && entries.groups.length === 0 && entries.tags.length === 0;
  return (
    <Box component="nav" aria-label="Problem topics" sx={{ display: 'flex', flexDirection: 'column' }}>
      {entries.showAll && <NavButton dense active={selectedTags.length === 0} icon={GridViewRoundedIcon} label="All Topics" onClick={onClear} />}
      {entries.groups.length > 0 && <SectionHeading>Topic groups</SectionHeading>}
      <GroupButtons groups={entries.groups} selectedGroup={selectedGroup} onSelectGroup={onSelectGroup} />
      {entries.tags.length > 0 && <SectionHeading>Topics</SectionHeading>}
      <TagButtons tags={entries.tags} selectedTags={selectedTags} isGroupSelected={Boolean(selectedGroup)} onToggleTag={onToggleTag} />
      {isEmpty && <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, py: 1 }}>No topics match your search.</Typography>}
    </Box>
  );
}
