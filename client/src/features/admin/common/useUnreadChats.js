import { useEffect, useState } from 'react';
import { adminApi } from '../../../api/adminApi';

const REFRESH_INTERVAL_MS = 30000;

// Unread live-chat count for the sidebar and menu badges. Refreshes every
// 30 seconds, and skips the request while the browser tab is hidden.
export default function useUnreadChats() {
  const [unreadChats, setUnreadChats] = useState(0);

  useEffect(() => {
    const load = () => {
      if (document.hidden) return;
      adminApi
        .listChats({ status: 'open', limit: 1 })
        .then(({ data }) => setUnreadChats(data.data.unreadChats))
        .catch(() => {});
    };
    load();
    const timerId = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(timerId);
  }, []);

  return unreadChats;
}
