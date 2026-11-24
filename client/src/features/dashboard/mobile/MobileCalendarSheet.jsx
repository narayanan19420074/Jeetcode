import { Box, Button, Drawer, alpha } from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import RightRail from '../components/RightRail';
import { LIB_ACCENT, LibraryFont, LibrarySheetHeader, librarySheetPaperSx, useLibraryPalette } from '../components/libraryStyle';

const OUTLINE_TINT = 0.5;

function OpenStudyPlansButton({ onClick }) {
  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={<SchoolRoundedIcon />}
      onClick={onClick}
      sx={{ mt: 2, fontWeight: FONT_WEIGHTS.bold, height: SIZES.controlHeight.mobile, borderRadius: RADII_PX.pill, color: LIB_ACCENT, borderColor: alpha(LIB_ACCENT, OUTLINE_TINT) }}
    >
      Open Study Plans
    </Button>
  );
}

// Phone calendar sheet: the streak calendar with study-plan deadlines, and a shortcut to the Study Plan view.
export default function MobileCalendarSheet({ open, onClose, dashboard }) {
  const pal = useLibraryPalette();
  const { user, isAuthenticated, progress, activity, goView } = dashboard;
  const openStudyPlans = () => {
    onClose();
    goView('plans');
  };
  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: librarySheetPaperSx(pal) } }}>
      <LibraryFont>
        <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>
          <LibrarySheetHeader title="Calendar" onClose={onClose} />
          <RightRail phone user={user} isAuthenticated={isAuthenticated} progress={progress} activity={activity} onNavigate={onClose} />
          {isAuthenticated && <OpenStudyPlansButton onClick={openStudyPlans} />}
        </Box>
      </LibraryFont>
    </Drawer>
  );
}
