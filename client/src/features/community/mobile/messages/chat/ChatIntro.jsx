import { ButtonBase, Typography } from '@mui/material';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../../../app/design/designTokens';
import { LIB_TRACKING } from '../../../../dashboard/components/libraryStyle';
import { PersonAvatar } from '../../../../friends/friendsUi';

// Start of the conversation: the friend's photo, name and handle. Tapping it opens their Job profile.
export default function ChatIntro({ friend, onOpenProfile }) {
  return (
    <ButtonBase onClick={onOpenProfile} aria-label={`View profile of ${friend.name}`} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, fontFamily: 'inherit', color: 'inherit', textAlign: 'left' }}>
      <PersonAvatar person={friend} size={SIZES.avatar.lg} />
      <Typography sx={{ fontSize: FONT_SIZES.subheading, lineHeight: '24px', letterSpacing: LIB_TRACKING, fontWeight: FONT_WEIGHTS.bold }}>{friend.name}</Typography>
      <Typography sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', color: 'var(--lib-muted)' }}>@{friend.handle}</Typography>
    </ButtonBase>
  );
}
