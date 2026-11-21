import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';

const linkSx = { color: LIB_ACCENT, fontWeight: FONT_WEIGHTS.medium, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } };
const buttonLinkSx = { ...linkSx, p: 0, border: 0, bgcolor: 'transparent', font: 'inherit', cursor: 'pointer' };

// License keys are an alternative to paying: only users without Pro are offered the activation link.
export function LicensePrompt({ onActivate }) {
  const pal = useLibraryPalette();
  return (
    <Typography sx={{ mt: 2.5, textAlign: 'center', fontSize: FONT_SIZES.bodyLg, lineHeight: '22px', letterSpacing: LIB_TRACKING, color: pal.muted }}>
      Have a license key?{' '}
      <Box component="button" type="button" onClick={onActivate} sx={buttonLinkSx}>
        Activate license
      </Box>
    </Typography>
  );
}

export function PlansLegalNote() {
  const pal = useLibraryPalette();
  return (
    <Typography sx={{ mt: 2.5, textAlign: 'center', fontSize: FONT_SIZES.body, lineHeight: '22px', letterSpacing: LIB_TRACKING, color: pal.muted }}>
      Subscriptions renew automatically until cancelled. See the{' '}
      <Box component={RouterLink} to="/refund" sx={linkSx}>Refund &amp; Cancellation Policy</Box>,{' '}
      <Box component={RouterLink} to="/terms" sx={linkSx}>Terms</Box> and{' '}
      <Box component={RouterLink} to="/privacy" sx={linkSx}>Privacy Policy</Box>.
    </Typography>
  );
}
