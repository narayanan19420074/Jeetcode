import { useState } from 'react';

const FEED_SECTION = { type: 'feed' };
const MESSAGES_SECTION = { type: 'messages' };

// Which page the desktop Community page shows: the post feed, the list of groups or newsletters, one group or
// newsletter (all in the middle column), or Messages (the whole area under the toolbar). `kind` is remembered so that Back returns to the right list.
export default function useDesktopSection() {
  const [section, setSection] = useState(FEED_SECTION);
  return {
    section,
    showFeed: () => setSection(FEED_SECTION),
    // The Messages icon works as a switch: a second click returns to the feed.
    toggleMessages: () => setSection((current) => (current.type === 'messages' ? FEED_SECTION : MESSAGES_SECTION)),
    showChannelList: (kind) => setSection({ type: 'list', kind }),
    showChannel: (channelId, kind) => setSection({ type: 'channel', channelId, kind }),
  };
}
