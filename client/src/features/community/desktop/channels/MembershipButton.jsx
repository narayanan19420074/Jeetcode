import { Button, Chip } from '@mui/material';
import useChannelMembership from '../../common/channels/useChannelMembership';
import { CHANNEL_KINDS } from '../../common/channels/channelKinds';
import { RADII_PX } from '../../../../app/design/designTokens';

// Join / Leave for a group, Subscribe / Unsubscribe for a newsletter. The owner always belongs and sees a label instead.
export default function MembershipButton({ channel, onChange }) {
  const config = CHANNEL_KINDS[channel.kind];
  const { on, busy, toggle } = useChannelMembership(channel, onChange);
  if (channel.isOwner) return <Chip size="small" label="Owner" />;
  const label = on ? config.leaveLabel : config.joinLabel;
  return (
    <Button variant={on ? 'outlined' : 'contained'} disableElevation disabled={busy} onClick={toggle} aria-label={`${label} ${channel.name}`} sx={{ borderRadius: RADII_PX.pill, px: 2, flexShrink: 0 }}>
      {label}
    </Button>
  );
}
