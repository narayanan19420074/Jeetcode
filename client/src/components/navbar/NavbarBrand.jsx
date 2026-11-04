import { Box, Typography } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import BrandMark from '../BrandMark';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../app/design/designTokens';
import { navActiveColor } from './navLinkStyles';

// Logo: the plain icon on desktop, the app-logo tile on phones (same drawing as the installed app icon).
export function LogoMark() {
  return (
    <>
      <Box sx={(theme) => ({ display: { xs: 'none', md: 'grid' }, width: SIZES.iconSize.medium, height: SIZES.iconSize.medium, placeItems: 'center', flexShrink: 0, color: navActiveColor(theme) })}>
        <CodeRoundedIcon sx={{ fontSize: FONT_SIZES.display }} />
      </Box>
      <BrandMark size={SIZES.iconButton.mobile} sx={{ display: { xs: 'block', md: 'none' } }} />
    </>
  );
}

// "Code" and the </> icon use the navigation blue (the same blue as the active navigation link) on desktop and phones.
export function LogoName() {
  return (
    <Typography
      variant="h6"
      sx={(t) => ({
        fontWeight: FONT_WEIGHTS.bold,
        letterSpacing: '-0.02em',
        [t.breakpoints.down('md')]: { fontSize: FONT_SIZES.heading, lineHeight: '24px', fontWeight: FONT_WEIGHTS.bold, letterSpacing: 0 },
      })}
    >
      Jeet
      <Box component="span" sx={(theme) => ({ color: navActiveColor(theme) })}>
        Code
      </Box>
    </Typography>
  );
}
