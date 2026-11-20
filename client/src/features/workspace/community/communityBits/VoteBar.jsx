import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import HeartBrokenOutlinedIcon from '@mui/icons-material/HeartBrokenOutlined';
import HeartBrokenRoundedIcon from '@mui/icons-material/HeartBrokenRounded';
import useVote, { OWN_POST_VOTE_MESSAGE } from './useVote';
import { useFlatLook } from './flatLook';
import { COLOR_PALETTE, FONT_WEIGHTS, FONT_SIZES, RADII_PX, MOTION, SIZES } from '../../../../app/design/designTokens';

// Instagram-style vote control: ♥ = upvote (red + pop animation when liked),
// 💔 = downvote. Optimistic; guests are sent to /login; authors can't vote on
// their own posts. variant 'pill' = flat action row, 'column' = compact stack
// beside a comment. Solutions pass allowDown={false} (like only).
const LIKE_RED = COLOR_PALETTE.custom.redFF3040;
// flat: the desktop workspace look, a small icon with the count beside it.
const VOTE_SIZES = { column: { btn: 28, icon: 19 }, pill: { btn: SIZES.iconButton.mobile, icon: 26 }, flat: { btn: SIZES.iconButton.desktop, icon: FONT_SIZES.iconCompact } };
const pop = keyframes`
  0% { transform: scale(1); }
  35% { transform: scale(1.35); }
  70% { transform: scale(0.92); }
  100% { transform: scale(1); }
`;

function LikeButton({ liked, tip, isMine, btn, icon, onCast }) {
  return (
    <Tooltip title={tip || (liked ? 'Unlike' : 'Like')}>
      <span style={{ display: 'inline-flex' }}>
        <IconButton
          aria-label="Like"
          aria-pressed={liked}
          onClick={() => onCast(1)}
          disabled={isMine}
          sx={{ width: btn, height: btn, color: liked ? LIKE_RED : 'text.primary' }}
        >
          {liked ? (
            <FavoriteRoundedIcon key="on" sx={{ fontSize: icon, animation: `${pop} ${MOTION.slow}ms ease-out` }} />
          ) : (
            <FavoriteBorderRoundedIcon key="off" sx={{ fontSize: icon }} />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
}

function DislikeButton({ disliked, tip, isMine, btn, icon, onCast }) {
  return (
    <Tooltip title={tip || (disliked ? 'Remove dislike' : 'Dislike')}>
      <span style={{ display: 'inline-flex' }}>
        <IconButton
          aria-label="Dislike"
          aria-pressed={disliked}
          onClick={() => onCast(-1)}
          disabled={isMine}
          sx={{ width: btn, height: btn, color: disliked ? 'text.primary' : 'text.secondary' }}
        >
          {disliked ? <HeartBrokenRoundedIcon sx={{ fontSize: icon }} /> : <HeartBrokenOutlinedIcon sx={{ fontSize: icon }} />}
        </IconButton>
      </span>
    </Tooltip>
  );
}

function VoteCount({ column, liked, score }) {
  return (
    <Typography
      aria-live="polite"
      sx={{
        minWidth: column ? 0 : 16,
        textAlign: 'center',
        fontWeight: FONT_WEIGHTS.semibold,
        fontSize: column ? FONT_SIZES.caption : FONT_SIZES.bodyLg,
        lineHeight: 1,
        color: liked ? LIKE_RED : 'text.primary',
      }}
    >
      {score}
    </Typography>
  );
}

function VoteColumn({ likeBtn, count, dislikeBtn }) {
  return (
    <Stack alignItems="center" spacing={0.25}>
      {likeBtn}
      {count}
      {dislikeBtn}
    </Stack>
  );
}

// ♥ + count live together in one tonal pill so it reads as the Like button.
const pillSx = (liked) => (theme) => ({
  height: SIZES.iconButton.mobile,
  pr: 1.5,
  borderRadius: RADII_PX.pill,
  bgcolor: liked ? alpha(LIKE_RED, 0.12) : alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.1 : 0.06),
  transition: `background-color ${MOTION.fast}ms`,
});

// Desktop workspace look: no fill, the liked state shows only in the red heart and count.
const flatPillSx = { height: SIZES.iconButton.desktop, pr: 0.5 };

function VotePill({ liked, likeBtn, count, dislikeBtn }) {
  const flat = useFlatLook();
  return (
    <Stack direction="row" alignItems="center" sx={{ gap: flat ? 0.5 : 1 }}>
      <Stack direction="row" alignItems="center" sx={flat ? flatPillSx : pillSx(liked)}>
        {likeBtn}
        {count}
      </Stack>
      {dislikeBtn}
    </Stack>
  );
}

export function VoteBar({ targetType, targetId, score, myVote, allowDown = true, isMine = false, variant = 'pill', onChange }) {
  const { state, error, cast } = useVote({ targetType, targetId, score, myVote, isMine, onChange });
  const flat = useFlatLook();
  const column = variant === 'column';
  const { btn, icon } = VOTE_SIZES[column ? 'column' : flat ? 'flat' : 'pill'];
  const tip = isMine ? OWN_POST_VOTE_MESSAGE : '';
  const liked = state.myVote === 1;
  const buttons = {
    likeBtn: <LikeButton liked={liked} tip={tip} isMine={isMine} btn={btn} icon={icon} onCast={cast} />,
    count: <VoteCount column={column} liked={liked} score={state.score} />,
    dislikeBtn: allowDown && <DislikeButton disliked={state.myVote === -1} tip={tip} isMine={isMine} btn={btn} icon={icon} onCast={cast} />,
  };
  return (
    <Box>
      {column ? <VoteColumn {...buttons} /> : <VotePill liked={liked} {...buttons} />}
      {error && <Typography color="error" sx={{ fontSize: FONT_SIZES.caption, mt: 0.5 }}>{error}</Typography>}
    </Box>
  );
}
