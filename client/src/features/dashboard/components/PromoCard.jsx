import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { BANNER_GRADIENT } from '../bannerGradients';
import { PROMO_CARD_W } from './promoCarouselConfig';
import { COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';

const TRACKING = '0.03em';

const cardSx = (gradient) => ({
  position: 'relative',
  flex: '0 0 auto',
  width: PROMO_CARD_W,
  height: 150,
  scrollSnapAlign: 'start',
  overflow: 'hidden',
  borderRadius: RADII_PX.card,
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  color: COLOR_PALETTE.white,
  textDecoration: 'none',
  background: gradient,
  '&:hover': { filter: 'brightness(1.06)' },
  '&:focus-visible': { outline: `3px solid ${COLOR_PALETTE.white}`, outlineOffset: -4 },
});

// Same ring icon as the phone banners.
function RingIcon({ icon: Icon }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        right: 20,
        top: 20,
        width: 64,
        height: 64,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        border: `5px solid ${withAlpha(COLOR_PALETTE.white, 0.55)}`,
        background: `linear-gradient(160deg, ${withAlpha(COLOR_PALETTE.white, 0.25)}, ${withAlpha(COLOR_PALETTE.white, 0.05)})`,
      }}
    >
      <Icon sx={{ fontSize: FONT_SIZES.hero, color: COLOR_PALETTE.white }} />
    </Box>
  );
}

const clampLines = (lines) => ({ display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden' });

export default function PromoCard({ card }) {
  const { key, title, text, cta, to, icon } = card;
  return (
    <Box component={RouterLink} to={to} sx={cardSx(BANNER_GRADIENT[key] || card.gradient)}>
      <RingIcon icon={icon} />
      <Box sx={{ position: 'relative', maxWidth: '62%' }}>
        <Typography sx={[{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.heading, lineHeight: '24px', letterSpacing: '-0.01em' }, clampLines(2)]}>{title}</Typography>
        <Typography sx={[{ mt: 0.5, fontSize: FONT_SIZES.body, lineHeight: '18px', letterSpacing: TRACKING, color: withAlpha(COLOR_PALETTE.white, 0.86) }, clampLines(2)]}>{text}</Typography>
      </Box>
      <Box sx={{ position: 'relative', alignSelf: 'flex-start', px: 2, height: 28, display: 'inline-flex', alignItems: 'center', borderRadius: RADII_PX.pill, bgcolor: withAlpha(COLOR_PALETTE.white, 0.2), fontSize: FONT_SIZES.body, letterSpacing: TRACKING }}>
        {cta}
      </Box>
    </Box>
  );
}
