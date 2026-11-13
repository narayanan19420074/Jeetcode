import { useState } from 'react';
import { CircularProgress, IconButton, Menu, MenuItem, Stack, TextField } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { COLOR_PALETTE, FONT_SIZES, RADII_PX, SHADOWS, SIZES } from '../../../../../app/design/designTokens';
import { LIB_ACCENT, LIB_FONT, LIB_TRACKING } from '../../../../dashboard/components/libraryStyle';
import QuickReplies from './QuickReplies';

const MAX_MESSAGE_LENGTH = 1000;

const fieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: RADII_PX.pill, minHeight: SIZES.touchTarget, py: 1, px: 2, bgcolor: 'var(--lib-player)', fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: 'var(--lib-text)' },
  '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: SHADOWS.ring(LIB_ACCENT) },
  '& .MuiInputBase-input': { p: 0 },
  '& fieldset': { border: 'none' },
};

const roundButtonSx = { width: SIZES.touchTarget, height: SIZES.touchTarget, flexShrink: 0 };

// The "+" button: extra things to send besides text. Today that is the pair room invitation.
function AttachButton({ onInvitePairRoom }) {
  const [anchor, setAnchor] = useState(null);
  const close = () => setAnchor(null);
  return (
    <>
      <IconButton onClick={(event) => setAnchor(event.currentTarget)} aria-label="Add to message" aria-haspopup="menu" sx={{ ...roundButtonSx, border: '1px solid var(--lib-border)', color: LIB_ACCENT }}><AddRoundedIcon /></IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close} slotProps={{ paper: { sx: { borderRadius: RADII_PX.card } } }}>
        <MenuItem onClick={() => { close(); onInvitePairRoom(); }} sx={{ minHeight: SIZES.touchTarget, fontFamily: LIB_FONT, fontSize: FONT_SIZES.title }}>Invite to pair room</MenuItem>
      </Menu>
    </>
  );
}

function SendButton({ canSend, isSending, onSend }) {
  return (
    <IconButton aria-label="Send message" onClick={onSend} disabled={!canSend || isSending} sx={{ ...roundButtonSx, color: COLOR_PALETTE.white, bgcolor: LIB_ACCENT, '&:hover': { bgcolor: `color-mix(in srgb, ${LIB_ACCENT} 85%, ${COLOR_PALETTE.black})` }, '&.Mui-disabled': { color: 'var(--lib-muted)', bgcolor: 'var(--lib-chip)' } }}>
      {isSending ? <CircularProgress size={FONT_SIZES.subheading} color="inherit" /> : <SendRoundedIcon />}
    </IconButton>
  );
}

// "Write a message…" field with the "+" button (friends only) and Send. Quick replies appear while the field is empty. Pressing Enter
// sends; Shift+Enter starts a new line.
export default function ChatComposer({ friend, isSending, onSend, onTyping, onInvitePairRoom }) {
  const [text, setText] = useState('');
  const submit = async () => {
    if (await onSend(text)) setText('');
  };
  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  };
  return (
    <Stack sx={{ flexShrink: 0, pb: 'calc(8px + env(safe-area-inset-bottom))', borderTop: '1px solid var(--lib-divider)' }}>
      {!text.trim() && <QuickReplies onPick={onSend} />}
      <Stack direction="row" sx={{ alignItems: 'flex-end', gap: 1, px: 2, pt: 1 }}>
        {onInvitePairRoom && <AttachButton onInvitePairRoom={onInvitePairRoom} />}
        <TextField fullWidth multiline maxRows={4} size="small" placeholder="Write a message…" value={text} onKeyDown={handleKeyDown} sx={fieldSx}
          onChange={(event) => { setText(event.target.value.slice(0, MAX_MESSAGE_LENGTH)); onTyping(); }}
          slotProps={{ htmlInput: { 'aria-label': `Message ${friend.name}`, maxLength: MAX_MESSAGE_LENGTH } }} />
        <SendButton canSend={Boolean(text.trim())} isSending={isSending} onSend={submit} />
      </Stack>
    </Stack>
  );
}
