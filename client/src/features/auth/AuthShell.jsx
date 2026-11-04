import { Link as RouterLink } from 'react-router-dom';
import { Box, Link, Paper, Typography, TextField } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import BrandMark from '../../components/BrandMark';
import { FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, RADII_PX, SIZES } from '../../app/design/designTokens';

const cardSx = { width: SIZES.fill, maxWidth: SIZES.authCardWidth, borderRadius: RADII_PX.card };

function AuthLogo() {
  return (
    <Box component={RouterLink} to="/" aria-label="JeetCode home" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', mb: 2 }}>
      <CodeRoundedIcon sx={{ fontSize: FONT_SIZES.heroLg, color: 'primary.main', display: { xs: 'none', md: 'block' } }} />
      <BrandMark size={SIZES.avatar.lg} sx={{ display: { xs: 'block', md: 'none' } }} />
    </Box>
  );
}

function LegalNote() {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, maxWidth: SIZES.authCardWidth, textAlign: 'center', lineHeight: LINE_HEIGHTS.relaxed }}>
      By continuing you agree to our{' '}
      <Link component={RouterLink} to="/terms" underline="hover">Terms</Link>
      {' '}and{' '}
      <Link component={RouterLink} to="/privacy" underline="hover">Privacy Policy</Link>.
    </Typography>
  );
}

// Shared GitHub-style shell for Login / Signup: logo + title on top, a small outlined card for the form,
// and a second small card below it for the "switch to the other page" link.
// The page surface is the theme background, so it follows the design tokens in light and dark mode.
export default function AuthShell({ title, children, footer }) {
  return (
    <Box sx={{ minHeight: SIZES.viewportHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'background.default', px: 2, pt: { xs: 4, sm: 8 }, pb: 4 }}>
      <AuthLogo />
      <Typography component="h1" sx={{ fontSize: FONT_SIZES.display, fontWeight: FONT_WEIGHTS.regular, mb: 2.5, textAlign: 'center' }}>
        {title}
      </Typography>
      <Paper elevation={0} variant="outlined" sx={{ ...cardSx, p: 2.5 }}>
        {children}
      </Paper>
      <LegalNote />
      {footer && (
        <Paper elevation={0} variant="outlined" sx={{ ...cardSx, p: 2, mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">{footer}</Typography>
        </Paper>
      )}
    </Box>
  );
}

// Label above a small input, like GitHub's forms.
export function AuthField({ label, id, helperText, ...props }) {
  return (
    <Box>
      <Typography component="label" htmlFor={id} variant="body2" sx={{ fontWeight: FONT_WEIGHTS.semibold, display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <TextField id={id} size="small" fullWidth required helperText={helperText} {...props} />
    </Box>
  );
}
