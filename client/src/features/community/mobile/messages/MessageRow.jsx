import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { PersonAvatar } from '../../../friends/friendsUi';
import { previewOf, shortTime } from '../../../friends/friendsKit';
import { LIB_TRACKING, LIB_ACCENT } from '../../../dashboard/components/libraryStyle';
import { clamp } from '../../../workspace/community/CommunityBits';
import UnreadBadge from '../../common/UnreadBadge';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../../app/design/designTokens';

const PREVIEW_LINES = 2;
const AVATAR_GAP = 1.5;
// The divider starts under the text, not under the photo, like the LinkedIn inbox.
const rowSx = {
  position: 'relative',
  '&::after': { content: '""', position: 'absolute', bottom: 0, right: 0, left: (theme) => `calc(${SIZES.avatar.post}px + ${theme.spacing(AVATAR_GAP)})`, borderBottom: '1px solid', borderColor: 'var(--lib-divider)' },
  '&:last-of-type::after': { display: 'none' },
};
const buttonSx = { width: SIZES.fill, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: AVATAR_GAP, py: 1.5, textAlign: 'left', fontFamily: 'inherit', color: 'inherit' };

// One conversation of the phone inbox: photo with online dot, name and time on the first line, then the latest message
// (two lines at most) with the unread count at its right. Unread conversations are bold.
export default function MessageRow({ friend, last, unread, online, myId, onOpen }) {
  const preview = last ? previewOf(last, myId) : `@${friend.handle}`;
  return (
    <Box data-fid={friend.userId} sx={rowSx}>
      <ButtonBase onClick={onOpen} aria-label={`Chat with ${friend.name}${unread ? `, ${unread} unread` : ''}`} sx={buttonSx}>
        <PersonAvatar person={friend} size={SIZES.avatar.post} online={online} />
        <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1 }}>
            <Typography noWrap sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth, fontSize: FONT_SIZES.title, lineHeight: 1.4, letterSpacing: LIB_TRACKING, fontWeight: unread ? FONT_WEIGHTS.bold : FONT_WEIGHTS.regular }}>{friend.name}</Typography>
            {last && <Typography sx={{ flexShrink: 0, fontSize: FONT_SIZES.body, color: unread ? LIB_ACCENT : 'var(--lib-muted)', fontWeight: unread ? FONT_WEIGHTS.bold : FONT_WEIGHTS.regular }}>{shortTime(last.at)}</Typography>}
          </Stack>
          <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1 }}>
            <Typography sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth, fontSize: FONT_SIZES.bodyLg, lineHeight: 1.4, letterSpacing: LIB_TRACKING, color: unread ? 'var(--lib-text)' : 'var(--lib-muted)', fontWeight: unread ? FONT_WEIGHTS.medium : FONT_WEIGHTS.regular, ...clamp(PREVIEW_LINES) }}>{preview}</Typography>
            <UnreadBadge count={unread} sx={{ mt: 0.25 }} />
          </Stack>
        </Box>
      </ButtonBase>
    </Box>
  );
}
