import { Chip, Tooltip } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { useNavigate } from 'react-router-dom';

// Renders in place of company-tag chips when problem.locked is true
// (see problem.controller.js — locked = isPremium && !req.hasProAccess).
// Clicking it goes straight to /pricing instead of doing nothing, so it
// doubles as a conversion nudge, not just a dead-end indicator.
export default function PremiumLockChip() {
  const navigate = useNavigate();
  return (
    <Tooltip title="Unlock with Pro">
      <Chip
        icon={<LockRoundedIcon sx={{ fontSize: '0.85rem !important' }} />}
        label="Pro"
        size="small"
        onClick={(e) => { e.stopPropagation(); navigate('/pricing'); }}
        sx={{ fontWeight: 700, bgcolor: 'warning.main', color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
      />
    </Tooltip>
  );
}
