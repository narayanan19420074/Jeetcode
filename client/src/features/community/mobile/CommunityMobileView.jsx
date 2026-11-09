import { Box, Fab } from '@mui/material';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import { FilterChips } from '../../workspace/community/CommunityBits';
import PostList from '../common/PostList';
import ComposePostDialog from '../common/ComposePostDialog';
import { FEED_TABS } from '../common/communityCategories';
import { SIZES } from '../../../app/design/designTokens';

// Phone layout: scrolling category tabs on top, full-width feed, floating compose button above the bottom bar.
export default function CommunityMobileView({ page }) {
  const { category, setCategory, feed, composeOpen, openCompose, closeCompose } = page;
  return (
    <Box sx={{ px: 2, pt: 1.5 }}>
      <FilterChips value={category} onChange={setCategory} options={FEED_TABS} />
      <PostList feed={feed} />
      <Fab
        color="primary"
        aria-label="Create post"
        onClick={openCompose}
        sx={(theme) => ({ position: 'fixed', right: theme.spacing(2), bottom: `calc(${SIZES.bottomNavHeight}px + ${theme.spacing(3)} + env(safe-area-inset-bottom))` })}
      >
        <EditNoteRoundedIcon />
      </Fab>
      <ComposePostDialog open={composeOpen} onClose={closeCompose} onPublished={feed.prepend} />
    </Box>
  );
}
