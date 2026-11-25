import { Typography } from '@mui/material';
import { LIB_ACCENT } from '../../dashboard/components/libraryStyle';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const MAX_SHOWN_COUNT = 99;
const badgeSx = {
  flexShrink: 0,
  minWidth: SIZES.unreadBadge,
  height: SIZES.unreadBadge,
  px: 0.75,
  borderRadius: RADII_PX.pill,
  display: 'grid',
  placeItems: 'center',
  bgcolor: LIB_ACCENT,
  color: COLOR_PALETTE.white,
  fontSize: FONT_SIZES.caption,
  fontWeight: FONT_WEIGHTS.bold,
};

// The round unread counter of the phone inbox rows and tabs. It is hidden from screen readers because the row or tab it
// belongs to already announces the count in its own label.
export default function UnreadBadge({ count, sx }) {
  if (!count || count < 1) return null;
  return (
    <Typography component="span" aria-hidden sx={{ ...badgeSx, ...sx }}>
      {count > MAX_SHOWN_COUNT ? `${MAX_SHOWN_COUNT}+` : count}
    </Typography>
  );
}
