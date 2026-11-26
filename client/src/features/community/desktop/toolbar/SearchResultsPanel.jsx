import { useSelector } from 'react-redux';
import { Divider, Paper } from '@mui/material';
import MemberRow from '../../mobile/members/MemberRow';
import useMemberSearch from '../../mobile/members/useMemberSearch';
import { SIZES, Z_INDEX } from '../../../../app/design/designTokens';
import FriendRequestButton from '../../../friends/common/FriendRequestButton';
import PostResultRow from './PostResultRow';
import SearchSection from './SearchSection';
import usePostSearch from './usePostSearch';

const MAX_MEMBERS_SHOWN = 5;
const panelSx = { position: 'absolute', top: SIZES.fill, left: 0, right: 0, mt: 0.5, zIndex: Z_INDEX.header, maxHeight: SIZES.communityToolbar.resultsMaxHeight, overflowY: 'auto' };

const renderMember = (member) => <MemberRow key={member.userId} member={member} extraAction={<FriendRequestButton member={member} />} />;
const renderPost = (post) => <PostResultRow key={post._id} post={post} />;

// Dropdown under the toolbar search field. Members can be followed or sent a friend request right here; posts open on
// click. Searching members is for signed-in people only, so guests see the posts block alone.
export default function SearchResultsPanel({ query }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const members = useMemberSearch(isAuthenticated ? query : '');
  const posts = usePostSearch(query);
  const memberState = { ...members, items: members.items.slice(0, MAX_MEMBERS_SHOWN) };
  return (
    <Paper elevation={8} role="region" aria-label="Search results" sx={panelSx}>
      {isAuthenticated && <SearchSection title="Members" state={memberState} emptyText="No members match your search." renderItem={renderMember} />}
      {isAuthenticated && <Divider />}
      <SearchSection title="Posts" state={posts} emptyText="No posts match your search." renderItem={renderPost} />
    </Paper>
  );
}
