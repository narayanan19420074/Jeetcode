import { IconButton, Stack } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PostMenu from '../common/PostMenu';
import useHidePost from '../common/useHidePost';

const compactButtonSx = { p: 0.5 };

// "Not interested": hides this post for the viewer, the same action as in the "..." menu.
function DismissButton({ post, onRemoved }) {
  const { hidePost } = useHidePost(post, onRemoved);
  return (
    <IconButton aria-label="Hide this post" onClick={hidePost} sx={compactButtonSx}>
      <CloseRoundedIcon />
    </IconButton>
  );
}

// The "..." menu and the dismiss button, side by side at the top right of a phone post.
export default function PhoneHeaderActions({ post, onRemoved }) {
  return (
    <Stack direction="row">
      <PostMenu post={post} onRemoved={onRemoved} triggerSx={compactButtonSx} />
      <DismissButton post={post} onRemoved={onRemoved} />
    </Stack>
  );
}
