import { useState } from 'react';
import { Box, ButtonBase, IconButton, Popover, Stack } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded';
import AddImageButton from '../common/AddImageButton';
import { EMOJIS } from '../../friends/chat/chatShared';
import { FONT_SIZES, RADII_PX } from '../../../app/design/designTokens';

const EMOJI_COLUMNS = 8;

function EmojiPicker({ anchorEl, onPick, onClose }) {
  return (
    <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${EMOJI_COLUMNS}, 1fr)`, p: 1 }}>
        {EMOJIS.map((emoji) => (
          <ButtonBase key={emoji} aria-label={`Insert ${emoji}`} onClick={() => { onPick(emoji); onClose(); }} sx={{ p: 0.5, borderRadius: RADII_PX.control, fontSize: FONT_SIZES.heading }}>
            {emoji}
          </ButtonBase>
        ))}
      </Box>
    </Popover>
  );
}

// Row of formatting buttons under the post text: emoji, bold, photo and code block.
export default function ComposeToolbar({ formatting, uploads, onInsertCode, disabled }) {
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <IconButton aria-label="Add emoji" disabled={disabled} onClick={(event) => setEmojiAnchor(event.currentTarget)}>
        <SentimentSatisfiedAltRoundedIcon />
      </IconButton>
      <IconButton aria-label="Bold" disabled={disabled} onClick={formatting.bold}>
        <FormatBoldRoundedIcon />
      </IconButton>
      <AddImageButton uploads={uploads} disabled={disabled} />
      <IconButton aria-label="Insert code block" disabled={disabled} onClick={onInsertCode}>
        <CodeRoundedIcon />
      </IconButton>
      <EmojiPicker anchorEl={emojiAnchor} onPick={formatting.insertEmoji} onClose={() => setEmojiAnchor(null)} />
    </Stack>
  );
}
