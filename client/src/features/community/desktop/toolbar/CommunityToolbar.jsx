import { useSelector } from 'react-redux';
import { Box, Container } from '@mui/material';
import { SHADOWS, SIZES, Z_INDEX } from '../../../../app/design/designTokens';
import MessagesToolbarButton from './MessagesToolbarButton';
import ToolbarSearch from './ToolbarSearch';

// The bar is full width with a shadow, so it stands out on its own above the bordered cards. Its z-index keeps the
// shadow and the search results above the sticky side columns below it.
const barSx = { position: 'relative', zIndex: Z_INDEX.header, bgcolor: 'background.paper', boxShadow: SHADOWS.toolbar };

// Three columns: empty, search, Messages. The outer columns share the free width equally, which keeps the search
// field exactly in the centre whether or not the Messages icon is shown.
const rowSx = { display: 'grid', alignItems: 'center', columnGap: 2, gridTemplateColumns: `1fr minmax(0, ${SIZES.communityToolbar.searchMaxWidth}px) 1fr` };
const messagesSlotSx = { gridColumn: 3, justifySelf: 'end' };

// Toolbar above the desktop Community page, in the same page width as the columns below: the search field for
// members and posts in the centre and the Messages icon at the right end. Messages are for signed-in people only.
export default function CommunityToolbar({ isMessagesOpen, onToggleMessages }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return (
    <Box component="header" sx={barSx}>
      <Container maxWidth={false} sx={{ maxWidth: SIZES.dashboardMaxWidth, py: 1.5, px: 3 }}>
        <Box sx={rowSx}>
          <ToolbarSearch />
          {isAuthenticated && (
            <Box sx={messagesSlotSx}>
              <MessagesToolbarButton isOpen={isMessagesOpen} onToggle={onToggleMessages} />
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
