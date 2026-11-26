import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { COMMUNITY_INBOX_PARAM } from '../../common/communityChatLink';
import { isInboxTab } from './inboxTabs';

// Reads the tab of an inbox link (/community?inbox=requests), removes it from the address so a refresh does not open
// Messages again, and hands the tab to `onTabRequested`.
export default function useInboxLink(onTabRequested) {
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get(COMMUNITY_INBOX_PARAM);

  useEffect(() => {
    if (!requestedTab) return;
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.delete(COMMUNITY_INBOX_PARAM);
      return next;
    }, { replace: true });
    if (isInboxTab(requestedTab)) onTabRequested(requestedTab);
  }, [requestedTab, onTabRequested, setParams]);
}
