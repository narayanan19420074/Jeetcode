import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import HeartBrokenOutlinedIcon from '@mui/icons-material/HeartBrokenOutlined';
import HeartBrokenRoundedIcon from '@mui/icons-material/HeartBrokenRounded';
import { communityApi } from '../../../../api/communityApi';
import { extractErrorMessage } from '../../../../api/apiClient';
import { COLOR_PALETTE, FONT_WEIGHTS, FONT_SIZES, RADII_PX, MOTION } from '../../../../app/design/designTokens';

// Instagram-style vote control: ♥ = upvote (red + pop animation when liked),
// 💔 = downvote. Optimistic; guests are sent to /login; authors can't vote on
// their own posts. variant 'pill' = flat action row (feed posts), 'column' =
// compact stack beside a comment. Solutions pass allowDown={false} (like only).
const LIKE_RED = COLOR_PALETTE.custom.redFF3040;
const pop = keyframes`
  0% { transform: scale(1); }
  35% { transform: scale(1.35); }
  70% { transform: scale(0.92); }
  100% { transform: scale(1); }
`;

// Optimistic vote state: the score moves immediately and rolls back if the server rejects the vote.
function useVote({ targetType, targetId, score, myVote, isMine, onChange }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [state, setState] = useState({ score, myVote });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setState({ score, myVote });
  }, [score, myVote]);

  const cast = async (value) => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname } } });
    if (busy || isMine) return;
    const prev = state;
    const next = prev.myVote === value ? 0 : value;
    setState({ myVote: next, score: prev.score + next - prev.myVote });
    setBusy(true);
    setError('');
    try {
      const { data } = await communityApi.vote(targetType, targetId, next);
      setState(data.data);
      onChange?.(data.data.score, data.data.myVote);
    } catch (err) {
      setState(prev);
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return { state, error, cast };
}

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

export function VoteBar({ targetType, targetId, score, myVote, allowDown = true, isMine = false, variant = 'pill', onChange }) {
  const { state, error, cast } = useVote({ targetType, targetId, score, myVote, isMine, onChange });
  const tip = isMine ? "You can't vote on your own post" : '';
  const column = variant === 'column';
  const btn = column ? 28 : 40;
  const icon = column ? 19 : 26;
  const liked = state.myVote === 1;
  const disliked = state.myVote === -1;

  const likeBtn = <LikeButton liked={liked} tip={tip} isMine={isMine} btn={btn} icon={icon} onCast={cast} />;
  const count = <VoteCount column={column} liked={liked} score={state.score} />;
  const dislikeBtn = allowDown && <DislikeButton disliked={disliked} tip={tip} isMine={isMine} btn={btn} icon={icon} onCast={cast} />;

  return (
    <Box>
      {column ? (
        <Stack alignItems="center" spacing={0.25}>
          {likeBtn}
          {count}
          {dislikeBtn}
        </Stack>
      ) : (
        <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
          {/* ♥ + count live together in one tonal pill so it reads as the Like button */}
          <Stack
            direction="row"
            alignItems="center"
            sx={(t) => ({
              height: 40,
              pr: 1.5,
              borderRadius: RADII_PX.pill,
              bgcolor: liked ? alpha(LIKE_RED, 0.12) : alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.1 : 0.06),
              transition: `background-color ${MOTION.fast}ms`,
            })}
          >
            {likeBtn}
            {count}
          </Stack>
          {dislikeBtn}
        </Stack>
      )}
      {error && (
        <Typography color="error" sx={{ fontSize: FONT_SIZES.caption, mt: 0.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
