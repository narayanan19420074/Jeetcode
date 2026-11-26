import { useSelector } from 'react-redux';

// Where one member stands with the signed-in person: already a friend, a request is waiting for the member to accept
// ('sent'), the member asked first and the person can accept ('received'), or nothing yet ('none').
export default function useFriendStatus(userId) {
  const { friends, incoming, outgoing } = useSelector((state) => state.friends);
  if (friends.some((friend) => friend.userId === userId)) return { status: 'friend' };
  if (outgoing.some((request) => request.user.userId === userId)) return { status: 'sent' };
  const received = incoming.find((request) => request.user.userId === userId);
  return received ? { status: 'received', requestId: received.requestId } : { status: 'none' };
}
