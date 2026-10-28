import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { SITE_NAME } from '../legal/legalConfig';

// Shown for any URL that does not match a route. Standalone shell, so it works signed in or out.
export default function NotFoundPage() {
  const { pathname } = useLocation();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="md" sx={{ py: 1.5 }}>
          <Box component={RouterLink} to="/" aria-label={`${SITE_NAME} home`} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit' }}>
            <CodeRoundedIcon sx={{ color: 'primary.main' }} />
            <Typography sx={{ fontWeight: 800 }}>{SITE_NAME}</Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
        <Stack spacing={2} sx={{ textAlign: 'center', alignItems: 'center' }}>
          <Typography sx={{ fontSize: { xs: '4rem', sm: '5.5rem' }, fontWeight: 800, lineHeight: 1, color: 'primary.main' }}>404</Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '1.9rem' }, fontWeight: 800 }}>
            Page not found
          </Typography>
          <Typography color="text.secondary">
            The page you are looking for does not exist or may have been moved.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {pathname}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%', justifyContent: 'center', pt: 1 }}>
            <Button component={RouterLink} to={isAuthenticated ? '/dashboard' : '/'} variant="contained" disableElevation sx={{ fontWeight: 700 }}>
              {isAuthenticated ? 'Go to dashboard' : 'Go to home page'}
            </Button>
            <Button component={RouterLink} to="/problems" variant="outlined" color="inherit" sx={{ fontWeight: 700 }}>
              Browse problems
            </Button>
            <Button component={RouterLink} to="/help" variant="text" color="inherit" sx={{ fontWeight: 700 }}>
              Help & Support
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
