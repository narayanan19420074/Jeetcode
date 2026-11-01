import { Box, Button, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

function AssistantLine({ text }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.75, mt: 1, color: 'var(--lib-muted)' }}>
      <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
      <Typography variant="body2" sx={{ textAlign: 'center' }}>
        {text}
      </Typography>
    </Box>
  );
}

// The frame shared by every screen: optional back link, title, assistant line, content and footnote.
export default function StepCard({ title, assistantLine, onBack, footnote, children }) {
  return (
    <Box sx={{ p: 3, borderRadius: '24px', bgcolor: 'background.paper', border: '1px solid var(--lib-divider)', boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>
      <Box sx={{ minHeight: 36 }}>
        {onBack && (
          <Button size="small" color="inherit" startIcon={<ArrowBackRoundedIcon />} onClick={onBack}>
            Back
          </Button>
        )}
      </Box>
      <Typography component="h2" variant="h5" sx={{ textAlign: 'center', fontWeight: 500 }}>
        {title}
      </Typography>
      {assistantLine && <AssistantLine text={assistantLine} />}
      <Box sx={{ mt: 3 }}>{children}</Box>
      {footnote && (
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'var(--lib-muted)' }}>
          {footnote}
        </Typography>
      )}
    </Box>
  );
}
