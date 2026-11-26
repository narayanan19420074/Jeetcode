import { Avatar, Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { DIFF_COLOR } from '../../dashboard/dashboardUtils';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, MOTION, RADII_PX, SIZES } from '../../../app/design/designTokens';
import FriendRequestButton from '../../friends/common/FriendRequestButton';
import { tierFor } from '../tiers';
import { APT_COLOR, PT } from '../lbShared';
import { TABULAR } from './lbLook';

function SolvedTile({ label, count, points, color }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ p: 1, textAlign: 'center', minWidth: SIZES.flexShrinkMinWidth, borderRadius: RADII_PX.control, bgcolor: pal.player }}>
      <Typography sx={[{ fontSize: FONT_SIZES.heading, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.2, color }, TABULAR]}>{count}</Typography>
      <Typography variant="caption" noWrap sx={{ display: 'block', fontWeight: FONT_WEIGHTS.semibold, color: pal.text }}>{label}</Typography>
      <Typography variant="caption" sx={[{ fontSize: FONT_SIZES.micro, color: pal.muted }, TABULAR]}>{count * points} pts</Typography>
    </Box>
  );
}

function TierBar({ row }) {
  const pal = useLibraryPalette();
  const { tier, next, progress, toNext } = tierFor(row.score);
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: tier.color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body }}>
          <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.subheading }} />{tier.name}
        </Box>
        <Typography variant="caption" sx={{ color: pal.muted }}>{next ? `${toNext.toLocaleString()} pts to ${next.name}` : 'Top level reached'}</Typography>
      </Box>
      <Box sx={{ height: SIZES.leaderboard.progress, borderRadius: RADII_PX.pill, bgcolor: pal.divider, overflow: 'hidden' }}>
        <Box sx={{ width: `${Math.max(progress, 4)}%`, height: SIZES.fill, borderRadius: RADII_PX.pill, bgcolor: tier.color, transition: `width ${MOTION.progress}ms ease` }} />
      </Box>
      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: pal.muted }}>{row.recent} solved in the last 7 days</Typography>
    </Box>
  );
}

// What this player has solved, and how far the next level is, with the Add friend button. Opens in a popover when there is no side panel.
export default function RowDetail({ row }) {
  const pal = useLibraryPalette();
  const { tier } = tierFor(row.score);
  const tiles = [['Easy', row.easy, PT.easy, DIFF_COLOR.Easy], ['Medium', row.medium, PT.medium, DIFF_COLOR.Medium], ['Hard', row.hard, PT.hard, DIFF_COLOR.Hard], ['Aptitude', row.aptitude, PT.aptitude, APT_COLOR]];
  return (
    <Box sx={{ p: 2, display: 'grid', gap: 1.5, bgcolor: pal.chip }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: SIZES.flexShrinkMinWidth }}>
        <Avatar src={row.avatarUrl || undefined} alt={row.name} sx={{ width: SIZES.leaderboard.rowAvatar, height: SIZES.leaderboard.rowAvatar, color: COLOR_PALETTE.white, bgcolor: alpha(tier.color, 0.9) }}>{row.name?.[0]?.toUpperCase()}</Avatar>
        <Box sx={{ minWidth: SIZES.flexShrinkMinWidth }}>
          <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.25 }}>{row.name}</Typography>
          <Typography noWrap variant="caption" sx={{ color: pal.muted }}>@{row.handle}{row.company ? `, ${row.company}` : ''}</Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}><FriendRequestButton member={row} /></Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1 }}>
        {tiles.map(([label, count, points, color]) => <SolvedTile key={label} label={label} count={count} points={points} color={color} />)}
      </Box>
      <TierBar row={row} />
    </Box>
  );
}
