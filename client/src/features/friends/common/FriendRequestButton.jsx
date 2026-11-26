import { useSelector } from 'react-redux';
import { Button, Typography } from '@mui/material';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import { acceptFriendRequest, sendFriendRequest } from '../friendsSlice';
import { useFriendAction } from '../desktop/useFriendAction';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';
import useFriendStatus from './useFriendStatus';

function StatusLabel({ text }) {
  return <Typography sx={{ flexShrink: 0, px: 1, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold, color: 'text.secondary' }}>{text}</Typography>;
}

// Friend request control of a member in the search results and the Leaderboard. Friends and pending requests show a plain
// label, so the same person is never asked twice (the server rejects duplicate requests as well). `member` needs
// `userId`, `handle` and `name`.
export default function FriendRequestButton({ member }) {
  const myId = useSelector((state) => state.auth.user?.id);
  const { status, requestId } = useFriendStatus(member.userId);
  const { busy, run } = useFriendAction();
  if (!myId || member.userId === myId) return null; // signed-out visitors cannot send requests, and nobody befriends themselves
  if (status === 'friend') return <StatusLabel text="Friends" />;
  if (status === 'sent') return <StatusLabel text="Request sent" />;
  const isAccepting = status === 'received';
  const submit = () => (isAccepting ? run(requestId, acceptFriendRequest(requestId), 'Friend added') : run(member.userId, sendFriendRequest(member.handle), 'Friend request sent'));
  return (
    <Button size="small" disabled={Boolean(busy)} onClick={submit} startIcon={isAccepting ? undefined : <PersonAddAlt1RoundedIcon />} aria-label={`${isAccepting ? 'Accept friend request from' : 'Send friend request to'} ${member.name}`} sx={{ flexShrink: 0, textTransform: 'none', fontWeight: FONT_WEIGHTS.semibold }}>
      {isAccepting ? 'Accept' : 'Add friend'}
    </Button>
  );
}
