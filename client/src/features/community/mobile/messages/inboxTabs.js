export const INBOX_TAB = { primary: 'primary', general: 'general', requests: 'requests' };

export const INBOX_TAB_OPTIONS = [
  { value: INBOX_TAB.primary, label: 'Primary' },
  { value: INBOX_TAB.general, label: 'General' },
  { value: INBOX_TAB.requests, label: 'Requests' },
];

// Which tab a conversation belongs to. Friends are Primary. A member who is not a friend is General once I have written
// to them (I started the chat or I answered), and stays a Requests entry until I answer, so a stranger's first messages
// never mix with the people I chose to talk to. Replying is what accepts a request.
export function inboxTabOf({ isFriend, hasMessagedThem, lastMessageFrom, myId }) {
  if (isFriend) return INBOX_TAB.primary;
  return hasMessagedThem || lastMessageFrom === myId ? INBOX_TAB.general : INBOX_TAB.requests;
}

export const EMPTY_INBOX_COPY = {
  [INBOX_TAB.primary]: { title: 'No conversations yet', hint: 'Add friends to start chatting with them.' },
  [INBOX_TAB.general]: { title: 'No general conversations', hint: 'Members who are not your friends appear here after you message them.' },
  [INBOX_TAB.requests]: { title: 'No message requests', hint: 'When a member who is not your friend messages you, it appears here until you reply.' },
};
