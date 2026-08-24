import { Chip } from '@mui/material';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';

export default function ProBadge({ size = 'small' }) {
  return (
    <Chip
      icon={<WorkspacePremiumRoundedIcon sx={{ fontSize: '1rem !important' }} />}
      label="PRO"
      size={size}
      sx={{
        fontWeight: 800,
        letterSpacing: '0.03em',
        bgcolor: 'warning.main',
        color: '#fff',
        '& .MuiChip-icon': { color: '#fff' },
      }}
    />
  );
}
