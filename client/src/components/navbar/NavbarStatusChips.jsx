import { Link as RouterLink } from 'react-router-dom';
import { Box, Chip, Tooltip } from '@mui/material';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import { FONT_WEIGHTS } from '../../app/design/designTokens';
import ProBadge from '../ProBadge';

function StreakChip({ streakDays }) {
  return (
    <Tooltip title={`${streakDays}-day streak`}>
      <Chip
        icon={<LocalFireDepartmentRoundedIcon sx={{ color: 'warning.main !important' }} />}
        label={`${streakDays} days`}
        size="small"
        variant="outlined"
        sx={{ fontWeight: FONT_WEIGHTS.bold, display: { xs: 'none', sm: 'flex' } }}
      />
    </Tooltip>
  );
}

function CoinsChip({ coins }) {
  return (
    <Tooltip title="Your coins. Open wallet">
      <Chip
        component={RouterLink}
        to="/store?tab=coins"
        clickable
        icon={<MonetizationOnRoundedIcon sx={{ color: 'warning.main !important' }} />}
        label={coins.toLocaleString('en-IN')}
        size="small"
        variant="outlined"
        aria-label={`${coins} coins, open wallet`}
        sx={{ fontWeight: FONT_WEIGHTS.bold, display: { xs: 'none', sm: 'inline-flex' } }}
      />
    </Tooltip>
  );
}

// Streak, coins and the Pro badge live in the phone menu on phones, so these only show from the sm breakpoint up.
export default function NavbarStatusChips({ user, coins }) {
  return (
    <>
      <StreakChip streakDays={user?.streakDays ?? 0} />
      <CoinsChip coins={coins} />
      {user?.isPro && (
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <ProBadge />
        </Box>
      )}
    </>
  );
}
