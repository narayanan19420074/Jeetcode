import { useSelector } from 'react-redux';
import { Box, ButtonBase, IconButton, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from './libraryStyle';
import { COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

// Red pill with the number of friend requests and unread chat messages waiting for me (both live).
export function RequestBadge({ requests }) {
  const unread = useSelector((s) => Object.values(s.friends.unread).reduce((a, c) => a + c, 0));
  const n = (requests || 0) + unread;
  if (!n) return null;
  return (
    <Box component="span" aria-label={`${n} friend notifications`} sx={{ minWidth: 20, height: 20, px: 0.5, borderRadius: RADII_PX.pill, bgcolor: 'error.main', color: 'error.contrastText', fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, display: 'grid', placeItems: 'center' }}>
      {n}
    </Box>
  );
}

// Pill button like the phone chips: cream when idle, accent when selected.
const navButtonSx = (pal, active, dense) => ({
  width: '100%',
  justifyContent: 'flex-start',
  gap: dense ? 1 : 1.5,
  px: dense ? 1.5 : 2,
  height: dense ? SIZES.navItemHeightDense : SIZES.navItemHeight,
  borderRadius: RADII_PX.pill,
  textAlign: 'left',
  fontFamily: 'inherit',
  letterSpacing: LIB_TRACKING,
  color: active ? COLOR_PALETTE.white : pal.text,
  bgcolor: active ? LIB_ACCENT : 'transparent',
  '&:hover': { bgcolor: active ? `color-mix(in srgb, ${LIB_ACCENT} 85%, ${COLOR_PALETTE.black})` : pal.chip },
  '&.Mui-focusVisible': { outline: `2px solid ${LIB_ACCENT}`, outlineOffset: 1 },
});

// `dense` shrinks the row, the icon and the label for long lists.
export function NavButton({ active, icon: Icon, label, count, accent, onClick, trailing, dense = false }) {
  const pal = useLibraryPalette();
  return (
    <ButtonBase onClick={onClick} aria-current={active ? 'page' : undefined} sx={navButtonSx(pal, active, dense)}>
      <Icon sx={{ fontSize: dense ? FONT_SIZES.title : FONT_SIZES.display, color: active ? COLOR_PALETTE.white : accent || pal.muted }} />
      <Typography noWrap sx={{ flex: 1, fontSize: dense ? FONT_SIZES.body : FONT_SIZES.bodyLg, fontWeight: active ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium, letterSpacing: LIB_TRACKING }}>
        {label}
      </Typography>
      {count !== undefined && (
        <Typography variant="caption" sx={{ color: active ? withAlpha(COLOR_PALETTE.white, 0.8) : pal.muted, fontVariantNumeric: 'tabular-nums' }}>
          {count}
        </Typography>
      )}
      {trailing}
    </ButtonBase>
  );
}

export function ListsHeader({ atLimit, onCreate }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ mt: 2, mb: 0.5, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold }}>My Lists</Typography>
      <Tooltip title={atLimit ? 'List limit reached' : 'New list'}>
        <span>
          <IconButton
            size="small"
            onClick={onCreate}
            disabled={atLimit}
            aria-label="Create a list"
            sx={{ width: 32, height: 32, bgcolor: pal.player, color: pal.text, '&:hover': { bgcolor: pal.player, filter: 'brightness(0.97)' } }}
          >
            <AddRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
