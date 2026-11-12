import { useSelector } from 'react-redux';
import { Dialog } from '@mui/material';
import { LibraryFont } from '../../../../dashboard/components/libraryStyle';
import ChatComposer from './ChatComposer';
import ChatHeader from './ChatHeader';
import ChatThread from './ChatThread';
import useChatThread from './useChatThread';
import useThreadScroll from './useThreadScroll';

function ChatContent({ friend, onClose, actions }) {
  const me = useSelector((state) => state.auth.user);
  const thread = useChatThread(friend.userId);
  const scroll = useThreadScroll(thread.messages, thread.isFriendTyping, thread.isLoading);
  // Sending always jumps to the newest message, even when the reader had scrolled up.
  const sendAndFollow = (text) => {
    scroll.pinToLatest();
    return thread.send(text);
  };
  return (
    <>
      <ChatHeader friend={friend} isTyping={thread.isFriendTyping} onBack={onClose} actions={actions} />
      <ChatThread friend={friend} me={me} thread={thread} scroll={scroll} onOpenProfile={actions.openProfile} />
      <ChatComposer friend={friend} isSending={thread.isSending} onSend={sendAndFollow} onTyping={thread.notifyTyping} onInvitePairRoom={actions.invitePairRoom} />
    </>
  );
}

// One conversation, full screen on top of the inbox, in the LinkedIn layout. It is a Dialog like the inbox itself:
// a Drawer would open behind the full-screen inbox Dialog and the tap would seem to do nothing.
// `friend` is null while the chat is closed. `actions` = { openProfile, invitePairRoom, removeFriend }.
export default function ChatScreen({ friend, onClose, actions }) {
  return (
    <Dialog fullScreen open={Boolean(friend)} onClose={onClose} aria-label="Chat">
      <LibraryFont sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
        {friend && <ChatContent friend={friend} onClose={onClose} actions={actions} />}
      </LibraryFont>
    </Dialog>
  );
}
