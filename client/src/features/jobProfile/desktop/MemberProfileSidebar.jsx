import { Link as RouterLink } from 'react-router-dom';
import { Button, ButtonBase, Paper, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { UserAvatar } from '../../workspace/community/CommunityBits';
import useSuggestedMembers from '../../community/mobile/members/useSuggestedMembers';
import { useFollowUser } from '../../community/common/usePostEngagement';
import { jobProfilePathOf } from '../common/jobProfilePaths';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const SUGGESTION_LIMIT = 5;

const cardSx = { p: 2, borderRadius: RADII_PX.card };

// Outlined pill like the Follow buttons of the profile suggestions on LinkedIn.
function SuggestedFollowButton({ member }) {
  const follow = useFollowUser(member.userId, member.isFollowing);
  const label = follow.on ? 'Following' : 'Follow';
  return (
    <Button variant="outlined" size="small" disabled={follow.busy} aria-pressed={follow.on} aria-label={`${label} ${member.name}`} startIcon={follow.on ? <CheckRoundedIcon /> : <AddRoundedIcon />} onClick={follow.toggle} sx={{ mt: 1, borderRadius: RADII_PX.pill, textTransform: 'none', fontWeight: FONT_WEIGHTS.semibold }}>
      {label}
    </Button>
  );
}

function SuggestedMemberRow({ member }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <UserAvatar user={member} size={SIZES.avatar.lg} />
      <Stack sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1, alignItems: 'flex-start' }}>
        <ButtonBase component={RouterLink} to={jobProfilePathOf(member.userId)} aria-label={`View profile of ${member.name}`} sx={{ display: 'block', maxWidth: SIZES.fill, textAlign: 'left', fontFamily: 'inherit', color: 'inherit' }}>
          <Typography noWrap sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.semibold }}>{member.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {member.headline || `@${member.handle}`}
          </Typography>
        </ButtonBase>
        <SuggestedFollowButton member={member} />
      </Stack>
    </Stack>
  );
}

// Other members the viewer may want to follow, never the member whose profile is open.
function MoreProfilesCard({ ownerId }) {
  const { items } = useSuggestedMembers(true);
  const members = items.filter((member) => member.userId !== String(ownerId)).slice(0, SUGGESTION_LIMIT);
  if (members.length === 0) return null;
  return (
    <Paper component="section" aria-label="More profiles for you" variant="outlined" sx={cardSx}>
      <Typography component="h2" sx={{ fontSize: FONT_SIZES.heading, fontWeight: FONT_WEIGHTS.bold, mb: 2 }}>More profiles for you</Typography>
      <Stack spacing={2}>
        {members.map((member) => <SuggestedMemberRow key={member.userId} member={member} />)}
      </Stack>
    </Paper>
  );
}

// Right column of another member's Job profile: members to follow next. It is hidden when printing the profile.
export default function MemberProfileSidebar({ editor }) {
  return (
    <Stack data-print-hide spacing={2}>
      <MoreProfilesCard ownerId={editor.owner._id} />
    </Stack>
  );
}
