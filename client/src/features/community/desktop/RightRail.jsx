import { Stack } from '@mui/material';
import NewsCard from './NewsCard';
import PuzzlesCard from './PuzzlesCard';

// Right rail, like the LinkedIn feed: news, then the day's puzzles.
export default function RightRail({ items }) {
  return (
    <Stack spacing={1.5}>
      <NewsCard items={items} />
      <PuzzlesCard />
    </Stack>
  );
}
