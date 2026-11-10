import { Box, Dialog, Fab } from '@mui/material';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import { LibraryFont } from '../../../dashboard/components/libraryStyle';
import { navActiveColor } from '../../../../components/navbar/navLinkStyles';
import MessagesTopBar from './MessagesTopBar';
import MessageFilterChips from './MessageFilterChips';
import ConversationRow from './ConversationRow';
import { SAMPLE_CONVERSATIONS } from './messagesSample';

const composeFabSx = (theme) => ({
  position: 'fixed',
  right: theme.spacing(2),
  bottom: `calc(${theme.spacing(3)} + env(safe-area-inset-bottom))`,
  bgcolor: navActiveColor(theme),
  color: theme.palette.common.white,
  '&:hover': { bgcolor: navActiveColor(theme) },
});

// Full-screen inbox opened from the messages button: search, filters and the conversation list.
// The dialog is a portal, so it wraps its content in LibraryFont again to get the page fonts and colours.
export default function MessagesScreen({ open, onClose }) {
  return (
    <Dialog fullScreen open={open} onClose={onClose} aria-label="Messages">
      <LibraryFont sx={{ flexGrow: 1, bgcolor: 'background.paper' }}>
        <MessagesTopBar onBack={onClose} />
        <MessageFilterChips />
        <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', borderTop: '1px solid', borderColor: 'divider' }}>
          {SAMPLE_CONVERSATIONS.map((conversation) => (
            <ConversationRow key={conversation.id} conversation={conversation} />
          ))}
        </Box>
        <Fab aria-label="New message" sx={composeFabSx}><EditNoteRoundedIcon /></Fab>
      </LibraryFont>
    </Dialog>
  );
}
