import { Box, Stack } from '@mui/material';
import CategoryTabs from '../common/CategoryTabs';
import ComposePostDialog from '../common/ComposePostDialog';
import PostList from '../common/PostList';
import PhonePostCard from '../mobile/PhonePostCard';
import { LibraryFont } from '../../dashboard/components/libraryStyle';
import { SIZES } from '../../../app/design/designTokens';
import ComposerCard from './ComposerCard';
import ProfileSummaryCard from './ProfileSummaryCard';
import RightRail from './RightRail';
import ShortcutsCard from './ShortcutsCard';

const { left, right, maxWidth, stickyTop } = SIZES.communityLayout;
const columns = `${left}px minmax(0, 1fr)`;
const pageSx = {
  maxWidth,
  mx: 'auto',
  px: 3,
  py: 3,
  display: 'grid',
  gridTemplateColumns: { md: columns, lg: `${columns} ${right}px` },
  gap: 3,
  alignItems: 'start',
};
const stickySx = { position: 'sticky', top: stickyTop };

// Desktop layout, like the LinkedIn feed: your card on the left, the feed in the middle, search and topics on the
// right. The feed itself is the same as on phones (same tabs, same post card). Below the lg breakpoint the right
// rail is hidden.
export default function CommunityDesktopView({ page }) {
  const { category, setCategory, tabs, feed, composeOpen, openCompose, closeCompose } = page;
  return (
    <LibraryFont>
      <Box sx={pageSx}>
        <Stack component="aside" spacing={1.5} sx={stickySx}>
          <ProfileSummaryCard />
          <ShortcutsCard onShowSaved={setCategory} />
        </Stack>
        <Stack spacing={1.5}>
          <ComposerCard onOpen={openCompose} />
          <CategoryTabs value={category} onChange={setCategory} options={tabs} />
          <PostList feed={feed} category={category} PostCard={PhonePostCard} />
        </Stack>
        <Box component="aside" sx={{ ...stickySx, display: { xs: 'none', lg: 'block' } }}>
          <RightRail category={category} onCategoryChange={setCategory} />
        </Box>
      </Box>
      <ComposePostDialog open={composeOpen} onClose={closeCompose} onPublished={feed.prepend} />
    </LibraryFont>
  );
}
