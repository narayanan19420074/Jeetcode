import { useSelector } from 'react-redux';
import { Box, Button, Typography } from '@mui/material';
import useSignInRedirect from '../../../workspace/community/communityBits/useSignInRedirect';
import { FONT_SIZES } from '../../../../app/design/designTokens';
import MemberList from './MemberList';
import useMemberSearch from './useMemberSearch';

function SignInToSearch() {
  const redirectToSignIn = useSignInRedirect();
  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Typography sx={{ fontSize: FONT_SIZES.title }}>Sign in to search for members.</Typography>
      <Button onClick={redirectToSignIn} sx={{ mt: 2 }}>Sign in</Button>
    </Box>
  );
}

// Results of the phone search field: every member account, not only friends. Searching is for signed-in members only.
export default function MemberSearchResults({ query }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const search = useMemberSearch(isAuthenticated ? query : '');
  if (!isAuthenticated) return <SignInToSearch />;
  return <MemberList state={search} heading="Members" emptyText="No members match your search." />;
}
