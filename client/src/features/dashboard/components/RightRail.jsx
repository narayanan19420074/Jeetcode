import { useMemo } from 'react';
import { Box } from '@mui/material';
import StreakCalendarCard from './rail/StreakCalendarCard';

// Streak + calendar rail on wide screens; the phone calendar sheet reuses it with `phone`.
export default function RightRail({ user, isAuthenticated, activity, phone = false, onNavigate }) {
  const byDate = useMemo(() => new Map((activity || []).map((a) => [a.date, a.submissions])), [activity]);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))', lg: 'minmax(0, 1fr)' },
        pb: { lg: 1 },
        gap: 2,
        alignItems: 'start',
      }}
    >
      <StreakCalendarCard user={user} isAuthenticated={isAuthenticated} byDate={byDate} phone={phone} onNavigate={onNavigate} />
    </Box>
  );
}
