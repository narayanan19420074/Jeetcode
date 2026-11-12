import { Component } from 'react';
import { Box, Button, Typography } from '@mui/material';

// A failure while drawing one conversation must not take the whole app down. The reader gets a clear message,
// the reason in small print for support, and a way back to the inbox.
export default class ChatErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Chat screen crashed:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <Box role="alert" sx={{ p: 3 }}>
        <Typography variant="h6">This conversation could not be opened.</Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'var(--lib-muted)', wordBreak: 'break-word' }}>{String(error?.message || error)}</Typography>
        <Button onClick={this.props.onClose} sx={{ mt: 2 }}>Back to messages</Button>
      </Box>
    );
  }
}
