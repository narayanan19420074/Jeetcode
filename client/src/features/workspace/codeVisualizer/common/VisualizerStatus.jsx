import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { visualizerLanguageLabels } from '../visualizerLanguages';

function Centered({ children }) {
  return (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, textAlign: 'center' }}>
      <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
        {children}
      </Stack>
    </Box>
  );
}

export function LoadingStatus() {
  return (
    <Centered>
      <CircularProgress aria-label="Running your code" />
      <Typography color="text.secondary">Running your code step by step…</Typography>
    </Centered>
  );
}

export function ErrorStatus({ message, onRetry }) {
  return (
    <Centered>
      <Typography role="alert">{message || 'The visualization could not be created.'}</Typography>
      <Button variant="outlined" onClick={onRetry}>
        Try again
      </Button>
    </Centered>
  );
}

// C++ and Java are compiled, so they have no line-by-line trace; offer the languages that do.
export function UnsupportedLanguageStatus({ onSelectLanguage }) {
  return (
    <Centered>
      <Typography>Step-by-step visualization is available for Python and JavaScript.</Typography>
      <Typography color="text.secondary" variant="body2">
        Switch the editor language to visualize your solution.
      </Typography>
      <Stack direction="row" spacing={1}>
        {visualizerLanguageLabels().map(({ id, label }) => (
          <Button key={id} variant="outlined" onClick={() => onSelectLanguage(id)}>
            Use {label}
          </Button>
        ))}
      </Stack>
    </Centered>
  );
}
