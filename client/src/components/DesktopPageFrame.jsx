import { Box, Container } from '@mui/material';
import { BORDER_WIDTHS, LAYOUT_SPACING, SIZES } from '../app/design/designTokens';

const { sidebar, rail, stickyTop } = SIZES.desktopFrame;
const SIDE_PADDING_UNITS = 3;

// Same grid as the Dashboard: left column, content, right column. The right column only shows from the lg breakpoint.
const gridSx = (hasRight) => ({
  display: 'grid',
  columnGap: { md: 3, lg: 0 },
  alignItems: 'stretch',
  gridTemplateColumns: {
    md: `${sidebar.md}px minmax(0, 1fr)`,
    lg: `${sidebar.lg}px minmax(0, 1fr)${hasRight ? ` ${rail}px` : ''}`,
  },
});

// A side column with the same hairline and inner padding as the Dashboard's. The hairline runs the full height of
// the page; the content inside stays in view while the page scrolls.
function SidePane({ side, children }) {
  const isLeft = side === 'left';
  return (
    <Box
      component="aside"
      sx={{
        display: isLeft ? { xs: 'none', md: 'block' } : { xs: 'none', lg: 'block' },
        minWidth: SIZES.flexShrinkMinWidth,
        [isLeft ? 'pr' : 'pl']: { lg: SIDE_PADDING_UNITS },
        [isLeft ? 'borderRight' : 'borderLeft']: `${BORDER_WIDTHS.thin}px solid`,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ position: 'sticky', top: stickyTop }}>{children}</Box>
    </Box>
  );
}

// Desktop page frame shared by every page with side columns (Dashboard layout values: page width, margins, column
// widths, hairlines). `left` and `right` are optional; the content always sits in the middle.
export default function DesktopPageFrame({ left, right, children }) {
  return (
    <Container maxWidth={false} sx={{ maxWidth: SIZES.dashboardMaxWidth, py: 3, px: 3 }}>
      <Box sx={gridSx(Boolean(right))}>
        {left ? <SidePane side="left">{left}</SidePane> : <Box />}
        <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, px: LAYOUT_SPACING.frameContentGutter }}>{children}</Box>
        {right && <SidePane side="right">{right}</SidePane>}
      </Box>
    </Container>
  );
}
