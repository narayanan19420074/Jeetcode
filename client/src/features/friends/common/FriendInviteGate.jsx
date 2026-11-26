import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import FriendInviteDialog from './FriendInviteDialog';

const INVITE_PARAM = 'invite';

// Shared friend invite links (?invite=handle) work on any page: once the person is signed in, the link is read, removed
// from the address so a refresh does not ask again, and the accept dialog opens. Signed-out visitors keep the link until
// they sign in (the dashboard remembers it across login).
export default function FriendInviteGate() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [params, setParams] = useSearchParams();
  const [handle, setHandle] = useState(null);
  const invitedBy = params.get(INVITE_PARAM);

  useEffect(() => {
    if (!invitedBy || !isAuthenticated) return;
    setHandle(invitedBy);
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.delete(INVITE_PARAM);
      return next;
    }, { replace: true });
  }, [invitedBy, isAuthenticated, setParams]);

  return handle ? <FriendInviteDialog handle={handle} onClose={() => setHandle(null)} /> : null;
}
