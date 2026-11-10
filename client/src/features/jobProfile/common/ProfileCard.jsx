import { IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';

// Icon-only button with a tooltip and an aria-label (WCAG: icon buttons need an accessible name).
export function IconAction({ label, icon: Icon, onClick }) {
  return (
    <Tooltip title={label}>
      <IconButton size="small" onClick={onClick} aria-label={label}>
        <Icon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

// Outlined card with a title and optional action buttons: the frame of every Job profile section.
export default function ProfileCard({ title, actions, children }) {
  return (
    <Paper variant="outlined" component="section" sx={{ p: 2, borderRadius: RADII_PX.card }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography component="h2" variant="subtitle1" sx={{ fontWeight: FONT_WEIGHTS.bold }}>
          {title}
        </Typography>
        <Stack direction="row">{actions}</Stack>
      </Stack>
      {children}
    </Paper>
  );
}
