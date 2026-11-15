import { useState } from 'react';

const FEED_SECTION = { type: 'feed' };

// Which page fills the middle column of the desktop Community page: the post feed, the list of groups or newsletters,
// or one group or newsletter. `kind` is remembered so that Back returns to the right list.
export default function useDesktopSection() {
  const [section, setSection] = useState(FEED_SECTION);
  return {
    section,
    showFeed: () => setSection(FEED_SECTION),
    showChannelList: (kind) => setSection({ type: 'list', kind }),
    showChannel: (channelId, kind) => setSection({ type: 'channel', channelId, kind }),
  };
}
