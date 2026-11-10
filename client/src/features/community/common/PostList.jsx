import { Alert, Box, Button } from '@mui/material';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import PostCard from './PostCard';
import CareerPostCard from './CareerPostCard';
import { CAREER_CATEGORY } from './communityCategories';
import { EmptyBlock, FeedSkeleton } from '../../workspace/community/CommunityBits';

// Career posts are white cards on a grey strip that runs edge to edge on phones, like a LinkedIn feed.
const careerFeedSx = { display: 'flex', flexDirection: 'column', gap: 1, mt: 1, mx: { xs: -2, md: 0 }, bgcolor: 'var(--lib-player)' };

function FeedRows({ items, category }) {
  const career = category === CAREER_CATEGORY;
  const Card = career ? CareerPostCard : PostCard;
  return (
    <Box sx={career ? careerFeedSx : undefined}>
      {items.map((post) => (
        <Card key={post._id} post={post} />
      ))}
    </Box>
  );
}

export default function PostList({ feed, category }) {
  const { items, loading, error, hasMore, loadMore, reload } = feed;
  if (error && items.length === 0) {
    return (
      <Alert severity="error" action={<Button color="inherit" onClick={reload}>Retry</Button>}>
        {error}
      </Alert>
    );
  }
  if (loading && items.length === 0) return <FeedSkeleton count={4} />;
  if (items.length === 0) {
    return <EmptyBlock icon={<ForumRoundedIcon />} title="No posts yet" text="Be the first to start a conversation in this category." />;
  }
  return (
    <>
      <FeedRows items={items} category={category} />
      {hasMore && (
        <Button fullWidth onClick={loadMore} disabled={loading} sx={{ my: 2 }}>
          {loading ? 'Loading…' : 'Load more'}
        </Button>
      )}
    </>
  );
}
