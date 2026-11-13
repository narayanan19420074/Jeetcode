import { Box, Dialog } from '@mui/material';
import { LibraryFont } from '../../../dashboard/components/libraryStyle';
import { SIZES } from '../../../../app/design/designTokens';
import ReelSlide from './ReelSlide';
import ReelsTopBar from './ReelsTopBar';
import useReelsScroll from './useReelsScroll';

const scrollerSx = {
  height: SIZES.fill,
  overflowY: 'auto',
  scrollSnapType: 'y mandatory',
  overscrollBehaviorY: 'contain',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

function ReelsBody({ feed, startId, onClose }) {
  const { items, hasMore, loading, loadMore } = feed;
  const startIndex = Math.max(0, items.findIndex((post) => post._id === startId));
  const { scrollRef, onScroll } = useReelsScroll({ startIndex, count: items.length, hasMore, loading, loadMore });
  return (
    <Box sx={{ position: 'relative', height: SIZES.viewportHeight }}>
      <Box ref={scrollRef} onScroll={onScroll} sx={scrollerSx}>
        {items.map((post) => <ReelSlide key={post._id} post={post} />)}
      </Box>
      <ReelsTopBar onBack={onClose} />
    </Box>
  );
}

// Full-screen viewer for the feed's posts, like Instagram Reels: swipe or scroll up for the next post, down for the
// previous one. It opens on the post whose photo was tapped (`startId`) and walks through the same posts as the feed,
// loading further pages as you go. The dialog is a portal, so it wraps its content in LibraryFont for the page fonts.
export default function PostReelsScreen({ feed, startId, onClose }) {
  const open = startId !== null;
  return (
    <Dialog fullScreen open={open} onClose={onClose} aria-label="Posts" slotProps={{ paper: { sx: { bgcolor: 'common.black' } } }}>
      <LibraryFont sx={{ flexGrow: 1, bgcolor: 'common.black' }}>{open && <ReelsBody feed={feed} startId={startId} onClose={onClose} />}</LibraryFont>
    </Dialog>
  );
}
