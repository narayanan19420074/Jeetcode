import { Stack } from '@mui/material';
import DesktopPageFrame from '../../../components/DesktopPageFrame';
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

function LeftRail({ onShowSaved }) {
  return (
    <Stack spacing={1.5}>
      <ProfileSummaryCard />
      <ShortcutsCard onShowSaved={onShowSaved} />
    </Stack>
  );
}

// Desktop layout in the shared page frame (same margins and column widths as the Dashboard): your card on the
// left, the feed in the middle at reading width, search and topics on the right. The feed itself is the same as on
// phones (same tabs, same post card).
export default function CommunityDesktopView({ page }) {
  const { category, setCategory, tabs, feed, composeOpen, openCompose, closeCompose } = page;
  return (
    <LibraryFont>
      <DesktopPageFrame left={<LeftRail onShowSaved={setCategory} />} right={<RightRail category={category} onCategoryChange={setCategory} />}>
        <Stack spacing={1.5} sx={{ maxWidth: SIZES.readingMaxWidth, mx: 'auto' }}>
          <ComposerCard onOpen={openCompose} />
          <CategoryTabs value={category} onChange={setCategory} options={tabs} />
          <PostList feed={feed} category={category} PostCard={PhonePostCard} />
        </Stack>
      </DesktopPageFrame>
      <ComposePostDialog open={composeOpen} onClose={closeCompose} onPublished={feed.prepend} />
    </LibraryFont>
  );
}
