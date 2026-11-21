import { Box, Paper, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

export const cardSx = { p: 2, borderRadius: RADII_PX.card };

export function SectionTitle({ children }) {
  return <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.title, mb: 1.5 }}>{children}</Typography>;
}

export function StatTile({ label, value, sub }) {
  return (
    <Paper variant="outlined" sx={cardSx}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

const rowSx = {
  all: 'unset',
  boxSizing: 'border-box',
  width: SIZES.fill,
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  py: 1.5,
  cursor: 'pointer',
  borderBottom: '1px solid',
  borderColor: 'divider',
  '&:last-of-type': { borderBottom: 0 },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2, borderRadius: RADII_PX.card },
  '&:hover': { bgcolor: 'action.hover' },
};

// One clickable row; lists and submissions share it.
export function ListRow({ leading, title, subtitle, trailing, onClick }) {
  return (
    <Box component="button" type="button" onClick={onClick} sx={rowSx}>
      {leading}
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.semibold }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {subtitle}
        </Typography>
      </Box>
      {trailing ?? <ChevronRightRoundedIcon sx={{ color: 'text.disabled' }} />}
    </Box>
  );
}
