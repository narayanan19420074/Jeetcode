import { Box, Collapse } from '@mui/material';
import { BORDER_WIDTHS, EASING, MOTION, SIZES } from '../../../app/design/designTokens';
import { RAIL_COLUMN_WIDTH } from '../dashboardUtils';

const RAIL_PADDING_UNITS = 3;

// Cards keep a fixed width, so they slide away as one piece while the column animates to zero width.
const railCardsWidth = (theme) => `calc(${RAIL_COLUMN_WIDTH} - ${theme.spacing(RAIL_PADDING_UNITS)} - ${BORDER_WIDTHS.thin}px)`;

// Right column on large screens. Its left border mirrors the right border of DashboardSidebarPane, so both columns frame the content alike.
// The rail is hidden (not removed) on views that do not use it, which lets it slide out.
function SideRail({ showRail, children }) {
  return (
    <Box
      className="autohide-scroll"
      aria-hidden={!showRail}
      sx={{
        minWidth: SIZES.flexShrinkMinWidth,
        minHeight: SIZES.flexShrinkMinHeight,
        height: SIZES.fill,
        overflowX: 'hidden',
        overflowY: showRail ? 'auto' : 'hidden',
        pl: RAIL_PADDING_UNITS,
        borderLeft: `${BORDER_WIDTHS.thin}px solid`,
        borderColor: 'divider',
        opacity: showRail ? 1 : 0,
        transform: showRail ? 'none' : 'translateX(28px)',
        pointerEvents: showRail ? 'auto' : 'none',
        transition: `opacity ${MOTION.slow}ms ease, transform ${MOTION.slow}ms ${EASING.standard}`,
      }}
    >
      <Box sx={{ width: railCardsWidth }}>{children}</Box>
    </Box>
  );
}

// Medium screens have no side column: the rail drops below the content instead.
function StackedRail({ showRail, children }) {
  return (
    <Box sx={{ gridColumn: '1 / -1' }}>
      <Collapse in={showRail} timeout={350} unmountOnExit>
        {children}
      </Collapse>
    </Box>
  );
}

// Streak and calendar rail of the dashboard. Phones show the calendar in a sheet, so they render nothing here.
export default function DashboardRailPane({ isLg, isMdUp, showRail, children }) {
  if (isLg) return <SideRail showRail={showRail}>{children}</SideRail>;
  if (isMdUp) return <StackedRail showRail={showRail}>{children}</StackedRail>;
  return null;
}
