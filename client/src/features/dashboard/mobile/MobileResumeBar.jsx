import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Typography, alpha } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { LIB_ACCENT } from '../components/libraryStyle';
import { STATUS_COLOR } from '../dashboardUtils';

const BAR_TINT = { dark: 0.22, light: 0.14 };
const BORDER_TINT = 0.25;
const ICON_TILE_TINT = 0.2;
// Sits above the phone bottom navigation (its height plus a small gap) and above the device's safe area.
const aboveBottomNav = `calc(${SIZES.bottomNavHeight}px + 1.25rem + env(safe-area-inset-bottom))`;

const barSx = (theme) => ({
  position: 'fixed',
  left: 16,
  right: 16,
  bottom: aboveBottomNav,
  zIndex: theme.zIndex.appBar - 1,
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  pl: 1.5,
  pr: 0.5,
  py: 1,
  borderRadius: RADII_PX.card,
  bgcolor: alpha(LIB_ACCENT, BAR_TINT[theme.palette.mode] ?? BAR_TINT.light),
  backdropFilter: 'blur(12px)',
  border: `1px solid ${alpha(LIB_ACCENT, BORDER_TINT)}`,
});

const iconTileSx = {
  width: SIZES.iconButton.mobile,
  height: SIZES.iconButton.mobile,
  borderRadius: RADII_PX.card,
  flexShrink: 0,
  display: 'grid',
  placeItems: 'center',
  bgcolor: alpha(LIB_ACCENT, ICON_TILE_TINT),
  color: LIB_ACCENT,
};

// Phones: a bar above the bottom navigation that continues the last unfinished attempt. It can be dismissed for that attempt.
export default function MobileResumeBar({ resume, onDismiss }) {
  const workspacePath = `/workspace/${resume.problem.slug}`;
  return (
    <Box sx={barSx}>
      <Box sx={iconTileSx}>
        <PlayArrowRoundedIcon />
      </Box>
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg, lineHeight: 1.25 }}>
          {resume.problem.title}
        </Typography>
        <Typography noWrap variant="caption" color="text.secondary">
          Pick up where you left off ·{' '}
          <Box component="span" sx={{ color: STATUS_COLOR[resume.status] || 'text.secondary', fontWeight: FONT_WEIGHTS.semibold }}>
            {resume.status}
          </Box>
        </Typography>
      </Box>
      <IconButton component={RouterLink} to={workspacePath} aria-label={`Resume ${resume.problem.title}`} sx={{ color: LIB_ACCENT }}>
        <PlayArrowRoundedIcon />
      </IconButton>
      <IconButton size="small" aria-label="Dismiss resume bar" onClick={onDismiss}>
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
