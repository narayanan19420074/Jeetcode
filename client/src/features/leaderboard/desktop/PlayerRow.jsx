import { Box, ButtonBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, MOTION, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { tierFor } from '../tiers';
import { CountUp, YouChip, activeLabel } from '../lbShared';
import { MEDAL_INK, FOCUS_RING, TABULAR } from './lbLook';
import { PlayerAvatar, RankMove, RankTile, RecentCount, SolvedStats, StreakCount, TierDot } from './RowParts';

function PlayerIdentity({ row, isMe, tier }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography noWrap sx={{ minWidth: SIZES.flexShrinkMinWidth, fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.medium, letterSpacing: LIB_TRACKING, lineHeight: 1.3 }}>{row.name}</Typography>
        {isMe && <YouChip />}
        <RankMove row={row} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <TierDot tier={tier} />
        <Typography noWrap variant="caption" sx={{ minWidth: SIZES.flexShrinkMinWidth, color: pal.muted }}>@{row.handle}</Typography>
        <StreakCount value={row.streak} />
      </Box>
    </Box>
  );
}

function PointsCell({ row, animated }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ width: SIZES.leaderboard.pointsColumn, flexShrink: 0, textAlign: 'right' }}>
      <Typography sx={[{ fontSize: FONT_SIZES.subheading, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.2, color: MEDAL_INK[row.rank] || pal.text }, TABULAR]}>
        {animated ? <CountUp value={row.score} /> : row.score.toLocaleString()}
      </Typography>
      <Typography variant="caption" sx={{ color: pal.muted, letterSpacing: LIB_TRACKING }}>pts</Typography>
    </Box>
  );
}

const rowButtonSx = { width: SIZES.fill, display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, textAlign: 'left', fontFamily: 'inherit', color: 'inherit', '&.Mui-focusVisible': FOCUS_RING };

// One player: rank, picture and name, solved counts, last 7 days and points. The same row is pinned under the list for the signed-in player.
function PlayerRowButton({ row, isMe, track, wide, animated, onPick }) {
  const { tier } = tierFor(row.score);
  return (
    <ButtonBase onClick={(event) => onPick(event, row)} sx={rowButtonSx}>
      <RankTile rank={row.rank} />
      <PlayerAvatar row={row} live={activeLabel(row.lastActive).live} />
      <PlayerIdentity row={row} isMe={isMe} tier={tier} />
      {wide && <SolvedStats row={row} track={track} />}
      {wide && <RecentCount recent={row.recent} />}
      <PointsCell row={row} animated={animated} />
    </ButtonBase>
  );
}

// The top player is a normal row; only its border is highlighted.
const tableRowSx = (pal, isMe, top) => ({
  position: 'relative',
  borderBottom: `1px solid ${pal.divider}`,
  '&:last-of-type': { borderBottom: 'none' },
  bgcolor: isMe ? alpha(LIB_ACCENT, 0.06) : 'transparent',
  transition: `background-color ${MOTION.fast}ms`,
  '&:hover': { bgcolor: alpha(LIB_ACCENT, 0.06) },
  ...(top && { m: 0.5, border: `1px solid ${MEDAL_INK[1]}`, borderRadius: RADII_PX.control }),
});

export function PlayerRow({ row, isMe, top = false, ...rest }) {
  const pal = useLibraryPalette();
  return (
    <Box id={isMe ? 'lb-me' : undefined} sx={tableRowSx(pal, isMe, top)}>
      <PlayerRowButton row={row} isMe={isMe} animated={false} {...rest} />
    </Box>
  );
}

export function PinnedPlayerRow(props) {
  return <PlayerRowButton {...props} isMe animated />;
}
