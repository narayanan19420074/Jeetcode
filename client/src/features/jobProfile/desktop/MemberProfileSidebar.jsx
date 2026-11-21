import { Link as RouterLink } from 'react-router-dom';
import { ButtonBase, Paper, Stack, Typography } from '@mui/material';
import { UserAvatar } from '../../workspace/community/CommunityBits';
import useSuggestedMembers from '../../community/mobile/members/useSuggestedMembers';
import MemberFollowButton from '../../community/mobile/members/MemberFollowButton';
import { jobProfilePathOf } from '../common/jobProfilePaths';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const SUGGESTION_LIMIT = 5;

const cardSx = { p: 2, borderRadius: RADII_PX.card };

function FollowersCard({ count }) {
  return (
    <Paper variant="outlined" sx={cardSx}>
      <Typography component="p" sx={{ fontSize: FONT_SIZES.heading, fontWeight: FONT_WEIGHTS.bold }}>
        {count.toLocaleString()} <Typography component="span" color="text.secondary" sx={{ fontSize: FONT_SIZES.body }}>{count === 1 ? 'follower' : 'followers'}</Typography>
      </Typography>
    </Paper>
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
        <MemberFollowButton member={member} />
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

// Right column of another member's Job profile: how many people follow them, then members to follow next.
export default function MemberProfileSidebar({ editor }) {
  return (
    <Stack spacing={2}>
      <FollowersCard count={editor.followerCount} />
      <MoreProfilesCard ownerId={editor.owner._id} />
    </Stack>
  );
}
