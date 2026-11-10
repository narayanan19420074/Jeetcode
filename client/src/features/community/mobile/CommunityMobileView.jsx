import { Box, Fab } from '@mui/material';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import CategoryTabs from '../common/CategoryTabs';
import { LibraryFont } from '../../dashboard/components/libraryStyle';
import { navActiveColor } from '../../../components/navbar/navLinkStyles';
import PostList from '../common/PostList';
import ComposePostDialog from '../common/ComposePostDialog';
import { FEED_TABS } from '../common/communityCategories';
import { SIZES } from '../../../app/design/designTokens';

// Phone layout: scrolling category tabs on top, full-width feed, floating compose button above the bottom bar.
export default function CommunityMobileView({ page }) {
  const { category, setCategory, feed, composeOpen, openCompose, closeCompose } = page;
  return (
    <LibraryFont>
    <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))' }}>
      <CategoryTabs value={category} onChange={setCategory} options={FEED_TABS} />
      <PostList feed={feed} category={category} />
      <Fab
        aria-label="Create post"
        onClick={openCompose}
        sx={(theme) => ({ bgcolor: navActiveColor(theme), color: theme.palette.common.white, '&:hover': { bgcolor: navActiveColor(theme) }, position: 'fixed', right: theme.spacing(2), bottom: `calc(${SIZES.bottomNavHeight}px + ${theme.spacing(3)} + env(safe-area-inset-bottom))` })}
      >
        <EditNoteRoundedIcon />
      </Fab>
      <ComposePostDialog open={composeOpen} onClose={closeCompose} onPublished={feed.prepend} />
    </Box>
    </LibraryFont>
  );
}
