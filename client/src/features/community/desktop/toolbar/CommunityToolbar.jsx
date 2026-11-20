import { useSelector } from 'react-redux';
import { Container, Stack } from '@mui/material';
import { SIZES } from '../../../../app/design/designTokens';
import MessagesToolbarButton from './MessagesToolbarButton';
import ToolbarSearch from './ToolbarSearch';

// Toolbar above the desktop Community page, in the same page width as the columns below: the search field for
// members and posts on the left and the Messages icon at the right end. Messages are for signed-in people only.
export default function CommunityToolbar() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return (
    <Container maxWidth={false} sx={{ maxWidth: SIZES.dashboardMaxWidth, pt: 2, px: 3 }}>
      <Stack component="header" direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <ToolbarSearch />
        {isAuthenticated && <MessagesToolbarButton />}
      </Stack>
    </Container>
  );
}
