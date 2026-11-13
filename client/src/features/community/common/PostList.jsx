import { Fragment } from 'react';
import { Alert, Box, Button } from '@mui/material';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import RichPostCard from './RichPostCard';
import { SAVED_FEED } from './communityCategories';
import { EmptyBlock, FeedSkeleton } from '../../workspace/community/CommunityBits';

// Posts are white cards on a grey strip that runs edge to edge on phones, like a LinkedIn feed (a thin band between cards). On desktop the cards stand alone.
const feedStripSx = { display: 'flex', flexDirection: 'column', gap: { xs: 0.5, md: 1 }, mt: 1, mx: { xs: -2, md: 0 }, bgcolor: { xs: 'var(--lib-player)', md: 'transparent' } };

function EmptyFeed({ category }) {
  if (category === SAVED_FEED) {
    return <EmptyBlock icon={<BookmarkBorderRoundedIcon />} title="No saved posts" text="Choose Save from the menu of a post to find it here later." />;
  }
  return <EmptyBlock icon={<ForumRoundedIcon />} title="No posts yet" text="Be the first to start a conversation in this category." />;
}

// `renderInterlude(slot)` draws extra content (the phone feed shows suggested members) after every INTERLUDE_EVERY posts.
const INTERLUDE_EVERY = 6;
const isInterludePosition = (index) => (index + 1) % INTERLUDE_EVERY === 0;

function FeedRows({ items, onRemoved, onOpenImage, PostCard, renderInterlude }) {
  return (
    <Box sx={feedStripSx}>
      {items.map((post, index) => (
        <Fragment key={post._id}>
          <PostCard post={post} onRemoved={onRemoved} onOpenImage={onOpenImage} />
          {renderInterlude && isInterludePosition(index) && renderInterlude(Math.floor(index / INTERLUDE_EVERY))}
        </Fragment>
      ))}
    </Box>
  );
}

// `PostCard` lets the phone feed draw its own card; the desktop feed uses the default. `onOpenImage(post)` is called when
// the photo of a post is tapped (the phone feed opens the posts viewer with it).
export default function PostList({ feed, category, PostCard = RichPostCard, renderInterlude, onOpenImage }) {
  const { items, loading, error, hasMore, loadMore, reload, removePosts } = feed;
  if (error && items.length === 0) {
    return (
      <Alert severity="error" action={<Button color="inherit" onClick={reload}>Retry</Button>}>
        {error}
      </Alert>
    );
  }
  if (loading && items.length === 0) return <FeedSkeleton count={4} />;
  if (items.length === 0) return <EmptyFeed category={category} />;
  return (
    <>
      <FeedRows items={items} onRemoved={removePosts} onOpenImage={onOpenImage} PostCard={PostCard} renderInterlude={renderInterlude} />
      {hasMore && (
        <Button fullWidth onClick={loadMore} disabled={loading} sx={{ my: 2 }}>
          {loading ? 'Loading…' : 'Load more'}
        </Button>
      )}
    </>
  );
}
