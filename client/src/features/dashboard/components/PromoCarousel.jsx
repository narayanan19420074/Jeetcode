import { Box, IconButton } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PromoCard from './PromoCard';
import { PROMO_GAP } from './promoCarouselConfig';
import usePromoCarousel from './usePromoCarousel';
import { COLOR_PALETTE, withAlpha, Z_INDEX, SHADOWS } from '../../../app/design/designTokens';

const TRACK_SX = {
  display: 'flex',
  gap: `${PROMO_GAP}px`,
  overflowX: 'auto',
  scrollSnapType: 'x proximity',
  pb: 0.5,
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

const arrowSx = (dir, hidden) => (t) => ({
  position: 'absolute',
  top: '50%',
  [dir < 0 ? 'left' : 'right']: -10,
  transform: 'translateY(-50%)',
  zIndex: Z_INDEX.raised,
  display: hidden ? 'none' : 'inline-flex',
  bgcolor: t.palette.background.paper,
  border: `1px solid ${t.palette.divider}`,
  boxShadow: SHADOWS.drop('md', withAlpha(COLOR_PALETTE.custom.black1A1613, 0.4)),
  '&:hover': { bgcolor: t.palette.background.paper, borderColor: t.palette.primary.main },
});

function ArrowButton({ dir, hidden, onClick }) {
  const Icon = dir < 0 ? ChevronLeftRoundedIcon : ChevronRightRoundedIcon;
  return (
    <IconButton onClick={() => onClick(dir)} aria-label={dir < 0 ? 'Previous banners' : 'Next banners'} size="small" sx={arrowSx(dir, hidden)}>
      <Icon fontSize="small" />
    </IconButton>
  );
}

// Swipeable banners in the phone Library look (gradient, ring icon). Auto-advances; see usePromoCarousel.
export default function PromoCarousel({ cards }) {
  const { rootRef, trackRef, edge, scrollByCards, rootProps, trackProps } = usePromoCarousel(cards.length);
  if (!cards.length) return null;
  return (
    <Box ref={rootRef} sx={{ position: 'relative' }} {...rootProps}>
      <ArrowButton dir={-1} hidden={edge.start} onClick={scrollByCards} />
      <ArrowButton dir={1} hidden={edge.end} onClick={scrollByCards} />
      <Box ref={trackRef} {...trackProps} sx={TRACK_SX}>
        {cards.map((card) => (
          <PromoCard key={card.key} card={card} />
        ))}
      </Box>
    </Box>
  );
}
