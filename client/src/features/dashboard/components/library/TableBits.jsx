import { Box, ButtonBase, Skeleton, Typography } from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import { PAD_X } from './libraryConstants';
import useLibraryStyles from './libraryStyles';

// Clickable column title that toggles between ascending and descending order.
export function ColumnHeader({ label, width, sortKey, sortValue, onSort, disabled }) {
  const styles = useLibraryStyles();
  const asc = `${sortKey}-asc`;
  const desc = `${sortKey}-desc`;
  const active = sortValue === asc || sortValue === desc;
  const ArrowIcon = sortValue === asc ? ArrowUpwardRoundedIcon : ArrowDownwardRoundedIcon;
  return (
    <ButtonBase
      disabled={disabled}
      onClick={() => onSort(sortValue === desc ? asc : desc)}
      sx={{ width, justifyContent: 'flex-end', gap: 0.25, fontFamily: 'inherit', opacity: disabled ? 0.5 : 1, display: { xs: 'none', sm: 'flex' } }}
    >
      <Typography variant="caption" sx={[styles.headLabel, active && { color: 'text.primary' }]}>
        {label}
      </Typography>
      {active && <ArrowIcon sx={{ fontSize: 13 }} />}
    </ButtonBase>
  );
}

function SkeletonRow() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: PAD_X, py: 1.6, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Skeleton variant="circular" width={20} height={20} />
      <Skeleton variant="text" sx={{ flex: 1, maxWidth: 360 }} />
      <Box sx={{ flex: 1 }} />
      <Skeleton variant="text" width={52} />
    </Box>
  );
}

export function SkeletonRows({ count = 8 }) {
  return Array.from({ length: count }, (_, i) => <SkeletonRow key={i} />);
}
