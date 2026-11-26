import { useSelector } from 'react-redux';
import { Navigate, useSearchParams } from 'react-router-dom';
import { communityChatPathOf, communityInboxPathOf } from '../../community/common/communityChatLink';

const FIND_PLAYERS_PATH = '/dashboard?view=leaderboard';

// The dashboard no longer has a Friends page. Friends are found and added from the Leaderboard, and chats, friend
// requests and invites are handled in Messages, so old links (saved notifications, shared invite links, bookmarks) are
// forwarded: an invite link keeps its code for the invite dialog, a chat link opens that chat, and any other link opens
// the Requests tab when requests are waiting, otherwise the Leaderboard.
export default function LegacyFriendsRedirect() {
  const [params] = useSearchParams();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { incoming, loaded } = useSelector((state) => state.friends);
  const inviteHandle = params.get('invite');
  const chatMemberId = params.get('chat');

  if (inviteHandle) return <Navigate replace to={`/dashboard?invite=${encodeURIComponent(inviteHandle)}`} />;
  if (chatMemberId) return <Navigate replace to={communityChatPathOf(chatMemberId)} />;
  if (isAuthenticated && !loaded) return null; // wait for the friend requests, so the right page opens
  return <Navigate replace to={incoming.length > 0 ? communityInboxPathOf('requests') : FIND_PLAYERS_PATH} />;
}
