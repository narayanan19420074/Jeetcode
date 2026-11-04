import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// A shared link carries a code in the URL, but the login redirect only keeps the path. The code is remembered across
// login or sign-up, and the matching dashboard view reopens with it once the person is signed in.
function useRestoreCodeAfterLogin({ param, storageKey, view, isAuthenticated, params, setParams }) {
  useEffect(() => {
    const code = params.get(param);
    if (code && !isAuthenticated) sessionStorage.setItem(storageKey, code);
    if (!isAuthenticated) return;
    const pending = sessionStorage.getItem(storageKey);
    if (!pending) return;
    sessionStorage.removeItem(storageKey);
    setParams({ view, [param]: pending }, { replace: true });
  }, [param, storageKey, view, isAuthenticated, params, setParams]);
}

// Study-plan invite links (?join=CODE) reopen the Study Plan view with the join card.
// Friend invite links (?invite=handle) reopen the Friends view with the accept card.
export default function useShareLinkRedirects(isAuthenticated) {
  const [params, setParams] = useSearchParams();
  useRestoreCodeAfterLogin({ param: 'join', storageKey: 'jeetcode.pendingJoin', view: 'plans', isAuthenticated, params, setParams });
  useRestoreCodeAfterLogin({ param: 'invite', storageKey: 'jeetcode.pendingInvite', view: 'friends', isAuthenticated, params, setParams });
}
