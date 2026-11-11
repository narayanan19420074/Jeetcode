import { Box, Tooltip } from '@mui/material';
import { UserAvatar } from '../../workspace/community/CommunityBits';
import { MOTION, RADII_PX, SIZES } from '../../../app/design/designTokens';

const AVATAR = SIZES.progressAvatar;
const HALF_AVATAR = AVATAR / 2;
// Bar and profile pictures share one scale, so a picture at 40% sits exactly where the bar is 40% full.
const positionOf = (percent) => `calc(${HALF_AVATAR}px + (100% - ${AVATAR}px) * ${percent / 100})`;

const trackSx = {
  position: 'absolute',
  left: HALF_AVATAR,
  right: HALF_AVATAR,
  top: '50%',
  height: SIZES.progressBarHeight,
  transform: 'translateY(-50%)',
  borderRadius: RADII_PX.pill,
  bgcolor: 'common.white',
  opacity: 0.3,
};

const fillSx = (percent) => ({
  position: 'absolute',
  left: HALF_AVATAR,
  top: '50%',
  width: `calc((100% - ${AVATAR}px) * ${percent / 100})`,
  height: SIZES.progressBarHeight,
  transform: 'translateY(-50%)',
  borderRadius: RADII_PX.pill,
  bgcolor: 'common.white',
  transition: `width ${MOTION.progress}ms ease`,
});

const markerSx = (member) => ({
  position: 'absolute',
  top: 0,
  left: positionOf(member.percent ?? 0),
  transform: 'translateX(-50%)',
  zIndex: member.isMe ? 2 : 1,
  lineHeight: 0,
  borderRadius: RADII_PX.circle,
  border: '2px solid',
  borderColor: 'common.white',
  transition: `left ${MOTION.progress}ms ease`,
});

// One bar for the whole plan: the fill is your progress and every member's profile picture stands at how much of the
// plan that member has completed.
export default function PlanProgressBar({ members, percent }) {
  return (
    <Box role="group" aria-label="Plan progress" sx={{ position: 'relative', height: AVATAR }}>
      <Box aria-hidden sx={trackSx} />
      <Box aria-hidden sx={fillSx(percent)} />
      {members.map((member) => (
        <Tooltip key={member.id} title={`${member.isMe ? 'You' : member.name}: ${member.percent ?? 0}%`}>
          <Box sx={markerSx(member)}>
            <UserAvatar user={member} size={AVATAR} />
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
}
