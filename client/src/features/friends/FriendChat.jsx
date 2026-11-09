import { Drawer } from '@mui/material';
import { LibraryFont, useLibraryPalette } from '../dashboard/components/libraryStyle';
import { ChatPanel } from './chat/ChatPanel';
export { ChatPanel } from './chat/ChatPanel';

// Right-side drawer (full screen on phones) that hosts one friend's chat.
// `lib` = phone Library look: cream surface, Roboto, and the Library header and composer.
export default function FriendChat({ friend, onClose, onCodeTogether, actions, overlay, lib = false, ...libProps }) {
  const pal = useLibraryPalette();
  const panel = friend && (
    <ChatPanel key={friend.userId} friend={friend} onClose={onClose} onCodeTogether={() => onCodeTogether(friend)} actions={actions} overlay={overlay} lib={lib} {...libProps} />
  );
  return (
    <Drawer
      anchor="right"
      open={Boolean(friend)}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 440 }, maxWidth: '100%', backgroundImage: 'none', ...(lib && { bgcolor: pal.bg }) } } }}
    >
      {lib && panel ? <LibraryFont sx={{ height: '100%', minHeight: 0 }}>{panel}</LibraryFont> : panel}
    </Drawer>
  );
}
