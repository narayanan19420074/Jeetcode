import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { UserAvatar, clamp } from '../../../workspace/community/CommunityBits';
import { FONT_SIZES, RADII_PX, SIZES } from '../../../../app/design/designTokens';

const PREVIEW_LINES = 2;
const mutedSx = { color: 'var(--lib-muted)', fontSize: FONT_SIZES.body };

const presenceDotSx = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: SIZES.presenceDot,
  height: SIZES.presenceDot,
  borderRadius: RADII_PX.circle,
  bgcolor: 'success.main',
  border: '2px solid',
  borderColor: 'background.paper',
};

function ConversationAvatar({ name, online }) {
  return (
    <Box sx={{ position: 'relative', flexShrink: 0, mt: 1.5 }}>
      <UserAvatar user={{ name }} size={SIZES.avatar.post} />
      {online && <Box role="img" aria-label="Online" sx={presenceDotSx} />}
    </Box>
  );
}

// One conversation: avatar with the online dot, name, last message and date. The divider starts at the text, like the list in the design.
export default function ConversationRow({ conversation }) {
  const { name, preview, date, online } = conversation;
  return (
    <ButtonBase component="li" sx={{ display: 'flex', alignItems: 'stretch', gap: 1.5, width: SIZES.fill, pl: 2, textAlign: 'left' }}>
      <ConversationAvatar name={name} online={online} />
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth, py: 1.5, pr: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Typography noWrap sx={{ fontSize: FONT_SIZES.title }}>{name}</Typography>
          <Typography sx={{ ...mutedSx, flexShrink: 0 }}>{date}</Typography>
        </Stack>
        <Typography sx={{ ...mutedSx, ...clamp(PREVIEW_LINES) }}>{preview}</Typography>
      </Box>
    </ButtonBase>
  );
}
