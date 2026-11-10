import { useSelector } from 'react-redux';
import { Stack } from '@mui/material';
import { PostAvatar } from '../common/PostAuthor';
import SearchField from './SearchField';
import MessagesButton from './messages/MessagesButton';
import { SIZES } from '../../../app/design/designTokens';

// Top of the phone feed: your photo, the search field and the messages button.
export default function CommunityTopBar() {
  const user = useSelector((state) => state.auth.user);
  return (
    <Stack component="header" direction="row" alignItems="center" spacing={1.5}>
      <PostAvatar author={user} size={SIZES.avatar.sm} />
      <SearchField placeholder="Search" label="Search community" />
      <MessagesButton />
    </Stack>
  );
}
