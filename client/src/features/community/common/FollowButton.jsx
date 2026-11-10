import { Button } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useFollowUser } from './usePostEngagement';
import { navActiveColor } from '../../../components/navbar/navLinkStyles';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

const followSx = (compact) => (theme) => ({
  flexShrink: 0,
  fontSize: compact ? FONT_SIZES.body : FONT_SIZES.subheading,
  fontWeight: FONT_WEIGHTS.semibold,
  textTransform: 'none',
  color: navActiveColor(theme),
  '& .MuiButton-startIcon > *:nth-of-type(1)': { fontSize: SIZES.iconSize.medium },
});

// "+ Follow" next to an author (a post header shows the icon, a comment row only the word). Nothing is shown for your own
// content or for anonymous posts, whose author is never revealed.
export default function FollowButton({ author, isOwn, isFollowing, compact = false }) {
  const follow = useFollowUser(author?._id, isFollowing);
  if (!author || isOwn) return null;
  const icon = follow.on ? <CheckRoundedIcon /> : <AddRoundedIcon />;
  return (
    <Button
      size="small"
      onClick={follow.toggle}
      disabled={follow.busy}
      aria-pressed={follow.on}
      aria-label={`${follow.on ? 'Unfollow' : 'Follow'} ${author.name}`}
      startIcon={compact ? undefined : icon}
      sx={followSx(compact)}
    >
      {follow.on ? 'Following' : 'Follow'}
    </Button>
  );
}
