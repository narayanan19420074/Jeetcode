import { Avatar, ButtonBase, Stack, Typography } from '@mui/material';
import { FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';
import { memberCountLabel } from '../../common/channels/channelKinds';
import { CHANNEL_ICONS } from './channelIcons';
import MembershipButton from './MembershipButton';

const DESCRIPTION_LINES = 2;
const clampSx = { display: '-webkit-box', WebkitLineClamp: DESCRIPTION_LINES, WebkitBoxOrient: 'vertical', overflow: 'hidden' };

function ChannelSummary({ channel, onOpen }) {
  return (
    <ButtonBase onClick={() => onOpen(channel)} sx={{ flex: 1, overflow: 'hidden', justifyContent: 'flex-start', textAlign: 'left', fontFamily: 'inherit', borderRadius: RADII_PX.control }}>
      <Stack sx={{ overflow: 'hidden' }}>
        <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold }}>{channel.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {memberCountLabel(channel.kind, channel.memberCount)}
        </Typography>
        {channel.description && <Typography variant="body2" color="text.secondary" sx={clampSx}>{channel.description}</Typography>}
      </Stack>
    </ButtonBase>
  );
}

// One group or newsletter in a list: open it by its name, join or subscribe with the button.
export default function ChannelRow({ channel, onOpen, onMembershipChange }) {
  const Icon = CHANNEL_ICONS[channel.kind];
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', p: 2 }}>
      <Avatar variant="rounded" sx={{ width: SIZES.avatar.post, height: SIZES.avatar.post, borderRadius: RADII_PX.control, bgcolor: 'action.selected', color: 'text.secondary' }}>
        <Icon />
      </Avatar>
      <ChannelSummary channel={channel} onOpen={onOpen} />
      <MembershipButton channel={channel} onChange={onMembershipChange} />
    </Stack>
  );
}
