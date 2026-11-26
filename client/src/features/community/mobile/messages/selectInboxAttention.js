import { selectUnreadTotal } from '../../../friends/friendsSlice';

// What needs the member's attention in Messages: unread messages plus friend requests waiting for an answer. It is the
// number on the messages button of the phone top bar.
export const selectInboxAttentionCount = (state) => selectUnreadTotal(state) + state.friends.incoming.length;
