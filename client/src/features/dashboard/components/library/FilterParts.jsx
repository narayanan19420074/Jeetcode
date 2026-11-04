import { Box, Chip, Typography } from '@mui/material';
import { FONT_WEIGHTS } from '../../../../app/design/designTokens';

export function FilterHeading({ children }) {
  return (
    <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.bold, mb: 1 }}>
      {children}
    </Typography>
  );
}

// One selectable option in the filter panel (a company, a topic group or a topic). Selected options are filled.
export function FilterChip({ on, label, icon, onClick }) {
  return (
    <Chip
      size="small"
      clickable
      icon={icon}
      label={label}
      onClick={onClick}
      aria-pressed={on}
      color={on ? 'primary' : 'default'}
      variant={on ? 'filled' : 'outlined'}
    />
  );
}

export function FilterChipWrap({ children }) {
  return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>{children}</Box>;
}
