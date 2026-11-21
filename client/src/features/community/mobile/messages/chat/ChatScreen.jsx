import { useSelector } from 'react-redux';
import { Dialog } from '@mui/material';
import { LibraryFont } from '../../../../dashboard/components/libraryStyle';
import { SIZES } from '../../../../../app/design/designTokens';
import ChatComposer from './ChatComposer';
import ChatErrorBoundary from './ChatErrorBoundary';
import ChatHeader from './ChatHeader';
import ChatThread from './ChatThread';
import useChatThread from './useChatThread';
import useThreadScroll from './useThreadScroll';

// Desktop: the chat is a window of its own size instead of the whole screen.
const windowedPaperSx = { width: SIZES.memberChatDialog.width, height: SIZES.memberChatDialog.height, maxWidth: SIZES.fill, maxHeight: SIZES.fill };

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

// One conversation, full screen on phones (`fullScreen`) or a window on desktop, on top of the inbox, in the LinkedIn layout. It is a Dialog like the inbox itself:
// a Drawer would open behind the full-screen inbox Dialog and the tap would seem to do nothing.
// `friend` is null while the chat is closed. `actions` = { openProfile, invitePairRoom, removeFriend }.
export default function ChatScreen({ friend, onClose, actions, fullScreen = true }) {
  return (
    <Dialog fullScreen={fullScreen} open={Boolean(friend)} onClose={onClose} aria-label="Chat" slotProps={fullScreen ? undefined : { paper: { sx: windowedPaperSx } }}>
      <LibraryFont sx={{ flexGrow: 1, minHeight: SIZES.flexShrinkMinHeight, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
        {friend && (
          <ChatErrorBoundary key={friend.userId} onClose={onClose}>
            <ChatContent friend={friend} onClose={onClose} actions={actions} />
          </ChatErrorBoundary>
        )}
      </LibraryFont>
    </Dialog>
  );
}
