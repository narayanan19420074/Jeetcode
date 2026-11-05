import { Alert, Stack } from '@mui/material';

// What stopped the program (if anything) and whether the trace was cut short.
export default function TraceNotices({ trace }) {
  if (!trace.error && !trace.truncated && trace.steps.length > 0) return null;
  return (
    <Stack spacing={0.5} sx={{ px: 2, pt: 1 }}>
      {trace.error && <Alert severity="error">{trace.errorLine ? `${trace.error} (line ${trace.errorLine})` : trace.error}</Alert>}
      {trace.truncated && <Alert severity="info">The trace was cut short because the program ran for a long time. Showing the first {trace.steps.length} steps.</Alert>}
      {!trace.error && trace.steps.length === 0 && <Alert severity="info">No line of your code ran for this case.</Alert>}
    </Stack>
  );
}
