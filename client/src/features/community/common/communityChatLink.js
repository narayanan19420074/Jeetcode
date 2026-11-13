// A link such as /community?chat=<memberId> opens the phone messages screen with the chat of that member. The Message
// button on another member's Job profile uses it.
export const COMMUNITY_CHAT_PARAM = 'chat';
export const communityChatPathOf = (memberId) => `/community?${COMMUNITY_CHAT_PARAM}=${memberId}`;
