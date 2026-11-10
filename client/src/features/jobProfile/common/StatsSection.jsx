import { useSelector } from 'react-redux';
import { Box, Stack, Typography } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';
import ProfileCard from './ProfileCard';

function StatRow({ icon: Icon, value, label }) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', py: 1 }}>
      <Icon color="action" />
      <Box>
        <Typography sx={{ fontWeight: FONT_WEIGHTS.semibold, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Stack>
  );
}

// Private numbers from the account. LinkedIn shows profile views here; JeetCode shows coding progress.
export default function StatsSection() {
  const user = useSelector((state) => state.auth.user);
  const privateNote = (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <VisibilityRoundedIcon fontSize="inherit" color="action" />
      <Typography variant="caption" color="text.secondary">
        Private to you
      </Typography>
    </Stack>
  );

  return (
    <ProfileCard title="Analytics" subtitle={privateNote}>
      <StatRow icon={CodeRoundedIcon} value={`${user.totalSolved ?? 0} problems solved`} label="Easy, medium and hard combined" />
      <StatRow icon={LocalFireDepartmentRoundedIcon} value={`${user.streakDays ?? 0} day streak`} label={`Longest streak: ${user.longestStreak ?? 0} days`} />
    </ProfileCard>
  );
}
