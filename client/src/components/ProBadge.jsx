import { Chip } from '@mui/material';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { COLOR_PALETTE, SIZES } from '../app/design/designTokens';

export default function ProBadge({ size = 'small' }) {
  return (
    <Chip
      icon={<WorkspacePremiumRoundedIcon sx={{ fontSize: `${SIZES.chipIconSize}px !important` }} />}
      label="PRO"
      size={size}
      sx={{
        fontWeight: 'fontWeightBold',
        letterSpacing: '0.03em',
        bgcolor: 'warning.main',
        color: COLOR_PALETTE.white,
        '& .MuiChip-icon': { color: COLOR_PALETTE.white },
      }}
    />
  );
}
