import PostMenu from '../common/PostMenu';

const compactButtonSx = { p: 0.5 };

// The "..." menu at the top right of a phone post. "Not interested" and "Hide posts by the author" live inside it, so there is no separate dismiss button.
export default function PhoneHeaderActions({ post, onRemoved }) {
  return <PostMenu post={post} onRemoved={onRemoved} triggerSx={compactButtonSx} />;
}
