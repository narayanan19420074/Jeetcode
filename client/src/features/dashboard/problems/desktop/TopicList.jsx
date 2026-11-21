import { MenuCard, MenuRow, MenuRowLabel, MenuSection } from '../../../../components/MenuCard';
import { findSelectedGroup } from '../common/topicNavigation';

// "All Topics" clears the topic filter, a group selects all of its topics at once, a single topic toggles on its own.
export default function TopicList({ groups, tags, selectedTags, onClear, onSelectGroup, onToggleTag }) {
  const selectedGroup = findSelectedGroup(groups, selectedTags);
  return (
    <MenuCard title="Topics">
      <MenuRow selected={selectedTags.length === 0} onClick={onClear}><MenuRowLabel label="All Topics" selected={selectedTags.length === 0} /></MenuRow>
      {groups.length > 0 && <MenuSection>Topic groups</MenuSection>}
      {groups.map((group) => {
        const selected = selectedGroup?.key === group.key;
        return <MenuRow key={group.key} selected={selected} onClick={() => onSelectGroup(group)}><MenuRowLabel label={group.label} selected={selected} /></MenuRow>;
      })}
      {tags.length > 0 && <MenuSection>Topics</MenuSection>}
      {tags.map(({ tag, count }) => {
        const selected = !selectedGroup && selectedTags.includes(tag);
        return <MenuRow key={tag} selected={selected} onClick={() => onToggleTag(tag)}><MenuRowLabel label={tag} count={count} selected={selected} /></MenuRow>;
      })}
    </MenuCard>
  );
}
