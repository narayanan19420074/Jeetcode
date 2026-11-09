import { Box, ButtonBase, IconButton, Stack, Typography } from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import useVote from '../../workspace/community/communityBits/useVote';
import { LIB_ACCENT, LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, RADII_PX, SIZES } from '../../../app/design/designTokens';

const barSx = (theme) => ({
  position: 'fixed',
  left: 16,
  right: 16,
  bottom: 'calc(12px + env(safe-area-inset-bottom))',
  zIndex: theme.zIndex.appBar - 10,
  maxWidth: SIZES.readingMaxWidth - 32,
  mx: 'auto',
});
const pillSx = { display: 'flex', alignItems: 'center', gap: 0.5, pl: 1, pr: 1.5, py: 1, borderRadius: RADII_PX.pill, bgcolor: 'var(--lib-player)', boxShadow: 1 };
const commentFieldSx = { flex: 1, minWidth: SIZES.flexShrinkMinWidth, height: SIZES.controlHeight.mobile, px: 2, gap: 1, justifyContent: 'flex-start', borderRadius: RADII_PX.pill, bgcolor: 'var(--lib-bg)', color: 'var(--lib-muted)', fontFamily: 'inherit', fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING };

function VoteArrow({ icon: Icon, label, active, disabled, onClick }) {
  return (
    <IconButton aria-label={label} aria-pressed={active} disabled={disabled} onClick={onClick} sx={{ color: active ? LIB_ACCENT : 'var(--lib-text)' }}>
      <Icon />
    </IconButton>
  );
}

function ViewCount({ value }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} aria-label={`${value} views`} sx={{ color: 'var(--lib-text)', pr: 0.5 }}>
      <VisibilityOutlinedIcon sx={{ fontSize: SIZES.iconSize.medium }} />
      <Typography sx={{ fontSize: FONT_SIZES.bodyLg }}>{value}</Typography>
    </Stack>
  );
}

// Fixed bar at the bottom of an open post: vote up or down, the view count and a field that jumps to the comments.
export default function PostActionBar({ post, onCommentClick }) {
  const { state, error, cast } = useVote({ targetType: 'post', targetId: post._id, score: post.score, myVote: post.myVote, isMine: post.isMine });
  return (
    <Box sx={barSx}>
      {error && <Typography role="alert" sx={{ mb: 0.5, textAlign: 'center', fontSize: FONT_SIZES.caption, color: 'error.main' }}>{error}</Typography>}
      <Box sx={pillSx}>
        <VoteArrow icon={ArrowUpwardRoundedIcon} label="Upvote" active={state.myVote === 1} disabled={post.isMine} onClick={() => cast(1)} />
        <Typography aria-live="polite" sx={{ fontSize: FONT_SIZES.bodyLg }}>{state.score}</Typography>
        <VoteArrow icon={ArrowDownwardRoundedIcon} label="Downvote" active={state.myVote === -1} disabled={post.isMine} onClick={() => cast(-1)} />
        <ViewCount value={post.viewCount} />
        <ButtonBase onClick={onCommentClick} sx={commentFieldSx}>
          <ChatBubbleOutlineRoundedIcon sx={{ fontSize: SIZES.iconSize.small }} />
          Add a comment…
        </ButtonBase>
      </Box>
    </Box>
  );
}
