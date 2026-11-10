import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Box, IconButton, InputBase, Stack, Typography } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import useCommentComposer from './useCommentComposer';
import { UserAvatar } from '../../workspace/community/CommunityBits';
import { navActiveColor } from '../../../components/navbar/navLinkStyles';
import { FONT_SIZES, RADII_PX, SIZES } from '../../../app/design/designTokens';

const barSx = { flexShrink: 0, px: 1.5, pt: 1, pb: 'calc(8px + env(safe-area-inset-bottom))', borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' };
const fieldSx = { flex: 1, minHeight: SIZES.controlHeight.mobile, px: 2, border: 1, borderColor: 'divider', borderRadius: RADII_PX.pill, fontSize: FONT_SIZES.title };

function ReplyBanner({ name, onCancel }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: 0.5, pl: 1 }}>
      <Typography sx={{ fontSize: FONT_SIZES.body, color: 'text.secondary' }}>Replying to {name}</Typography>
      <IconButton size="small" aria-label="Cancel reply" onClick={onCancel}><CloseRoundedIcon fontSize="small" /></IconButton>
    </Stack>
  );
}

// Pinned under the comments: your avatar and the "Add a comment…" field. Tapping Reply on a comment aims the field at it.
export default function CommentInputBar({ postId, replyTo, onCancelReply, onAdded }) {
  const user = useSelector((state) => state.auth.user);
  const inputRef = useRef(null);
  const composer = useCommentComposer({ postId, replyTo, onAdded: (comment) => { onAdded(comment); onCancelReply(); } });
  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo]);
  return (
    <Box sx={barSx}>
      {replyTo && <ReplyBanner name={replyTo.author?.name} onCancel={onCancelReply} />}
      <Stack direction="row" alignItems="center" spacing={1}>
        {user && <UserAvatar user={user} size={SIZES.avatar.sm} />}
        <InputBase
          multiline
          maxRows={4}
          inputRef={inputRef}
          value={composer.text}
          disabled={composer.sending}
          placeholder="Add a comment…"
          onFocus={composer.isAuthenticated ? undefined : composer.redirectToSignIn}
          onChange={(event) => composer.change(event.target.value)}
          inputProps={{ 'aria-label': 'Add a comment' }}
          endAdornment={composer.text.trim() && (
            <IconButton aria-label="Send comment" onClick={composer.send} disabled={composer.sending} sx={(theme) => ({ color: navActiveColor(theme) })}>
              <SendRoundedIcon />
            </IconButton>
          )}
          sx={fieldSx}
        />
      </Stack>
    </Box>
  );
}
