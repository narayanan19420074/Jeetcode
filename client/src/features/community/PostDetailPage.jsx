import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, IconButton, Skeleton, Stack } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { LibraryFont, libBackBtnSx, libIconBtnSx } from '../dashboard/components/libraryStyle';
import usePost from './common/usePost';
import PostDetailBody from './common/PostDetailBody';
import PostMenu from './common/PostMenu';
import { SIZES } from '../../app/design/designTokens';

// Room under the content so the last comment is never hidden behind the fixed action bar.
const pageSx = (theme) => ({
  maxWidth: SIZES.readingMaxWidth,
  mx: 'auto',
  px: { xs: 2, md: 3 },
  pt: { xs: 'calc(8px + env(safe-area-inset-top))', md: 4 },
  pb: `calc(${theme.spacing(14)} + env(safe-area-inset-bottom))`,
});

// A single community post with its voting and nested comments (the comment section is shared with problem discussions).
export default function PostDetailPage() {
  const { postId } = useParams();
  const { post, loading, error, changeCommentCount } = usePost(postId);
  const navigate = useNavigate();
  // Deleting or hiding the open post leaves nothing to show, so go back to the feed.
  const leavePost = () => navigate('/community', { replace: true });
  return (
    <LibraryFont>
      <Box sx={pageSx}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <IconButton component={RouterLink} to="/community" aria-label="Back to community" sx={libBackBtnSx}>
            <ArrowBackRoundedIcon />
          </IconButton>
          {post && <PostMenu post={post} onRemoved={leavePost} triggerSx={libIconBtnSx} />}
        </Stack>
        {loading && <Skeleton variant="rounded" height={SIZES.avatar.lg * 4} />}
        {error && <Alert severity="error">{error}</Alert>}
        {post && <PostDetailBody post={post} onCommentCountChange={changeCommentCount} />}
      </Box>
    </LibraryFont>
  );
}
