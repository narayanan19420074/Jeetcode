import { Box, IconButton, Typography } from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';
import { LIB_TRACKING, LibraryFont, libIconBtnSx } from '../components/libraryStyle';

function StreakLabel({ days }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LocalFireDepartmentRoundedIcon sx={{ fontSize: FONT_SIZES.display, color: 'warning.main' }} />
      <Typography sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>{days}-day streak</Typography>
    </Box>
  );
}

// Top of the phone home: the streak on the left, the plan calendar on the right.
export default function MobileHomeHeader({ user, isAuthenticated, onOpenCalendar }) {
  return (
    <LibraryFont sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: SIZES.iconButton.mobile }}>
      {isAuthenticated ? <StreakLabel days={user?.streakDays ?? 0} /> : <span />}
      <IconButton onClick={onOpenCalendar} aria-label="Open calendar" sx={libIconBtnSx}>
        <CalendarMonthRoundedIcon />
      </IconButton>
    </LibraryFont>
  );
}
