import { Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Typography, TextField } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';

// Shared GitHub-style shell for Login / Signup: logo + title on top,
// a small outlined card for the form, and a second small card below it
// for the "switch to the other page" link.
export default function AuthShell({ title, children, footer }) {
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
        <CodeRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
      </Box>

      <Typography component="h1" sx={{ fontSize: '1.5rem', fontWeight: 300, mb: 2.5, textAlign: 'center' }}>
        {title}
      </Typography>

      <Paper elevation={0} variant="outlined" sx={{ p: 2.5, width: '100%', maxWidth: 340, borderRadius: 2 }}>
        {children}
      </Paper>

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

// Label above a small input, like GitHub's forms.
export function AuthField({ label, id, helperText, ...props }) {
  return (
    <Box>
      <Typography component="label" htmlFor={id} variant="body2" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <TextField id={id} size="small" fullWidth required helperText={helperText} {...props} />
    </Box>
  );
}
