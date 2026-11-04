import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { BORDER_WIDTHS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { GOOGLE_CLIENT_ID, startGithubSignIn } from './loginConfig';
import useGoogleSignIn from './useGoogleSignIn';

// Same outlined square button on every screen size, coloured only by the theme.
const socialButtonSx = {
  width: SIZES.iconButton.mobile,
  height: SIZES.iconButton.mobile,
  border: `${BORDER_WIDTHS.thin}px solid`,
  borderColor: 'divider',
  borderRadius: RADII_PX.control,
};

// Google's real (invisible) button sits on top of our icon and takes the click.
function GoogleButton() {
  const { googleButtonRef, googleReady } = useGoogleSignIn();
  const iframeSize = `${SIZES.iconButton.mobile}px !important`;
  return (
    <Box sx={{ position: 'relative', width: SIZES.iconButton.mobile, height: SIZES.iconButton.mobile, flexShrink: 0 }}>
      <Tooltip title="Google">
        <IconButton aria-label="Continue with Google" onClick={() => window.google?.accounts?.id?.prompt()} sx={socialButtonSx}>
          <GoogleIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Box
        ref={googleButtonRef}
        sx={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.01, pointerEvents: googleReady ? 'auto' : 'none', '& iframe': { width: iframeSize, height: iframeSize } }}
      />
    </Box>
  );
}

export default function SocialSignInButtons() {
  return (
    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', alignItems: 'center' }}>
      {GOOGLE_CLIENT_ID && <GoogleButton />}
      <Tooltip title="GitHub">
        <IconButton aria-label="Continue with GitHub" onClick={startGithubSignIn} sx={socialButtonSx}>
          <GitHubIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {/* LinkedIn is pending product approval on LinkedIn's side. */}
      <Tooltip title="LinkedIn (coming soon)">
        <span>
          <IconButton aria-label="LinkedIn (coming soon)" disabled sx={socialButtonSx}>
            <LinkedInIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
