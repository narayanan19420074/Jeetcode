import { Link as RouterLink } from 'react-router-dom';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { UserAvatar } from '../../../workspace/community/CommunityBits';
import { jobProfilePathOf } from '../../../jobProfile/common/jobProfilePaths';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';
import MemberFollowButton from './MemberFollowButton';

const STRIP_SIZE = 4;

const cardSx = { width: SIZES.memberCardWidth, flexShrink: 0, p: 1.5, gap: 0.5, alignItems: 'center', textAlign: 'center', border: '1px solid', borderColor: 'var(--lib-divider)', borderRadius: RADII_PX.card };

function MemberCard({ member }) {
  return (
    <Stack sx={cardSx}>
      <ButtonBase component={RouterLink} to={jobProfilePathOf(member.userId)} aria-label={`View profile of ${member.name}`} sx={{ flexDirection: 'column', gap: 0.5, fontFamily: 'inherit', color: 'inherit', width: SIZES.fill }}>
        <UserAvatar user={member} size={SIZES.avatar.lg} />
        <Typography noWrap sx={{ maxWidth: SIZES.fill, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold }}>{member.name}</Typography>
        <Typography noWrap sx={{ maxWidth: SIZES.fill, fontSize: FONT_SIZES.caption, color: 'var(--lib-muted)' }}>{member.headline || `@${member.handle}`}</Typography>
      </ButtonBase>
      <MemberFollowButton member={member} />
    </Stack>
  );
}

// "People you may know": a swipeable row of suggested members shown between feed posts. Each place in the feed shows its
// own four members, so the same person is not offered twice. Nothing is drawn when there is nobody left to suggest.
export default function SuggestedMembersStrip({ members, slot }) {
  const shown = members.slice(slot * STRIP_SIZE, (slot + 1) * STRIP_SIZE);
  if (shown.length === 0) return null;
  return (
    <Box component="section" aria-label="People you may know" sx={{ bgcolor: 'background.paper', py: 1.5, px: 2 }}>
      <Typography component="h2" sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold, pb: 1 }}>People you may know</Typography>
      <Stack direction="row" sx={{ gap: 1, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
        {shown.map((member) => <MemberCard key={member.userId} member={member} />)}
      </Stack>
    </Box>
  );
}
