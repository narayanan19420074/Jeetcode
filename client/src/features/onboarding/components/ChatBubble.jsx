import { Box, Typography } from '@mui/material';

// One message in the conversation. Assistant messages sit left, the learner's replies right.
export default function ChatBubble({ message }) {
  const isLearner = message.role === 'user';
  return (
    <Box sx={{ display: 'flex', justifyContent: isLearner ? 'flex-end' : 'flex-start' }}>
      <Typography
        sx={{
          maxWidth: '85%',
          px: 2,
          py: 1.25,
          borderRadius: 3,
          bgcolor: isLearner ? 'primary.main' : 'var(--lib-chip)',
          color: isLearner ? 'primary.contrastText' : 'var(--lib-text)',
        }}
      >
        {message.text}
      </Typography>
    </Box>
  );
}
