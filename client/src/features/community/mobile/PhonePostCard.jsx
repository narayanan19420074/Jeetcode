import RichPostCard from '../common/RichPostCard';
import PhonePostHeader from './PhonePostHeader';
import ReactionStack from './ReactionStack';

// The feed post as drawn on phones: the shared card with the phone header and the reaction stack under the post.
export default function PhonePostCard({ post, onRemoved }) {
  return <RichPostCard post={post} onRemoved={onRemoved} Header={PhonePostHeader} engagementTrailing={<ReactionStack />} />;
}
