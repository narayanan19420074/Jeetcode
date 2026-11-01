import { useState } from 'react';
import { Box, IconButton, InputBase, Typography } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

const NO_MATCH_MESSAGE = 'I could not match that. Choose an option above or type its name.';

// Lets the learner type an answer instead of tapping a card. `onSubmitText` returns true when the
// text matched an option; otherwise the learner sees what to do next (clear error message).
export default function TypeInstead({ isDisabled, onSubmitText }) {
  const [text, setText] = useState('');
  const [hasNoMatch, setHasNoMatch] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    setHasNoMatch(!onSubmitText(text));
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2, pr: 0.5, borderRadius: 999, bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)' }}>
        <InputBase fullWidth disabled={isDisabled} value={text} onChange={(event) => setText(event.target.value)} placeholder="Or type your answer" inputProps={{ 'aria-label': 'Type your answer' }} />
        <IconButton type="submit" color="primary" disabled={isDisabled || !text.trim()} aria-label="Send answer">
          <SendRoundedIcon />
        </IconButton>
      </Box>
      {hasNoMatch && (
        <Typography role="alert" variant="caption" sx={{ display: 'block', mt: 0.5, px: 2, color: 'error.main' }}>
          {NO_MATCH_MESSAGE}
        </Typography>
      )}
    </Box>
  );
}
