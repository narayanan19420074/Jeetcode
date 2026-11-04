import { Box } from '@mui/material';
import { BORDER_WIDTHS, SIZES } from '../../../app/design/designTokens';

// Desktop-only left column of the dashboard. Its right border is the same hairline as the navbar's bottom border,
// so the sidebar and the top bar frame the content the same way. The scrollbar is hidden because the sidebar is short.
export default function DashboardSidebarPane({ children }) {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'block' },
        position: { md: 'sticky' },
        top: { md: 84, lg: 0 },
        pr: { lg: 3 },
        height: { lg: SIZES.fill },
        overflowY: { lg: 'auto' },
        minHeight: SIZES.flexShrinkMinHeight,
        borderRight: `${BORDER_WIDTHS.thin}px solid`,
        borderColor: 'divider',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {children}
    </Box>
  );
}
