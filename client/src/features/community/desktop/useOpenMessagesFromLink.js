import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { COMMUNITY_CHAT_PARAM, COMMUNITY_INBOX_PARAM } from '../common/communityChatLink';

// Chat and inbox links (/community?chat=<id>, /community?inbox=requests) open Messages on the desktop Community page. The
// chat id stays in the address because Messages reads it to select that chat; the inbox tab is only a request to open
// Messages, so it is removed. It acts once, so the person can close Messages afterwards.
export default function useOpenMessagesFromLink(showMessages) {
  const [params, setParams] = useSearchParams();
  const handled = useRef(false);
  const isLinkedToMessages = params.has(COMMUNITY_CHAT_PARAM) || params.has(COMMUNITY_INBOX_PARAM);

  useEffect(() => {
    if (handled.current || !isLinkedToMessages) return;
    handled.current = true;
    showMessages();
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.delete(COMMUNITY_INBOX_PARAM);
      return next;
    }, { replace: true });
  }, [isLinkedToMessages, showMessages, setParams]);
}
