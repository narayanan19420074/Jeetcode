import { Typography } from '@mui/material';
import { tint } from '../../dashboard/dashboardUtils';

// Small pill on an item picture ("Popular", "Only 3 left"). Needs the Library CSS variables, so it lives inside LibraryFont.
export default function StoreBadge({ children, color }) {
  return (
    <Typography component="span" sx={{ px: 1, py: 0.3, borderRadius: 99, fontSize: 12, fontWeight: 500, lineHeight: 1.2, color, bgcolor: 'var(--lib-bg)', border: `1px solid ${tint(color, 40)}` }}>
      {children}
    </Typography>
  );
}
