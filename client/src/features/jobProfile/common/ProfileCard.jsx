import { IconButton, Paper, Stack, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';

// Icon-only button with a tooltip and an aria-label (WCAG: icon buttons need an accessible name).
export function IconAction({ label, icon: Icon, onClick }) {
  return (
    <Tooltip title={label}>
      <IconButton onClick={onClick} aria-label={label}>
        <Icon />
      </IconButton>
    </Tooltip>
  );
}

// Frame of every Job profile section. On phones it is a flat full-width block (the page shows a grey band
// between blocks, like the LinkedIn app); on desktop it is an outlined card.
export default function ProfileCard({ title, subtitle, actions, children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Paper variant={isMobile ? 'elevation' : 'outlined'} elevation={0} component="section" sx={{ p: 2, borderRadius: isMobile ? RADII_PX.square : RADII_PX.card, bgcolor: 'background.paper' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <div>
          <Typography component="h2" variant="h6" sx={{ fontWeight: FONT_WEIGHTS.bold }}>
            {title}
          </Typography>
          {subtitle}
        </div>
        <Stack direction="row">{actions}</Stack>
      </Stack>
      {children}
    </Paper>
  );
}
