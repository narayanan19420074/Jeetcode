import { useSelector } from 'react-redux';
import { Avatar, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { IconAction } from './ProfileCard';
import { initialsFromName } from '../../../components/navbar/navConfig';

// Name, photo and headline. The name, photo and location come from the account (Settings > Profile),
// the headline and the open-to-work flag from the Job profile.
export default function IdentityHeader({ editor }) {
  const user = useSelector((state) => state.auth.user);
  const { profile } = editor;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: RADII_PX.card }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Avatar src={user.avatarUrl || undefined} alt="" sx={{ width: SIZES.avatar.lg, height: SIZES.avatar.lg, fontSize: FONT_SIZES.heading, fontWeight: FONT_WEIGHTS.bold, bgcolor: 'primary.main' }}>
          {initialsFromName(user.name)}
        </Avatar>
        <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
          <Typography component="h1" variant="h6" sx={{ fontWeight: FONT_WEIGHTS.bold, wordBreak: 'break-word' }}>
            {user.name}
          </Typography>
          <Typography color={profile.headline ? 'text.primary' : 'text.secondary'}>{profile.headline || 'Add a headline to tell recruiters what you do.'}</Typography>
          <HeaderMeta location={user.location} openToWork={profile.openToWork} />
        </Box>
        <IconAction label="Edit intro" icon={EditRoundedIcon} onClick={editor.editIntro} />
      </Stack>
    </Paper>
  );
}

function HeaderMeta({ location, openToWork }) {
  if (!location && !openToWork) return null;
  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
      {location && <Chip size="small" icon={<PlaceRoundedIcon />} label={location} />}
      {openToWork && <Chip size="small" color="success" label="Open to work" />}
    </Stack>
  );
}
