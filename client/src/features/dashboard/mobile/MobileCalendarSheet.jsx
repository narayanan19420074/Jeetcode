import { Box, Button, Drawer, IconButton, Typography, alpha } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { FONT_SIZES, FONT_WEIGHTS, RADII, RADII_PX, SIZES } from '../../../app/design/designTokens';
import RightRail from '../components/RightRail';
import { LIB_ACCENT, LibraryFont, libIconBtnSx, useLibraryPalette } from '../components/libraryStyle';

const OUTLINE_TINT = 0.5;

const sheetPaperSx = (pal) => ({
  borderRadius: `${RADII.card}px ${RADII.card}px 0 0`,
  maxHeight: `calc(${SIZES.viewportHeight} * 0.9)`,
  pb: 'env(safe-area-inset-bottom)',
  bgcolor: pal.bg,
  backgroundImage: 'none',
  color: pal.text,
});

function SheetHeader({ onClose }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography component="h2" sx={{ fontSize: FONT_SIZES.subheading, lineHeight: '24px', fontWeight: FONT_WEIGHTS.bold }}>
        Calendar
      </Typography>
      <IconButton onClick={onClose} aria-label="Close calendar" sx={[libIconBtnSx, { mr: -0.5 }]}>
        <CloseRoundedIcon />
      </IconButton>
    </Box>
  );
}

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
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: sheetPaperSx(pal) } }}>
      <LibraryFont>
        <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>
          <SheetHeader onClose={onClose} />
          <RightRail phone user={user} isAuthenticated={isAuthenticated} progress={progress} activity={activity} onNavigate={onClose} />
          {isAuthenticated && <OpenStudyPlansButton onClick={openStudyPlans} />}
        </Box>
      </LibraryFont>
    </Drawer>
  );
}
