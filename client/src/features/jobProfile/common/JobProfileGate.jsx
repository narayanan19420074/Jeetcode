import { Box, Button, CircularProgress, Typography } from '@mui/material';

// Shows a spinner while the profile loads and a retry button if loading failed; otherwise the page content.
export default function JobProfileGate({ editor, children }) {
  if (editor.status === 'ready') return children;

  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      {editor.status === 'loading' ? (
        <CircularProgress aria-label="Loading Job profile" />
      ) : (
        <>
          <Typography sx={{ mb: 2 }}>Couldn’t load your Job profile.</Typography>
          <Button variant="contained" disableElevation onClick={editor.reload}>
            Try again
          </Button>
        </>
      )}
    </Box>
  );
}
