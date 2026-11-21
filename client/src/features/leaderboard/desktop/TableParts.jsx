import { Box, Button, Skeleton, Typography } from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES, Z_INDEX } from '../../../app/design/designTokens';
import { STATS_LABEL, statsColumnWidth } from './columns';

// Column titles of the table. Sticky, so they stay visible while the rows scroll under them.
export function TableHead({ track, wide }) {
  const pal = useLibraryPalette();
  const label = { fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium, letterSpacing: LIB_TRACKING, color: pal.muted, whiteSpace: 'nowrap' };
  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: Z_INDEX.raised, display: 'flex', alignItems: 'center', gap: 1.5, px: 2, height: SIZES.listRowHeight, bgcolor: pal.chip, borderBottom: `1px solid ${pal.divider}` }}>
      <Typography sx={[label, { flex: 1 }]}>Player</Typography>
      {wide && <Typography sx={[label, { width: statsColumnWidth(track), textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis' }]}>{STATS_LABEL[track]}</Typography>}
      {wide && <Typography sx={[label, { width: SIZES.leaderboard.recentColumn, textAlign: 'right' }]}>7 days</Typography>}
      <Typography sx={[label, { width: SIZES.leaderboard.pointsColumn, textAlign: 'right' }]}>Points</Typography>
    </Box>
  );
}

export function SkeletonRow({ index }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1 }}>
      <Skeleton variant="rounded" width={SIZES.leaderboard.rankTile} height={SIZES.leaderboard.rankTile} />
      <Skeleton variant="circular" width={SIZES.leaderboard.rowAvatar} height={SIZES.leaderboard.rowAvatar} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width={`${40 + ((index * 17) % 35)}%`} />
        <Skeleton variant="text" width="25%" />
      </Box>
      <Skeleton variant="text" width={SIZES.leaderboard.pointsColumn} />
    </Box>
  );
}

export function EmptyTopPlayer() {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ py: 3, px: 2, textAlign: 'center', borderRadius: RADII_PX.card, bgcolor: pal.chip, border: `1px solid ${pal.border}` }}>
      <EmojiEventsRoundedIcon sx={{ fontSize: FONT_SIZES.heroLg, color: COLOR_PALETTE.amber[500] }} />
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold }}>No top player yet</Typography>
      <Typography sx={{ fontSize: FONT_SIZES.body, color: pal.muted }}>Solve a question to take the first place.</Typography>
    </Box>
  );
}

function emptyMessage({ q, scope }) {
  if (q) return `No player matches "${q}".`;
  return scope === 'friends' ? 'No friends on this board yet.' : 'No one has scored in this period yet.';
}

// Offers the one step that is most likely to bring players back into view.
export function EmptyList({ q, scope, period, onClearSearch, onShowEveryone, onShowAllTime }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ py: 5, px: 3, textAlign: 'center' }}>
      <EmojiEventsRoundedIcon sx={{ fontSize: FONT_SIZES.heroLg, color: pal.muted, opacity: 0.6 }} />
      <Typography sx={{ mt: 0.5, fontWeight: FONT_WEIGHTS.bold }}>{emptyMessage({ q, scope })}</Typography>
      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
        {q && <Button variant="outlined" size="small" onClick={onClearSearch}>Clear search</Button>}
        {!q && scope === 'friends' && <Button variant="outlined" size="small" onClick={onShowEveryone}>Show everyone</Button>}
        {!q && period !== 'all' && <Button variant="outlined" size="small" onClick={onShowAllTime}>Show all-time</Button>}
      </Box>
    </Box>
  );
}
