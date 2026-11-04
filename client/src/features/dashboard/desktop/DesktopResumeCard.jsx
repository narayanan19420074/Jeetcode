import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography, alpha } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { STATUS_COLOR, surface } from '../dashboardUtils';

const RESUME_TINT = { dark: 0.14, light: 0.08 };

const resumeCardSx = (theme) => ({
  px: 2,
  py: 1.5,
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, RESUME_TINT[theme.palette.mode] ?? RESUME_TINT.light)}, transparent 55%), ${theme.palette.background.paper}`,
});

const playBadgeSx = {
  width: SIZES.controlHeight.desktop,
  height: SIZES.controlHeight.desktop,
  borderRadius: RADII_PX.circle,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
};

// Wide screens keep this card on the page while an unfinished attempt exists, so the person can resume it at any time.
export default function DesktopResumeCard({ resume }) {
  return (
    <Box sx={[surface, resumeCardSx]}>
      <Box sx={playBadgeSx}>
        <PlayArrowRoundedIcon fontSize="small" />
      </Box>
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Pick up where you left off
        </Typography>
        <Typography variant="body2" noWrap sx={{ fontWeight: FONT_WEIGHTS.bold }}>
          {resume.problem.title}{' '}
          <Box component="span" sx={{ color: STATUS_COLOR[resume.status] || 'text.secondary', fontWeight: FONT_WEIGHTS.semibold }}>
            ({resume.status})
          </Box>
        </Typography>
      </Box>
      <Button component={RouterLink} to={`/workspace/${resume.problem.slug}`} size="small" variant="contained" disableElevation sx={{ fontWeight: FONT_WEIGHTS.bold, flexShrink: 0 }}>
        Resume
      </Button>
    </Box>
  );
}
