import { useDispatch } from 'react-redux';
import { fetchChatOverview } from '../../friends/friendsSlice';
import ChatScreen from '../../community/mobile/messages/chat/ChatScreen';
import { toChatPerson } from '../../community/mobile/messages/useChatLink';

// Desktop: a conversation with the member whose Job profile is open, in a window on top of the profile. A first message
// creates a conversation, so the inbox reloads when the window closes.
export default function MemberChatDialog({ owner, open, onClose }) {
  const dispatch = useDispatch();
  const close = () => {
    onClose();
    dispatch(fetchChatOverview());
  };
  // The chat menu's "View profile" has nothing to open here: the profile is already behind the window.
  return <ChatScreen fullScreen={false} friend={open ? toChatPerson(owner) : null} onClose={close} actions={{ openProfile: close }} />;
}
