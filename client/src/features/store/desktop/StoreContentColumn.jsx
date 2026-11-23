import { Box, Typography } from '@mui/material';
import { LAYOUT_SPACING, SIZES } from '../../../app/design/designTokens';
import ItemGrid from './ItemGrid';
import MerchNotice from './MerchNotice';
import StoreToolbar from './StoreToolbar';

// Middle column: only the item grid scrolls, so the sidebar and the filters stay put like on the Problems page.
export default function StoreContentColumn({ store, isPageOneWindowTall }) {
  const { search, setSearch, items, loading, data, error, merchLocked, user, balance, isAuthenticated, buy, setCourseSlug } = store;
  return (
    <Box
      component="section"
      aria-label="Store items"
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: SIZES.flexShrinkMinWidth, minHeight: SIZES.flexShrinkMinHeight, px: LAYOUT_SPACING.frameContentGutter, height: isPageOneWindowTall ? SIZES.fill : 'auto' }}
    >
      <StoreToolbar search={search} onSearch={setSearch} count={items.length} />
      {error && <Typography role="alert" color="error">{error}</Typography>}
      {merchLocked && <MerchNotice minSolved={data?.minSolvedForMerch} solved={user?.totalSolved ?? 0} />}
      <Box className="autohide-scroll" sx={{ flex: 1, minHeight: SIZES.flexShrinkMinHeight, overflowY: isPageOneWindowTall ? 'auto' : 'visible', pb: 2 }}>
        <ItemGrid items={items} loading={loading && !data} balance={balance} signedIn={isAuthenticated} onBuy={buy} onCourse={setCourseSlug} />
      </Box>
    </Box>
  );
}
