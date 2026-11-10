import { useSelector } from 'react-redux';
import { IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import { PostAvatar } from '../common/PostAuthor';
import { libSearchSx } from '../../dashboard/components/libraryStyle';
import { SIZES } from '../../../app/design/designTokens';

const searchFieldSx = { ...libSearchSx, mt: 0, px: 0, flex: 1 };

function SearchField() {
  return (
    <TextField
      placeholder="Search"
      sx={searchFieldSx}
      slotProps={{
        htmlInput: { 'aria-label': 'Search community' },
        input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> },
      }}
    />
  );
}

// Top of the phone feed: your photo, the search field and the messages button. Display only for now.
export default function CommunityTopBar() {
  const user = useSelector((state) => state.auth.user);
  return (
    <Stack component="header" direction="row" alignItems="center" spacing={1.5}>
      <PostAvatar author={user} size={SIZES.avatar.md} />
      <SearchField />
      <IconButton aria-label="Messages" sx={{ color: 'var(--lib-text)' }}>
        <ChatBubbleRoundedIcon />
      </IconButton>
    </Stack>
  );
}
