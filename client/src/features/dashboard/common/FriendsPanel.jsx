import { useSearchParams } from 'react-router-dom';
import FriendsView from '../../friends/FriendsView';

// Friends view of the dashboard. A friend invite link opens it with ?invite=handle, which the accept card reads and clears.
export default function FriendsPanel({ isAuthenticated, user }) {
  const [params, setParams] = useSearchParams();
  return (
    <FriendsView
      isAuthenticated={isAuthenticated}
      user={user}
      inviteHandle={params.get('invite')}
      onClearInvite={() => setParams({ view: 'friends' }, { replace: true })}
      onOpenLeaderboard={() => setParams({ view: 'leaderboard', scope: 'friends' })}
    />
  );
}
