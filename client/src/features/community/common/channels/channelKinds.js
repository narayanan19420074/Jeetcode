export const CHANNEL_NAME_MIN = 3;
export const CHANNEL_NAME_MAX = 60;
export const CHANNEL_DESCRIPTION_MAX = 300;

// Wording and rules that differ between a group and a newsletter. A group is discussed by its members; a newsletter is
// written by its owner and read by subscribers.
export const CHANNEL_KINDS = {
  group: {
    kind: 'group',
    title: 'Groups',
    singular: 'group',
    memberNouns: ['member', 'members'],
    joinLabel: 'Join',
    leaveLabel: 'Leave',
    createLabel: 'Create group',
    namePlaceholder: 'For example: Backend interview prep',
    emptyDiscover: { title: 'No groups yet', text: 'Create the first group to discuss a topic with other members.' },
    emptyMine: { title: 'You have not joined any groups', text: 'Join a group from Discover or create your own.' },
    emptyPosts: { title: 'No posts in this group yet', text: 'Members can start the first conversation.' },
  },
  newsletter: {
    kind: 'newsletter',
    title: 'Newsletters',
    singular: 'newsletter',
    memberNouns: ['subscriber', 'subscribers'],
    joinLabel: 'Subscribe',
    leaveLabel: 'Unsubscribe',
    createLabel: 'Create newsletter',
    namePlaceholder: 'For example: Weekly system design notes',
    emptyDiscover: { title: 'No newsletters yet', text: 'Create a newsletter to publish updates to your subscribers.' },
    emptyMine: { title: 'You are not subscribed to any newsletters', text: 'Subscribe from Discover or create your own.' },
    emptyPosts: { title: 'No issues published yet', text: 'New issues will appear here.' },
  },
};

export const memberCountLabel = (kind, count) => {
  const [singular, plural] = CHANNEL_KINDS[kind].memberNouns;
  return `${count} ${count === 1 ? singular : plural}`;
};

// Mirrors the server rule: every group member may post, but only the owner publishes a newsletter.
export const canPublishTo = (channel) => (channel.kind === 'newsletter' ? channel.isOwner : channel.isMember);

// Keeps the counter in step with what the server did after a join or leave, without reloading the list.
export const applyMembershipChange = (channel, joined) => ({
  ...channel,
  isMember: joined,
  memberCount: Math.max(0, channel.memberCount + (joined ? 1 : -1)),
});
