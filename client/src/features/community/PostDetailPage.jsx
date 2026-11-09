import { Link as RouterLink, useParams } from 'react-router-dom';
import { Alert, Box, Button, Skeleton } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { LibraryFont } from '../dashboard/components/libraryStyle';
import usePost from './common/usePost';
import PostDetailBody from './common/PostDetailBody';
import { SIZES } from '../../app/design/designTokens';

// A single community post with its voting and nested comments (the comment section is shared with problem discussions).
export default function PostDetailPage() {
  const { postId } = useParams();
  const { post, loading, error, changeCommentCount } = usePost(postId);
  return (
    <LibraryFont>
    <Box sx={{ maxWidth: SIZES.readingMaxWidth, mx: 'auto', px: { xs: 2, md: 3 }, pt: { xs: 'calc(8px + env(safe-area-inset-top))', md: 4 }, pb: { xs: 2, md: 4 } }}>
      <Button component={RouterLink} to="/community" startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 1 }}>Community</Button>
      {loading && <Skeleton variant="rounded" height={SIZES.avatar.lg * 4} />}
      {error && <Alert severity="error">{error}</Alert>}
      {post && <PostDetailBody post={post} onCommentCountChange={changeCommentCount} />}
    </Box>
    </LibraryFont>
  );
}
