import { Stack } from '@mui/material';
import DesktopPageFrame from '../../../components/DesktopPageFrame';
import CategoryTabs from '../common/CategoryTabs';
import ComposePostDialog from '../common/ComposePostDialog';
import PostList from '../common/PostList';
import PhonePostCard from '../mobile/PhonePostCard';
import { LibraryFont } from '../../dashboard/components/libraryStyle';
import { SIZES } from '../../../app/design/designTokens';
import ComposerCard from './ComposerCard';
import AnalyticsCard from './AnalyticsCard';
import MessagingDock from './MessagingDock';
import PremiumCard from './PremiumCard';
import ProfileSummaryCard from './ProfileSummaryCard';
import RightRail from './RightRail';
import ShortcutsCard from './ShortcutsCard';
import ChannelDetailView from './channels/ChannelDetailView';
import ChannelsView from './channels/ChannelsView';
import useDesktopSection from './channels/useDesktopSection';

function LeftRail({ onShowSaved, onOpenChannels }) {
  return (
    <Stack spacing={1.5}>
      <ProfileSummaryCard />
      <PremiumCard />
      <AnalyticsCard />
      <ShortcutsCard onShowSaved={onShowSaved} onOpenChannels={onOpenChannels} />
    </Stack>
  );
}

function FeedColumn({ page }) {
  const { category, setCategory, tabs, feed, openCompose } = page;
  return (
    <Stack spacing={1.5} sx={{ maxWidth: SIZES.readingMaxWidth, mx: 'auto' }}>
      <ComposerCard onOpen={openCompose} />
      <CategoryTabs value={category} onChange={setCategory} options={tabs} />
      <PostList feed={feed} category={category} PostCard={PhonePostCard} />
    </Stack>
  );
}

// Middle column: the post feed, a list of groups or newsletters, or one group or newsletter.
function CenterColumn({ page, nav }) {
  const { section } = nav;
  if (section.type === 'list') return <ChannelsView kind={section.kind} onBack={nav.showFeed} onOpenChannel={nav.showChannel} />;
  if (section.type === 'channel') return <ChannelDetailView channelId={section.channelId} kind={section.kind} onBack={nav.showChannelList} />;
  return <FeedColumn page={page} />;
}

// Desktop layout in the shared page frame (same margins and column widths as the Dashboard): your card on the
// left, the feed in the middle at reading width, news and puzzles on the right, with the messaging dock at the bottom right. The feed itself is the same as on
// phones (same tabs, same post card).
export default function CommunityDesktopView({ page }) {
  const { setCategory, feed, composeOpen, closeCompose } = page;
  const nav = useDesktopSection();
  // The Saved tab lives in the feed, so choosing Saved items from a group or newsletter page returns to the feed first.
  const showSaved = (value) => {
    setCategory(value);
    nav.showFeed();
  };
  return (
    <LibraryFont>
      <DesktopPageFrame left={<LeftRail onShowSaved={showSaved} onOpenChannels={nav.showChannelList} />} right={<RightRail items={feed.items} />}>
        <CenterColumn page={page} nav={nav} />
      </DesktopPageFrame>
      <MessagingDock />
      <ComposePostDialog open={composeOpen} onClose={closeCompose} onPublished={feed.prepend} />
    </LibraryFont>
  );
}
