import { Box, Button, ButtonBase, Stack, Typography } from '@mui/material';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { pillButtonSx } from '../../dashboard/components/libraryDesktopStyles';
import StoreBadge from '../common/StoreBadge';
import { itemAction } from '../common/storeSelectors';
import { Coins, ItemArt, fmt, priceNote } from '../storeUtils';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';

const ROSE = COLOR_PALETTE.rose[600];
const TWO_LINES = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };

function ItemPicture({ item, label, onOpen, disabled }) {
  const note = priceNote(item);
  return (
    <ButtonBase onClick={onOpen} disabled={disabled} aria-label={`${label}: ${item.name}`} sx={{ position: 'relative', display: 'block', width: '100%' }}>
      <ItemArt art={item.art} accent={item.accent} height={150} image={item.image} />
      {(item.popular || note) && (
        <Stack direction="row" sx={{ position: 'absolute', top: 10, left: 10, gap: 0.75, flexWrap: 'wrap' }}>
          {item.popular && <StoreBadge color={LIB_ACCENT}>Popular</StoreBadge>}
          {note && <StoreBadge color={ROSE}>{note}</StoreBadge>}
        </Stack>
      )}
    </ButtonBase>
  );
}

function PriceLine({ item, balance, showShortfall, palette }) {
  return (
    <Box>
      <Coins value={item.price} size={20} />
      {showShortfall && <Typography sx={{ mt: 0.25, fontSize: FONT_SIZES.body, color: palette.muted }}>Need {fmt(item.price - balance)} more</Typography>}
    </Box>
  );
}

export default function StoreItemCard({ item, balance, signedIn, onBuy, onCourse }) {
  const palette = useLibraryPalette();
  const action = itemAction(item, balance, signedIn);
  const open = () => (action.opensCourse ? onCourse(item.slug) : onBuy(item));
  const showShortfall = !action.owned && signedIn && !action.afford && !action.soldOut;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, borderRadius: '16px', overflow: 'hidden', opacity: action.soldOut ? 0.65 : 1, bgcolor: palette.chip, border: `1px solid ${palette.border}`, transition: 'border-color .15s', '&:hover': { borderColor: LIB_ACCENT } }}>
      <ItemPicture item={item} label={action.label} onOpen={open} disabled={action.soldOut} />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2, gap: 0.5, minWidth: 0 }}>
        <Typography component="h3" sx={[{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, lineHeight: '22px', letterSpacing: LIB_TRACKING }, TWO_LINES]}>{item.name}</Typography>
        <Typography noWrap title={item.blurb} sx={{ fontSize: FONT_SIZES.body, color: palette.muted }}>{item.blurb}</Typography>
        <Box sx={{ mt: 'auto', pt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <PriceLine item={item} balance={balance} showShortfall={showShortfall} palette={palette} />
          <Button onClick={open} disabled={action.soldOut} disableElevation sx={pillButtonSx(action.afford && !action.owned, palette)}>{action.label}</Button>
        </Box>
      </Box>
    </Box>
  );
}
