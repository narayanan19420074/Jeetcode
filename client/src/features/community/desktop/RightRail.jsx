import { List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';
import { FEED_TABS } from '../common/communityCategories';
import MessagesButton from '../mobile/messages/MessagesButton';
import SearchField from '../mobile/SearchField';
import RailCard from './RailCard';

function SearchCard() {
  return (
    <RailCard sx={{ p: 1.5 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <SearchField placeholder="Search" label="Search community" />
        <MessagesButton />
      </Stack>
    </RailCard>
  );
}

function TopicsCard({ category, onChange }) {
  return (
    <RailCard>
      <Typography sx={{ px: 2, pt: 2, pb: 1, fontWeight: FONT_WEIGHTS.bold }}>Topics</Typography>
      <List disablePadding sx={{ pb: 1 }}>
        {FEED_TABS.map((tab) => (
          <ListItemButton key={tab.value || 'all'} selected={tab.value === category} onClick={() => onChange(tab.value)}>
            <ListItemText primary={tab.label} slotProps={{ primary: { variant: 'body2', fontWeight: FONT_WEIGHTS.semibold } }} />
          </ListItemButton>
        ))}
      </List>
    </RailCard>
  );
}

// Right rail: the same search and messages as the phone top bar, then the topics to browse.
export default function RightRail({ category, onCategoryChange }) {
  return (
    <Stack spacing={1.5}>
      <SearchCard />
      <TopicsCard category={category} onChange={onCategoryChange} />
    </Stack>
  );
}
