import FollowButton from '../../common/FollowButton';

// Follow button of a member card. It reuses the feed's Follow button, which expects the author shape of a post.
export default function MemberFollowButton({ member }) {
  return <FollowButton author={{ _id: member.userId, name: member.name }} isFollowing={member.isFollowing} />;
}
