import { IconButton, InputBase } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { LIB_ACCENT, LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, RADII_PX, SIZES } from '../../../app/design/designTokens';

const fieldSx = { flex: 1, minWidth: SIZES.flexShrinkMinWidth, minHeight: SIZES.controlHeight.mobile, pl: 2, pr: 0.5, borderRadius: RADII_PX.pill, bgcolor: 'var(--lib-bg)', fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING };

// The "Add a comment…" pill. Signed-in readers type and send from here; for guests it opens the sign-in page.
export default function PostCommentField({ comment }) {
  const { text, change, send, sending, isAuthenticated, redirectToSignIn } = comment;
  return (
    <InputBase
      multiline
      maxRows={4}
      value={text}
      disabled={sending}
      placeholder="Add a comment…"
      onFocus={isAuthenticated ? undefined : redirectToSignIn}
      onChange={(event) => change(event.target.value)}
      inputProps={{ 'aria-label': 'Add a comment' }}
      endAdornment={text.trim() && (
        <IconButton aria-label="Send comment" onClick={send} disabled={sending} sx={{ color: LIB_ACCENT }}>
          <SendRoundedIcon />
        </IconButton>
      )}
      sx={fieldSx}
    />
  );
}
