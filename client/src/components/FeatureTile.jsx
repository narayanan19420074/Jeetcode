import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AppCard from './ui/AppCard';
import { COLOR_PALETTE, RADII_PX, SIZES } from '../app/design/designTokens';

const CLAMP_TWO_LINES = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };

function FeatureIcon({ color, children }) {
  const size = SIZES.avatar.md;
  const tileSx = { width: size, height: size, borderRadius: RADII_PX.control, bgcolor: color, color: COLOR_PALETTE.white };
  return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...tileSx }}>{children}</Box>;
}

// Dashboard tile that opens a feature page. It is a real link, so it works with the keyboard and opens in a new tab.
export default function FeatureTile({ icon, title, description, to, badge = 'New', accentColor = 'primary.main' }) {
  return (
    <AppCard interactive component={RouterLink} to={to} sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FeatureIcon color={accentColor}>{icon}</FeatureIcon>
        {badge && (
          <Typography variant="micro" sx={{ fontWeight: 'fontWeightBold', color: accentColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {badge}
          </Typography>
        )}
      </Box>
      <Typography variant="subtitle2">{title}</Typography>
      <Typography variant="caption" color="text.secondary" sx={CLAMP_TWO_LINES}>{description}</Typography>
    </AppCard>
  );
}
