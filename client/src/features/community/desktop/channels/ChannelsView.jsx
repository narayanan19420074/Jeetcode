import { useState } from 'react';
import { Button, Stack } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CategoryTabs from '../../common/CategoryTabs';
import useChannelList from '../../common/channels/useChannelList';
import { CHANNEL_KINDS } from '../../common/channels/channelKinds';
import { RADII_PX, SIZES } from '../../../../app/design/designTokens';
import BackHeader from './BackHeader';
import ChannelList from './ChannelList';
import CreateChannelDialog from './CreateChannelDialog';

const SCOPE_TABS = [
  { value: 'discover', label: 'Discover' },
  { value: 'mine', label: 'Yours' },
];

// Middle column when Groups or Newsletters is chosen in the left rail: browse everything or only what you belong to,
// open one, or create your own. A newly created channel opens straight away.
export default function ChannelsView({ kind, onBack, onOpenChannel }) {
  const config = CHANNEL_KINDS[kind];
  const [scope, setScope] = useState('discover');
  const [createOpen, setCreateOpen] = useState(false);
  const list = useChannelList(kind, scope);
  const createButton = (
    <Button variant="contained" disableElevation startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)} sx={{ borderRadius: RADII_PX.pill }}>
      {config.createLabel}
    </Button>
  );

  return (
    <Stack spacing={1.5} sx={{ maxWidth: SIZES.readingMaxWidth, mx: 'auto' }}>
      <BackHeader title={config.title} backLabel="Back to feed" onBack={onBack} action={createButton} />
      <CategoryTabs value={scope} onChange={setScope} options={SCOPE_TABS} />
      <ChannelList kind={kind} scope={scope} list={list} onOpen={(channel) => onOpenChannel(channel._id, kind)} />
      <CreateChannelDialog open={createOpen} kind={kind} onClose={() => setCreateOpen(false)} onCreated={(channel) => onOpenChannel(channel._id, kind)} />
    </Stack>
  );
}
