import { Box, Skeleton, Typography } from '@mui/material';
import { useLibraryPalette } from '../../dashboard/components/libraryStyle';
import StoreItemCard from './StoreItemCard';
import { FONT_WEIGHTS, FONT_SIZES } from '../../../app/design/designTokens';

const COLUMNS = { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' };
const SKELETON_COUNT = 8;

function EmptyShelf({ palette }) {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.subheading }}>Nothing here yet</Typography>
      <Typography sx={{ mt: 0.5, color: palette.muted }}>Try another category.</Typography>
    </Box>
  );
}

export default function ItemGrid({ items, loading, balance, signedIn, onBuy, onCourse }) {
  const palette = useLibraryPalette();
  if (!loading && items.length === 0) return <EmptyShelf palette={palette} />;
  return (
    <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: COLUMNS }}>
      {loading
        ? Array.from({ length: SKELETON_COUNT }, (_, i) => <Skeleton key={i} variant="rounded" height={300} sx={{ borderRadius: '16px' }} />)
        : items.map((item) => <StoreItemCard key={item.slug} item={item} balance={balance} signedIn={signedIn} onBuy={onBuy} onCourse={onCourse} />)}
    </Box>
  );
}
