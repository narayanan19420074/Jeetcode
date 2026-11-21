import { Avatar, Badge, Box, Tooltip, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import { useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { DIFF_COLOR } from '../../dashboard/dashboardUtils';
import { lbTokens } from '../lbTheme';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { MEDAL_INK, TABULAR, tintTagSx } from './lbLook';
import { statsColumnWidth } from './columns';

export function RankTile({ rank }) {
  const pal = useLibraryPalette();
  const ink = MEDAL_INK[rank];
  return (
    <Box sx={[{ width: SIZES.leaderboard.rankTile, height: SIZES.leaderboard.rankTile, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: RADII_PX.control, fontSize: FONT_SIZES.bodyLg, fontWeight: ink ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium, color: ink || pal.muted, bgcolor: ink ? alpha(ink, 0.16) : 'transparent' }, TABULAR]}>
      {rank}
    </Box>
  );
}

// Profile picture with a green dot while the player is active today.
export function PlayerAvatar({ row, live }) {
  const tokens = lbTokens(useTheme().palette.mode);
  return (
    <Badge variant="dot" overlap="circular" invisible={!live} color="success" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Avatar src={row.avatarUrl || undefined} alt={row.name} sx={{ width: SIZES.leaderboard.rowAvatar, height: SIZES.leaderboard.rowAvatar, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: tokens.avatarFg, bgcolor: tokens.avatarBg }}>
        {row.name?.[0]?.toUpperCase()}
      </Avatar>
    </Badge>
  );
}

// Rank change since last week (all-time, everyone board only; the server sends null otherwise).
export function RankMove({ row }) {
  if (row.isNew) return <Box component="span" sx={[tintTagSx(COLOR_PALETTE.amber[600]), { fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, flexShrink: 0 }]}>new</Box>;
  const change = row.movement;
  if (!change) return null;
  const up = change > 0;
  const Icon = up ? ArrowDropUpRoundedIcon : ArrowDropDownRoundedIcon;
  return (
    <Box component="span" aria-label={`${up ? 'Up' : 'Down'} ${Math.abs(change)} since last week`} sx={[{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, color: up ? 'success.main' : 'error.main', fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold }, TABULAR]}>
      <Icon sx={{ fontSize: FONT_SIZES.heading, mx: -0.6 }} />{Math.abs(change)}
    </Box>
  );
}

export function StreakCount({ value }) {
  const pal = useLibraryPalette();
  const on = value > 0;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
      <LocalFireDepartmentRoundedIcon sx={{ fontSize: FONT_SIZES.bodyLg, color: on ? COLOR_PALETTE.orange[500] : pal.muted, opacity: on ? 1 : 0.5 }} />
      <Typography component="span" sx={[{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold, color: on ? pal.text : pal.muted }, TABULAR]}>{value}d</Typography>
    </Box>
  );
}

export function TierDot({ tier }) {
  return (
    <Tooltip title={tier.name}>
      <Box component="span" aria-label={tier.name} sx={{ display: 'inline-grid', placeItems: 'center', width: SIZES.leaderboard.tierDot, height: SIZES.leaderboard.tierDot, borderRadius: RADII_PX.circle, flexShrink: 0, bgcolor: alpha(tier.color, 0.18), color: tier.color }}>
        <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.body }} />
      </Box>
    </Tooltip>
  );
}

function StatNumber({ count, color, label }) {
  const pal = useLibraryPalette();
  return (
    <Tooltip title={label}>
      <Typography component="span" sx={[{ flex: 1, textAlign: 'right', fontSize: FONT_SIZES.bodyLg, fontWeight: count > 0 ? FONT_WEIGHTS.semibold : FONT_WEIGHTS.regular, color: count > 0 ? color : pal.muted }, TABULAR]}>{count}</Typography>
    </Tooltip>
  );
}

// Coding shows Easy / Medium / Hard; the other tracks show how many questions were solved.
export function SolvedStats({ row, track }) {
  const pal = useLibraryPalette();
  const Icon = track === 'aptitude' ? PsychologyRoundedIcon : CodeRoundedIcon;
  const cells = track === 'coding'
    ? [[row.easy, DIFF_COLOR.Easy, 'Easy solved'], [row.medium, DIFF_COLOR.Medium, 'Medium solved'], [row.hard, DIFF_COLOR.Hard, 'Hard solved']]
    : [[row.solved, pal.text, 'Questions solved']];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: statsColumnWidth(track), flexShrink: 0 }}>
      {track !== 'coding' && <Icon sx={{ fontSize: FONT_SIZES.bodyLg, color: pal.muted }} />}
      {cells.map(([count, color, label]) => <StatNumber key={label} count={count} color={color} label={label} />)}
    </Box>
  );
}

export function RecentCount({ recent }) {
  const pal = useLibraryPalette();
  return (
    <Tooltip title="Solved in the last 7 days">
      <Typography component="span" sx={[{ width: SIZES.leaderboard.recentColumn, flexShrink: 0, textAlign: 'right', fontSize: FONT_SIZES.bodyLg, color: recent > 0 ? 'success.main' : pal.muted }, TABULAR]}>
        {recent > 0 ? `+${recent}` : '–'}
      </Typography>
    </Tooltip>
  );
}
