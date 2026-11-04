import { Box } from '@mui/material';
import { RADII_PX } from '../../../../app/design/designTokens';
import { sameSet } from './libraryConstants';
import { FilterChip, FilterChipWrap, FilterHeading } from './FilterParts';

// Colour dot that identifies a topic group (for example Arrays & Hashing).
function GroupDot({ color }) {
  return <Box component="span" sx={(theme) => ({ width: theme.spacing(1), height: theme.spacing(1), borderRadius: RADII_PX.circle, bgcolor: color })} />;
}

// A group selects all of its topics at once; "All Topics" clears the topic filter.
function TopicGroupChips({ groups, selectedTags, onSelect, onClear }) {
  return (
    <FilterChipWrap>
      <FilterChip on={selectedTags.length === 0} label="All Topics" onClick={onClear} />
      {groups.map((group) => (
        <FilterChip
          key={group.key}
          on={sameSet(selectedTags, group.tags)}
          label={group.label}
          icon={<GroupDot color={group.color} />}
          onClick={() => onSelect(group)}
        />
      ))}
    </FilterChipWrap>
  );
}

function TopicChips({ tags, selectedTags, onToggle }) {
  return (
    <FilterChipWrap>
      {tags.map(({ tag, count }) => (
        <FilterChip key={tag} on={selectedTags.includes(tag)} label={`${tag} ${count}`} onClick={() => onToggle(tag)} />
      ))}
    </FilterChipWrap>
  );
}

// Every topic filter of the problem library: the topic groups, then each single topic with its problem count.
export default function TopicFilters({ lib }) {
  const { groups, tags, query, patch, toggleTag } = lib;
  if (tags.length === 0) return null;
  return (
    <>
      <FilterHeading>Topic groups</FilterHeading>
      <TopicGroupChips groups={groups} selectedTags={query.tags} onSelect={(group) => patch({ tags: group.tags })} onClear={() => patch({ tags: [] })} />
      <FilterHeading>Topics</FilterHeading>
      <TopicChips tags={tags} selectedTags={query.tags} onToggle={toggleTag} />
    </>
  );
}
