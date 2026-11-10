import { Box, IconButton, Stack, Typography } from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PostCommentField from './PostCommentField';
import usePostComment from './usePostComment';
import useVote from '../../workspace/community/communityBits/useVote';
import { LIB_ACCENT } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, RADII_PX, SIZES } from '../../../app/design/designTokens';

// Above the phone tab bar and the page header, below dialogs.
const barSx = (theme) => ({
  position: 'fixed',
  left: 16,
  right: 16,
  bottom: 'calc(12px + env(safe-area-inset-bottom))',
  zIndex: theme.zIndex.appBar + 1,
  maxWidth: SIZES.readingMaxWidth - 32,
  mx: 'auto',
});
const pillSx = { display: 'flex', alignItems: 'center', gap: 0.5, pl: 1, pr: 1, py: 1, borderRadius: RADII_PX.pill, bgcolor: 'var(--lib-player)', boxShadow: 1 };

function VoteArrow({ icon: Icon, label, active, onClick }) {
  return (
    <IconButton aria-label={label} aria-pressed={active} onClick={onClick} sx={{ color: active ? LIB_ACCENT : 'var(--lib-text)' }}>
      <Icon />
    </IconButton>
  );
}

function ViewCount({ value }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} aria-label={`${value} views`} sx={{ color: 'var(--lib-text)', px: 0.5 }}>
      <VisibilityOutlinedIcon sx={{ fontSize: SIZES.iconSize.medium }} />
      <Typography sx={{ fontSize: FONT_SIZES.bodyLg }}>{value}</Typography>
    </Stack>
  );
}

function BarMessage({ text }) {
  if (!text) return null;
  return <Typography role="alert" sx={{ mb: 0.5, textAlign: 'center', fontSize: FONT_SIZES.caption, color: 'error.main' }}>{text}</Typography>;
}

// Fixed bar at the bottom of an open post: vote up or down, the view count and a field to write a comment.
export default function PostActionBar({ post, onCommentPosted }) {
  const vote = useVote({ targetType: 'post', targetId: post._id, score: post.score, myVote: post.myVote });
  const comment = usePostComment(post._id, onCommentPosted);
  return (
    <Box sx={barSx}>
      <BarMessage text={vote.error || comment.error} />
      <Box sx={pillSx}>
        <VoteArrow icon={ArrowUpwardRoundedIcon} label="Upvote" active={vote.state.myVote === 1} onClick={() => vote.cast(1)} />
        <Typography aria-live="polite" sx={{ fontSize: FONT_SIZES.bodyLg }}>{vote.state.score}</Typography>
        <VoteArrow icon={ArrowDownwardRoundedIcon} label="Downvote" active={vote.state.myVote === -1} onClick={() => vote.cast(-1)} />
        <ViewCount value={post.viewCount} />
        <PostCommentField comment={comment} />
      </Box>
    </Box>
  );
}
