import { Avatar, Box, Button, Chip, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { BANNER_GRADIENT } from '../../dashboard/bannerGradients';
import { initialsFromName } from '../../../components/navbar/navConfig';
import AddSectionMenu from './AddSectionMenu';
import { IconAction } from './ProfileCard';

// Current company and latest school, shown under the headline like the LinkedIn top card.
const organizationLine = ({ experience, education }) => {
  const currentJob = experience.find((job) => job.isCurrent) ?? experience[0];
  return [currentJob?.company, education[0]?.school].filter(Boolean).join(' · ');
};

function ProfilePhoto({ user }) {
  return (
    <Avatar
      src={user.avatarUrl || undefined}
      alt=""
      sx={{ width: SIZES.avatar.xl, height: SIZES.avatar.xl, mt: -7, ml: 2, border: '4px solid', borderColor: 'background.paper', fontSize: FONT_SIZES.display, fontWeight: FONT_WEIGHTS.bold, bgcolor: 'primary.main' }}
    >
      {initialsFromName(user.name)}
    </Avatar>
  );
}

function HeaderText({ user, profile, readOnly }) {
  return (
    <Box sx={{ px: 2, pb: 2 }}>
      <Typography component="h1" variant="h5" sx={{ fontWeight: FONT_WEIGHTS.bold, wordBreak: 'break-word' }}>
        {user.name}
      </Typography>
      <Typography sx={{ mt: 0.5 }} color={profile.headline ? 'text.primary' : 'text.secondary'}>
        {profile.headline || (readOnly ? (user.handle && `@${user.handle}`) : 'Add a headline to tell recruiters what you do.')}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {organizationLine(profile)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {user.location}
      </Typography>
    </Box>
  );
}

// Another member's profile only says whether they are open to work.
function OpenToWorkNote({ isOpen }) {
  if (!isOpen) return null;
  return (
    <Box sx={{ px: 2, pb: 2 }}>
      <Chip label="Open to work" color="success" size="small" />
    </Box>
  );
}

function OwnerActions({ editor }) {
  return (
    <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2 }}>
      <Button variant="contained" disableElevation fullWidth onClick={editor.editIntro}>
        {editor.profile.openToWork ? 'Open to work' : 'Open to'}
      </Button>
      <AddSectionMenu editor={editor} />
    </Stack>
  );
}

// Banner, round photo, name, headline, organisation, location and the two action buttons.
export default function IdentityHeader({ editor }) {
  const { owner: user, profile, readOnly } = editor;
  const isMobile = useMediaQuery(useTheme().breakpoints.down('md'));

  return (
    <Paper variant={isMobile ? 'elevation' : 'outlined'} elevation={0} sx={{ overflow: 'hidden', borderRadius: isMobile ? RADII_PX.square : RADII_PX.card }}>
      <Box sx={{ height: SIZES.profileBannerHeight, background: BANNER_GRADIENT.visualizer }} />
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', pr: 1 }}>
        <ProfilePhoto user={user} />
        {!readOnly && <IconAction label="Edit intro" icon={EditRoundedIcon} onClick={editor.editIntro} />}
      </Stack>
      <HeaderText user={user} profile={profile} readOnly={readOnly} />
      {readOnly ? <OpenToWorkNote isOpen={profile.openToWork} /> : <OwnerActions editor={editor} />}
    </Paper>
  );
}
