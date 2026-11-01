import { useState } from 'react';
import { Box, IconButton, InputBase } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

// Free-text input under the chat. Disabled while the next card is loading or the plan is shown.
export default function TypingBox({ disabled, onSend }) {
  const [text, setText] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <Box
      component="form"
      onSubmit={submit}
      sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.5, borderRadius: 999, bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)' }}
    >
      <InputBase
        fullWidth
        value={text}
        disabled={disabled}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type your answer"
        inputProps={{ 'aria-label': 'Type your answer' }}
      />
      <IconButton type="submit" color="primary" disabled={disabled || !text.trim()} aria-label="Send answer">
        <SendRoundedIcon />
      </IconButton>
    </Box>
  );
}
