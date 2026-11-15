import { Fragment } from 'react';
import { Alert, Button, Divider } from '@mui/material';
import { EmptyBlock, FeedSkeleton } from '../../../workspace/community/CommunityBits';
import { CHANNEL_KINDS } from '../../common/channels/channelKinds';
import RailCard from '../RailCard';
import { CHANNEL_ICONS } from './channelIcons';
import ChannelRow from './ChannelRow';

function ChannelRows({ items, onOpen, onMembershipChange }) {
  return (
    <RailCard>
      {items.map((channel, index) => (
        <Fragment key={channel._id}>
          {index > 0 && <Divider />}
          <ChannelRow channel={channel} onOpen={onOpen} onMembershipChange={onMembershipChange} />
        </Fragment>
      ))}
    </RailCard>
  );
}

// Loading, error, empty and loaded states of a list of groups or newsletters.
export default function ChannelList({ kind, scope, list, onOpen }) {
  const { items, loading, error, hasMore, loadMore, reload, updateMembership } = list;
  if (error && items.length === 0) {
    return <Alert severity="error" action={<Button color="inherit" onClick={reload}>Retry</Button>}>{error}</Alert>;
  }
  if (loading && items.length === 0) return <FeedSkeleton count={3} />;
  if (items.length === 0) {
    const Icon = CHANNEL_ICONS[kind];
    const empty = scope === 'mine' ? CHANNEL_KINDS[kind].emptyMine : CHANNEL_KINDS[kind].emptyDiscover;
    return <EmptyBlock icon={<Icon />} title={empty.title} text={empty.text} />;
  }
  return (
    <>
      <ChannelRows items={items} onOpen={onOpen} onMembershipChange={updateMembership} />
      {hasMore && <Button fullWidth onClick={loadMore} disabled={loading}>{loading ? 'Loading…' : 'Load more'}</Button>}
    </>
  );
}
