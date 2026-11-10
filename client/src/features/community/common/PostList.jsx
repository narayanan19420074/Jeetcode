import { Alert, Box, Button } from '@mui/material';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import PostCard from './PostCard';
import RichPostCard from './RichPostCard';
import { CAREER_CATEGORY } from './communityCategories';
import { EmptyBlock, FeedSkeleton } from '../../workspace/community/CommunityBits';

// Rich cards are white on a grey strip that runs edge to edge on phones, like a LinkedIn feed. The Career tab is one
// continuous strip; in other tabs only the posts with an image get a strip of their own.
const careerFeedSx = { display: 'flex', flexDirection: 'column', gap: 1, mt: 1, mx: { xs: -2, md: 0 }, bgcolor: 'var(--lib-player)' };
const imagePostStripSx = { my: 1, py: 1, mx: { xs: -2, md: 0 }, bgcolor: 'var(--lib-player)' };

function FeedRow({ post, inCareerTab }) {
  if (inCareerTab) return <RichPostCard post={post} />;
  if (!post.coverImage) return <PostCard post={post} />;
  return (
    <Box sx={imagePostStripSx}>
      <RichPostCard post={post} />
    </Box>
  );
}

function FeedRows({ items, category }) {
  const inCareerTab = category === CAREER_CATEGORY;
  return (
    <Box sx={inCareerTab ? careerFeedSx : undefined}>
      {items.map((post) => (
        <FeedRow key={post._id} post={post} inCareerTab={inCareerTab} />
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
