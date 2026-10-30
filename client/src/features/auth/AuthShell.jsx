import { Link as RouterLink } from 'react-router-dom';
import { Box, Link, Paper, Typography, TextField, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import BrandMark from '../../components/BrandMark';
import { LIBRARY_PALETTE, LIB_ACCENT, LIB_TRACKING, LibraryFont, libPanelSx, useLibraryPalette } from '../dashboard/components/libraryStyle';

// Phones (below the md breakpoint) get the Library look: warm cream page, Roboto, pill fields and buttons.
// Larger screens keep the GitHub-style card layout.
export function useAuthPhone() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
}

// Pill field: 48px tall, cream fill, no border until focused.
const phoneFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 999,
    height: 48,
    bgcolor: 'var(--lib-player)',
    fontSize: 18,
    letterSpacing: LIB_TRACKING,
    px: '20px',
  },
  '& .MuiOutlinedInput-input': { p: 0, height: '100%' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: LIB_ACCENT, borderWidth: 2 },
  '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: 'error.main' },
  '& input:-webkit-autofill': {
    WebkitBoxShadow: '0 0 0 100px var(--lib-player) inset',
    WebkitTextFillColor: 'var(--lib-text)',
    caretColor: 'var(--lib-text)',
    borderRadius: 999,
  },
  '& .MuiFormHelperText-root': { mx: '20px', mt: 0.75, fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING },
};

// Buttons and alerts that the auth pages render inside the shell pick up the Library look from here,
// so every auth page (sign in, sign up, reset) matches without editing each one.
const phoneControlsSx = {
  '& .MuiButton-contained': {
    height: 48,
    px: 3,
    borderRadius: 999,
    fontSize: 18,
    fontWeight: 500,
    letterSpacing: LIB_TRACKING,
    textTransform: 'none',
    boxShadow: 'none',
    bgcolor: LIB_ACCENT,
    color: '#fff',
    '&:hover': { bgcolor: `color-mix(in srgb, ${LIB_ACCENT} 85%, #000)` },
    '&.Mui-disabled': { bgcolor: 'var(--lib-chip)', color: 'var(--lib-muted)' },
  },
  '& .MuiAlert-root': { borderRadius: '16px', fontSize: 15, letterSpacing: LIB_TRACKING },
};

function PhoneShell({ title, subtitle, children, footer }) {
  const pal = useLibraryPalette();
  return (
    <Box
      sx={(t) => ({
        minHeight: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        px: 2,
        pt: 'calc(32px + env(safe-area-inset-top))',
        pb: 'calc(32px + env(safe-area-inset-bottom))',
        bgcolor: t.palette.mode === 'light' ? LIBRARY_PALETTE.light.bg : 'background.default',
      })}
    >
      <LibraryFont sx={{ width: '100%', maxWidth: 440, ...phoneControlsSx }}>
        <Box component={RouterLink} to="/" aria-label="JeetCode home" sx={{ display: 'block', width: 'fit-content', mx: 'auto' }}>
          <BrandMark size={72} />
        </Box>

        <Typography component="h1" sx={{ mt: 2, textAlign: 'center', fontWeight: 700, fontSize: 26, lineHeight: '32px' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ mt: 0.5, textAlign: 'center', fontSize: 17, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: pal.muted }}>
            {subtitle}
          </Typography>
        )}

        <Box sx={{ mt: 3 }}>{children}</Box>

        <Typography sx={{ mt: 3, textAlign: 'center', fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>
          By continuing you agree to our{' '}
          <Link component={RouterLink} to="/terms" underline="hover">Terms</Link>
          {' '}and{' '}
          <Link component={RouterLink} to="/privacy" underline="hover">Privacy Policy</Link>.
        </Typography>

        {footer && (
          <Box sx={{ ...libPanelSx, mt: 2, p: 2, textAlign: 'center', fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>
            {footer}
          </Box>
        )}
      </LibraryFont>
    </Box>
  );
}

// Shared GitHub-style shell for Login / Signup: logo + title on top,
// a small outlined card for the form, and a second small card below it
// for the "switch to the other page" link. On phones it uses the Library look instead.
export default function AuthShell({ title, subtitle, children, footer }) {
  const phone = useAuthPhone();
  if (phone) {
    return (
      <PhoneShell title={title} subtitle={subtitle} footer={footer}>
        {children}
      </PhoneShell>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: 'background.default',
        px: 2,
        pt: { xs: 4, sm: 8 },
        pb: 4,
      }}
    >
      <Box
        component={RouterLink}
        to="/"
        aria-label="JeetCode home"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', mb: 2 }}
      >
        <CodeRoundedIcon sx={{ fontSize: 40, color: 'primary.main', display: { xs: 'none', md: 'block' } }} />
        <BrandMark size={56} sx={{ display: { xs: 'block', md: 'none' } }} />
      </Box>

      <Typography component="h1" sx={{ fontSize: '1.5rem', fontWeight: 300, mb: 2.5, textAlign: 'center' }}>
        {title}
      </Typography>

      <Paper elevation={0} variant="outlined" sx={{ p: 2.5, width: '100%', maxWidth: 340, borderRadius: 2 }}>
        {children}
      </Paper>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, maxWidth: 340, textAlign: 'center', lineHeight: 1.6 }}>
        By continuing you agree to our{' '}
        <Link component={RouterLink} to="/terms" underline="hover">Terms</Link>
        {' '}and{' '}
        <Link component={RouterLink} to="/privacy" underline="hover">Privacy Policy</Link>.
      </Typography>

      {footer && (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 2, mt: 2, width: '100%', maxWidth: 340, borderRadius: 2, textAlign: 'center' }}
        >
          <Typography variant="body2">{footer}</Typography>
        </Paper>
      )}
    </Box>
  );
}

// Label above an input. Small GitHub-style input on larger screens, Library pill on phones.
export function AuthField({ label, id, helperText, ...props }) {
  const phone = useAuthPhone();
  if (phone) {
    return (
      <Box>
        <Typography component="label" htmlFor={id} sx={{ display: 'block', mb: 0.75, ml: 2, fontSize: 15, lineHeight: '20px', fontWeight: 500, letterSpacing: LIB_TRACKING }}>
          {label}
        </Typography>
        <TextField id={id} fullWidth required helperText={helperText} sx={phoneFieldSx} {...props} />
      </Box>
    );
  }
  return (
    <Box>
      <Typography component="label" htmlFor={id} variant="body2" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <TextField id={id} size="small" fullWidth required helperText={helperText} {...props} />
    </Box>
  );
}
