import { Box, Button, Stack, Typography } from '@mui/material';
import { PersonAvatar } from '../../../friends/friendsUi';
import { acceptFriendRequest, declineFriendRequest } from '../../../friends/friendsSlice';
import { useFriendAction } from '../../../friends/desktop/useFriendAction';
import { LIB_TRACKING, libCompactSolidBtnSx, libCompactTintBtnSx } from '../../../dashboard/components/libraryStyle';
import { FONT_SIZES, SIZES } from '../../../../app/design/designTokens';

const AVATAR_GAP = 1.5;

// A friend request in the Requests tab: who is asking, with Accept and Decline. Accepting moves the member to Primary.
export default function FriendRequestRow({ request }) {
  const { requestId, user } = request;
  const { busy, run } = useFriendAction();
  const accept = () => run(requestId, acceptFriendRequest(requestId), 'Friend added');
  const decline = () => run(requestId, declineFriendRequest(requestId), 'Friend request declined');
  return (
    <Stack direction="row" sx={{ alignItems: 'flex-start', gap: AVATAR_GAP, py: 1.5, borderBottom: '1px solid', borderColor: 'var(--lib-divider)' }}>
      <PersonAvatar person={user} size={SIZES.avatar.post} />
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.title, lineHeight: 1.4, letterSpacing: LIB_TRACKING }}>{user.name}</Typography>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>@{user.handle} sent you a friend request</Typography>
        <Stack direction="row" sx={{ gap: 1, mt: 1 }}>
          <Button disabled={Boolean(busy)} onClick={accept} aria-label={`Accept friend request from ${user.name}`} sx={libCompactSolidBtnSx}>Accept</Button>
          <Button disabled={Boolean(busy)} onClick={decline} aria-label={`Decline friend request from ${user.name}`} sx={libCompactTintBtnSx}>Decline</Button>
        </Stack>
      </Box>
    </Stack>
  );
}
