import { friendsApi } from '../../../../../api/friendsApi';
import { getFriendsSocket } from '../../../../friends/friendsRealtime';

const SOCKET_ACK_TIMEOUT_MS = 6000;
const ACK_TIMEOUT_ERROR = 'timeout';

function emitOverSocket(socket, friendId, text) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ ok: false, error: ACK_TIMEOUT_ERROR }), SOCKET_ACK_TIMEOUT_MS);
    socket.emit('dm:send', { to: friendId, text }, (reply) => {
      clearTimeout(timer);
      resolve(reply);
    });
  });
}

// Sends over the live connection so the friend sees it at once. When the connection is down, or does not answer in
// time, the message goes over plain HTTP so a slow socket never loses it. Resolves to the saved message.
export default async function sendChatMessage(friendId, text) {
  const socket = getFriendsSocket();
  if (socket?.connected) {
    const reply = await emitOverSocket(socket, friendId, text);
    if (reply.ok) return reply.message;
    if (reply.error !== ACK_TIMEOUT_ERROR) throw new Error(reply.error || 'Could not send the message.');
  }
  const { data } = await friendsApi.chatSend(friendId, text);
  return data.data.message;
}
