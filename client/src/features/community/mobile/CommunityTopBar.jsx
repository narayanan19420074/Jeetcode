import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { IconButton, Stack } from '@mui/material';
import { PostAvatar } from '../common/PostAuthor';
import { OWN_JOB_PROFILE_PATH } from '../../jobProfile/common/jobProfilePaths';
import SearchField from './SearchField';
import MessagesButton from './messages/MessagesButton';
import { SIZES } from '../../../app/design/designTokens';

// Your photo opens your own Job profile, the same way an author's photo on a post opens theirs.
function OwnProfileLink({ user }) {
  return (
    <IconButton component={RouterLink} to={OWN_JOB_PROFILE_PATH} aria-label="View your Job profile" sx={{ p: 0 }}>
      <PostAvatar author={user} size={SIZES.avatar.sm} />
    </IconButton>
  );
}

// Top of the phone feed: your photo, the search field and the messages button.
export default function CommunityTopBar() {
  const user = useSelector((state) => state.auth.user);
  return (
    <Stack component="header" direction="row" alignItems="center" spacing={1.5}>
      <OwnProfileLink user={user} />
      <SearchField placeholder="Search" label="Search community" />
      <MessagesButton />
    </Stack>
  );
}
