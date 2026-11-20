import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import FriendsView from '../../friends/FriendsView';
import { SIZES } from '../../../app/design/designTokens';

const ignoreInviteLink = () => {};

// Messages as a page of its own: it takes the whole area under the toolbar, in the same page width as the Community
// columns. It is the same component as the Friends page (friends, requests, find players and the chat with the
// selected friend), so both always agree.
export default function MessagesPanel() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  return (
    <Container maxWidth={false} sx={{ maxWidth: SIZES.dashboardMaxWidth, py: 3, px: 3 }}>
      <FriendsView isAuthenticated={isAuthenticated} user={user} inviteHandle={null} onClearInvite={ignoreInviteLink} onOpenLeaderboard={() => navigate('/dashboard?view=leaderboard&scope=friends')} />
    </Container>
  );
}
