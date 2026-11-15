import { useState } from 'react';
import { Alert, Stack, Typography } from '@mui/material';
import ComposePostDialog from '../../common/ComposePostDialog';
import PostList from '../../common/PostList';
import PhonePostCard from '../../mobile/PhonePostCard';
import useChannel from '../../common/channels/useChannel';
import useCommunityFeed from '../../common/useCommunityFeed';
import { CHANNEL_KINDS, canPublishTo, memberCountLabel } from '../../common/channels/channelKinds';
import { EmptyBlock, FeedSkeleton } from '../../../workspace/community/CommunityBits';
import { SIZES } from '../../../../app/design/designTokens';
import BackHeader from './BackHeader';
import ComposerCard from '../ComposerCard';
import MembershipButton from './MembershipButton';
import RailCard from '../RailCard';
import { CHANNEL_ICONS } from './channelIcons';

function ChannelAbout({ channel, onMembershipChange }) {
  return (
    <RailCard sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Stack sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {memberCountLabel(channel.kind, channel.memberCount)} · Created by {channel.owner?.name}
          </Typography>
          {channel.description && <Typography sx={{ mt: 1 }}>{channel.description}</Typography>}
        </Stack>
        <MembershipButton channel={channel} onChange={onMembershipChange} />
      </Stack>
    </RailCard>
  );
}

function ChannelPosts({ channel, feed }) {
  const config = CHANNEL_KINDS[channel.kind];
  const Icon = CHANNEL_ICONS[channel.kind];
  const emptyState = <EmptyBlock icon={<Icon />} title={config.emptyPosts.title} text={config.emptyPosts.text} />;
  return <PostList feed={feed} category="" PostCard={PhonePostCard} emptyState={emptyState} />;
}

// Middle column for one group or newsletter: who runs it, the join or subscribe button, a post box for those allowed to
// publish, and its posts.
function LoadedChannel({ channel, feed, onBack, onMembershipChange }) {
  const [composeOpen, setComposeOpen] = useState(false);
  const config = CHANNEL_KINDS[channel.kind];
  return (
    <Stack spacing={1.5} sx={{ maxWidth: SIZES.readingMaxWidth, mx: 'auto' }}>
      <BackHeader title={channel.name} backLabel={`Back to ${config.title}`} onBack={onBack} />
      <ChannelAbout channel={channel} onMembershipChange={onMembershipChange} />
      {canPublishTo(channel) && <ComposerCard onOpen={() => setComposeOpen(true)} />}
      {channel.kind === 'group' && !channel.isMember && <Alert severity="info">Join this group to post.</Alert>}
      <ChannelPosts channel={channel} feed={feed} />
      <ComposePostDialog open={composeOpen} onClose={() => setComposeOpen(false)} onPublished={feed.prepend} channelId={channel._id} />
    </Stack>
  );
}

export default function ChannelDetailView({ channelId, kind, onBack }) {
  const { channel, loading, error, updateMembership } = useChannel(channelId);
  const feed = useCommunityFeed('', channelId);
  if (error) return <Alert severity="error">{error}</Alert>;
  if (loading || !channel) return <FeedSkeleton count={3} />;
  return <LoadedChannel channel={channel} feed={feed} onBack={() => onBack(kind)} onMembershipChange={updateMembership} />;
}
