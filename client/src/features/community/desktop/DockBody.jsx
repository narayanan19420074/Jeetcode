import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Box } from '@mui/material';
import { ChatPanel } from '../../friends/chat/ChatPanel';
import { friendsApi } from '../../../api/friendsApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { SIZES } from '../../../app/design/designTokens';
import ConversationList from './ConversationList';

// "Code together" from inside a chat: invite the friend and open the room, as the Friends page does.
function useCodeTogether() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  return async (friend) => {
    try {
      const { data } = await friendsApi.roomInvite(friend.userId);
      enqueueSnackbar(`Invite sent to @${friend.handle}`, { variant: 'success' });
      navigate(`/room/${data.data.roomId}`);
    } catch (error) {
      enqueueSnackbar(extractErrorMessage(error), { variant: 'error' });
    }
  };
}

// What the open dock shows: the conversation list, or one friend's chat after a tap (close returns to the list).
export default function DockBody() {
  const friends = useSelector((state) => state.friends.friends);
  const [chatId, setChatId] = useState(null);
  const codeTogether = useCodeTogether();
  const friend = friends.find((item) => item.userId === chatId);

  if (!friend) return <ConversationList onOpen={setChatId} />;
  return (
    <Box sx={{ flex: 1, minHeight: SIZES.flexShrinkMinHeight, display: 'flex', flexDirection: 'column' }}>
      <ChatPanel key={friend.userId} friend={friend} onClose={() => setChatId(null)} onCodeTogether={() => codeTogether(friend)} />
    </Box>
  );
}
