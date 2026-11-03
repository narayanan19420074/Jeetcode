import { Chip } from '@mui/material';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { COLOR_PALETTE } from '../app/design/designTokens';

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
        color: COLOR_PALETTE.white,
        '& .MuiChip-icon': { color: COLOR_PALETTE.white },
      }}
    />
  );
}
