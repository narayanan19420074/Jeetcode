import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getFriendsSocket } from '../../../../friends/friendsRealtime';
import { addUnique } from '../../../../friends/chat/chatShared';

const TYPING_INDICATOR_MS = 3000;

const belongsToChat = (message, friendId) => message.from === friendId || message.to === friendId;

// When the friend opens the chat they have read everything you sent, so your unread ticks become "seen".
const markOwnMessagesSeen = (myId) => (messages) => messages.map((message) => (message.from === myId && !message.readAt ? { ...message, readAt: new Date().toISOString() } : message));

function bindSocketEvents(socket, handlers) {
  Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
  return () => Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
}

// Live events of one conversation: new messages, "seen" receipts and the friend's typing indicator.
// Returns whether the friend is typing right now.
export default function useChatLive(friendId, setMessages, markRead) {
  const myId = useSelector((state) => state.auth.user?.id);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef(null);

  useEffect(() => {
    const socket = getFriendsSocket();
    if (!socket) return undefined;
    const unbind = bindSocketEvents(socket, {
      'dm:new': (message) => {
        if (!belongsToChat(message, friendId)) return;
        setMessages((previous) => addUnique(previous, message));
        if (message.from === friendId) {
          setIsTyping(false);
          markRead();
        }
      },
      'dm:read': ({ by }) => by === friendId && setMessages(markOwnMessagesSeen(myId)),
      'dm:typing': ({ from }) => {
        if (from !== friendId) return;
        setIsTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setIsTyping(false), TYPING_INDICATOR_MS);
      },
    });
    return () => {
      unbind();
      clearTimeout(typingTimer.current);
    };
  }, [friendId, myId, setMessages, markRead]);

  return isTyping;
}
