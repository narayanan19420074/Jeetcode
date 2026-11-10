import { Button } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useFollowAuthor } from './usePostEngagement';
import { navActiveColor } from '../../../components/navbar/navLinkStyles';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';

const followSx = (theme) => ({
  flexShrink: 0,
  fontSize: FONT_SIZES.title,
  fontWeight: FONT_WEIGHTS.semibold,
  textTransform: 'none',
  color: navActiveColor(theme),
});

// "+ Follow" next to the author. Hidden for your own posts and for anonymous posts, whose author is never revealed.
export default function FollowButton({ post }) {
  const follow = useFollowAuthor(post);
  if (!post.author || post.isMine) return null;
  return (
    <Button
      size="small"
      onClick={follow.toggle}
      disabled={follow.busy}
      aria-pressed={follow.on}
      aria-label={`${follow.on ? 'Unfollow' : 'Follow'} ${post.author.name}`}
      startIcon={follow.on ? <CheckRoundedIcon /> : <AddRoundedIcon />}
      sx={followSx}
    >
      {follow.on ? 'Following' : 'Follow'}
    </Button>
  );
}
