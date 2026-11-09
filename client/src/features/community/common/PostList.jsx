import { Alert, Box, Button } from '@mui/material';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import PostCard from './PostCard';
import { EmptyBlock, FeedSkeleton } from '../../workspace/community/CommunityBits';

export default function PostList({ feed }) {
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
    <Box>
      {items.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
      {hasMore && (
        <Button fullWidth onClick={loadMore} disabled={loading} sx={{ my: 2 }}>
          {loading ? 'Loading…' : 'Load more'}
        </Button>
      )}
    </Box>
  );
}
