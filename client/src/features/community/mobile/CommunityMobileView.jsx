import { Box, Fab } from '@mui/material';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import CategoryTabs from '../common/CategoryTabs';
import { LibraryFont } from '../../dashboard/components/libraryStyle';
import { navActiveColor } from '../../../components/navbar/navLinkStyles';
import PostList from '../common/PostList';
import CommunityTopBar from './CommunityTopBar';
import PhonePostCard from './PhonePostCard';
import PostReelsScreen from './reels/PostReelsScreen';
import useReelsRoute from './reels/useReelsRoute';
import ComposePostDialog from '../common/ComposePostDialog';
import { SIZES } from '../../../app/design/designTokens';

const composeFabSx = (theme) => ({
  bgcolor: navActiveColor(theme),
  color: theme.palette.common.white,
  '&:hover': { bgcolor: navActiveColor(theme) },
  position: 'fixed',
  right: theme.spacing(2),
  bottom: `calc(${SIZES.bottomNavHeight}px + ${theme.spacing(3)} + env(safe-area-inset-bottom))`,
});

// Phone layout: top bar with search, scrolling category tabs, full-width feed, floating compose button above the bottom bar.
// Tapping a post's photo opens the full-screen posts viewer over the feed.
export default function CommunityMobileView({ page }) {
  const { category, setCategory, tabs, feed, composeOpen, openCompose, closeCompose } = page;
  const reels = useReelsRoute();
  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))' }}>
        <CommunityTopBar />
        <Box sx={{ mt: 1 }}>
          <CategoryTabs value={category} onChange={setCategory} options={tabs} />
        </Box>
        <PostList feed={feed} category={category} PostCard={PhonePostCard} cardProps={{ onOpenImage: (post) => reels.open(post._id) }} />
        <Fab aria-label="Create post" onClick={openCompose} sx={composeFabSx}>
          <EditNoteRoundedIcon />
        </Fab>
        <ComposePostDialog open={composeOpen} onClose={closeCompose} onPublished={feed.prepend} />
      </Box>
      <PostReelsScreen feed={feed} startId={reels.startId} onClose={reels.close} />
    </LibraryFont>
  );
}
