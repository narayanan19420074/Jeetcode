import { Alert, Chip, FormControlLabel, Paper, Stack, Switch, Typography } from '@mui/material';
import { FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';
import useProForEveryone from './useProForEveryone';

function ProAccessHeader({ enabled }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: FONT_WEIGHTS.bold }}>
        Pro access
      </Typography>
      {enabled !== null && (
        <Chip
          size="small"
          variant="outlined"
          label={enabled ? 'On for all users' : 'Off'}
          color={enabled ? 'success' : 'default'}
        />
      )}
    </Stack>
  );
}

// Admin switch: while on, every signed-in user has Pro access until an admin turns it off.
export default function ProAccessCard() {
  const { enabled, busy, error, changeProForEveryone } = useProForEveryone();

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: RADII_PX.card }}>
      <ProAccessHeader enabled={enabled} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Give every signed-in user Pro access. It stays on until you turn it off here.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}
      <FormControlLabel
        label="Pro for all users"
        control={
          <Switch
            checked={Boolean(enabled)}
            disabled={enabled === null || busy}
            onChange={(event) => changeProForEveryone(event.target.checked)}
            slotProps={{ input: { 'aria-label': 'Pro for all users' } }}
          />
        }
      />
    </Paper>
  );
}
