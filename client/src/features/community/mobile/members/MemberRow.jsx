import { Link as RouterLink } from 'react-router-dom';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { UserAvatar } from '../../../workspace/community/CommunityBits';
import { jobProfilePathOf } from '../../../jobProfile/common/jobProfilePaths';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../../app/design/designTokens';
import MemberFollowButton from './MemberFollowButton';

const profileLinkSx = { flex: 1, minWidth: SIZES.flexShrinkMinWidth, justifyContent: 'flex-start', gap: 1.5, textAlign: 'left', fontFamily: 'inherit', color: 'inherit' };

function MemberText({ member }) {
  return (
    <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
      <Typography noWrap sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold }}>{member.name}</Typography>
      <Typography noWrap sx={{ fontSize: FONT_SIZES.body, color: 'var(--lib-muted)' }}>{member.headline || `@${member.handle}`}</Typography>
    </Box>
  );
}

// One account in a list: photo, name and headline open the member's Job profile; Follow is on the right.
export default function MemberRow({ member }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, py: 1.5, borderBottom: '1px solid', borderColor: 'var(--lib-divider)' }}>
      <ButtonBase component={RouterLink} to={jobProfilePathOf(member.userId)} aria-label={`View profile of ${member.name}`} sx={profileLinkSx}>
        <UserAvatar user={member} size={SIZES.avatar.post} />
        <MemberText member={member} />
      </ButtonBase>
      <MemberFollowButton member={member} />
    </Stack>
  );
}
