import { Paper, Stack, Typography } from '@mui/material';
import { FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';

function SignupRow({ user }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.semibold }}>
        {user.name}{' '}
        <Typography component="span" variant="caption" color="text.secondary">
          @{user.handle}
        </Typography>
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {new Date(user.createdAt).toLocaleDateString()}
      </Typography>
    </Stack>
  );
}

export default function RecentSignupsCard({ signups }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: RADII_PX.card }}>
      <Typography variant="h6" sx={{ fontWeight: FONT_WEIGHTS.bold, mb: 2 }}>
        Recent signups
      </Typography>
      {signups.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No signups yet.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {signups.map((user) => (
            <SignupRow key={user._id} user={user} />
          ))}
        </Stack>
      )}
    </Paper>
  );
}
