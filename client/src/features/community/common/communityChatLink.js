// A link such as /community?chat=<memberId> opens the phone messages screen with the chat of that member. The Message
// button on another member's Job profile uses it.
export const COMMUNITY_CHAT_PARAM = 'chat';
export const communityChatPathOf = (memberId) => `/community?${COMMUNITY_CHAT_PARAM}=${memberId}`;

// A link such as /community?inbox=requests opens Messages (on phones, on that tab). Notifications about friend requests
// use it, because friend requests are answered in the Requests tab of Messages.
export const COMMUNITY_INBOX_PARAM = 'inbox';
export const communityInboxPathOf = (tab) => `/community?${COMMUNITY_INBOX_PARAM}=${tab}`;
